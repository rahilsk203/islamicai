import { GeminiAPI } from './gemini-api.js';
import { AdvancedSessionManager } from './advanced-session-manager.js';
import { CommandHandler } from './command-handler.js';
import { AdaptiveLanguageSystem } from './adaptive-language-system.js';

export default {
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
        const apiKeys = env.GEMINI_API_KEYS ? 
          env.GEMINI_API_KEYS.split(',').map(key => key.trim()) : 
          [env.GEMINI_API_KEY];
        
        const geminiAPI = new GeminiAPI(apiKeys);
        const keyStats = geminiAPI.getKeyStats();
        
        return new Response(JSON.stringify({
          status: 'healthy',
          apiKeys: {
            total: apiKeys.length,
            available: geminiAPI.apiKeyManager.getAvailableKeyCount(),
            stats: keyStats
          },
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Handle streaming endpoint
      if (request.method === 'POST' && url.pathname === '/api/stream') {
        return this.handleStreamingRequest(request, env, ctx);
      }

      // Handle regular chat endpoint
      if (request.method === 'POST' && url.pathname === '/api/chat') {
        return this.handleChatRequest(request, env, ctx);
      }

      // Only allow POST requests for chat endpoints
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Default to regular chat if no specific endpoint
      return this.handleChatRequest(request, env, ctx);

    } catch (error) {
      console.error('Worker error:', error);
      
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
   * Handle streaming request
   */
  async handleStreamingRequest(request, env, ctx) {
    const url = new URL(request.url);
    const body = await request.json();
    
    // Get session ID from either URL params or request body
    const sessionId = url.searchParams.get('session_id') || body.session_id;
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userMessage = body.message;
    const languageInfo = body.language_info || {};
    const streamingOptions = body.streaming_options || { enableStreaming: true };
    
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize managers and adaptive language system
    const sessionManager = new AdvancedSessionManager(env.CHAT_SESSIONS);
    const commandHandler = new CommandHandler();
    const adaptiveLanguageSystem = new AdaptiveLanguageSystem();
    
    // Support multiple API keys with fallback for local testing
    const apiKeys = env.GEMINI_API_KEYS ? 
      env.GEMINI_API_KEYS.split(',').map(key => key.trim()) : 
      [env.GEMINI_API_KEY || "AIzaSyCGpimrLEZrz-rN6yVKfvTHG4G1dpOb_fc"];
    
    const geminiAPI = new GeminiAPI(apiKeys);

    // Apply adaptive language learning and detection
    const languageAdaptation = adaptiveLanguageSystem.adaptLanguage(userMessage, sessionId, {
      previousMessages: await sessionManager.getRecentMessages(sessionId, 5),
      userProfile: await sessionManager.getUserProfile(sessionId),
      timestamp: Date.now()
    });

    // Check for commands
    if (userMessage.startsWith('/')) {
      const commandResult = await commandHandler.handleCommand(userMessage, sessionId, sessionManager);
      return new Response(JSON.stringify(commandResult), {
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
      )
    };

    // Handle streaming response
    return this.handleStreamingResponse(
      geminiAPI, 
      sessionId, 
      userMessage, 
      contextualPrompt, 
      enhancedLanguageInfo, 
      streamingOptions,
      sessionManager
    );
  },

  /**
   * Handle regular chat request
   */
  async handleChatRequest(request, env, ctx) {
    const url = new URL(request.url);
    const body = await request.json();
    
    // Get session ID from either URL params or request body
    const sessionId = url.searchParams.get('session_id') || body.session_id;
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userMessage = body.message;
    const languageInfo = body.language_info || {};
    const streamingOptions = body.streaming_options || {};
    
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize managers and adaptive language system
    const sessionManager = new AdvancedSessionManager(env.CHAT_SESSIONS);
    const commandHandler = new CommandHandler();
    const adaptiveLanguageSystem = new AdaptiveLanguageSystem();
    
    // Support multiple API keys with fallback for local testing
    const apiKeys = env.GEMINI_API_KEYS ? 
      env.GEMINI_API_KEYS.split(',').map(key => key.trim()) : 
      [env.GEMINI_API_KEY || "AIzaSyCGpimrLEZrz-rN6yVKfvTHG4G1dpOb_fc"];
    
    const geminiAPI = new GeminiAPI(apiKeys);

    // Apply adaptive language learning and detection
    const languageAdaptation = adaptiveLanguageSystem.adaptLanguage(userMessage, sessionId, {
      previousMessages: await sessionManager.getRecentMessages(sessionId, 5),
      userProfile: await sessionManager.getUserProfile(sessionId),
      timestamp: Date.now()
    });

    // Check for commands
    if (userMessage.startsWith('/')) {
      const commandResult = await commandHandler.handleCommand(userMessage, sessionId, sessionManager);
      return new Response(JSON.stringify(commandResult), {
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
      )
    };

    // Handle streaming vs non-streaming responses
    if (streamingOptions.enableStreaming) {
      return this.handleStreamingResponse(
        geminiAPI, 
        sessionId, 
        userMessage, 
        contextualPrompt, 
        enhancedLanguageInfo, 
        streamingOptions,
        sessionManager
      );
    }

    // Call Gemini API with enhanced adaptive language info
    const geminiResponse = await geminiAPI.generateResponse([], sessionId, userMessage, contextualPrompt, enhancedLanguageInfo);
    
    // Process message and update session with intelligent memory
    const sessionData = await sessionManager.processMessage(sessionId, userMessage, geminiResponse);

    // Prepare response
    const response = {
      session_id: sessionId,
      reply: geminiResponse,
      history_summary: sessionManager.getHistorySummary(sessionData.history),
      user_profile: sessionData.userProfile,
      memory_count: sessionData.memories.length
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },

  /**
   * Handle streaming response for live API
   * @param {GeminiAPI} geminiAPI - Gemini API instance
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @param {string} contextualPrompt - Contextual prompt
   * @param {Object} enhancedLanguageInfo - Enhanced language info
   * @param {Object} streamingOptions - Streaming options
   * @param {AdvancedSessionManager} sessionManager - Session manager
   * @returns {Response} Streaming response
   */
  async handleStreamingResponse(geminiAPI, sessionId, userMessage, contextualPrompt, enhancedLanguageInfo, streamingOptions, sessionManager) {
    try {
      // Generate streaming response
      const stream = await geminiAPI.generateResponse([], sessionId, userMessage, contextualPrompt, enhancedLanguageInfo, streamingOptions);
      
      // Create a new stream that includes session management
      const enhancedStream = new ReadableStream({
        async start(controller) {
          let fullResponse = '';
          
          try {
            const reader = stream.getReader();
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              // Parse the chunk
              const chunkData = this.parseStreamingChunk(value);
              
              if (chunkData.type === 'content') {
                fullResponse += chunkData.content;
              }
              
              // Forward the chunk
              controller.enqueue(value);
            }
            
            // Process the complete message for session management
            if (fullResponse.trim()) {
              try {
                await sessionManager.processMessage(sessionId, userMessage, fullResponse);
              } catch (sessionError) {
                console.error('Session processing error:', sessionError);
              }
            }
            
          } catch (error) {
            console.error('Streaming processing error:', error);
            controller.enqueue(this.createErrorChunk('Streaming error occurred'));
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
      console.error('Streaming handler error:', error);
      
      // Return error as streaming response
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(this.createErrorChunk('Streaming service unavailable'));
          controller.close();
        }
      });

      return new Response(errorStream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
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
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.substring(6);
          return JSON.parse(jsonData);
        }
      }
      return { type: 'unknown', content: chunk };
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
