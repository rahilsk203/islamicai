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
  }

  /**
   * Hash function to determine which namespace a session should be stored in
   * @param {string} sessionId - Session identifier
   * @returns {number} Index of the namespace to use
   */
  _getNamespaceIndex(sessionId) {
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % this.namespaceCount;
  }

  /**
   * Get the appropriate session manager for a given session ID
   * @param {string} sessionId - Session identifier
   * @returns {AdvancedSessionManager} The session manager for this session
   */
  _getSessionManager(sessionId) {
    const namespaceIndex = this._getNamespaceIndex(sessionId);
    this.performanceStats.namespaceAccesses[namespaceIndex]++;
    return this.sessionManagers[namespaceIndex];
  }

  /**
   * Get session data from the appropriate KV namespace
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session data
   */
  async getSessionData(sessionId) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.getSessionData(sessionId);
  }

  /**
   * Save session data to the appropriate KV namespace
   * @param {string} sessionId - Session identifier
   * @param {Object} sessionData - Session data to save
   */
  async saveSessionData(sessionId, sessionData) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.saveSessionData(sessionId, sessionData);
  }

  /**
   * Get contextual prompt for the session
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @returns {string} Contextual prompt
   */
  async getContextualPrompt(sessionId, userMessage) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.getContextualPrompt(sessionId, userMessage);
  }

  /**
   * Process a message and update session data
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @param {string} aiResponse - AI response
   * @returns {Object} Updated session data
   */
  async processMessage(sessionId, userMessage, aiResponse) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.processMessage(sessionId, userMessage, aiResponse);
  }

  /**
   * Get recent messages for adaptive language system
   * @param {string} sessionId - Session identifier
   * @param {number} limit - Number of recent messages to retrieve
   * @returns {Array} Recent messages
   */
  async getRecentMessages(sessionId, limit = 5) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.getRecentMessages(sessionId, limit);
  }

  /**
   * Get user profile for adaptive language system
   * @param {string} sessionId - Session identifier
   * @returns {Object} User profile
   */
  async getUserProfile(sessionId) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.getUserProfile(sessionId);
  }

  /**
   * Clear session history
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Success status
   */
  async clearSessionHistory(sessionId) {
    const sessionManager = this._getSessionManager(sessionId);
    return await sessionManager.clearSessionHistory(sessionId);
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
      loadDistribution: this.performanceStats.namespaceAccesses.map(accesses => 
        ((accesses / totalAccesses) * 100).toFixed(2) + '%'
      )
    };
  }
}