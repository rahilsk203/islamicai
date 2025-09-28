import { GeminiAPI } from './gemini-api.js';
import { MultiKVSessionManager } from './multi-kv-session-manager.js';
import { CommandHandler } from './command-handler.js';
import { AdaptiveLanguageSystem } from './adaptive-language-system.js';
import { PrivacyFilter } from './privacy-filter.js';
import { PersistentMemoryManager } from './persistent-memory-manager.js';

/**
 * DSA-Optimized Islamic AI Worker
 * Implements advanced data structures and algorithms for optimal performance
 */
class OptimizedIslamicAIWorker {
  constructor() {
    // Initialize optimized data structures
    this._initializeOptimizedDataStructures();
    
    // Performance monitoring
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      streamingRequests: 0,
      directRequests: 0,
      errorCount: 0,
      ipExtractionTime: 0,
      sessionProcessingTime: 0
    };
    
    // Circuit breaker for error handling
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      threshold: 5,
      timeout: 60000 // 1 minute
    };
  }

  /**
   * Initialize optimized data structures for DSA-level performance
   * @private
   */
  _initializeOptimizedDataStructures() {
    // Trie-based request routing for O(k) path matching
    this.requestRouter = this._buildRequestRouter();
    
    // Pre-computed IP header priority for O(1) extraction
    this.ipHeaderPriority = [
      'CF-Connecting-IP',
      'X-Forwarded-For', 
      'X-Real-IP',
      'X-Client-IP',
      'X-Forwarded',
      'Forwarded-For',
      'Forwarded'
    ];
    
    // Cache for frequently accessed data
    this.cache = new Map();
    this.cacheMaxSize = 1000;
    this.cacheTTL = 300000; // 5 minutes
    
    // Object pool for frequently created objects
    this.objectPool = {
      responses: [],
      errorObjects: [],
      metadataObjects: []
    };
    
    // Pre-computed response headers for different scenarios
    this.responseHeaders = {
      cors: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      json: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      stream: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    };
  }

  /**
   * Build Trie-based request router for O(k) path matching
   * @private
   * @returns {Object} Trie structure for request routing
   */
  _buildRequestRouter() {
    const router = {};
    
    const routes = {
      'GET /health': 'healthCheck',
      'GET /test-internet': 'internetTest',
      'POST /api/chat': 'chatRequest',
      'POST /api/stream': 'chatRequest',
      'POST /': 'chatRequest',
      'OPTIONS /': 'corsPreflight'
    };
    
    for (const [path, handler] of Object.entries(routes)) {
      const parts = path.split(' ');
      const method = parts[0];
      const route = parts[1] || '/';
      let current = router;
      
      // Build method node
      if (!current[method]) {
        current[method] = {};
      }
      current = current[method];
      
      // Build route trie
      const segments = route.split('/').filter(s => s !== '');
      for (const segment of segments) {
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }
      current._handler = handler;
    }
    
    return router;
  }

  /**
   * Route request using Trie for O(k) complexity
   * @param {string} method - HTTP method
   * @param {string} pathname - Request path
   * @returns {string|null} Handler name or null
   */
  _routeRequest(method, pathname) {
    let current = this.requestRouter[method];
    if (!current) return null;
    
    // Special handling for OPTIONS method - match any path
    if (method === 'OPTIONS') {
      return current._handler || null;
    }
    
    const segments = pathname.split('/').filter(s => s);
    
    for (const segment of segments) {
      if (current[segment]) {
        current = current[segment];
      } else if (current['*']) {
        current = current['*'];
      } else {
        return null;
      }
    }
    
    return current._handler || null;
  }

  /**
   * Cache management with LRU eviction
   * @private
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   */
  _setCache(key, value) {
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Get value from cache with TTL check
   * @private
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      this.performanceMetrics.cacheHits++;
      return cached.value;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    this.performanceMetrics.cacheMisses++;
    return null;
  }

  /**
   * Get object from pool or create new one
   * @private
   * @param {string} type - Object type
   * @returns {Object} Object from pool
   */
  _getFromPool(type) {
    const pool = this.objectPool[type];
    if (pool.length > 0) {
      return pool.pop();
    }
    return {};
  }

  /**
   * Return object to pool
   * @private
   * @param {string} type - Object type
   * @param {Object} obj - Object to return
   */
  _returnToPool(type, obj) {
    const pool = this.objectPool[type];
    if (pool.length < 100) { // Limit pool size
      // Clear object properties
      Object.keys(obj).forEach(key => delete obj[key]);
      pool.push(obj);
    }
  }

  /**
   * Circuit breaker pattern for error handling
   * @private
   * @param {Function} operation - Operation to execute
   * @returns {Promise} Operation result
   */
  async _executeWithCircuitBreaker(operation) {
    const now = Date.now();
    
    // Check if circuit is open
    if (this.circuitBreaker.state === 'OPEN') {
      if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
        this.circuitBreaker.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      
      // Reset circuit breaker on success
      if (this.circuitBreaker.state === 'HALF_OPEN') {
        this.circuitBreaker.state = 'CLOSED';
        this.circuitBreaker.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = now;
      
      if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
        this.circuitBreaker.state = 'OPEN';
      }
      
      throw error;
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / 
        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100,
      averageResponseTime: this.performanceMetrics.averageResponseTime / 
        Math.max(this.performanceMetrics.totalRequests, 1),
      circuitBreakerState: this.circuitBreaker.state
    };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      streamingRequests: 0,
      directRequests: 0,
      errorCount: 0,
      ipExtractionTime: 0,
      sessionProcessingTime: 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      ttl: this.cacheTTL,
      hitRate: this.performanceMetrics.cacheHits / 
        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100
    };
  }
}

