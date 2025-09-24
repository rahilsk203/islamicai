// Multi-API Key Manager for IslamicAI Backend
// Handles multiple Gemini API keys with load balancing and failover

export class APIKeyManager {
  constructor(apiKeys) {
    this.apiKeys = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
    this.currentIndex = 0;
    this.failedKeys = new Set();
    this.keyStats = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get the next available API key
   * @returns {string} Available API key
   */
  getNextKey() {
    // Filter out failed keys
    const availableKeys = this.apiKeys.filter(key => !this.failedKeys.has(key));
    
    if (availableKeys.length === 0) {
      // If all keys failed, reset and try again
      this.failedKeys.clear();
      return this.apiKeys[this.currentIndex % this.apiKeys.length];
    }

    // Use round-robin for load balancing
    const key = availableKeys[this.currentIndex % availableKeys.length];
    this.currentIndex = (this.currentIndex + 1) % availableKeys.length;
    
    return key;
  }

  /**
   * Mark an API key as failed
   * @param {string} apiKey - The failed API key
   * @param {string} reason - Reason for failure
   */
  markKeyFailed(apiKey, reason = 'unknown') {
    console.warn(`API key failed: ${apiKey.substring(0, 10)}... (${reason})`);
    this.failedKeys.add(apiKey);
    
    // Record failure stats
    if (!this.keyStats.has(apiKey)) {
      this.keyStats.set(apiKey, { successes: 0, failures: 0, lastUsed: null });
    }
    this.keyStats.get(apiKey).failures++;
  }

  /**
   * Mark an API key as successful
   * @param {string} apiKey - The successful API key
   */
  markKeySuccess(apiKey) {
    // Remove from failed keys if it was there
    this.failedKeys.delete(apiKey);
    
    // Record success stats
    if (!this.keyStats.has(apiKey)) {
      this.keyStats.set(apiKey, { successes: 0, failures: 0, lastUsed: null });
    }
    const stats = this.keyStats.get(apiKey);
    stats.successes++;
    stats.lastUsed = new Date().toISOString();
  }

  /**
   * Get statistics for all API keys
   * @returns {Object} Key statistics
   */
  getKeyStats() {
    const stats = {};
    for (const [key, data] of this.keyStats.entries()) {
      stats[key.substring(0, 10) + '...'] = {
        ...data,
        successRate: data.successes + data.failures > 0 
          ? (data.successes / (data.successes + data.failures) * 100).toFixed(2) + '%'
          : '0%',
        isActive: !this.failedKeys.has(key)
      };
    }
    return stats;
  }

  /**
   * Reset failed keys (useful for periodic cleanup)
   */
  resetFailedKeys() {
    this.failedKeys.clear();
    console.log('Reset all failed API keys');
  }

  /**
   * Get the number of available keys
   * @returns {number} Number of available keys
   */
  getAvailableKeyCount() {
    return this.apiKeys.filter(key => !this.failedKeys.has(key)).length;
  }

  /**
   * Check if any keys are available
   * @returns {boolean} True if at least one key is available
   */
  hasAvailableKeys() {
    return this.getAvailableKeyCount() > 0;
  }

  /**
   * Get all API keys (for debugging)
   * @returns {Array} All API keys
   */
  getAllKeys() {
    return this.apiKeys.map(key => key.substring(0, 10) + '...');
  }
}
