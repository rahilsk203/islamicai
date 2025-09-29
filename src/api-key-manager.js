// Multi-API Key Manager for IslamicAI Backend
// Handles multiple Gemini API keys with load balancing and failover

export class APIKeyManager {
  constructor(apiKeys) {
    this.apiKeys = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
    this.currentIndex = 0;
    this.failedKeys = new Map(); // Legacy tracking for failure times (kept for compatibility)
    this.keyStats = new Map(); // Public stats surface
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.failureCooldown = 5 * 60 * 1000; // 5 minutes cooldown for failed keys

    // DSA: Per-key state with cooldown timestamp & counters for fast scoring
    // key -> { failures, successes, lastUsed, failureUntil }
    this.keyState = new Map();
    for (const key of this.apiKeys) {
      this.keyState.set(key, {
        failures: 0,
        successes: 0,
        lastUsed: 0,
        failureUntil: 0
      });
      // Initialize keyStats mirror
      this.keyStats.set(key, { successes: 0, failures: 0, lastUsed: null });
    }
  }

  /**
   * Get the next available API key
   * @returns {string} Available API key
   */
  getNextKey() {
    const now = Date.now();
    const available = [];
    let oldestCooling = null; // { key, failureUntil }

    for (const key of this.apiKeys) {
      const state = this.keyState.get(key);
      const availableNow = !state || state.failureUntil <= now;
      if (availableNow) {
        available.push(key);
      } else {
        if (!oldestCooling || state.failureUntil < oldestCooling.failureUntil) {
          oldestCooling = { key, failureUntil: state.failureUntil };
        }
      }
    }

    if (available.length === 0) {
      // No key currently available: choose the one that becomes available the soonest
      if (oldestCooling) {
        console.warn(`All keys cooling down, retrying soonest: ${oldestCooling.key.substring(0, 10)}...`);
        return oldestCooling.key;
      }
      // Fallback to first key
      return this.apiKeys[0];
    }

    // DSA: Choose the best available key by failure rate then least-recently-used
    let bestKey = available[0];
    let bestScore = Infinity;
    for (const key of available) {
      const score = this._scoreKey(key, now);
      if (score < bestScore) {
        bestScore = score;
        bestKey = key;
      }
    }

    // Update round-robin pointer lightly to avoid starvation
    this.currentIndex = (this.currentIndex + 1) % Math.max(available.length, 1);
    return bestKey;
  }

  /**
   * Mark an API key as failed
   * @param {string} apiKey - The failed API key
   * @param {string} reason - Reason for failure
   */
  markKeyFailed(apiKey, reason = 'unknown') {
    console.warn(`API key failed: ${apiKey.substring(0, 10)}... (${reason})`);
    const now = Date.now();
    this.failedKeys.set(apiKey, now);
    const state = this.keyState.get(apiKey) || { failures: 0, successes: 0, lastUsed: 0, failureUntil: 0 };
    state.failures++;
    state.failureUntil = now + this.failureCooldown;
    state.lastUsed = now;
    this.keyState.set(apiKey, state);
    
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
    const now = Date.now();
    const state = this.keyState.get(apiKey) || { failures: 0, successes: 0, lastUsed: 0, failureUntil: 0 };
    state.successes++;
    state.lastUsed = now;
    state.failureUntil = 0;
    this.keyState.set(apiKey, state);
    
    // Record success stats
    if (!this.keyStats.has(apiKey)) {
      this.keyStats.set(apiKey, { successes: 0, failures: 0, lastUsed: null });
    }
    const stats = this.keyStats.get(apiKey);
    stats.successes++;
    stats.lastUsed = new Date(now).toISOString();
  }

  /**
   * Get statistics for all API keys
   * @returns {Object} Key statistics
   */
  getKeyStats() {
    const stats = {};
    for (const [key, data] of this.keyStats.entries()) {
      const state = this.keyState.get(key) || { failureUntil: 0 };
      const now = Date.now();
      stats[key.substring(0, 10) + '...'] = {
        ...data,
        successRate: data.successes + data.failures > 0 
          ? (data.successes / (data.successes + data.failures) * 100).toFixed(2) + '%'
          : '0%',
        isActive: state.failureUntil <= now,
        failureCooldownRemaining: Math.max(0, (state.failureUntil || 0) - now)
      };
    }
    return stats;
  }

  /**
   * Reset failed keys (useful for periodic cleanup)
   */
  resetFailedKeys() {
    this.failedKeys.clear();
    for (const [key, state] of this.keyState.entries()) {
      state.failureUntil = 0;
      this.keyState.set(key, state);
    }
    console.log('Reset all failed API keys');
  }

  /**
   * Get the number of available keys
   * @returns {number} Number of available keys
   */
  getAvailableKeyCount() {
    const now = Date.now();
    return this.apiKeys.filter(key => {
      const state = this.keyState.get(key);
      return !state || state.failureUntil <= now;
    }).length;
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

  // DSA: Compute a key score for selection (lower is better)
  _scoreKey(key, now) {
    const state = this.keyState.get(key) || { failures: 0, successes: 0, lastUsed: 0, failureUntil: 0 };
    const total = state.failures + state.successes;
    const failureRate = total > 0 ? state.failures / total : 0;
    const recencyPenalty = Math.max(0, (now - (state.lastUsed || 0)) / (60 * 1000)); // minutes since last used
    // Weight failure rate strongly, prefer keys less recently used to spread load
    return failureRate * 100 + (1 / (recencyPenalty + 1));
  }
}