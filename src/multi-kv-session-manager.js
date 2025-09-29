import { AdvancedSessionManager } from './advanced-session-manager.js';

/**
 * MultiKVSessionManager - Distributes session data across multiple KV namespaces for better scalability
 * 
 * This class extends the AdvancedSessionManager functionality but distributes session data
 * across multiple KV namespaces to improve performance and scalability. Each session is
 * assigned to a specific KV namespace based on a hash of the session ID.
 */
export class MultiKVSessionManager {
  /**
   * Constructor for MultiKVSessionManager
   * @param {Array} kvNamespaces - Array of KV namespace bindings
   */
  constructor(kvNamespaces) {
    if (!Array.isArray(kvNamespaces) || kvNamespaces.length === 0) {
      throw new Error('At least one KV namespace is required');
    }
    
    this.kvNamespaces = kvNamespaces;
    this.namespaceCount = kvNamespaces.length;
    
    // Create individual session managers for each namespace
    this.sessionManagers = kvNamespaces.map(kv => new AdvancedSessionManager(kv));
    
    // Use the first session manager as the primary for shared functionality
    this.primarySessionManager = this.sessionManagers[0];
    
    // Performance tracking
    this.performanceStats = {
      namespaceAccesses: new Array(this.namespaceCount).fill(0),
      cacheHits: 0,
      cacheMisses: 0
    };

    // DSA: Cache for sessionId -> namespace index (LRU-like via Map order)
    this.sessionIndexCache = new Map();
    this.sessionIndexCacheCapacity = 5000;

    // DSA: Simple per-namespace health with cooldown after failures
    this.namespaceHealth = new Array(this.namespaceCount).fill(0).map(() => ({
      failures: 0,
      failureUntil: 0
    }));
    this.failureCooldownMs = 60 * 1000; // 1 minute
  }

  /**
   * Hash function to determine which namespace a session should be stored in
   * @param {string} sessionId - Session identifier
   * @returns {number} Index of the namespace to use
   */
  _getNamespaceIndex(sessionId) {
    // DSA: FNV-1a 32-bit for fast uniform hashing
    let hash = 0x811c9dc5;
    for (let i = 0; i < sessionId.length; i++) {
      hash ^= sessionId.charCodeAt(i);
      hash = (hash >>> 0) * 0x01000193;
    }
    return (hash >>> 0) % this.namespaceCount;
  }

  /**
   * Get the appropriate session manager for a given session ID
   * @param {string} sessionId - Session identifier
   * @returns {AdvancedSessionManager} The session manager for this session
   */
  _getSessionManager(sessionId) {
    // Check cache
    if (this.sessionIndexCache.has(sessionId)) {
      const idx = this.sessionIndexCache.get(sessionId);
      if (this._isNamespaceHealthy(idx)) {
        this.performanceStats.cacheHits++;
        this.performanceStats.namespaceAccesses[idx]++;
        return this.sessionManagers[idx];
      } else {
        // Evict stale mapping
        this.sessionIndexCache.delete(sessionId);
      }
    }
    this.performanceStats.cacheMisses++;
    // Compute preferred index
    const preferred = this._getNamespaceIndex(sessionId);
    // Pick a healthy namespace, fallback to round-robin scan
    const idx = this._pickHealthyNamespace(preferred);
    // Cache mapping
    this.sessionIndexCache.set(sessionId, idx);
    if (this.sessionIndexCache.size > this.sessionIndexCacheCapacity) {
      const oldestKey = this.sessionIndexCache.keys().next().value;
      if (oldestKey) this.sessionIndexCache.delete(oldestKey);
    }
    this.performanceStats.namespaceAccesses[idx]++;
    return this.sessionManagers[idx];
  }

  _isNamespaceHealthy(idx) {
    const h = this.namespaceHealth[idx];
    return !h || h.failureUntil <= Date.now();
  }

