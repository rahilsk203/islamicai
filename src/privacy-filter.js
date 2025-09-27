/**
 * Privacy Filter System for IslamicAI
 * Ensures internal AI information is not exposed during long chat conversations
 */

export class PrivacyFilter {
  constructor() {
    // Patterns that should never be exposed to users
    this.sensitivePatterns = [
      // API and technical information
      { pattern: /GEMINI_API_KEY/i, replacement: '[REDACTED]' },
      { pattern: /API_KEY/i, replacement: '[REDACTED]' },
      { pattern: /api key/i, replacement: '[REDACTED]' },
      { pattern: /model.*gemini/i, replacement: '[REDACTED]' },
      { pattern: /version.*[0-9]+\.[0-9]+/i, replacement: '[REDACTED]' },
      { pattern: /internal.*system/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /system.*internal/i, replacement: '[INTERNAL SYSTEM]' },
      
      // Technical architecture
      { pattern: /cloudflare/i, replacement: '[REDACTED]' },
      { pattern: /workers/i, replacement: '[REDACTED]' },
      { pattern: /kv store/i, replacement: '[REDACTED]' },
      { pattern: /namespace/i, replacement: '[REDACTED]' },
      { pattern: /cache/i, replacement: '[REDACTED]' },
      { pattern: /bloom filter/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /trie/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /avl tree/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /segment tree/i, replacement: '[INTERNAL SYSTEM]' },
      
      // Memory and data structures
      { pattern: /memory.*cache/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /session.*cache/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /lru cache/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /hash map/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /data structure/i, replacement: '[INTERNAL SYSTEM]' },
      
      // Implementation details
      { pattern: /implementation/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /algorithm/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /dsa/i, replacement: '[INTERNAL SYSTEM]' }, // Data Structures and Algorithms
      { pattern: /performance.*optimization/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /compression/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /decompression/i, replacement: '[INTERNAL SYSTEM]' },
      
      // Configuration and environment
      { pattern: /env\..*/i, replacement: '[REDACTED]' },
      { pattern: /environment.*variable/i, replacement: '[REDACTED]' },
      { pattern: /config/i, replacement: '[REDACTED]' },
      { pattern: /configuration/i, replacement: '[REDACTED]' },
      { pattern: /setting/i, replacement: '[REDACTED]' },
      
      // Development information
      { pattern: /development/i, replacement: '[REDACTED]' },
      { pattern: /developed by/i, replacement: '[REDACTED]' },
      { pattern: /created by/i, replacement: '[REDACTED]' },
      { pattern: /google/i, replacement: '[REDACTED]' },
      { pattern: /openai/i, replacement: '[REDACTED]' },
      { pattern: /microsoft/i, replacement: '[REDACTED]' },
      { pattern: /meta/i, replacement: '[REDACTED]' },
      { pattern: /facebook/i, replacement: '[REDACTED]' },
      { pattern: /amazon/i, replacement: '[REDACTED]' },
      { pattern: /aws/i, replacement: '[REDACTED]' },
    ];
    
    // Allowed Islamic technical terms that should not be filtered
    this.allowedIslamicTerms = [
      'Quran', 'Hadith', 'Sunna', 'Fiqh', 'Tafseer', 'Seerah',
      'Allah', 'Prophet', 'Muhammad', 'Sahaba', 'Khilafah',
      'Salah', 'Zakat', 'Sawm', 'Hajj', 'Iman', 'Tawhid'
    ];
  }
  
  /**
   * Filter sensitive information from AI responses
   * @param {string} response - AI response to filter
   * @param {Object} sessionData - Current session data for context
   * @returns {string} Filtered response
   */
  filterResponse(response, sessionData = {}) {
    if (!response || typeof response !== 'string') {
      return response;
    }
    
    let filteredResponse = response;
    
    // Apply sensitive pattern filtering
    this.sensitivePatterns.forEach(({ pattern, replacement }) => {
      // Only filter if it's not an allowed Islamic term
      if (!this.containsAllowedIslamicTerm(filteredResponse, pattern)) {
        filteredResponse = filteredResponse.replace(pattern, replacement);
      }
    });
    
    // Additional filtering for technical implementation details
    filteredResponse = this.filterImplementationDetails(filteredResponse);
    
    // Filter any debugging or development comments
    filteredResponse = this.filterDebugInfo(filteredResponse);
    
    return filteredResponse;
  }
  
