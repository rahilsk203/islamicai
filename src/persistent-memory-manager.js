import { IntelligentMemory } from './intelligent-memory.js';

/**
 * PersistentMemoryManager
 * - Session-based chat logs: session_kv:{sessionId}
 * - User-based profile/facts: user_kv:{userId}
 * - Semantic index for messages: semantic_kv:index:{userId}, semantic_kv:msg:{msgId}
 *
 * This manager layers user-level memory and semantic retrieval on top of
 * existing session storage. It is KV-agnostic and works with a single KV binding
 * or multiple via passed adapters; keys are namespaced by prefix strings.
 */
export class PersistentMemoryManager {
  constructor(primaryKV, userKV = null, semanticKV = null) {
    // Accept any KV-like binding (get/put/delete)
    this.kv = primaryKV;
    this.userKV = userKV || primaryKV;
    this.semanticKV = semanticKV || primaryKV;
    this.memory = new IntelligentMemory();

    // Tunables
    this.defaultLastNTurns = 10;
    this.topKSimilar = 5;
  }

  // ---- Key helpers ----
  _sessionKey(sessionId) { return `session_kv:${sessionId}`; }
  _userKey(userId) { return `user_kv:${userId}`; }
  _semanticUserIndexKey(userId) { return `semantic_kv:index:${userId}`; }
  _semanticMsgKey(msgId) { return `semantic_kv:msg:${msgId}`; }
  _sessionToUserKey(sessionId) { return `session_user:${sessionId}`; }

  // ---- Session ↔ User linkage ----
  async linkSessionToUser(sessionId, userId) {
    if (!sessionId || !userId) return;
    try {
      await this.kv.put(this._sessionToUserKey(sessionId), userId);
    } catch {}
  }

  async getUserIdForSession(sessionId) {
    try {
      return await this.kv.get(this._sessionToUserKey(sessionId));
    } catch { return null; }
  }

  // ---- User profile / facts ----
  async getUserProfile(userId) {
    try {
      const data = await this.userKV.get(this._userKey(userId));
      return data ? JSON.parse(data) : { keyFacts: {}, preferences: {}, optOutMemory: false };
    } catch {
      return { keyFacts: {}, preferences: {}, optOutMemory: false };
    }
  }

  async saveUserProfile(userId, profile) {
    try {
      await this.userKV.put(this._userKey(userId), JSON.stringify(profile), { expirationTtl: 60 * 60 * 24 * 30 });
    } catch {}
  }

  async saveUserFact(userId, type, value, priority = 2) {
    const profile = await this.getUserProfile(userId);
    if (!profile.keyFacts) profile.keyFacts = {};
    profile.keyFacts[type] = value;
    await this.saveUserProfile(userId, profile);
    // Also persist as a long-term memory record in semantic index
    const mem = this.memory.createMemory(`${type}: ${value}`, this.memory.memoryTypes.IMPORTANT_FACTS, priority, { userId });
    await this._saveSemanticRecord(userId, mem.id, `${type} ${value}`, {
      kind: 'fact', type, priority, memoryId: mem.id
    });
    return mem.id;
  }

  // ---- Semantic indexing ----
  _computeEmbedding(text) {
    // Lightweight bag-of-words TF map
    const words = (text || '').toLowerCase().split(/[^a-z0-9\u0600-\u06FF\u0900-\u097F]+/).filter(Boolean);
    const tf = {};
    for (const w of words) tf[w] = (tf[w] || 0) + 1;
    return tf;
  }

  _cosineSim(a, b) {
    let dot = 0, na = 0, nb = 0;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const va = a[k] || 0;
      const vb = b[k] || 0;
      dot += va * vb;
      na += va * va;
      nb += vb * vb;
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  async _getUserSemanticIndex(userId) {
    try {
      const raw = await this.semanticKV.get(this._semanticUserIndexKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  async _setUserSemanticIndex(userId, ids) {
    try {
      await this.semanticKV.put(this._semanticUserIndexKey(userId), JSON.stringify(ids.slice(-5000)), { expirationTtl: 60 * 60 * 24 * 30 });
    } catch {}
  }

  async _saveSemanticRecord(userId, msgId, text, metadata) {
    const embedding = this._computeEmbedding(text);
    const record = { id: msgId, userId, embedding, text, metadata, createdAt: Date.now() };
    await this.semanticKV.put(this._semanticMsgKey(msgId), JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });
    const idx = await this._getUserSemanticIndex(userId);
    idx.push(msgId);
    await this._setUserSemanticIndex(userId, idx);
  }

  async recordTurn(userId, sessionId, role, content) {
    // Skip if opted out
    const userProfile = await this.getUserProfile(userId);
    if (userProfile.optOutMemory) return;

    const msgId = `${sessionId}:${role}:${Date.now()}`;
    await this._saveSemanticRecord(userId, msgId, content, { kind: 'message', role, sessionId });
  }

  async forgetLast(userId) {
    const ids = await this._getUserSemanticIndex(userId);
    const last = ids.pop();
    if (last) {
      try { await this.semanticKV.delete(this._semanticMsgKey(last)); } catch {}
      await this._setUserSemanticIndex(userId, ids);
      return true;
    }
    return false;
  }

  async setOptOut(userId, optOut) {
    const profile = await this.getUserProfile(userId);
    profile.optOutMemory = !!optOut;
    await this.saveUserProfile(userId, profile);
    return profile.optOutMemory;
  }

  // ---- Episodic summaries ----
  async addEpisodicSummary(userId, sessionId, summaryText) {
    const mem = this.memory.createMemory(summaryText, this.memory.memoryTypes.CONVERSATION_CONTEXT, this.memory.memoryPriority.MEDIUM, { userId, sessionId, episodic: true });
    await this._saveSemanticRecord(userId, mem.id, summaryText, { kind: 'episodic', sessionId, episodic: true });
    return mem.id;
  }

  // ---- Hybrid recall ----
  async recall(userId, sessionHistory, query, options = {}) {
    const lastN = options.lastN || this.defaultLastNTurns;
    const topK = options.topK || this.topKSimilar;

    // Short-term: last N turns
    const shortTerm = sessionHistory.slice(-lastN);

    // Long-term + episodic via semantic similarity
    const idx = await this._getUserSemanticIndex(userId);
    const qEmbed = this._computeEmbedding(query || '');
    const scored = [];
    for (const id of idx) {
      try {
        const raw = await this.semanticKV.get(this._semanticMsgKey(id));
        if (!raw) continue;
        const rec = JSON.parse(raw);
        const score = this._cosineSim(qEmbed, rec.embedding);
        if (score > 0) scored.push({ rec, score });
      } catch {}
    }
    scored.sort((a, b) => b.score - a.score);
    const similar = scored.slice(0, topK).map(s => s.rec);

    return { shortTerm, similar };
  }
}


