import { IntelligentMemory } from './intelligent-memory.js';
import { PerformanceOptimizer } from './performance-optimizer.js';
import { UltraAdvancedSessionMemory } from './ultra-session-memory.js';

export class AdvancedSessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 50;
    this.maxMemoryItems = 100;
    this.memory = new IntelligentMemory();
    this.performanceOptimizer = new PerformanceOptimizer();
    
    // 🧠 Ultra-Advanced Session Memory System
    this.ultraMemory = new UltraAdvancedSessionMemory(this.performanceOptimizer);
    this.selfLearningEnabled = true;
    
    console.log('🚀 Advanced Session Manager initialized with Ultra-Memory, Self-Learning & Enhanced Chat History');
  }

  async getSessionData(sessionId) {
    try {
      // ⚡ Initialize ultra-advanced session memory
      if (this.selfLearningEnabled) {
        await this.ultraMemory.initializeSession(sessionId);
      }
      
      // ⚡ Try DSA-optimized session cache first (O(1) lookup)
      const cachedSession = await this.performanceOptimizer.getCachedSession(sessionId);
      if (cachedSession) {
        console.log('⚡ Retrieved session from DSA cache (ultra-fast)');
        return cachedSession;
      }
      const sessionData = await this.kv.get(`session:${sessionId}`);
      const data = sessionData ? JSON.parse(sessionData) : {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString(),
        conversationFlow: [] // Track conversation flow
      };
      
      // ⚡ Cache session data for future O(1) retrieval
      await this.performanceOptimizer.cacheSession(sessionId, data);
      
      return data;
    } catch (error) {
      console.error('Error getting session data:', error);
      return {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString(),
        conversationFlow: []
      };
    }
  }

  async saveSessionData(sessionId, sessionData) {
    try {
      // Update last activity
      sessionData.lastActivity = new Date().toISOString();
      
      // ⚡ Apply DSA-based session optimization
      const optimizedSessionData = await this.performanceOptimizer.optimizeSessionData(sessionData);
      
      // Limit memory items
      if (optimizedSessionData.memories.length > this.maxMemoryItems) {
        optimizedSessionData.memories = this.prioritizeMemories(optimizedSessionData.memories)
          .slice(0, this.maxMemoryItems);
      }
      
      await this.kv.put(`session:${sessionId}`, JSON.stringify(optimizedSessionData), {
        expirationTtl: 86400 * 30 // 30 days
      });
      
      // ⚡ Update DSA cache with optimized data
      await this.performanceOptimizer.cacheSession(sessionId, optimizedSessionData);
      
      console.log('⚡ Session saved with DSA optimization');
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  /**
   * Get recent messages for adaptive language system with DSA optimization
   * @param {string} sessionId - Session identifier
   * @param {number} limit - Number of recent messages to retrieve
   * @returns {Array} Recent messages
   */
  async getRecentMessages(sessionId, limit = 5) {
    try {
      // ⚡ Try DSA-optimized recent messages cache first
      const cachedMessages = await this.performanceOptimizer.getCachedRecentMessages(sessionId, limit);
      if (cachedMessages) {
        console.log('⚡ Retrieved recent messages from DSA cache');
        return cachedMessages;
      }
      
      const sessionData = await this.getSessionData(sessionId);
      const recentMessages = sessionData.history.slice(-limit);
      
      // ⚡ Cache recent messages for future fast retrieval
      await this.performanceOptimizer.cacheRecentMessages(sessionId, recentMessages);
      
      return recentMessages;
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  /**
   * Get user profile for adaptive language system
   * @param {string} sessionId - Session identifier
   * @returns {Object} User profile
   */
  async getUserProfile(sessionId) {
    try {
      const sessionData = await this.getSessionData(sessionId);
      return sessionData.userProfile || {};
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {};
    }
  }

  prioritizeMemories(memories) {
    return memories.sort((a, b) => {
      // Sort by priority, then by access count, then by recency
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.accessCount !== b.accessCount) return b.accessCount - a.accessCount;
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });
  }

  async processMessage(sessionId, userMessage, aiResponse) {
    const startTime = Date.now();
    
    // 🧠 Ultra-Advanced Learning Processing with enhanced chat history
    if (this.selfLearningEnabled) {
      const learningResult = await this.ultraMemory.processMessageWithLearning(
        sessionId, userMessage, aiResponse
      );
      console.log(`🧠 Learning insights: Intelligence gain ${learningResult.intelligenceGain.toFixed(1)}%`);
      console.log(`💾 Chat history updated: ${learningResult.chatHistoryUpdated}`);
      console.log(`📊 Contextual improvements: ${learningResult.contextualImprovements.toFixed(1)}%`);
    }
    
    // ⚡ Apply DSA-based message preprocessing
    const preprocessedData = await this.performanceOptimizer.preprocessMessage(
      userMessage, 
      aiResponse, 
      sessionId
    );
    
    const sessionData = await this.getSessionData(sessionId);
    
    // Add messages to history with DSA optimization hints
    const userMessageObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      processingHints: preprocessedData.userHints
    };
    
    const aiMessageObj = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      processingHints: preprocessedData.aiHints
    };
    
    sessionData.history.push(userMessageObj, aiMessageObj);
    
    // ⚡ Extract important info with DSA optimization
    const importantInfo = await this.performanceOptimizer.optimizeInformationExtraction(
      userMessage, 
      sessionData.history,
      this.memory
    );
    
    // Update user profile
    this.updateUserProfile(sessionData.userProfile, importantInfo);
    
    // Create and store memories
    const newMemories = this.createMemoriesFromInfo(importantInfo, userMessage);
    sessionData.memories.push(...newMemories);
    
    // Update conversation context
    this.updateConversationContext(sessionData.conversationContext, userMessage, aiResponse);
    
    // Track conversation flow
    this.updateConversationFlow(sessionData.conversationFlow, userMessage, aiResponse);
    
    // Maintain history length
    if (sessionData.history.length > this.maxHistoryLength) {
      sessionData.history = sessionData.history.slice(-this.maxHistoryLength);
    }
    
    // Save updated session data with performance metrics
    const processingTime = Date.now() - startTime;
    sessionData.performanceMetrics = {
      lastProcessingTime: processingTime,
      dsaOptimized: true,
      timestamp: new Date().toISOString()
    };
    
    await this.saveSessionData(sessionId, sessionData);
    
    console.log(`⚡ Message processed with DSA optimization in ${processingTime}ms`);
    return sessionData;
  }

  updateUserProfile(userProfile, importantInfo) {
    // Update language preference
    if (importantInfo.userPreferences.language) {
      userProfile.preferredLanguage = importantInfo.userPreferences.language;
    }
    
    // Update Fiqh school preference
    if (importantInfo.userPreferences.fiqhSchool) {
      userProfile.fiqhSchool = importantInfo.userPreferences.fiqhSchool;
    }
    
    // Update response style preference
    if (importantInfo.userPreferences.responseStyle) {
      userProfile.responseStyle = importantInfo.userPreferences.responseStyle;
    }
    
    // Update emotional state
    if (importantInfo.emotionalContext) {
      userProfile.currentEmotionalState = importantInfo.emotionalContext;
    }
    
    // Update learning patterns
    if (importantInfo.learningPatterns) {
      userProfile.learningPatterns = importantInfo.learningPatterns;
    }
    
    // Update key facts with better handling
    if (importantInfo.keyFacts && importantInfo.keyFacts.length > 0) {
      if (!userProfile.keyFacts) userProfile.keyFacts = {};
      
      importantInfo.keyFacts.forEach(fact => {
        // For names, always update (high priority)
        if (fact.type === 'name') {
          userProfile.keyFacts[fact.type] = fact.value;
          console.log(`✅ Name extracted and stored: ${fact.value}`);
        } else {
          userProfile.keyFacts[fact.type] = fact.value;
        }
      });
    }
  }

  createMemoriesFromInfo(importantInfo, userMessage) {
    const memories = [];
    
    // Create memory for Islamic topics
    importantInfo.islamicTopics.forEach(topic => {
      memories.push(this.memory.createMemory(
        `User interested in ${topic}`,
        this.memory.memoryTypes.ISLAMIC_KNOWLEDGE,
        this.memory.memoryPriority.HIGH,
        { topic, originalMessage: userMessage }
      ));
    });
    
    // Create memory for key facts
    importantInfo.keyFacts.forEach(fact => {
      memories.push(this.memory.createMemory(
        fact.value,
        this.memory.memoryTypes.IMPORTANT_FACTS,
        fact.priority,
        { factType: fact.type, originalMessage: userMessage }
      ));
    });
    
    // Create memory for emotional context
    if (importantInfo.emotionalContext !== 'neutral') {
      memories.push(this.memory.createMemory(
        `User emotional state: ${importantInfo.emotionalContext}`,
        this.memory.memoryTypes.EMOTIONAL_STATE,
        this.memory.memoryPriority.MEDIUM,
        { emotionalState: importantInfo.emotionalContext, originalMessage: userMessage }
      ));
    }
    
    return memories;
  }

  updateConversationContext(context, userMessage, aiResponse) {
    // Track conversation topics
    if (!context.topics) context.topics = [];
    
    const topics = this.memory.extractIslamicTopics(userMessage);
    topics.forEach(topic => {
      if (!context.topics.includes(topic)) {
        context.topics.push(topic);
      }
    });
    
    // Track conversation flow
    if (!context.flow) context.flow = [];
    context.flow.push({
      userIntent: this.analyzeUserIntent(userMessage),
      aiResponseType: this.analyzeResponseType(aiResponse),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 interactions
    if (context.flow.length > 20) {
      context.flow = context.flow.slice(-20);
    }
  }

  updateConversationFlow(conversationFlow, userMessage, aiResponse) {
    // Track conversation progression and context shifts
    const flowItem = {
      userMessage: userMessage,
      aiResponse: aiResponse,
      userIntent: this.analyzeUserIntent(userMessage),
      contextShift: this.detectContextShift(conversationFlow, userMessage),
      timestamp: new Date().toISOString()
    };
    
    conversationFlow.push(flowItem);
    
    // Keep only last 30 conversation turns
    if (conversationFlow.length > 30) {
      conversationFlow = conversationFlow.slice(-30);
    }
  }

  detectContextShift(conversationFlow, newUserMessage) {
    if (conversationFlow.length === 0) return false;
    
    // Get the last user message
    const lastUserMessage = conversationFlow[conversationFlow.length - 1].userMessage;
    
    // Extract topics from both messages
    const lastTopics = this.memory.extractIslamicTopics(lastUserMessage);
    const newTopics = this.memory.extractIslamicTopics(newUserMessage);
    
    // Check if there's no overlap in topics
    const hasOverlap = lastTopics.some(topic => newTopics.includes(topic));
    
    return !hasOverlap; // Context shift if no overlap
  }

  analyzeUserIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('what') || lowerMessage.includes('kya')) {
      return 'question';
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('samjha')) {
      return 'explanation';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('madad')) {
      return 'help';
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('shukriya')) {
      return 'gratitude';
    } else if (lowerMessage.includes('why') || lowerMessage.includes('kyun')) {
      return 'reasoning';
    } else if (lowerMessage.includes('how') || lowerMessage.includes('kaise')) {
      return 'how-to';
    } else {
      return 'general';
    }
  }

  analyzeResponseType(response) {
    if (response.includes('Surah') || response.includes('Hadith')) {
      return 'scholarly';
    } else if (response.includes('Allah knows best') || response.includes('🤲')) {
      return 'humble';
    } else if (response.includes('example') || response.includes('for instance')) {
      return 'explanatory';
    } else if (response.includes('step') || response.includes('first') || response.includes('second')) {
      return 'instructional';
    } else {
      return 'general';
    }
  }

  async getContextualPrompt(sessionId, userMessage) {
    const startTime = Date.now();
    
    // 🧠 Try ultra-advanced contextual prompt with enhanced chat history learning
    if (this.selfLearningEnabled) {
      try {
        const ultraPrompt = await this.ultraMemory.getOptimizedContextualPrompt(sessionId, userMessage);
        if (ultraPrompt && ultraPrompt.prompt) {
          console.log(`🧠 Ultra-advanced prompt with ${ultraPrompt.learningInsights} insights & ${ultraPrompt.chatHistoryItems} history items`);
          console.log(`📊 Context accuracy: ${(ultraPrompt.contextualAccuracy * 100).toFixed(1)}%`);
          return ultraPrompt.prompt;
        }
      } catch (error) {
        console.warn('⚠️ Ultra-memory fallback, using standard prompt:', error.message);
      }
    }
    
    // ⚡ Try DSA-optimized contextual prompt cache first
    const cachedPrompt = await this.performanceOptimizer.getCachedContextualPrompt(
      sessionId, 
      userMessage
    );
    
    if (cachedPrompt) {
      console.log('⚡ Retrieved contextual prompt from DSA cache (ultra-fast)');
      return cachedPrompt;
    }
    
    const sessionData = await this.getSessionData(sessionId);
    
    // Get relevant memories with DSA optimization
    const relevantMemories = await this.performanceOptimizer.optimizeMemoryRetrieval(
      sessionData.memories,
      userMessage,
      this.memory,
      5
    );
    
    // ⚡ Build contextual prompt with DSA optimization
    let contextualPrompt = await this.performanceOptimizer.optimizePromptBuilding(
      sessionData.userProfile,
      this.buildBasePrompt.bind(this)
    );
    
    // Add conversation history context
    if (sessionData.history.length > 0) {
      contextualPrompt += '\n\n**Recent Conversation History:**\n';
      // Include last 3 exchanges for immediate context
      const recentHistory = sessionData.history.slice(-6); // 3 user+AI exchanges
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'IslamicAI';
        contextualPrompt += `${role}: ${msg.content}\n`;
      });
    }
    
    // Add memory context
    if (relevantMemories.length > 0) {
      contextualPrompt += '\n\n**Relevant Context from Previous Conversations:**\n';
      relevantMemories.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`;
        this.memory.updateMemoryAccess(memory);
      });
    }
    
    // Add conversation context
    if (sessionData.conversationContext.topics && sessionData.conversationContext.topics.length > 0) {
      contextualPrompt += `\n**Current Conversation Topics:** ${sessionData.conversationContext.topics.join(', ')}\n`;
    }
    
    // Add emotional context
    if (sessionData.userProfile.currentEmotionalState) {
      contextualPrompt += `\n**User's Current Emotional State:** ${sessionData.userProfile.currentEmotionalState}\n`;
    }
    
    // Add conversation flow context
    if (sessionData.conversationFlow.length > 0) {
      const lastFlowItem = sessionData.conversationFlow[sessionData.conversationFlow.length - 1];
      if (lastFlowItem.contextShift) {
        contextualPrompt += '\n**Note:** The conversation topic has shifted. Please acknowledge this transition appropriately.\n';
      }
    }
    
    // ⚡ Cache contextual prompt for future O(1) retrieval
    const processingTime = Date.now() - startTime;
    await this.performanceOptimizer.cacheContextualPrompt(
      sessionId,
      userMessage,
      contextualPrompt,
      processingTime
    );
    
    console.log(`⚡ Contextual prompt generated with DSA optimization in ${processingTime}ms`);
    return contextualPrompt;
  }

  buildBasePrompt(userProfile) {
    let prompt = 'You are IslamicAI, an advanced Islamic Scholar AI assistant.';
    
    // Add user-specific context
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
    
    // Add response style guidance based on user preferences
    if (userProfile.responseStyle === 'detailed') {
      prompt += '\n**Response Style:** Provide detailed explanations with examples and references.';
    } else if (userProfile.responseStyle === 'brief') {
      prompt += '\n**Response Style:** Provide concise answers while maintaining scholarly accuracy.';
    } else {
      prompt += '\n**Response Style:** Provide balanced responses with appropriate detail.';
    }
    
    return prompt;
  }

  async clearSessionHistory(sessionId) {
    try {
      await this.kv.delete(`session:${sessionId}`);
      
      // ⚡ Clear DSA cache entries for this session
      await this.performanceOptimizer.clearSessionCache(sessionId);
      
      console.log('⚡ Session cleared from both KV store and DSA cache');
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
  
  /**
   * 🧠 Get ultra-advanced session analytics with learning insights
   * @param {string} sessionId - Session identifier
   * @returns {Object} Comprehensive analytics with learning data
   */
  async getUltraSessionAnalytics(sessionId) {
    if (!this.selfLearningEnabled) {
      return { error: 'Self-learning not enabled' };
    }
    
    try {
      const analytics = await this.ultraMemory.getSessionAnalytics(sessionId);
      const performanceStats = this.getPerformanceStats();
      
      return {
        ...analytics,
        systemPerformance: performanceStats,
        ultraFeaturesEnabled: true,
        selfLearningActive: true,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting ultra analytics:', error);
      return { error: error.message };
    }
  }
  
  /**
   * 📊 Get learning progress for a session
   * @param {string} sessionId - Session identifier
   * @returns {Object} Learning progress data
   */
  async getLearningProgress(sessionId) {
    if (!this.selfLearningEnabled) {
      return { learningEnabled: false };
    }
    
    try {
      const insights = await this.ultraMemory.learningEngine.getLearningInsights(sessionId);
      const progress = await this.ultraMemory.learningEngine.getLearningProgress(sessionId);
      
      return {
        learningEnabled: true,
        totalInsights: insights.totalInsights,
        intelligenceGain: insights.intelligenceGain,
        progressPercentage: progress,
        learningRate: insights.learningRate,
        sessionOptimized: true
      };
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return { error: error.message };
    }
  }
  
  /**
   * 🎯 Toggle self-learning system
   * @param {boolean} enabled - Enable/disable self-learning
   */
  toggleSelfLearning(enabled) {
    this.selfLearningEnabled = enabled;
    console.log(`🧠 Self-learning system ${enabled ? 'enabled' : 'disabled'}`);
    return { selfLearningEnabled: this.selfLearningEnabled };
  }
  
  /**
   * Get DSA-optimized session metrics
   * @param {string} sessionId - Session identifier
   * @returns {Object} Session performance metrics
   */
  async getSessionPerformanceMetrics(sessionId) {
    const sessionData = await this.getSessionData(sessionId);
    return {
      sessionMetrics: sessionData.performanceMetrics || {},
      optimizerMetrics: this.performanceOptimizer.getSessionMetrics(sessionId)
    };
  }
}