  /**
   * Check if a text contains allowed Islamic terms that match a pattern
   * @param {string} text - Text to check
   * @param {RegExp} pattern - Pattern to check against
   * @returns {boolean} True if text contains allowed Islamic terms matching the pattern
   */
  containsAllowedIslamicTerm(text, pattern) {
    const patternStr = pattern.toString().toLowerCase();
    return this.allowedIslamicTerms.some(term => 
      patternStr.includes(term.toLowerCase()) && text.toLowerCase().includes(term.toLowerCase())
    );
  }
  
  /**
   * Filter implementation details that might be exposed
   * @param {string} response - Response to filter
   * @returns {string} Filtered response
   */
  filterImplementationDetails(response) {
    let filtered = response;
    
    // Filter common implementation detail phrases
    const implementationFilters = [
      { pattern: /\[DSA\]/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /data structure.*algorithm/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /performance.*optimization/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /cache.*management/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /memory.*management/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /bloom filter/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /avl tree/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /segment tree/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /trie.*structure/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /hash.*map/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /lru.*cache/gi, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /compression.*algorithm/gi, replacement: '[INTERNAL SYSTEM]' }
    ];
    
    implementationFilters.forEach(({ pattern, replacement }) => {
      filtered = filtered.replace(pattern, replacement);
    });
    
    return filtered;
  }
  
  /**
   * Filter debug information
   * @param {string} response - Response to filter
   * @returns {string} Filtered response
   */
  filterDebugInfo(response) {
    let filtered = response;
    
    // Filter debug comments and logging references
    const debugFilters = [
      { pattern: /console\.log/gi, replacement: '[LOG INFO]' },
      { pattern: /debug:/gi, replacement: '[LOG INFO]:' },
      { pattern: /log:/gi, replacement: '[LOG INFO]:' },
      { pattern: /trace:/gi, replacement: '[LOG INFO]:' },
      { pattern: /performance.*stats/gi, replacement: '[LOG INFO]' },
      { pattern: /cache.*hit/gi, replacement: '[INTERNAL SYSTEM]' }
    ];
    
    debugFilters.forEach(({ pattern, replacement }) => {
      filtered = filtered.replace(pattern, replacement);
    });
    
    return filtered;
  }
  
  /**
   * Sanitize session data before exposing to frontend
   * @param {Object} sessionData - Raw session data
   * @returns {Object} Sanitized session data
   */
  sanitizeSessionData(sessionData) {
    if (!sessionData) return {};
    
    // Create a copy to avoid modifying original data
    const sanitized = { ...sessionData };
    
    // Remove sensitive fields
    delete sanitized.apiKeys;
    delete sanitized.kv;
    delete sanitized.cache;
    delete sanitized.memoryCache;
    delete sanitized.memoryBloomFilter;
    delete sanitized.memoryHashMap;
    delete sanitized.sessionCache;
    
    // Sanitize nested objects
    if (sanitized.history) {
      sanitized.history = sanitized.history.map(msg => ({
        role: msg.role,
        content: this.filterResponse(msg.content),
        timestamp: msg.timestamp
      }));
    }
    
    if (sanitized.memories) {
      sanitized.memories = sanitized.memories.map(memory => ({
        id: memory.id,
        content: this.filterResponse(memory.content),
        type: memory.type,
        priority: memory.priority,
        timestamp: memory.timestamp
      }));
    }
    
    return sanitized;
  }
  
  /**
   * Check if a response contains sensitive information
   * @param {string} response - Response to check
   * @returns {boolean} True if sensitive information is detected
   */
  containsSensitiveInfo(response) {
    if (!response || typeof response !== 'string') {
      return false;
    }
    
    return this.sensitivePatterns.some(({ pattern }) => {
      // Skip allowed Islamic terms
      if (this.containsAllowedIslamicTerm(response, pattern)) {
        return false;
      }
      return pattern.test(response);
    });
  }
}