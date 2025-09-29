import { GeminiAPI } from './gemini-api.js';
import { MultiKVSessionManager } from './multi-kv-session-manager.js';
import { CommandHandler } from './command-handler.js';
import { AdaptiveLanguageSystem } from './adaptive-language-system.js';
import { PrivacyFilter } from './privacy-filter.js';
import { PersistentMemoryManager } from './persistent-memory-manager.js';
import { D1MemoryManager, D1_SCHEMA_SQL } from './d1-memory-manager.js';
import { AuthManager, AUTH_SCHEMA_SQL } from './auth-manager.js';

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
      cors: (origin) => ({
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true'
      }),
      json: (origin) => ({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true'
      }),
      stream: (origin) => ({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization, X-CSRF-Token',
        'Access-Control-Allow-Credentials': 'true'
      })
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
      'OPTIONS /health': 'corsPreflight',
      'GET /test-internet': 'internetTest',
      'OPTIONS /test-internet': 'corsPreflight',
      'POST /auth/signup': 'authSignup',
      'OPTIONS /auth/signup': 'corsPreflight',
      'POST /auth/login': 'authLogin',
      'OPTIONS /auth/login': 'corsPreflight',
      'POST /auth/google': 'authGoogle',
      'OPTIONS /auth/google': 'corsPreflight',
      'POST /auth/csrf-token': 'generateCSRFToken',
      'OPTIONS /auth/csrf-token': 'corsPreflight',
      'POST /prefs/update': 'prefsUpdate',
      'OPTIONS /prefs/update': 'corsPreflight',
      'POST /prefs/clear': 'prefsClear',
      'OPTIONS /prefs/clear': 'corsPreflight',
      'POST /profile/update': 'profileUpdate',
      'OPTIONS /profile/update': 'corsPreflight',
      'POST /memory/clear': 'memoryClear',
      'OPTIONS /memory/clear': 'corsPreflight',
      'GET /memory/profile': 'getMemoryProfile',
      'OPTIONS /memory/profile': 'corsPreflight',
      'POST /api/chat': 'chatRequest',
      'OPTIONS /api/chat': 'corsPreflight',
      'POST /api/stream': 'chatRequest',
      'OPTIONS /api/stream': 'corsPreflight',
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
      // Try to match exact path first
      const segments = pathname.split('/').filter(s => s);
      let optionsCurrent = this.requestRouter['OPTIONS'];
      
      for (const segment of segments) {
        if (optionsCurrent[segment]) {
          optionsCurrent = optionsCurrent[segment];
        } else {
          break;
        }
      }
      
      if (optionsCurrent._handler) {
        return optionsCurrent._handler;
      }
      
      // Fallback to corsPreflight handler
      return 'corsPreflight';
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
  /** Ensure D1 schema exists (idempotent) */
  async ensureD1Schema(env) {
    try {
      if (!env || !env.D1_DB) return;
      // Run minimal CREATE TABLE IF NOT EXISTS batch
      const statements = (D1_SCHEMA_SQL + '\n' + AUTH_SCHEMA_SQL)
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      for (const stmt of statements) {
        try {
          await env.D1_DB.prepare(stmt).run();
        } catch {}
      }
    } catch (e) {
      console.log('D1 schema ensure failed:', e.message);
    }
  },
  /**
   * JWT token utilities for auth
   */
  async signToken(userId, env) {
    const secret = env.AUTH_SECRET || 'dev-secret';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    
    // Create JWT payload with expiration (24 hours)
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: userId,
      exp: now + (24 * 60 * 60), // 24 hours
      iat: now,
      iss: 'islamic-ai',
      aud: 'islamic-ai-users'
    };
    
    // Encode header and payload
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerEncoded = btoa(JSON.stringify(header)).replace(/=/g, '');
    const payloadEncoded = btoa(JSON.stringify(payload)).replace(/=/g, '');
    const data = `${headerEncoded}.${payloadEncoded}`;
    
    // Sign the data
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '');
    
    return `${data}.${signature}`;
  },

  async verifyToken(request, env) {
    const auth = request.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return null;
    
    const token = auth.substring(7);
    const secret = env.AUTH_SECRET || 'dev-secret';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerEncoded, payloadEncoded, signature] = parts;
    const data = `${headerEncoded}.${payloadEncoded}`;
    
    // Verify signature
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '');
    if (signature !== expectedSignature) return null;
    
    // Decode and validate payload
    try {
      const payload = JSON.parse(atob(payloadEncoded));
      const now = Math.floor(Date.now() / 1000);
      
      // Check expiration
      if (payload.exp && payload.exp < now) return null;
      
      // Check issuer
      if (payload.iss !== 'islamic-ai') return null;
      
      // Check audience
      if (payload.aud !== 'islamic-ai-users') return null;
      
      return payload.sub; // Return user ID
    } catch (e) {
      return null;
    }
  },
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

    // Get the origin from the request
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    try {
      const url = new URL(request.url);
      
      // Use Trie-based routing for O(k) path matching
      const handler = worker._routeRequest(request.method, url.pathname);
      
      if (handler === 'corsPreflight') {
        return new Response(null, {
          status: 200,
          headers: worker.responseHeaders.cors(origin)
        });
      }

      if (handler === 'healthCheck') {
        return await this._handleHealthCheck(env, origin);
      }

      if (handler === 'internetTest') {
        return await this._handleInternetTest(env, origin);
      }

      if (handler === 'authSignup') {
        return await this._handleAuthSignup(request, env, origin);
      }

      if (handler === 'authLogin') {
        return await this._handleAuthLogin(request, env, origin);
      }

      if (handler === 'authGoogle') {
        return await this._handleAuthGoogle(request, env, origin);
      }

      if (handler === 'generateCSRFToken') {
        return await this._handleGenerateCSRFToken(request, env, origin);
      }

      if (handler === 'prefsUpdate') {
        return await this._handlePrefsUpdate(request, env, origin);
      }

      if (handler === 'prefsClear') {
        return await this._handlePrefsClear(request, env, origin);
      }

      if (handler === 'profileUpdate') {
        return await this._handleProfileUpdate(request, env, origin);
      }

      if (handler === 'memoryClear') {
        return await this._handleMemoryClear(request, env, origin);
      }

      if (handler === 'getMemoryProfile') {
        return await this._handleGetMemoryProfile(request, env, origin);
      }

      if (handler === 'chatRequest') {
        return await this._handleChatRequest(request, env, ctx, origin);
      }

      // Method not allowed
      const errorResponse = worker._getFromPool('errorObjects');
      errorResponse.error = 'Method not allowed';
      const response = new Response(JSON.stringify(errorResponse), {
        status: 405,
        headers: worker.responseHeaders.json(origin)
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
            headers: worker.responseHeaders.json(origin)
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
          headers: worker.responseHeaders.json(origin)
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
  async _handleHealthCheck(env, origin) {
    const cacheKey = 'health_check';
    const cached = worker._getCache(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: worker.responseHeaders.json(origin)
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
      headers: worker.responseHeaders.json(origin)
    });
  },

  /**
   * Handle internet test with caching
   * @private
   */
  async _handleInternetTest(env, origin) {
    const cacheKey = 'internet_test';
    const cached = worker._getCache(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: worker.responseHeaders.json(origin)
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
        headers: worker.responseHeaders.json(origin)
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
        headers: worker.responseHeaders.json(origin)
      });
    }
  },

  /**
   * Auth: Email signup
   */
  async _handleAuthSignup(request, env, origin) {
    try {
      await this.ensureD1Schema(env);
      const body = await request.json();
      const { email, password } = body || {};
      
      // Get CSRF token from header
      const csrfToken = request.headers.get('X-CSRF-Token');
      
      // Verify CSRF token for state-changing operations
      if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
        return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
      }
      
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: worker.responseHeaders.json(origin) });
      }
      const auth = new AuthManager(env.D1_DB, env);
      const { userId } = await auth.signupEmail(email, password);
      const d1 = new D1MemoryManager(env.D1_DB, env);
      await d1.ensureUser(userId, { email, provider: 'local' });
      const token = await this.signToken(userId, env);
      
      // Generate and set CSRF token cookie
      const csrfTokenNew = this.generateCSRFToken(env);
      const responseHeaders = {
        ...worker.responseHeaders.json(origin),
        'Set-Cookie': `csrf-token=${csrfTokenNew}; HttpOnly; Secure; SameSite=Strict; Path=/`
      };
      
      return new Response(JSON.stringify({ user_id: userId, token }), { status: 200, headers: responseHeaders });
    } catch (e) {
      const privacyFilter = new PrivacyFilter();
      return new Response(JSON.stringify({ error: privacyFilter.filterResponse(e.message) }), { status: 400, headers: worker.responseHeaders.json(origin) });
    }
  },

  /**
   * Auth: Email login
   */
  async _handleAuthLogin(request, env, origin) {
    try {
      await this.ensureD1Schema(env);
      const body = await request.json();
      const { email, password } = body || {};
      
      // Get CSRF token from header
      const csrfToken = request.headers.get('X-CSRF-Token');
      
      // Verify CSRF token for state-changing operations
      if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
        return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
      }
      
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: worker.responseHeaders.json(origin) });
      }
      const auth = new AuthManager(env.D1_DB, env);
      const { userId } = await auth.loginEmail(email, password);
      const d1 = new D1MemoryManager(env.D1_DB, env);
      await d1.ensureUser(userId, { email, provider: 'local' });
      
      // Update user profile with login information
      await d1.updateUserProfile(userId, {});
      
      const token = await this.signToken(userId, env);
      
      // Generate and set CSRF token cookie
      const csrfTokenNew = this.generateCSRFToken(env);
      const responseHeaders = {
        ...worker.responseHeaders.json(origin),
        'Set-Cookie': `csrf-token=${csrfTokenNew}; HttpOnly; Secure; SameSite=Strict; Path=/`
      };
      
      return new Response(JSON.stringify({ user_id: userId, token }), { status: 200, headers: responseHeaders });
    } catch (e) {
      const privacyFilter = new PrivacyFilter();
      return new Response(JSON.stringify({ error: privacyFilter.filterResponse('Invalid credentials') }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
  },

  /**
   * Auth: Google Sign-In
   */
  async _handleAuthGoogle(request, env, origin) {
    try {
      await this.ensureD1Schema(env);
      const body = await request.json();
      const { id_token } = body || {};
      
      // Get CSRF token from header
      const csrfToken = request.headers.get('X-CSRF-Token');
      
      // Verify CSRF token for state-changing operations
      if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
        return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
      }
      
      if (!id_token) {
        return new Response(JSON.stringify({ error: 'id_token required' }), { status: 400, headers: worker.responseHeaders.json(origin) });
      }
      const auth = new AuthManager(env.D1_DB, env);
      const { userId } = await auth.loginGoogle(id_token);
      const d1 = new D1MemoryManager(env.D1_DB, env);
      await d1.ensureUser(userId, { provider: 'google' });
      
      // Update user profile with login information
      await d1.updateUserProfile(userId, {});
      
      const token = await this.signToken(userId, env);
      
      // Generate and set CSRF token cookie
      const csrfTokenNew = this.generateCSRFToken(env);
      const responseHeaders = {
        ...worker.responseHeaders.json(origin),
        'Set-Cookie': `csrf-token=${csrfTokenNew}; HttpOnly; Secure; SameSite=Strict; Path=/`
      };
      
      return new Response(JSON.stringify({ user_id: userId, token }), { status: 200, headers: responseHeaders });
    } catch (e) {
      const privacyFilter = new PrivacyFilter();
      return new Response(JSON.stringify({ error: privacyFilter.filterResponse('Google authentication failed') }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
  },

  /**
   * Generate CSRF token
   */
  async _handleGenerateCSRFToken(request, env, origin) {
    const csrfToken = this.generateCSRFToken(env);
    const responseHeaders = {
      ...worker.responseHeaders.json(origin),
      'Set-Cookie': `csrf-token=${csrfToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
    };
    return new Response(JSON.stringify({ csrfToken }), { status: 200, headers: responseHeaders });
  },

  /**
   * Preferences: update (language, madhhab, interests)
   */
  async _handlePrefsUpdate(request, env, origin) {
    await this.ensureD1Schema(env);
    const userId = await this.verifyToken(request, env);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
    
    // Verify CSRF token for state-changing operations
    const body = await request.json();
    const { language, madhhab, interests } = body || {};
    
    // Get CSRF token from header
    const csrfToken = request.headers.get('X-CSRF-Token');
    
    if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
    }
    
    const d1 = new D1MemoryManager(env.D1_DB, env);
    await d1.ensureUser(userId);
    await d1.setPreferences(userId, { language, madhhab, interests });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: worker.responseHeaders.json(origin) });
  },

  /**
   * Preferences: clear one field
   */
  async _handlePrefsClear(request, env, origin) {
    await this.ensureD1Schema(env);
    const userId = await this.verifyToken(request, env);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
    
    // Verify CSRF token for state-changing operations
    const body = await request.json();
    const { field } = body || {};
    
    // Get CSRF token from header
    const csrfToken = request.headers.get('X-CSRF-Token');
    
    if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
    }
    
    const map = { language: 'language_pref', madhhab: 'madhhab_pref', interests: 'interests_json' };
    const column = map[field];
    if (!column) {
      return new Response(JSON.stringify({ error: 'Invalid field' }), { status: 400, headers: worker.responseHeaders.json(origin) });
    }
    const d1 = new D1MemoryManager(env.D1_DB, env);
    await d1.clearPreference(userId, column);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: worker.responseHeaders.json(origin) });
  },

  /**
   * User Profile: update user profile information
   */
  async _handleProfileUpdate(request, env, origin) {
    await this.ensureD1Schema(env);
    const userId = await this.verifyToken(request, env);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
    
    // Verify CSRF token for state-changing operations
    const body = await request.json();
    const { name, avatar_url } = body || {};
    
    // Get CSRF token from header
    const csrfToken = request.headers.get('X-CSRF-Token');
    
    if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
    }
    
    const d1 = new D1MemoryManager(env.D1_DB, env);
    await d1.ensureUser(userId);
    await d1.updateUserProfile(userId, { name, avatarUrl: avatar_url });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: worker.responseHeaders.json(origin) });
  },

  /**
   * Generate a random CSRF token
   * @param {Object} env - Environment variables
   * @returns {string} CSRF token
   */
  generateCSRFToken(env) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  /**
   * Verify CSRF token
   * @param {Request} request - The incoming request
   * @param {string} csrfToken - CSRF token to verify
   * @returns {boolean} Whether the CSRF token is valid
   */
  verifyCSRFToken(request, csrfToken) {
    // If no CSRF token is provided, allow the request (for backward compatibility)
    if (!csrfToken) {
      return true;
    }
    
    // For stateless APIs, we use double-submit cookie pattern
    // The CSRF token should be provided in both a header and a cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    // Check if CSRF token is provided in header
    const headerCSRFToken = request.headers.get('X-CSRF-Token');
    
    // If we have a csrf-token cookie, verify it matches the provided token in header
    if (cookies['csrf-token'] && headerCSRFToken) {
      return cookies['csrf-token'] === headerCSRFToken;
    }
    
    // If no csrf-token cookie exists but we have a token in the body, verify against that
    // This is for backward compatibility
    if (!cookies['csrf-token'] && csrfToken) {
      return true;
    }
    
    // If no csrf-token cookie exists and no header token, allow the request (for backward compatibility)
    return true;
  },

  /**
   * Clear user memory
   */
  async _handleMemoryClear(request, env, origin) {
    await this.ensureD1Schema(env);
    const userId = await this.verifyToken(request, env);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
    
    // Verify CSRF token for state-changing operations
    const body = await request.json();
    
    // Get CSRF token from header
    const csrfToken = request.headers.get('X-CSRF-Token');
    
    if (csrfToken && !this.verifyCSRFToken(request, csrfToken)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: worker.responseHeaders.json(origin) });
    }
    
    try {
      const d1 = new D1MemoryManager(env.D1_DB, env);
      
      // Delete all user memories using the new method
      await d1.deleteAllUserMemories(userId);
      
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: worker.responseHeaders.json(origin) });
    } catch (e) {
      const privacyFilter = new PrivacyFilter();
      return new Response(JSON.stringify({ error: privacyFilter.filterResponse(e.message) }), { status: 500, headers: worker.responseHeaders.json(origin) });
    }
  },

  /**
   * Get user memory profile
   */
  async _handleGetMemoryProfile(request, env, origin) {
    await this.ensureD1Schema(env);
    const userId = await this.verifyToken(request, env);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: worker.responseHeaders.json(origin) });
    }
    
    try {
      const d1 = new D1MemoryManager(env.D1_DB, env);
      const memoryProfile = await d1.getUserMemoryProfile(userId);
      const userProfile = await d1.getUserProfile(userId);
      
      return new Response(JSON.stringify({ 
        user_id: userId,
        profile: userProfile,
        memory: memoryProfile
      }), { status: 200, headers: worker.responseHeaders.json(origin) });
    } catch (e) {
      const privacyFilter = new PrivacyFilter();
      return new Response(JSON.stringify({ error: privacyFilter.filterResponse(e.message) }), { status: 500, headers: worker.responseHeaders.json(origin) });
    }
  },

  /**
   * Extract user IP address from request with optimized header checking
   * @param {Request} request - The incoming request
   * @returns {string} User's IP address
   */
  extractUserIP(request) {
    // Use pre-computed header priority for O(1) lookup
    const ipHeaderPriority = [
      'CF-Connecting-IP',
      'X-Forwarded-For', 
      'X-Real-IP',
      'X-Client-IP',
      'X-Forwarded',
      'Forwarded-For',
      'Forwarded'
    ];
    
    for (const header of ipHeaderPriority) {
      const value = request.headers.get(header);
      if (value) {
        // If X-Forwarded-For contains multiple IPs, take the first one
        const finalIP = value.includes(',') ? value.split(',')[0].trim() : value;
        console.log(`User IP detected: ${finalIP} (from ${header})`);
        return finalIP;
      }
    }
    
    console.log('No valid IP address found in headers');
    return 'unknown';
  },

  /**
   * Handle chat request with optimizations
   * @private
   */
  async _handleChatRequest(request, env, ctx, origin) {
    // Extract the URL and body from the request
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
        headers: worker.responseHeaders.json(origin),
      });
    }

    const userMessage = body.message;
    // Authenticated user (personalized memory only if authenticated)
    const authedUserId = await this.verifyToken(request, env);
    const userIdFromBody = authedUserId || body.user_id || body.userId || null;
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
        headers: worker.responseHeaders.json(origin),
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
        headers: worker.responseHeaders.json(origin)
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
        headers: worker.responseHeaders.json(origin),
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
    // D1-backed long-term preferences and summaries for authenticated users
    let userPreferences = null;
    let recentSummaries = [];
    let userProfile = null;
    if (authedUserId) {
      try {
        const d1 = new D1MemoryManager(env.D1_DB, env);
        await d1.ensureUser(authedUserId);
        userPreferences = await d1.getPreferences(authedUserId);
        recentSummaries = await d1.getRecentSummaries(authedUserId, 3);
        userProfile = await d1.getUserProfile(authedUserId);
        
        if (userPreferences.language) {
          contextualPrompt += `\n\nUser language preference: ${userPreferences.language}.`;
        }
        if (userPreferences.madhhab) {
          contextualPrompt += `\nMadhhab preference: ${userPreferences.madhhab}.`;
        }
        if (userPreferences.interests && userPreferences.interests.length) {
          contextualPrompt += `\nInterests: ${userPreferences.interests.join(', ')}.`;
        }
        if (recentSummaries.length) {
          contextualPrompt += `\nRecent discussion summaries: ${recentSummaries.map(s => `- ${s}`).join(' ')}`;
        }
      } catch (e) {
        console.log('D1 recall failed:', e.message);
      }
    }
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
          privacyFilter, // Pass privacy filter to streaming handler
          origin // Pass origin to streaming handler
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
              // Also store compressed summary to D1 for authenticated users
              if (authedUserId) {
                try {
                  const d1 = new D1MemoryManager(env.D1_DB, env);
                  await d1.addDiscussionSummary(authedUserId, sessionId, summaryText);
                  // Create a memory checkpoint for long conversations
                  await d1.createMemoryCheckpoint(authedUserId, sessionId, sessionData.history);
                } catch {}
              }
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
          user_preferences: authedUserId ? userPreferences : null,
          user_profile_info: authedUserId ? userProfile : null,
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
          headers: worker.responseHeaders.json(origin),
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
        headers: worker.responseHeaders.json(origin),
      });
    }
  }
};
