import { IntelligentMemory } from './intelligent-memory.js';
import { PrivacyFilter } from './privacy-filter.js';

export class AdvancedSessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 10; // Further reduced for better performance
    this.maxMemoryItems = 20; // Further reduced for better performance
    this.memory = new IntelligentMemory();
    this.privacyFilter = new PrivacyFilter(); // Add privacy filter
    
    // Simplified session management for better performance
    this.sessionCache = new Map();
    this.cacheCapacity = 100; // Reduced cache capacity for memory efficiency
    
    // Performance tracking
    this.performanceStats = {
      cacheHits: 0,
      cacheMisses: 0,
      kvAccesses: 0,
      bloomFilterHits: 0,
      bloomFilterMisses: 0
    };

    // LRU cache for contextual prompts (session-aware)
    this.promptCache = new Map();
    this.promptCacheCapacity = 200;

    // DSA: Per-session recent message dedupe (fast similarity short-circuit)
    this.sessionRecentMsg = new Map(); // sessionId -> { set: Set<string>, queue: string[] }
    this.recentMsgCapacity = 64;

    // DSA: Precompiled regexes for hot paths
    this._regex = {
      time: /\b(time|samay|waqt|abhi|now|current)\b/i,
      weather: /\b(weather|mausam|hawa|temperature|barish|rain|sunny|garam|thand|weater)\b/i,
      news: /\b(news|khabar|update|latest|aj|today|gaza|israel|palestine)\b/i,
      greeting: /\b(hello|hi|salam|assalam|kasa|kaise|how are you)\b/i,
      islamic: /\b(quran|hadith|islam|allah|prayer|namaz|dua|islamic)\b/i,
      personalInfo: /(hello|hi|assalamu alaikum|kasa hai|kaise ho|how are you)/i,
      family: /(maa|papa|bhai|sister|family|ghar|home)/i,
      health: /(thik|fine|well|sick|ill|bimar)/i
    };
  }

  // Simplified cache management
  _manageSessionCache() {
    if (this.sessionCache.size > this.cacheCapacity) {
      // Remove oldest entries
      const firstKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(firstKey);
    }
  }

  // Simplified session data retrieval for better performance
  async getSessionData(sessionId) {
    try {
      // Check cache first
      if (this.sessionCache.has(sessionId)) {
        return this.sessionCache.get(sessionId);
      }
      
      // Fetch from KV store
      const sessionData = await this.kv.get(`session:${sessionId}`);
      const parsedData = sessionData ? JSON.parse(this._decompressSessionData(sessionData)) : this._createNewSessionData();
      
      // Cache the data
      this.sessionCache.set(sessionId, parsedData);
      this._manageSessionCache();
      
      return parsedData;
    } catch (error) {
      console.error('Error getting session data:', error);
      return this._createNewSessionData();
    }
  }

  // Performance optimized session data creation
  _createNewSessionData() {
    return {
      history: [],
      memories: [],
      behaviorProfile: null,
      userProfile: {},
      conversationContext: {},
      lastActivity: new Date().toISOString(),
      conversationFlow: [],
      accessPattern: []
    };
  }

  // Simplified session save for better performance
  async saveSessionData(sessionId, sessionData) {
    try {
      // Update last activity
      sessionData.lastActivity = new Date().toISOString();
      
      // Limit memory items
      if (sessionData.memories.length > this.maxMemoryItems) {
        sessionData.memories = sessionData.memories.slice(0, this.maxMemoryItems);
      }
      
      // Update cache
      this.sessionCache.set(sessionId, sessionData);
      this._manageSessionCache();
      
      // Save to KV store with compression
      const serializedData = JSON.stringify(sessionData);
      const compressedData = this._compressSessionData(serializedData);
      
      await this.kv.put(`session:${sessionId}`, compressedData, {
        expirationTtl: 86400 * 3 // 3 days
      });
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  // Simplified context retrieval for better performance
  async getContextualPrompt(sessionId, userMessage) {
    const sessionData = await this.getSessionData(sessionId);

    // Build cache key using session and a lightweight hash of userMessage
    const cacheKey = this._buildPromptCacheKey(sessionId, userMessage);
    const cached = this._getFromPromptCache(cacheKey);
    if (cached) {
      this.performanceStats.cacheHits++;
      return cached;
    }

    this.performanceStats.cacheMisses++;
    const prompt = this._buildSimpleContext(sessionData, userMessage);
    this._putInPromptCache(cacheKey, prompt);
    return prompt;
  }

  // Simplified context building for better performance
  _buildSimpleContext(sessionData, userMessage) {
    // Build minimal contextual prompt
    let contextualPrompt = this.buildBasePrompt(sessionData.userProfile);
    
    // Detect query type for better focus
    const queryType = this._detectQueryType(userMessage);
    if (queryType) {
      contextualPrompt += `\n**QUERY TYPE DETECTED: ${queryType}**\n`;
      contextualPrompt += `- Focus ONLY on ${queryType} related information\n`;
      contextualPrompt += `- Do NOT include information about other topics\n`;
    }
    
    // Include minimal recent conversation history for context
    if (sessionData.history.length > 0) {
      contextualPrompt += '\n\n**Recent Conversation History (for context only):**\n';
      // Include only last 2 messages (1 exchange) to prevent topic mixing
      const recentHistory = sessionData.history.slice(-2);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'IslamicAI';
        contextualPrompt += `${role}: ${msg.content}\n`;
      });
      
      // Add instruction to maintain conversation context
      contextualPrompt += '\n**CRITICAL CONVERSATION RULES:**\n';
      contextualPrompt += '- IGNORE previous conversation topics unless directly relevant\n';
      contextualPrompt += '- Respond ONLY to the user\'s CURRENT question/message\n';
      contextualPrompt += '- If user asks "kasa hai" (how are you), respond about your status ONLY\n';
      contextualPrompt += '- If user asks for time, provide current time ONLY, not weather or other topics\n';
      contextualPrompt += '- If user asks for weather, provide weather ONLY, not time or other topics\n';
      contextualPrompt += '- If user asks for news, provide news ONLY, not previous topics\n';
      contextualPrompt += '- DO NOT mix different topics in your response\n';
      contextualPrompt += '- Stay 100% focused on the user\'s immediate question\n';
    }
    
    // Add memory context if available (only if highly relevant)
    if (sessionData.memories.length > 0) {
      // Get most relevant memories with higher threshold
      const relevantMemories = this.memory.getRelevantMemories(
        sessionData.memories, 
        userMessage, 
        2 // Reduced from 5 to 2
      );
      
      // Only include memories if they are highly relevant to current query
      if (relevantMemories.length > 0) {
        contextualPrompt += '\n**Highly Relevant Context:**\n';
      relevantMemories.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`;
      });
      }
    }
    
    return contextualPrompt;
  }

  // ---- LRU cache helpers for contextual prompts ----
  _buildPromptCacheKey(sessionId, userMessage = '') {
    // DSA: FNV-1a 32-bit hash over the last 256 chars for speed and distribution
    const text = (userMessage || '').slice(-256);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = (hash >>> 0) * 0x01000193;
    }
    return `${sessionId}:${(hash >>> 0).toString(16)}`;
  }

  _getFromPromptCache(key) {
    if (this.promptCache.has(key)) {
      const entry = this.promptCache.get(key);
      if (Date.now() - entry.ts < 30000) { // 30s TTL
        return entry.prompt;
      } else {
        this.promptCache.delete(key);
      }
    }
    return null;
  }

  _putInPromptCache(key, prompt) {
    this.promptCache.set(key, { prompt, ts: Date.now() });
    if (this.promptCache.size > this.promptCacheCapacity) {
      const firstKey = this.promptCache.keys().next().value;
      this.promptCache.delete(firstKey);
    }
  }

  // ---- DSA helpers: simple compression, decompression, and LRU-put ----
  _compressSessionData(data) {
    // Lightweight symbol shortening to reduce KV size
    return data
      .replace(/"role":"user"/g, '"r":"u"')
      .replace(/"role":"assistant"/g, '"r":"a"')
      .replace(/"content":/g, '"c":')
      .replace(/"timestamp":/g, '"t":')
      .replace(/"session_id":/g, '"s":');
  }

  // DSA: Simple decompression for session data
  _decompressSessionData(data) {
    // This is a simplified decompression - in production, you might use a proper compression library
    return data
      .replace(/"r":"u"/g, '"role":"user"')
      .replace(/"r":"a"/g, '"role":"assistant"')
      .replace(/"c":/g, '"content":')
      .replace(/"t":/g, '"timestamp":')
      .replace(/"s":/g, '"session_id":');
  }

  /**
   * Get recent messages for adaptive language system with DSA optimization
   * @param {string} sessionId - Session identifier
   * @param {number} limit - Number of recent messages to retrieve
   * @returns {Array} Recent messages
   */
  async getRecentMessages(sessionId, limit = 5) {
    try {
      // DSA: Use cache for O(1) access when possible
      if (this.sessionCache.has(sessionId)) {
        const sessionData = this.sessionCache.get(sessionId);
        return sessionData.history.slice(-limit);
      }
      
      const sessionData = await this.getSessionData(sessionId);
      return sessionData.history.slice(-limit);
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  /**
   * Get user profile for adaptive language system with DSA optimization
   * @param {string} sessionId - Session identifier
   * @returns {Object} User profile
   */
  async getUserProfile(sessionId) {
    try {
      // DSA: Use cache for O(1) access when possible
      if (this.sessionCache.has(sessionId)) {
        const sessionData = this.sessionCache.get(sessionId);
        return sessionData.userProfile || {};
      }
      
      const sessionData = await this.getSessionData(sessionId);
      return sessionData.userProfile || {};
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {};
    }
  }

  /**
   * Process a message and update session data
   * @param {string} sessionId - Session identifier
   * @param {string} userMessage - User message
   * @param {string} aiResponse - AI response
   * @returns {Object} Updated session data
   */
  async processMessage(sessionId, userMessage, aiResponse) {
    try {
      // Get current session data
      const sessionData = await this.getSessionData(sessionId);
      
      // Add user message to history
      sessionData.history.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
      
      // Add AI response to history
      sessionData.history.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      });
      
      // Trim history to max length
      if (sessionData.history.length > this.maxHistoryLength) {
        sessionData.history = sessionData.history.slice(-this.maxHistoryLength);
      }
      
      // Update user profile with interaction data
      if (!sessionData.userProfile) {
        sessionData.userProfile = {};
      }
      
      // Update last interaction timestamp
      sessionData.userProfile.lastInteraction = new Date().toISOString();
      
      // Save updated session data
      await this.saveSessionData(sessionId, sessionData);
      
      return sessionData;
    } catch (error) {
      console.error('Error processing message:', error);
      // Return a safe fallback
      return {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {}
      };
    }
  }

  /**
   * Build base prompt with user profile information
   * @param {Object} userProfile - User profile data
   * @returns {string} Base prompt
   */
  buildBasePrompt(userProfile) {
    let prompt = 'You are IslamicAI, an advanced Islamic Scholar AI assistant.';
    
    // Add user-specific context if available
    if (userProfile && Object.keys(userProfile).length > 0) {
      if (userProfile.preferredLanguage) {
        const languageNames = {
          'english': 'English',
          'hindi': 'Hindi (हिंदी)',
          'bengali': 'Bengali (বাংলা)',
          'hinglish': 'Hinglish (Hindi + English mix)'
        };
        prompt += `\n**User's Preferred Language:** ${languageNames[userProfile.preferredLanguage] || userProfile.preferredLanguage}`;
        prompt += `\n**IMPORTANT:** Always respond in the user's preferred language: ${languageNames[userProfile.preferredLanguage] || userProfile.preferredLanguage}. This is crucial for user experience.`;
      }
      
      if (userProfile.fiqhSchool) {
        prompt += `\n**User's Fiqh School Preference:** ${userProfile.fiqhSchool}`;
      }
      
      if (userProfile.responseStyle) {
        prompt += `\n**User's Preferred Response Style:** ${userProfile.responseStyle}`;
      }
      
      if (userProfile.keyFacts && userProfile.keyFacts.name) {
        prompt += `\n**User's Name:** ${userProfile.keyFacts.name}`;
      }
      
      if (userProfile.keyFacts && userProfile.keyFacts.location) {
        prompt += `\n**User's Location:** ${userProfile.keyFacts.location}`;
      }
    }
    
    // Add response style guidance based on user preferences
    if (userProfile && userProfile.responseStyle === 'detailed') {
      prompt += '\n**Response Style:** Provide detailed explanations with examples and references.';
    } else if (userProfile && userProfile.responseStyle === 'brief') {
      prompt += '\n**Response Style:** Provide concise answers while maintaining scholarly accuracy.';
    } else {
      prompt += '\n**Response Style:** Provide balanced responses with appropriate detail.';
    }
    
    // Add contextual guidance for better conversation flow
    prompt += '\n\n**Conversation Guidelines:**';
    prompt += '\n- Maintain natural conversation flow and recall previous exchanges within the session';
    prompt += '\n- Respond contextually to what the user has said before';
    prompt += '\n- If the user mentions something they said earlier, acknowledge it appropriately';
    prompt += '\n- Keep responses conversational and natural, not robotic';
    prompt += '\n- Follow the conversation context instructions provided in the session history';
    prompt += '\n- Build upon previous responses rather than repeating information unnecessarily';
    
    return prompt;
  }

  /**
   * Detect query type for better focus
   * @param {string} message - User message
   * @returns {string|null} Query type or null
   */
  _detectQueryType(message) {
    if (!message) return null;
    
    const lowerMessage = message.toLowerCase();
    
    if (this._regex.time.test(lowerMessage)) {
      return 'time';
    } else if (this._regex.weather.test(lowerMessage)) {
      return 'weather';
    } else if (this._regex.news.test(lowerMessage)) {
      return 'news';
    } else if (this._regex.greeting.test(lowerMessage)) {
      return 'greeting';
    } else if (this._regex.islamic.test(lowerMessage)) {
      return 'islamic';
    } else {
      return 'general';
    }
  }

  async clearSessionHistory(sessionId) {
    try {
      await this.kv.delete(`session:${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error clearing session history:', error);
      return false;
    }
  }

  getHistorySummary(sessionHistory) {
    if (sessionHistory.length <= 10) {
      return null;
    }

    const olderMessages = sessionHistory.slice(0, -10);
    const topics = this.memory.extractIslamicTopics(
      olderMessages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ')
    );

    return `Previous topics discussed: ${topics.join(', ')}...`;
  }
}