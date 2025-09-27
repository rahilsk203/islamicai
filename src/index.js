import { GeminiAPI } from './gemini-api.js';
import { AdvancedSessionManager } from './advanced-session-manager.js';
import { CommandHandler } from './command-handler.js';
import { AdaptiveLanguageSystem } from './adaptive-language-system.js';
import { PrivacyFilter } from './privacy-filter.js';

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
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      const url = new URL(request.url);
      
      // Handle health check for API keys
      if (request.method === 'GET' && url.pathname === '/health') {
        const apiKeys = this.getAPIKeys(env);
        
        const geminiAPI = new GeminiAPI(apiKeys);
        const keyStats = geminiAPI.getKeyStats();
        
        // Use privacy filter to sanitize health check response
        const privacyFilter = new PrivacyFilter();
        const sanitizedKeyStats = privacyFilter.sanitizeSessionData(keyStats);
        
        return new Response(JSON.stringify({
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
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Handle internet connectivity test
      if (request.method === 'GET' && url.pathname === '/test-internet') {
        try {
          const apiKeys = this.getAPIKeys(env);
          const geminiAPI = new GeminiAPI(apiKeys);
          const privacyFilter = new PrivacyFilter(); // Add privacy filter
          
          // Test internet search capability
          const testQuery = 'current islamic calendar 2024';
          const internetData = await geminiAPI.internetProcessor.processQuery(testQuery);
          
          // Sanitize internet data before returning
          const sanitizedInternetData = privacyFilter.sanitizeSessionData(internetData);
          
          return new Response(JSON.stringify({
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
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
          });
        } catch (error) {
          // Use privacy filter for error messages
          const privacyFilter = new PrivacyFilter();
          const safeErrorMessage = privacyFilter.filterResponse(error.message);
          
          return new Response(JSON.stringify({
            status: 'internet_test_failed',
            error: safeErrorMessage,
            internetAccess: 'failed',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
          });
        }
      }

      // All requests now support both streaming and direct responses
      // Default is streaming unless explicitly disabled
      if (request.method === 'POST' && (url.pathname === '/api/chat' || url.pathname === '/api/stream' || url.pathname === '/')) {
        return this.handleChatRequest(request, env, ctx);
      }

      // Only allow POST requests for chat endpoints
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }

      // Default to regular chat
      return this.handleChatRequest(request, env, ctx);

    } catch (error) {
      console.error('Worker error:', error);
      
      // Use privacy filter for error messages
      const privacyFilter = new PrivacyFilter();
      const safeErrorMessage = privacyFilter.filterResponse(error.message);
      
      // Fallback response
      const fallbackResponse = {
        session_id: request.url.includes('session_id=') ? new URL(request.url).searchParams.get('session_id') : 'unknown',
        reply: "Sorry, AI service is temporarily unavailable. Please try again.",
        history_summary: null
      };

      return new Response(JSON.stringify(fallbackResponse), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },

  /**
   * Extract user IP address from request
   * @param {Request} request - The incoming request
   * @returns {string} User's IP address
   */
  extractUserIP(request) {
    // Try multiple headers for IP detection (Cloudflare Workers)
    const cfConnectingIP = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIP = request.headers.get('X-Real-IP');
    
    // Also check for other possible IP headers
    const xClientIP = request.headers.get('X-Client-IP');
    const xForwarded = request.headers.get('X-Forwarded');
    const forwardedFor = request.headers.get('Forwarded-For');
    const forwarded = request.headers.get('Forwarded');
    
    // Priority order: CF-Connecting-IP > X-Forwarded-For > X-Real-IP > others
    const userIP = cfConnectingIP || 
                  xForwardedFor || 
                  xRealIP || 
                  xClientIP ||
                  xForwarded ||
                  forwardedFor ||
                  forwarded ||
                  'unknown';
    
    // If X-Forwarded-For contains multiple IPs, take the first one
    let finalIP = userIP;
    if (userIP && userIP.includes(',')) {
      finalIP = userIP.split(',')[0].trim();
    }
    
    console.log(`User IP detected: ${finalIP}`);
    console.log(`IP Headers: CF-Connecting-IP=${cfConnectingIP}, X-Forwarded-For=${xForwardedFor}, X-Real-IP=${xRealIP}, X-Client-IP=${xClientIP}, X-Forwarded=${xForwarded}, Forwarded-For=${forwardedFor}, Forwarded=${forwarded}`);
    
    return finalIP;
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
    const sessionManager = new AdvancedSessionManager(env.CHAT_SESSIONS);
    const commandHandler = new CommandHandler();
    const adaptiveLanguageSystem = new AdaptiveLanguageSystem();
    const privacyFilter = new PrivacyFilter(); // Add privacy filter
    
    // Use multiple API keys with load balancing
    const apiKeys = this.getAPIKeys(env);
    const geminiAPI = new GeminiAPI(apiKeys);
    
    console.log(`Using ${apiKeys.length} API key(s) with load balancing`);

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
    const contextualPrompt = await sessionManager.getContextualPrompt(sessionId, userMessage);
    
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
        
        // Process message and update session with intelligent memory
        const sessionData = await sessionManager.processMessage(sessionId, userMessage, filteredResponse);

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
   * Handle streaming response with multiple API key support
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
      
      // Capture methods to avoid 'this' context issues
      const parseStreamingChunk = this.parseStreamingChunk;
      const createErrorChunk = this.createErrorChunk;
      
      // Create a new stream that includes session management
      const enhancedStream = new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          let metadataSent = false;
          
          try {
            const reader = stream.getReader();
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              // Parse the chunk
              const chunkData = parseStreamingChunk(value);
              
              // Filter content if it's a content chunk
              if (chunkData && chunkData.type === 'content') {
                const filteredContent = privacyFilter.filterResponse(chunkData.content);
                fullResponse += filteredContent;
                
                // Create a new filtered chunk
                const filteredChunk = `data: ${JSON.stringify({
                  type: 'content',
                  content: filteredContent
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(filteredChunk));
              } else {
                // Forward non-content chunks as is
                controller.enqueue(value);
              }
              
              // Send metadata once at the beginning (skip if terse)
              if (!metadataSent && chunkData && chunkData.type !== 'start') {
                if (!(enhancedLanguageInfo && enhancedLanguageInfo.response_prefs && enhancedLanguageInfo.response_prefs.terse)) {
                  const metadataChunk = `data: ${JSON.stringify({
                    type: 'metadata',
                    content: {
                      session_id: sessionId,
                      streaming: true,
                      timestamp: new Date().toISOString(),
                      language_info: enhancedLanguageInfo,
                      location_info: locationInfo,
                      chunk_info: {
                        size: streamingOptions.chunkSize,
                        delay: streamingOptions.delay
                      }
                    }
                  })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(metadataChunk));
                }
                metadataSent = true;
              }
              
              // Forward the chunk (already handled above for content chunks)
              if (chunkData && chunkData.type !== 'content') {
                controller.enqueue(value);
              }
            }
            
            // Send completion metadata (skip if terse)
            if (!(enhancedLanguageInfo && enhancedLanguageInfo.response_prefs && enhancedLanguageInfo.response_prefs.terse)) {
              // Filter the full response for any sensitive information
              const filteredFullResponse = privacyFilter.filterResponse(fullResponse);
              
              const completionChunk = `data: ${JSON.stringify({
                type: 'completion',
                content: {
                  session_id: sessionId,
                  response_length: filteredFullResponse.length,
                  timestamp: new Date().toISOString(),
                  message: 'Response completed successfully ✅',
                  location_info: locationInfo
                }
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(completionChunk));
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
            const errorChunk = createErrorChunk(safeErrorMessage);
            controller.enqueue(new TextEncoder().encode(errorChunk));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(enhancedStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        },
      });

    } catch (error) {
      console.error('Streaming response error:', error);
      // Use privacy filter for error messages
      const safeErrorMessage = privacyFilter.filterResponse(error.message);
      
      return new Response(JSON.stringify({
        error: safeErrorMessage,
        session_id: sessionId
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
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
  }
};
