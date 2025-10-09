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
      
      // Implementation details (only when clearly technical context)
      { pattern: /\bimplementation\b.*\b(?:system|code|software|programming)/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /\balgorithm\b.*\b(?:data|structure|optimization|computer)/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /\bdsa\b.*\b(?:data|structure|algorithm)/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /\bperformance.*optimization\b.*\b(?:system|code|software)/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /\bcompression\b.*\b(?:data|file|system)/i, replacement: '[INTERNAL SYSTEM]' },
      { pattern: /\bdecompression\b.*\b(?:data|file|system)/i, replacement: '[INTERNAL SYSTEM]' },
      
      // Configuration and environment (only when clearly technical context)
      { pattern: /\benv\.[a-zA-Z_]+/i, replacement: '[REDACTED]' },
      { pattern: /\benvironment.*variable\b.*\b(?:system|code|software)/i, replacement: '[REDACTED]' },
      { pattern: /\bconfig\b.*\b(?:file|system|software|programming)/i, replacement: '[REDACTED]' },
      { pattern: /\bconfiguration\b.*\b(?:system|software|programming)/i, replacement: '[REDACTED]' },
      { pattern: /\bsetting\b.*\b(?:system|software|programming|config)/i, replacement: '[REDACTED]' },
      
      // Development information (only when clearly technical context)
      { pattern: /\bdevelopment\b.*\b(?:team|company|firm|software|system)/i, replacement: '[REDACTED]' },
      { pattern: /\bdeveloped by\b.*\b(?:google|openai|microsoft|meta|facebook|amazon)/i, replacement: '[REDACTED]' },
      { pattern: /\bcreated by\b.*\b(?:google|openai|microsoft|meta|facebook|amazon)/i, replacement: '[REDACTED]' },
      { pattern: /\bgoogle\b.*\b(?:ai|search|api|model|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\bopenai\b.*\b(?:gpt|model|api|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\bmicrosoft\b.*\b(?:azure|ai|model|api|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\bmeta\b.*\b(?:ai|model|api|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\bfacebook\b.*\b(?:ai|model|api|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\bamazon\b.*\b(?:aws|ai|model|api|developed|created)/i, replacement: '[REDACTED]' },
      { pattern: /\baws\b.*\b(?:service|api|cloud|developed|created)/i, replacement: '[REDACTED]' },
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

    // Fast-path short-circuit: if no likely technical keywords, skip heavy regex loop
    // This drastically reduces cost on regular user content
    const maybeTechnical = /api|model|config|system|internal|cache|memory|debug|log|gemini|openai|google|aws|azure|kv|namespace|worker/i.test(filteredResponse);
    if (!maybeTechnical) {
      return filteredResponse;
    }
    
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