import { GeminiAPI } from './gemini-api.js';
import { AdvancedSessionManager } from './advanced-session-manager.js';
import { CommandHandler } from './command-handler.js';
import { AdvancedLanguageDetection } from './advanced-language-detection.js';

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

      // Only allow POST requests for chat
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const url = new URL(request.url);
      const sessionId = url.searchParams.get('session_id');
      
      if (!sessionId) {
        return new Response(JSON.stringify({ error: 'Session ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const body = await request.json();
      const userMessage = body.message;
      const languageInfo = body.language_info || {};
      
      if (!userMessage) {
        return new Response(JSON.stringify({ error: 'Message required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Initialize managers first
      const sessionManager = new AdvancedSessionManager(env.CHAT_SESSIONS);
      const commandHandler = new CommandHandler();
      
      // Support multiple API keys
      const apiKeys = env.GEMINI_API_KEYS ? 
        env.GEMINI_API_KEYS.split(',').map(key => key.trim()) : 
        [env.GEMINI_API_KEY];
      
      const geminiAPI = new GeminiAPI(apiKeys);
      const languageDetector = new AdvancedLanguageDetection();

      // Enhanced language detection with context
      const sessionDataForDetection = await sessionManager.getSessionData(sessionId);
      const context = {
        previousLanguage: sessionDataForDetection?.userProfile?.preferredLanguage,
        userProfile: sessionDataForDetection?.userProfile,
        currentText: userMessage
      };
      
      // Use advanced language detection if frontend detection is weak
      let enhancedLanguageInfo = languageInfo;
      if (!languageInfo.detected_language || languageInfo.confidence < 60) {
        console.log('Using advanced backend language detection...');
        const backendDetection = languageDetector.detectLanguage(userMessage, context);
        enhancedLanguageInfo = {
          detected_language: backendDetection.language,
          confidence: backendDetection.confidence,
          script: backendDetection.script,
          should_respond_in_language: backendDetection.confidence > 50,
          is_mixed_language: backendDetection.isMixedLanguage,
          detected_scripts: backendDetection.detectedScripts,
          analysis: backendDetection.analysis
        };
        console.log('Advanced language detection result:', enhancedLanguageInfo);
      }

      console.log('Received message with enhanced language info:', {
        message: userMessage,
        frontendDetection: languageInfo,
        backendDetection: enhancedLanguageInfo
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
      
      // Call Gemini API with enhanced prompt and language info
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
};