// Create singleton instance
const worker = new OptimizedIslamicAIWorker();

export default {
  /**
   * Get configured API keys with fallback
   * @param {Object} env - Environment variables
   * @returns {Array} Array of API keys
   */
  getAPIKeys(env) {
    // Try multiple API keys first, then fallback to single key
    let apiKeys = [];
    
    if (env.GEMINI_API_KEYS) {
      apiKeys = env.GEMINI_API_KEYS.split(',').map(key => key.trim()).filter(key => key.length > 0);
    }
    
    // Fallback to single API key if multiple keys not configured
    if (apiKeys.length === 0 && env.GEMINI_API_KEY) {
      apiKeys = [env.GEMINI_API_KEY];
    }
    
    // Final fallback (should be configured in production)
    if (apiKeys.length === 0) {
      console.warn('No API keys configured! Please set GEMINI_API_KEYS or GEMINI_API_KEY');
      apiKeys = ['YOUR_API_KEY_HERE']; // This will fail but prevents crashes
    }
    
    console.log(`Loaded ${apiKeys.length} API key(s) for load balancing`);
    return apiKeys;
  },

  /**
   * Get default streaming options from environment
   * @param {Object} env - Environment variables
   * @returns {Object} Default streaming options
   */
  getDefaultStreamingOptions(env) {
    return {
      enableStreaming: env.DEFAULT_STREAMING_ENABLED === 'true',
      chunkSize: parseInt(env.STREAMING_CHUNK_SIZE) || 30,
      delay: parseInt(env.STREAMING_DELAY_MS) || 50,
      includeMetadata: true
    };
  },

  async fetch(request, env, ctx) {
    const startTime = performance.now();
    worker.performanceMetrics.totalRequests++;

    try {
      const url = new URL(request.url);
      
      // Use Trie-based routing for O(k) path matching
      const handler = worker._routeRequest(request.method, url.pathname);
      
      if (handler === 'corsPreflight') {
        return new Response(null, {
          status: 200,
          headers: worker.responseHeaders.cors
        });
      }

      if (handler === 'healthCheck') {
        return await this._handleHealthCheck(env);
      }

      if (handler === 'internetTest') {
        return await this._handleInternetTest(env);
      }

      if (handler === 'chatRequest') {
        return await this._handleChatRequest(request, env, ctx);
      }

      // Method not allowed
      const errorResponse = worker._getFromPool('errorObjects');
      errorResponse.error = 'Method not allowed';
      const response = new Response(JSON.stringify(errorResponse), {
        status: 405,
        headers: worker.responseHeaders.json
      });
      worker._returnToPool('errorObjects', errorResponse);
      return response;

    } catch (error) {
      console.error('Worker error:', error);
      worker.performanceMetrics.errorCount++;
      
      // Use circuit breaker for error handling
      try {
        return await worker._executeWithCircuitBreaker(async () => {
          const privacyFilter = new PrivacyFilter();
          const safeErrorMessage = privacyFilter.filterResponse(error.message);
          
          const fallbackResponse = worker._getFromPool('responses');
          fallbackResponse.session_id = request.url.includes('session_id=') ? 
            new URL(request.url).searchParams.get('session_id') : 'unknown';
          fallbackResponse.reply = "Sorry, AI service is temporarily unavailable. Please try again.";
          fallbackResponse.history_summary = null;
          fallbackResponse.error = safeErrorMessage;

          const response = new Response(JSON.stringify(fallbackResponse), {
            status: 200,
            headers: worker.responseHeaders.json
          });
          
          worker._returnToPool('responses', fallbackResponse);
          return response;
        });
      } catch (circuitError) {
        // Circuit breaker is open
        const fallbackResponse = worker._getFromPool('responses');
        fallbackResponse.session_id = 'unknown';
        fallbackResponse.reply = "Service temporarily unavailable due to high error rate. Please try again later.";
        fallbackResponse.history_summary = null;

        const response = new Response(JSON.stringify(fallbackResponse), {
          status: 503,
          headers: worker.responseHeaders.json
        });
        
        worker._returnToPool('responses', fallbackResponse);
        return response;
      }
    } finally {
      const processingTime = performance.now() - startTime;
      worker.performanceMetrics.averageResponseTime += processingTime;
    }
  },

  /**
   * Handle health check with caching
   * @private
   */
  async _handleHealthCheck(env) {
    const cacheKey = 'health_check';
    const cached = worker._getCache(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: worker.responseHeaders.json
      });
    }

    const apiKeys = this.getAPIKeys(env);
    const geminiAPI = new GeminiAPI(apiKeys);
    const keyStats = geminiAPI.getKeyStats();
    
    const privacyFilter = new PrivacyFilter();
    const sanitizedKeyStats = privacyFilter.sanitizeSessionData(keyStats);
    
    const healthData = {
      status: 'healthy',
      streaming: 'enabled_by_default',
      multipleApiKeys: true,
      internetAccess: 'enabled',
      apiKeys: {
        total: apiKeys.length,
        available: geminiAPI.apiKeyManager.getAvailableKeyCount(),
        stats: sanitizedKeyStats
      },
      defaultStreaming: {
        enabled: env.DEFAULT_STREAMING_ENABLED === 'true',
        chunkSize: parseInt(env.STREAMING_CHUNK_SIZE) || 30,
        delay: parseInt(env.STREAMING_DELAY_MS) || 50
      },
      timestamp: new Date().toISOString(),
      performance: worker.getPerformanceMetrics()
    };

    worker._setCache(cacheKey, healthData);

    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: worker.responseHeaders.json
    });
  },

  /**
   * Handle internet test with caching
   * @private
   */
  async _handleInternetTest(env) {
    const cacheKey = 'internet_test';
    const cached = worker._getCache(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: worker.responseHeaders.json
      });
    }

    try {
      const apiKeys = this.getAPIKeys(env);
      const geminiAPI = new GeminiAPI(apiKeys);
      const privacyFilter = new PrivacyFilter();
      
      const testQuery = 'current islamic calendar 2024';
      const internetData = await geminiAPI.internetProcessor.processQuery(testQuery);
      const sanitizedInternetData = privacyFilter.sanitizeSessionData(internetData);
      
      const testData = {
        status: 'internet_test_completed',
        internetAccess: sanitizedInternetData.needsInternetData ? 'working' : 'limited',
        testQuery: testQuery,
        searchResults: sanitizedInternetData.data ? {
          sources: sanitizedInternetData.data.sources,
          resultsCount: sanitizedInternetData.data.results.length,
          islamicRelevance: sanitizedInternetData.data.islamicRelevance,
          dataQuality: sanitizedInternetData.data.dataQuality
        } : null,
        processingStats: geminiAPI.internetProcessor.getProcessingStats(),
        timestamp: new Date().toISOString()
      };

      worker._setCache(cacheKey, testData);

      return new Response(JSON.stringify(testData), {
        status: 200,
        headers: worker.responseHeaders.json
      });
    } catch (error) {
      const privacyFilter = new PrivacyFilter();
      const safeErrorMessage = privacyFilter.filterResponse(error.message);
      
      const errorData = {
        status: 'internet_test_failed',
        error: safeErrorMessage,
        internetAccess: 'failed',
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(errorData), {
        status: 200,
        headers: worker.responseHeaders.json
      });
    }
  },

  /**
   * Handle chat request with optimizations
   * @private
   */
  async _handleChatRequest(request, env, ctx) {
    return await worker._executeWithCircuitBreaker(async () => {
      return await this.handleChatRequest(request, env, ctx);
    });
  },

  /**
   * Extract user IP address from request with optimized header checking
   * @param {Request} request - The incoming request
   * @returns {string} User's IP address
   */
  extractUserIP(request) {
    const startTime = performance.now();
    
    // Use pre-computed header priority for O(1) lookup
    for (const header of worker.ipHeaderPriority) {
      const value = request.headers.get(header);
      if (value) {
        // If X-Forwarded-For contains multiple IPs, take the first one
        const finalIP = value.includes(',') ? value.split(',')[0].trim() : value;
        
        worker.performanceMetrics.ipExtractionTime += performance.now() - startTime;
        console.log(`User IP detected: ${finalIP} (from ${header})`);
        
        return finalIP;
      }
    }
    
    worker.performanceMetrics.ipExtractionTime += performance.now() - startTime;
    console.log('No valid IP address found in headers');
    return 'unknown';
  },

  /**
   * Handle all chat requests with streaming by default and multiple API key support
   */
  async handleChatRequest(request, env, ctx) {
    const url = new URL(request.url);
    const body = await request.json();
    
    // Extract user IP for location detection
    // Allow manual IP override for testing
    const manualIP = body.manual_ip || null;
    const userIP = manualIP || this.extractUserIP(request);
    
    // Get session ID from either URL params or request body
    const sessionId = url.searchParams.get('session_id') || body.session_id;
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    const userMessage = body.message;
    const userIdFromBody = body.user_id || body.userId || null;
    const memoryOptOut = body.memory_opt_out === true;
    // Brevity controls (default to terse)
    const mode = (body.mode || '').toLowerCase();
    const terse = body.terse === true || mode === 'terse' || mode === 'brief' || body.verbose === false;
    const verbose = body.verbose === true || mode === 'verbose';
    const brevityPrefs = {
      terse,
      verbose,
      maxSentences: Number(body.max_sentences) > 0 ? Math.min(Number(body.max_sentences), 8) : (terse ? 4 : 12),
      maxTokens: Number(body.max_tokens) > 0 ? Math.min(Number(body.max_tokens), 1024) : (terse ? 192 : 512)
    };
    const languageInfo = body.language_info || {};
    
    // Get default streaming options and allow override
    const defaultStreamingOptions = this.getDefaultStreamingOptions(env);
    const requestStreamingOptions = body.streaming_options || {};
    const streamingOptions = {
      ...defaultStreamingOptions,
      ...requestStreamingOptions
    };
    
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    console.log(`Processing message for session ${sessionId}: ${userMessage}`);
    console.log(`Streaming options:`, streamingOptions);
    console.log(`User IP: ${userIP} ${manualIP ? '(manual override)' : ''}`);

    // Initialize managers and adaptive language system
    // Use multiple KV namespaces if available, otherwise fall back to single
    const kvNamespaces = [];
    if (env.CHAT_SESSIONS) kvNamespaces.push(env.CHAT_SESSIONS);
    if (env.CHAT_SESSIONS_2) kvNamespaces.push(env.CHAT_SESSIONS_2);
    if (env.CHAT_SESSIONS_3) kvNamespaces.push(env.CHAT_SESSIONS_3);
    if (env.CHAT_SESSIONS_4) kvNamespaces.push(env.CHAT_SESSIONS_4);
    
    const sessionManager = new MultiKVSessionManager(kvNamespaces.length > 0 ? kvNamespaces : [env.CHAT_SESSIONS]);
    // Use dedicated KVs if available; fallback to primary chat KV
    const primaryKV = kvNamespaces.length > 0 ? kvNamespaces[0] : env.CHAT_SESSIONS;
    const userKV = env.USER_KV || primaryKV;
    const semanticKV = env.SEMANTIC_KV || primaryKV;
    const persistentMemory = new PersistentMemoryManager(primaryKV, userKV, semanticKV);
    const commandHandler = new CommandHandler();
    const adaptiveLanguageSystem = new AdaptiveLanguageSystem();
    const privacyFilter = new PrivacyFilter(); // Add privacy filter
    
    // Use multiple API keys with load balancing
    const apiKeys = this.getAPIKeys(env);
    const geminiAPI = new GeminiAPI(apiKeys);
    
    console.log(`Using ${apiKeys.length} API key(s) with load balancing`);

    // Link session to user and apply opt-out if requested
    // Determine userId (prefer explicit; fallback to prior link; then sessionId)
    let userId = userIdFromBody || await persistentMemory.getUserIdForSession(sessionId) || sessionId;
    await persistentMemory.linkSessionToUser(sessionId, userId);
    if (memoryOptOut) {
      await persistentMemory.setOptOut(userId, true);
    }

    // Forget intent: support /forget and natural language like "forget this" or "yaad mat rakho"
    const msgLower = (userMessage || '').trim().toLowerCase();
    if (msgLower === '/forget' || /\b(forget this|yaad mat rakho|isse bhool jao|isey bhool jao|forget it)\b/.test(msgLower)) {
      const ok = await persistentMemory.forgetLast(userId);
      const reply = ok ? 'Okay, I have forgotten the most recent memory.' : 'There was nothing recent to forget.';
      return new Response(JSON.stringify({ session_id: sessionId, reply }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Apply adaptive language learning and detection
    const languageAdaptation = adaptiveLanguageSystem.adaptLanguage(userMessage, sessionId, {
      previousMessages: await sessionManager.getRecentMessages(sessionId, 5),
      userProfile: await sessionManager.getUserProfile(sessionId),
      timestamp: Date.now()
    });

    // Check for commands
    if (userMessage.startsWith('/')) {
      const commandResult = await commandHandler.handleCommand(userMessage, sessionId, sessionManager);
      // Filter command results
      const filteredCommandResult = {
        ...commandResult,
        reply: privacyFilter.filterResponse(commandResult.reply)
      };
      return new Response(JSON.stringify(filteredCommandResult), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get contextual prompt with memory
    const contextualPromptBase = await sessionManager.getContextualPrompt(sessionId, userMessage);

    // Hybrid recall: short-term (already in contextualPromptBase) + semantic similar long-term
    // Fetch full session history to drive recall
    const sessionDataForRecall = await sessionManager.getSessionData(sessionId);
    const recall = await persistentMemory.recall(userId, sessionDataForRecall.history || [], userMessage, {
      lastN: 10,
      topK: 5
    });

    let contextualPrompt = contextualPromptBase;
    if (recall.similar && recall.similar.length > 0) {
      contextualPrompt += '\n\n**Relevant Prior Memories:**\n';
      recall.similar.forEach(rec => {
        const label = rec.metadata && rec.metadata.kind ? rec.metadata.kind : 'memory';
        contextualPrompt += `- (${label}) ${rec.text}\n`;
      });
    }
    
    // Create enhanced language info with adaptation data
    const enhancedLanguageInfo = {
      detected_language: languageAdaptation.detectedLanguage,
      confidence: languageAdaptation.confidence,
      should_respond_in_language: languageAdaptation.shouldAdapt,
      adaptation_type: languageAdaptation.adaptationType,
      user_preference: languageAdaptation.userPreference,
      learning_data: languageAdaptation.learningData,
      response_instructions: adaptiveLanguageSystem.getResponseInstructions(
        languageAdaptation.detectedLanguage, 
        languageAdaptation
      ),
      response_prefs: brevityPrefs
    };

    try {
      // Get location information early for context
      let locationInfo = null;
      if (userIP && userIP !== 'unknown') {
        try {
          const { LocationPrayerService } = await import('./location-prayer-service.js');
          const locationService = new LocationPrayerService();
          const location = await locationService.getUserLocation(userIP);
          locationInfo = {
            ip: userIP,
            city: location.city,
            region: location.region,
            country: location.country,
            timezone: location.timezone,
            latitude: location.lat,
            longitude: location.lng,
            source: location.source,
            isDefault: location.isDefault || false
          };
          console.log('Location information retrieved:', locationInfo);
        } catch (error) {
          console.log('Location detection failed:', error.message);
          // Even if location detection fails, we still want to continue with the request
        }
      } else {
        console.log('No valid IP address for location detection, using default location');
        try {
          const { LocationPrayerService } = await import('./location-prayer-service.js');
          const locationService = new LocationPrayerService();
          const defaultLocation = locationService.getDefaultLocation();
          locationInfo = {
            ip: 'unknown',
            city: defaultLocation.city,
            region: defaultLocation.region,
            country: defaultLocation.country,
            timezone: defaultLocation.timezone,
            latitude: defaultLocation.lat,
            longitude: defaultLocation.lng,
            source: defaultLocation.source,
            isDefault: true
          };
          console.log('Default location information used:', locationInfo);
        } catch (error) {
          console.log('Failed to get default location:', error.message);
        }
      }

      // Check if streaming is enabled (default is true)
      if (streamingOptions.enableStreaming) {
        console.log('Using streaming response (default mode)');
        return await this.handleStreamingResponse(
          geminiAPI, 
          sessionId, 
          userMessage, 
          contextualPrompt, 
          enhancedLanguageInfo, 
          streamingOptions,
          sessionManager,
          userIP,
          locationInfo, // Pass location info to streaming handler
          privacyFilter // Pass privacy filter to streaming handler
        );
      } else {
        console.log('Using direct response (streaming disabled)');
        // Process internet data if needed
        const internetData = await geminiAPI.internetProcessor.processQuery(userMessage, {
          sessionId,
          languageInfo: enhancedLanguageInfo,
          contextualPrompt
        }, userIP);
        
        // Call Gemini API with direct response, now including location context
        const geminiResponse = await geminiAPI.generateResponse(
          [], 
          sessionId, 
          userMessage, 
          contextualPrompt, 
          enhancedLanguageInfo, 
          streamingOptions,
          userIP,
          locationInfo // Pass location info to Gemini API
        );
        
        // Filter the response before sending to user
        const filteredResponse = privacyFilter.filterResponse(geminiResponse);
        
        // Record turns in persistent memory (user + assistant)
        await persistentMemory.recordTurn(userId, sessionId, 'user', userMessage);
        await persistentMemory.recordTurn(userId, sessionId, 'assistant', filteredResponse);

        // Process message and update session with intelligent memory
        const sessionData = await sessionManager.processMessage(sessionId, userMessage, filteredResponse);

        // Episodic summarization when history grows
        if ((sessionData.history || []).length >= 20) {
          try {
            const summaryText = sessionManager.getHistorySummary(sessionData.history) || '';
            if (summaryText) {
              await persistentMemory.addEpisodicSummary(userId, sessionId, summaryText);
            }
          } catch {}
        }

        // Prepare response (compact if terse)
        const response = brevityPrefs.terse ? {
          session_id: sessionId,
          reply: filteredResponse,
          streaming: false,
          timestamp: new Date().toISOString()
        } : {
          session_id: sessionId,
          reply: filteredResponse,
          history_summary: sessionManager.getHistorySummary(sessionData.history),
          user_profile: privacyFilter.sanitizeSessionData(sessionData.userProfile),
          memory_count: sessionData.memories.length,
          streaming: false,
          api_keys_used: apiKeys.length,
          language_info: enhancedLanguageInfo,
          internet_enhanced: true,
          location_info: locationInfo,
          timestamp: new Date().toISOString(),
          response_metadata: {
            response_length: filteredResponse.length,
            language_detected: enhancedLanguageInfo.detected_language,
            adaptation_type: enhancedLanguageInfo.adaptation_type,
            internet_data_used: internetData ? internetData.needsInternetData : false,
            search_strategy: internetData && internetData.searchResults ? internetData.searchResults.searchStrategy : null
          }
        };

        console.log(`Direct response generated for session ${sessionId}, length: ${filteredResponse.length}`);

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

    } catch (error) {
      console.error('Error generating response:', error);
      
      // Use privacy filter for error messages
      const safeErrorMessage = privacyFilter.filterResponse(error.message);
      
      // Return error response
      const errorResponse = {
        session_id: sessionId,
        reply: "Sorry, I'm having trouble processing your request right now. Please try again.",
        error: safeErrorMessage,
        streaming: streamingOptions.enableStreaming,
        api_keys_available: apiKeys.length,
        language_info: enhancedLanguageInfo // Include language info in error response
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },

  /**
   * Handle streaming response with optimized buffering and batching
   * @param {GeminiAPI} geminiAPI - Gemini API instance with multiple keys
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @param {string} contextualPrompt - Contextual prompt
   * @param {Object} enhancedLanguageInfo - Enhanced language info
   * @param {Object} streamingOptions - Streaming options
   * @param {AdvancedSessionManager} sessionManager - Session manager
   * @param {string} userIP - User's IP address for location detection
   * @param {Object} locationInfo - User's location information
   * @param {PrivacyFilter} privacyFilter - Privacy filter instance
   * @returns {Response} Streaming response
   */
  async handleStreamingResponse(geminiAPI, sessionId, userMessage, contextualPrompt, enhancedLanguageInfo, streamingOptions, sessionManager, userIP, locationInfo, privacyFilter) {
    const startTime = performance.now();
    worker.performanceMetrics.streamingRequests++;

    try {
      console.log(`Starting streaming response for session ${sessionId} with ${geminiAPI.apiKeyManager.getAvailableKeyCount()} API keys`);
      
      // Generate streaming response using multiple API keys, now including location context
      const stream = await geminiAPI.generateResponse(
        [], 
        sessionId, 
        userMessage, 
        contextualPrompt, 
        enhancedLanguageInfo, 
        streamingOptions,
        userIP,
        locationInfo // Pass location info to Gemini API
      );
      
      // Create optimized streaming buffer
      const buffer = {
        chunks: [],
        totalSize: 0,
        maxSize: streamingOptions.chunkSize * 10, // Buffer up to 10 chunks
        flush: () => {
          if (buffer.chunks.length > 0) {
            const combined = buffer.chunks.join('');
            buffer.chunks = [];
            buffer.totalSize = 0;
            return combined;
          }
          return null;
        },
        add: (chunk) => {
          buffer.chunks.push(chunk);
          buffer.totalSize += chunk.length;
          if (buffer.totalSize >= buffer.maxSize) {
            return buffer.flush();
          }
          return null;
        }
      };
      
      // Create a new stream that includes session management with optimizations
      const enhancedStream = new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          let metadataSent = false;
          let chunkCount = 0;
          
          try {
            const reader = stream.getReader();
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              // Parse the chunk
              const chunkData = this.parseStreamingChunk(value);
              
              // Filter content if it's a content chunk
              if (chunkData && chunkData.type === 'content') {
                const filteredContent = privacyFilter.filterResponse(chunkData.content);
                fullResponse += filteredContent;
                
                // Create a new filtered chunk
                const filteredChunk = `data: ${JSON.stringify({
                  type: 'content',
                  content: filteredContent
                })}\n\n`;
                
                // Use buffering for better performance
                const bufferedChunk = buffer.add(filteredChunk);
                if (bufferedChunk) {
                  controller.enqueue(new TextEncoder().encode(bufferedChunk));
                }
              } else {
                // Forward non-content chunks as is
                controller.enqueue(value);
              }
              
              // Send metadata once at the beginning (skip if terse)
              if (!metadataSent && chunkData && chunkData.type !== 'start') {
                if (!(enhancedLanguageInfo && enhancedLanguageInfo.response_prefs && enhancedLanguageInfo.response_prefs.terse)) {
                  const metadataObj = worker._getFromPool('metadataObjects');
                  metadataObj.type = 'metadata';
                  metadataObj.content = {
                    session_id: sessionId,
                    streaming: true,
                    timestamp: new Date().toISOString(),
                    language_info: enhancedLanguageInfo,
                    location_info: locationInfo,
                    chunk_info: {
                      size: streamingOptions.chunkSize,
                      delay: streamingOptions.delay
                    }
                  };
                  
                  const metadataChunk = `data: ${JSON.stringify(metadataObj)}\n\n`;
                  controller.enqueue(new TextEncoder().encode(metadataChunk));
                  
                  worker._returnToPool('metadataObjects', metadataObj);
                }
                metadataSent = true;
              }
              
              // Forward the chunk (already handled above for content chunks)
              if (chunkData && chunkData.type !== 'content') {
                controller.enqueue(value);
              }
              
              chunkCount++;
            }
            
            // Flush remaining buffer
            const remainingBuffer = buffer.flush();
            if (remainingBuffer) {
              controller.enqueue(new TextEncoder().encode(remainingBuffer));
            }
            
            // Send completion metadata (skip if terse)
            if (!(enhancedLanguageInfo && enhancedLanguageInfo.response_prefs && enhancedLanguageInfo.response_prefs.terse)) {
              // Filter the full response for any sensitive information
              const filteredFullResponse = privacyFilter.filterResponse(fullResponse);
              
              const completionObj = worker._getFromPool('metadataObjects');
              completionObj.type = 'completion';
              completionObj.content = {
                session_id: sessionId,
                response_length: filteredFullResponse.length,
                timestamp: new Date().toISOString(),
                message: 'Response completed successfully ✅',
                location_info: locationInfo,
                chunk_count: chunkCount,
                processing_time: performance.now() - startTime
              };
              
              const completionChunk = `data: ${JSON.stringify(completionObj)}\n\n`;
              controller.enqueue(new TextEncoder().encode(completionChunk));
              
              worker._returnToPool('metadataObjects', completionObj);
            }
            
            // Process the complete message for session management
            if (fullResponse.trim()) {
              try {
                // Filter the full response before storing in session
                const filteredFullResponse = privacyFilter.filterResponse(fullResponse);
                await sessionManager.processMessage(sessionId, userMessage, filteredFullResponse);
                console.log(`Streaming session updated for ${sessionId}, response length: ${filteredFullResponse.length}`);
              } catch (sessionError) {
                console.error('Session processing error:', sessionError);
              }
            }
            
          } catch (error) {
            console.error('Streaming processing error:', error);
            // Use privacy filter for error messages
            const safeErrorMessage = privacyFilter.filterResponse(error.message);
            const errorChunk = this.createErrorChunk(safeErrorMessage);
            controller.enqueue(new TextEncoder().encode(errorChunk));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(enhancedStream, {
        status: 200,
        headers: worker.responseHeaders.stream
      });

    } catch (error) {
      console.error('Streaming response error:', error);
      worker.performanceMetrics.errorCount++;
      
      // Use privacy filter for error messages
      const safeErrorMessage = privacyFilter.filterResponse(error.message);
      
      const errorResponse = worker._getFromPool('errorObjects');
      errorResponse.error = safeErrorMessage;
      errorResponse.session_id = sessionId;
      
      const response = new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: worker.responseHeaders.json
      });
      
      worker._returnToPool('errorObjects', errorResponse);
      return response;
    }
  },

  /**
   * Parse streaming chunk data
   * @param {string} chunk - Raw chunk data
   * @returns {Object} Parsed chunk data
   */
  parseStreamingChunk(chunk) {
    try {
      const chunkStr = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
      const lines = chunkStr.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.substring(6);
          return JSON.parse(jsonData);
        }
      }
      return { type: 'unknown', content: chunkStr };
    } catch (error) {
      return { type: 'error', content: chunk };
    }
  },

  /**
   * Create error chunk for streaming
   * @param {string} errorMessage - Error message
   * @returns {string} Formatted error chunk
   */
  createErrorChunk(errorMessage) {
    return `data: ${JSON.stringify({
      type: 'error',
      content: errorMessage,
      timestamp: new Date().toISOString()
    })}\n\n`;
  },

  /**
   * Get worker performance metrics
   * @returns {Object} Performance metrics
   */
  getWorkerPerformanceMetrics() {
    return worker.getPerformanceMetrics();
  },

  /**
   * Get worker cache statistics
   * @returns {Object} Cache statistics
   */
  getWorkerCacheStats() {
    return worker.getCacheStats();
  },

  /**
   * Reset worker performance metrics
   */
  resetWorkerPerformanceMetrics() {
    worker.resetPerformanceMetrics();
  },

  /**
   * Clear worker cache
   */
  clearWorkerCache() {
    worker.clearCache();
  },

  /**
   * Get circuit breaker state
   * @returns {string} Circuit breaker state
   */
  getCircuitBreakerState() {
    return worker.circuitBreaker.state;
  },

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    worker.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
      threshold: 5,
      timeout: 60000
    };
  }
};