  _pickHealthyNamespace(startIdx) {
    const now = Date.now();
    // Try preferred first
    if (this._isNamespaceHealthy(startIdx)) return startIdx;
    // Linear probe for next healthy
    for (let i = 1; i < this.namespaceCount; i++) {
      const idx = (startIdx + i) % this.namespaceCount;
      if (this._isNamespaceHealthy(idx)) return idx;
    }
    // None healthy: choose the one with earliest recovery
    let bestIdx = startIdx;
    let bestTime = Infinity;
    for (let i = 0; i < this.namespaceCount; i++) {
      const t = this.namespaceHealth[i].failureUntil || 0;
      if (t < bestTime) { bestTime = t; bestIdx = i; }
    }
    return bestIdx;
  }

  _markNamespaceFailure(idx) {
    const h = this.namespaceHealth[idx];
    const now = Date.now();
    h.failures = (h.failures || 0) + 1;
    h.failureUntil = now + this.failureCooldownMs * Math.min(4, h.failures); // backoff
  }

  /**
   * Get session data from the appropriate KV namespace
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session data
   */
  async getSessionData(sessionId) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].getSessionData(sessionId);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].getSessionData(sessionId);
    }
  }

  /**
   * Save session data to the appropriate KV namespace
   * @param {string} sessionId - Session identifier
   * @param {Object} sessionData - Session data to save
   */
  async saveSessionData(sessionId, sessionData) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].saveSessionData(sessionId, sessionData);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].saveSessionData(sessionId, sessionData);
    }
  }

  /**
   * Get contextual prompt for the session
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @returns {string} Contextual prompt
   */
  async getContextualPrompt(sessionId, userMessage) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].getContextualPrompt(sessionId, userMessage);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].getContextualPrompt(sessionId, userMessage);
    }
  }

  /**
   * Process a message and update session data
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @param {string} aiResponse - AI response
   * @returns {Object} Updated session data
   */
  async processMessage(sessionId, userMessage, aiResponse) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].processMessage(sessionId, userMessage, aiResponse);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].processMessage(sessionId, userMessage, aiResponse);
    }
  }

  /**
   * Get recent messages for adaptive language system
   * @param {string} sessionId - Session identifier
   * @param {number} limit - Number of recent messages to retrieve
   * @returns {Array} Recent messages
   */
  async getRecentMessages(sessionId, limit = 5) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].getRecentMessages(sessionId, limit);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].getRecentMessages(sessionId, limit);
    }
  }

  /**
   * Get user profile for adaptive language system
   * @param {string} sessionId - Session identifier
   * @returns {Object} User profile
   */
  async getUserProfile(sessionId) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].getUserProfile(sessionId);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].getUserProfile(sessionId);
    }
  }

  /**
   * Clear session history
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Success status
   */
  async clearSessionHistory(sessionId) {
    const idx = this._getSessionManagerIndex(sessionId);
    try {
      return await this.sessionManagers[idx].clearSessionHistory(sessionId);
    } catch (e) {
      this._markNamespaceFailure(idx);
      const altIdx = this._pickHealthyNamespace((idx + 1) % this.namespaceCount);
      return await this.sessionManagers[altIdx].clearSessionHistory(sessionId);
    }
  }

  /**
   * Get history summary
   * @param {Array} sessionHistory - Session history
   * @returns {string|null} History summary
   */
  getHistorySummary(sessionHistory) {
    return this.primarySessionManager.getHistorySummary(sessionHistory);
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    const totalAccesses = this.performanceStats.namespaceAccesses.reduce((sum, val) => sum + val, 0);
    const avgAccesses = totalAccesses / this.namespaceCount;
    
    return {
      namespaceAccesses: [...this.performanceStats.namespaceAccesses],
      totalAccesses,
      avgAccessesPerNamespace: avgAccesses,
      cacheHits: this.performanceStats.cacheHits,
      cacheMisses: this.performanceStats.cacheMisses,
      health: this.namespaceHealth.map(h => ({ failures: h.failures, recoveringInMs: Math.max(0, h.failureUntil - Date.now()) })),
      loadDistribution: this.performanceStats.namespaceAccesses.map(accesses => 
        ((accesses / totalAccesses) * 100).toFixed(2) + '%'
      )
    };
  }

  // Helper: get computed index without side effects beyond stats/cache
  _getSessionManagerIndex(sessionId) {
    const mgr = this._getSessionManager(sessionId);
    // return corresponding index
    return this.sessionManagers.indexOf(mgr);
  }
}