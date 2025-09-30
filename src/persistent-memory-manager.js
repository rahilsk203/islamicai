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

    // DSA: In-memory LRU caches to reduce KV roundtrips
    this.userProfileCache = new Map(); // userId -> { profile, ts }
    this.semanticIndexCache = new Map(); // userId -> { ids, ts }
    this.recentRecordSet = new Map(); // userId -> { set: Set<string>, queue: string[] }
    this.recallCache = new Map(); // key -> { result, ts }
    this.cacheTTLms = 5 * 60 * 1000; // 5 minutes
    this.userProfileCacheCap = 2000;
    this.semanticIndexCacheCap = 2000;
    this.recentRecordCap = 128;
    this.recallCacheCap = 1000;
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
      // DSA: LRU cache first
      const now = Date.now();
      if (this.userProfileCache.has(userId)) {
        const entry = this.userProfileCache.get(userId);
        if (now - entry.ts < this.cacheTTLms) {
          return entry.profile;
        } else {
          this.userProfileCache.delete(userId);
        }
      }
      const data = await this.userKV.get(this._userKey(userId));
      const profile = data ? JSON.parse(data) : { keyFacts: {}, preferences: {}, optOutMemory: false };
      this._putUserProfileCache(userId, profile);
      return profile;
    } catch {
      return { keyFacts: {}, preferences: {}, optOutMemory: false };
    }
  }

  async saveUserProfile(userId, profile) {
    try {
      await this.userKV.put(this._userKey(userId), JSON.stringify(profile), { expirationTtl: 60 * 60 * 24 * 30 });
      this._putUserProfileCache(userId, profile);
    } catch {}
  }

  async saveUserFact(userId, type, value, priority = 2) {
    // For guest users, don't save facts to persistent storage
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping user fact save for guest user');
      return null;
    }
    
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
    // For guest users, return empty index
    if (!this._isAuthenticatedUser(userId)) {
      return [];
    }
    
    try {
      const now = Date.now();
      if (this.semanticIndexCache.has(userId)) {
        const entry = this.semanticIndexCache.get(userId);
        if (now - entry.ts < this.cacheTTLms) return entry.ids;
        this.semanticIndexCache.delete(userId);
      }
      const raw = await this.semanticKV.get(this._semanticUserIndexKey(userId));
      const ids = raw ? JSON.parse(raw) : [];
      this._putSemanticIndexCache(userId, ids);
      return ids;
    } catch { return []; }
  }

  async _setUserSemanticIndex(userId, ids) {
    // For guest users, don't save semantic index
    if (!this._isAuthenticatedUser(userId)) {
      return;
    }
    
    try {
      await this.semanticKV.put(this._semanticUserIndexKey(userId), JSON.stringify(ids.slice(-5000)), { expirationTtl: 60 * 60 * 24 * 30 });
      this._putSemanticIndexCache(userId, ids.slice(-5000));
    } catch {}
  }

  async _saveSemanticRecord(userId, msgId, text, metadata) {
    // For guest users, don't save semantic records to persistent storage
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping semantic record save for guest user');
      return;
    }
    
    // DSA: Skip duplicate recent texts per user (normalized hash)
    if (this._isRecentDuplicate(userId, text)) return;
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
    
    // For guest users, don't record turns in semantic memory
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping turn recording for guest user');
      return;
    }

    const msgId = `${sessionId}:${role}:${Date.now()}`;
    await this._saveSemanticRecord(userId, msgId, content, { kind: 'message', role, sessionId });
  }

  async forgetLast(userId) {
    // For guest users, don't forget anything in semantic memory
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping forget last for guest user');
      return false;
    }
    
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
    // For guest users, don't add episodic summaries to persistent storage
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping episodic summary for guest user');
      return null;
    }
    
    const mem = this.memory.createMemory(summaryText, this.memory.memoryTypes.CONVERSATION_CONTEXT, this.memory.memoryPriority.MEDIUM, { userId, sessionId, episodic: true });
    await this._saveSemanticRecord(userId, mem.id, summaryText, { kind: 'episodic', sessionId, episodic: true });
    return mem.id;
  }

  // ---- Hybrid recall ----
  async recall(userId, sessionHistory, query, options = {}) {
    const lastN = options.lastN || this.defaultLastNTurns;
    const topK = options.topK || this.topKSimilar;

    // DSA: Short-window recall cache to avoid recomputing for identical query
    const cacheKey = this._recallKey(userId, query);
    const now = Date.now();
    if (this.recallCache.has(cacheKey)) {
      const entry = this.recallCache.get(cacheKey);
      if (now - entry.ts < 5000) return entry.result; // 5s debounce
      this.recallCache.delete(cacheKey);
    }

    // Short-term: last N turns
    const shortTerm = sessionHistory.slice(-lastN);

    // For guest users, don't perform long-term recall
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping long-term recall for guest user');
      const result = { shortTerm, similar: [] };
      this._putRecallCache(cacheKey, result);
      return result;
    }

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

    const result = { shortTerm, similar };
    this._putRecallCache(cacheKey, result);
    return result;
  }
}

// ---- DSA helpers (private) ----
PersistentMemoryManager.prototype._putUserProfileCache = function(userId, profile) {
  this.userProfileCache.set(userId, { profile, ts: Date.now() });
  if (this.userProfileCache.size > this.userProfileCacheCap) {
    const oldest = this.userProfileCache.keys().next().value;
    if (oldest) this.userProfileCache.delete(oldest);
  }
};

PersistentMemoryManager.prototype._putSemanticIndexCache = function(userId, ids) {
  this.semanticIndexCache.set(userId, { ids, ts: Date.now() });
  if (this.semanticIndexCache.size > this.semanticIndexCacheCap) {
    const oldest = this.semanticIndexCache.keys().next().value;
    if (oldest) this.semanticIndexCache.delete(oldest);
  }
};

PersistentMemoryManager.prototype._normalizeText = function(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 512);
};

PersistentMemoryManager.prototype._hash32 = function(text) {
  // FNV-1a 32-bit
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = (hash >>> 0) * 0x01000193;
  }
  return (hash >>> 0).toString(16);
};

PersistentMemoryManager.prototype._isRecentDuplicate = function(userId, text) {
  const normalized = this._normalizeText(text);
  const sig = this._hash32(normalized);
  if (!this.recentRecordSet.has(userId)) {
    this.recentRecordSet.set(userId, { set: new Set(), queue: [] });
  }
  const bucket = this.recentRecordSet.get(userId);
  if (bucket.set.has(sig)) return true;
  bucket.set.add(sig);
  bucket.queue.push(sig);
  if (bucket.queue.length > this.recentRecordCap) {
    const old = bucket.queue.shift();
    if (old) bucket.set.delete(old);
  }
  return false;
};

PersistentMemoryManager.prototype._recallKey = function(userId, query) {
  const norm = this._normalizeText(query || '');
  return `${userId}:${this._hash32(norm)}`;
};

PersistentMemoryManager.prototype._putRecallCache = function(key, result) {
  this.recallCache.set(key, { result, ts: Date.now() });
  if (this.recallCache.size > this.recallCacheCap) {
    const oldest = this.recallCache.keys().next().value;
    if (oldest) this.recallCache.delete(oldest);
  }
};

// Helper method to check if a user is authenticated
PersistentMemoryManager.prototype._isAuthenticatedUser = function(userId) {
  // Authenticated users have a proper UUID format, guest users use session IDs
  if (!userId) return false;
  // Check if userId looks like a UUID (authenticated user)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
};