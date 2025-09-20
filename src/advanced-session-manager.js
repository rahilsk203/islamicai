import { IntelligentMemory } from './intelligent-memory.js';

export class AdvancedSessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 50; // Increased for better context
    this.maxMemoryItems = 100;
    this.memory = new IntelligentMemory();
  }

  async getSessionData(sessionId) {
    try {
      const sessionData = await this.kv.get(`session:${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting session data:', error);
      return {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString()
      };
    }
  }

  async saveSessionData(sessionId, sessionData) {
    try {
      // Update last activity
      sessionData.lastActivity = new Date().toISOString();
      
      // Limit memory items
      if (sessionData.memories.length > this.maxMemoryItems) {
        sessionData.memories = this.prioritizeMemories(sessionData.memories)
          .slice(0, this.maxMemoryItems);
      }
      
      await this.kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
        expirationTtl: 86400 * 30 // 30 days
      });
    } catch (error) {
      console.error('Error saving session data:', error);
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
    const sessionData = await this.getSessionData(sessionId);
    
    // Add messages to history
    const userMessageObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };
    
    const aiMessageObj = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };
    
    sessionData.history.push(userMessageObj, aiMessageObj);
    
    // Extract and store important information
    const importantInfo = this.memory.extractImportantInfo(userMessage, sessionData.history);
    
    // Update user profile
    this.updateUserProfile(sessionData.userProfile, importantInfo);
    
    // Create and store memories
    const newMemories = this.createMemoriesFromInfo(importantInfo, userMessage);
    sessionData.memories.push(...newMemories);
    
    // Update conversation context
    this.updateConversationContext(sessionData.conversationContext, userMessage, aiResponse);
    
    // Save updated session data
    await this.saveSessionData(sessionId, sessionData);
    
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
    } else {
      return 'general';
    }
  }

  async getContextualPrompt(sessionId, userMessage) {
    const sessionData = await this.getSessionData(sessionId);
    
    // Get relevant memories
    const relevantMemories = this.memory.getRelevantMemories(
      sessionData.memories, 
      userMessage, 
      5
    );
    
    // Build contextual prompt
    let contextualPrompt = this.buildBasePrompt(sessionData.userProfile);
    
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
    
    return prompt;
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
