import { IntelligentMemory } from './intelligent-memory.js';

export class AdvancedSessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 10; // Further reduced for better performance
    this.maxMemoryItems = 20; // Further reduced for better performance
    this.memory = new IntelligentMemory();
    
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
    return this._buildSimpleContext(sessionData, userMessage);
  }

  // Simplified context building for better performance
  _buildSimpleContext(sessionData, userMessage) {
    // Build minimal contextual prompt
    let contextualPrompt = this.buildBasePrompt(sessionData.userProfile);
    
    // Include recent conversation history for better context
    if (sessionData.history.length > 0) {
      contextualPrompt += '\n\n**Recent Conversation History:**\n';
      // Include last 4 messages (2 exchanges) for better context
      const recentHistory = sessionData.history.slice(-4);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'IslamicAI';
        contextualPrompt += `${role}: ${msg.content}\n`;
      });
    }
    
    // Add memory context if available
    if (sessionData.memories.length > 0) {
      contextualPrompt += '\n**Important Context from Previous Messages:**\n';
      // Get most relevant memories
      const relevantMemories = this.memory.getRelevantMemories(
        sessionData.memories, 
        userMessage, 
        5
      );
      
      relevantMemories.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`;
      });
    }
    
    return contextualPrompt;
  }

  // DSA: Advanced context building with tree and graph algorithms
  async _buildAdvancedContext(sessionData, userMessage) {
    // DSA: Use AVL tree for efficient history sorting
    const historyTree = sessionData.historyAVL || this.createAVLTree();
    
    // Rebuild tree with current history if needed
    if (!sessionData.historyAVL || historyTree.getSortedMessages().length !== sessionData.history.length) {
      sessionData.history.forEach(msg => {
        historyTree.root = historyTree.insert(historyTree.root, msg);
      });
    }
    
    // Get sorted history
    const sortedHistory = historyTree.getSortedMessages();
    
    // DSA: Use segment tree for efficient range queries
    const segmentTree = this.createSegmentTree(sortedHistory);
    
    // DSA: Get relevant memories using advanced algorithms
    const relevantMemories = this.memory.getRelevantMemories(
      sessionData.memories, 
      userMessage, 
      10 // More memories for complex sessions
    );
    
    // DSA: Build contextual prompt with advanced structure
    let contextualPrompt = this.buildBasePrompt(sessionData.userProfile);

    // Inject concise behavior core memory block
    if (sessionData.behaviorProfile) {
      const bp = sessionData.behaviorProfile;
      contextualPrompt += `\n\n**User Behavior Profile (Auto-Learn):**\n- Samples: ${bp.samples}\n- Avg length (chars): ${bp.avgMessageLengthChars}\n- Hinglish preference: ${bp.hinglishPreferenceRatio}\n- Quran affinity: ${bp.quranAffinityRatio}\n- Likes citations: ${bp.wantsCitationsRatio}\n- Prefers short: ${bp.prefersShortRatio}, detailed: ${bp.prefersDetailedRatio}\n- Questions/msg: ${bp.questionPerMessage}, exclaims/msg: ${bp.exclaimPerMessage}`;
    }
    
    // DSA: Add conversation history with time-based clustering
    if (sortedHistory.length > 0) {
      contextualPrompt += '\n\n**Conversation History (Time-Ordered):**\n';
      
      // Group messages by time clusters (last 3 clusters)
      const timeClusters = this._clusterMessagesByTime(sortedHistory);
      const recentClusters = timeClusters.slice(-3);
      
      recentClusters.forEach((cluster, clusterIndex) => {
        contextualPrompt += `\n**Cluster ${clusterIndex + 1} (${cluster.timeRange}):**\n`;
        cluster.messages.forEach(msg => {
          const role = msg.role === 'user' ? 'User' : 'IslamicAI';
          contextualPrompt += `- ${role}: ${msg.content}\n`;
        });
      });
    }
    
    // DSA: Add memory context with priority-based filtering
    if (relevantMemories.length > 0) {
      contextualPrompt += '\n\n**Relevant Context from Previous Conversations:**\n';
      
      // Sort memories by relevance score
      const sortedMemories = relevantMemories.sort((a, b) => 
        (b.tfidfScore || 0) - (a.tfidfScore || 0)
      );
      
      // Group by memory type
      const memoryGroups = this._groupMemoriesByType(sortedMemories);
      
      Object.entries(memoryGroups).forEach(([type, memories]) => {
        contextualPrompt += `\n**${type.charAt(0).toUpperCase() + type.slice(1)} Memories:**\n`;
        memories.slice(0, 3).forEach(memory => {
          contextualPrompt += `- ${memory.content}\n`;
          this.memory.updateMemoryAccess(memory);
        });
      });
    }
    
    // DSA: Add conversation context with topic grouping
    if (sessionData.conversationContext.topics && sessionData.conversationContext.topics.length > 0) {
      contextualPrompt += `\n**Current Conversation Topics:** ${sessionData.conversationContext.topics.join(', ')}\n`;
    }
    
    // DSA: Add emotional context with trend analysis
    if (sessionData.userProfile.currentEmotionalState) {
      contextualPrompt += `\n**User's Current Emotional State:** ${sessionData.userProfile.currentEmotionalState}\n`;
      
      // Add emotional trend if available
      const emotionalTrend = this._analyzeEmotionalTrend(sessionData.conversationFlow);
      if (emotionalTrend) {
        contextualPrompt += `\n**Emotional Trend:** ${emotionalTrend}\n`;
      }
    }
    
    // DSA: Add conversation flow context with advanced analysis
    if (sessionData.conversationFlow.length > 0) {
      const lastFlowItem = sessionData.conversationFlow[sessionData.conversationFlow.length - 1];
      if (lastFlowItem.contextShift) {
        contextualPrompt += '\n**Note:** The conversation topic has shifted. Please acknowledge this transition appropriately.\n';
      }
      
      // Add conversation complexity analysis
      const complexity = this._analyzeConversationComplexity(sessionData.conversationFlow);
      contextualPrompt += `\n**Conversation Complexity:** ${complexity}\n`;
    }
    
    // NEW: Add personalized response context based on user preferences and history
    contextualPrompt += this._buildPersonalizedContext(sessionData, userMessage);
    
    return contextualPrompt;
  }

  // NEW: Build personalized context based on user history and preferences
  _buildPersonalizedContext(sessionData, userMessage) {
    let personalizedContext = '\n\n**Personalized Response Context:**\n';
    
    // Add user name if known
    if (sessionData.userProfile.keyFacts && sessionData.userProfile.keyFacts.name) {
      personalizedContext += `- The user's name is ${sessionData.userProfile.keyFacts.name}. Address them by name when appropriate.\n`;
    }
    
    // Add user location if known
    if (sessionData.userProfile.keyFacts && sessionData.userProfile.keyFacts.location) {
      personalizedContext += `- The user is located in ${sessionData.userProfile.keyFacts.location}. Consider local context when relevant.\n`;
    }
    
    // Add user's preferred topics
    if (sessionData.conversationContext.topics && sessionData.conversationContext.topics.length > 0) {
      personalizedContext += `- The user has shown interest in these topics: ${sessionData.conversationContext.topics.join(', ')}.\n`;
    }
    
    // Add user's learning patterns
    if (sessionData.userProfile.learningPatterns) {
      const patterns = sessionData.userProfile.learningPatterns;
      if (patterns.questionTypes && patterns.questionTypes.length > 0) {
        personalizedContext += `- The user typically asks ${patterns.questionTypes.join(', ')} type questions.\n`;
      }
      personalizedContext += `- The user prefers ${patterns.responseLength || 'medium'} length responses.\n`;
    }
    
    // Add user's emotional journey
    if (sessionData.userProfile.currentEmotionalState) {
      personalizedContext += `- The user's current emotional state is ${sessionData.userProfile.currentEmotionalState}. Respond with appropriate empathy.\n`;
    }
    
    // Add conversation progression context
    const totalMessages = sessionData.history.length;
    if (totalMessages > 10) {
      personalizedContext += `- This is an ongoing conversation with ${Math.floor(totalMessages/2)} exchanges. The user is engaged and returning for more information.\n`;
    } else if (totalMessages > 4) {
      personalizedContext += `- This is a developing conversation. The user is building a relationship with IslamicAI.\n`;
    } else {
      personalizedContext += `- This is a new conversation. Be welcoming and establish trust.\n`;
    }
    
    // Add response style preferences
    if (sessionData.userProfile.responseStyle) {
      personalizedContext += `- The user prefers ${sessionData.userProfile.responseStyle} responses.\n`;
    }
    
    // Add Fiqh school preference
    if (sessionData.userProfile.fiqhSchool) {
      personalizedContext += `- The user follows the ${sessionData.userProfile.fiqhSchool} school of Fiqh. Consider this when discussing jurisprudential matters.\n`;
    }
    
    // Add language preference
    if (sessionData.userProfile.preferredLanguage) {
      const languageNames = {
        'english': 'English',
        'hindi': 'Hindi (हिंदी)',
        'bengali': 'Bengali (বাংলা)',
        'hinglish': 'Hinglish (Hindi + English mix)',
        'urdu': 'Urdu (اردو)',
        'arabic': 'Arabic (العربية)',
        'persian': 'Persian (فارسی)'
      };
      personalizedContext += `- The user prefers responses in ${languageNames[sessionData.userProfile.preferredLanguage] || sessionData.userProfile.preferredLanguage}.\n`;
    }
    
    // Add previous discussion context
    const recentUserMessages = sessionData.history
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content);
    
    if (recentUserMessages.length > 0) {
      personalizedContext += `- Recent user questions: ${recentUserMessages.join('; ')}.\n`;
    }
    
    return personalizedContext;
  }

  // DSA: Cluster messages by time for better context organization
  _clusterMessagesByTime(messages) {
    if (messages.length === 0) return [];
    
    // Sort messages by timestamp
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Cluster messages based on time gaps (30 minutes threshold)
    const clusters = [];
    let currentCluster = {
      messages: [sortedMessages[0]],
      startTime: new Date(sortedMessages[0].timestamp),
      endTime: new Date(sortedMessages[0].timestamp)
    };
    
    for (let i = 1; i < sortedMessages.length; i++) {
      const currentTime = new Date(sortedMessages[i].timestamp);
      const timeDiff = (currentTime - currentCluster.endTime) / (1000 * 60); // minutes
      
      if (timeDiff > 30) {
        // Create time range string
        currentCluster.timeRange = `${currentCluster.startTime.toLocaleTimeString()} - ${currentCluster.endTime.toLocaleTimeString()}`;
        clusters.push(currentCluster);
        
        // Start new cluster
        currentCluster = {
          messages: [sortedMessages[i]],
          startTime: currentTime,
          endTime: currentTime
        };
      } else {
        // Add to current cluster
        currentCluster.messages.push(sortedMessages[i]);
        currentCluster.endTime = currentTime;
      }
    }
    
    // Add last cluster
    currentCluster.timeRange = `${currentCluster.startTime.toLocaleTimeString()} - ${currentCluster.endTime.toLocaleTimeString()}`;
    clusters.push(currentCluster);
    
    return clusters;
  }

  // DSA: Group memories by type for better organization
  _groupMemoriesByType(memories) {
    const groups = {};
    
    memories.forEach(memory => {
      if (!groups[memory.type]) {
        groups[memory.type] = [];
      }
      groups[memory.type].push(memory);
    });
    
    return groups;
  }

  // DSA: Analyze emotional trend in conversation
  _analyzeEmotionalTrend(conversationFlow) {
    if (conversationFlow.length < 3) return null;
    
    const recentEmotions = conversationFlow
      .slice(-5)
      .map(item => item.userEmotionalState || 'neutral')
      .filter(state => state !== 'neutral');
    
    if (recentEmotions.length < 2) return null;
    
    // Simple trend analysis
    const positiveEmotions = ['happy', 'excited', 'grateful'].filter(emotion => 
      recentEmotions.includes(emotion)
    ).length;
    
    const negativeEmotions = ['sad', 'angry', 'frustrated', 'confused'].filter(emotion => 
      recentEmotions.includes(emotion)
    ).length;
    
    if (positiveEmotions > negativeEmotions) {
      return 'becoming more positive 😊';
    } else if (negativeEmotions > positiveEmotions) {
      return 'becoming more concerned 😟';
    } else {
      return 'stable equilibrium ⚖️';
    }
  }

  // DSA: Analyze conversation complexity
  _analyzeConversationComplexity(conversationFlow) {
    if (conversationFlow.length === 0) return 'simple';
    
    // Count topic shifts
    const topicShifts = conversationFlow.filter(item => item.contextShift).length;
    
    // Count unique topics
    const uniqueTopics = new Set(
      conversationFlow.flatMap(item => 
        item.userMessage ? this.memory.extractIslamicTopics(item.userMessage) : []
      )
    ).size;
    
    // Calculate average message length
    const avgMessageLength = conversationFlow.reduce((sum, item) => 
      sum + (item.userMessage ? item.userMessage.length : 0), 0
    ) / conversationFlow.length;
    
    // Determine complexity based on metrics
    if (topicShifts > 3 || uniqueTopics > 5 || avgMessageLength > 200) {
      return 'high complexity 🧠';
    } else if (topicShifts > 1 || uniqueTopics > 3 || avgMessageLength > 100) {
      return 'medium complexity 🤔';
    } else {
      return 'low complexity 🟢';
    }
  }

  // DSA: Simple compression for session data
  _compressSessionData(data) {
    // This is a simplified compression - in production, you might use a proper compression library
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

  // DSA: Priority Queue implementation for memory prioritization
  prioritizeMemories(memories) {
    // Create a max heap based on priority
    const heap = [];
    
    // Helper functions for heap operations
    const getParentIndex = (i) => Math.floor((i - 1) / 2);
    const getLeftChildIndex = (i) => 2 * i + 1;
    const getRightChildIndex = (i) => 2 * i + 2;
    
    const swap = (i, j) => {
      [heap[i], heap[j]] = [heap[j], heap[i]];
    };
    
    const heapifyUp = (index) => {
      let currentIndex = index;
      while (
        currentIndex > 0 &&
        heap[getParentIndex(currentIndex)].priority > heap[currentIndex].priority
      ) {
        swap(getParentIndex(currentIndex), currentIndex);
        currentIndex = getParentIndex(currentIndex);
      }
    };
    
    const heapifyDown = (index) => {
      let currentIndex = index;
      while (true) {
        let largest = currentIndex;
        const leftChild = getLeftChildIndex(currentIndex);
        const rightChild = getRightChildIndex(currentIndex);
        
        if (
          leftChild < heap.length &&
          heap[leftChild].priority > heap[largest].priority
        ) {
          largest = leftChild;
        }
        
        if (
          rightChild < heap.length &&
          heap[rightChild].priority > heap[largest].priority
        ) {
          largest = rightChild;
        }
        
        if (largest === currentIndex) break;
        
        swap(currentIndex, largest);
        currentIndex = largest;
      }
    };
    
    // Insert all memories into the heap
    memories.forEach(memory => {
      heap.push(memory);
      heapifyUp(heap.length - 1);
    });
    
    // Extract memories in priority order
    const sortedMemories = [];
    while (heap.length > 0) {
      // Move the highest priority item to the end
      swap(0, heap.length - 1);
      sortedMemories.push(heap.pop());
      heapifyDown(0);
    }
    
    return sortedMemories;
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
    
    // DSA: Use binary search to check if similar messages exist
    const hasSimilarMessage = this._binarySearchForSimilarMessage(
      sessionData.history, 
      userMessage
    );
    
    // Extract and store important information
    const importantInfo = this.memory.extractImportantInfo(userMessage, sessionData.history);
    
    // Update user profile
    this.updateUserProfile(sessionData.userProfile, importantInfo);
    
    // Create and store memories
    const newMemories = this.createMemoriesFromInfo(importantInfo, userMessage);
    sessionData.memories.push(...newMemories);
    
    // Update conversation context
    this.updateConversationContext(sessionData.conversationContext, userMessage, aiResponse);
    
    // Track conversation flow
    this.updateConversationFlow(sessionData.conversationFlow, userMessage, aiResponse);
    
    // Maintain history length with DSA optimization
    if (sessionData.history.length > this.maxHistoryLength) {
      // DSA: Use sliding window technique to maintain history
      sessionData.history = this._slidingWindowTrim(sessionData.history, this.maxHistoryLength);
    }
    
    // Compute/merge behavior core memory (DSA optimized)
    try {
      const snapshot = this.memory.computeBehaviorProfile(sessionData.history);
      sessionData.behaviorProfile = this.memory.updateBehaviorProfile(sessionData.behaviorProfile, snapshot);
    } catch (err) {
      console.log('Behavior profiling error:', err.message);
    }

    // Save updated session data
    await this.saveSessionData(sessionId, sessionData);
    
    return sessionData;
  }

  // DSA: Sliding window technique for efficient history trimming
  _slidingWindowTrim(history, maxLength) {
    if (history.length <= maxLength) return history;
    
    // Keep the most recent messages
    return history.slice(-maxLength);
  }

  // DSA: Binary search for similar messages
  _binarySearchForSimilarMessage(history, message) {
    // This is a simplified implementation - in practice, you'd use a more sophisticated similarity measure
    const sortedHistory = [...history].sort((a, b) => 
      a.content.localeCompare(b.content)
    );
    
    let left = 0;
    let right = sortedHistory.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midMessage = sortedHistory[mid].content;
      
      // Simple string similarity check
      if (midMessage.includes(message) || message.includes(midMessage)) {
        return true;
      }
      
      if (midMessage < message) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return false;
  }

  updateUserProfile(userProfile, importantInfo) {
    // Update language preference from explicit preference or learned behavior
    if (importantInfo.userPreferences.language) {
      userProfile.preferredLanguage = importantInfo.userPreferences.language;
    } else if (this._shouldPreferHinglish(userProfile)) {
      userProfile.preferredLanguage = 'hinglish';
    } else if (this._shouldPreferArabic(userProfile)) {
      userProfile.preferredLanguage = 'arabic';
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

  // Decide Hinglish preference using behavior profile
  _shouldPreferHinglish(userProfile = {}) {
    try {
      // Try to pull from cached session data if available
      const currentSession = [...this.sessionCache.values()].pop();
      const bp = (currentSession && currentSession.behaviorProfile) || null;
      if (!bp) return false;
      // Confidence: prefer Hinglish if ratio >= 0.5 and detailed/short lean is not strongly English-indicative
      return (bp.hinglishPreferenceRatio || 0) >= 0.5;
    } catch {
      return false;
    }
  }

  // Decide Arabic preference using behavior profile
  _shouldPreferArabic(userProfile = {}) {
    try {
      const currentSession = [...this.sessionCache.values()].pop();
      const bp = (currentSession && currentSession.behaviorProfile) || null;
      if (!bp) return false;
      return (bp.arabicPreferenceRatio || 0) >= 0.5;
    } catch {
      return false;
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
    
    // Track key conversation points for better context recall
    if (!context.keyPoints) context.keyPoints = [];
    
    // Extract key points from the conversation
    const keyPoints = this.extractKeyPoints(userMessage, aiResponse);
    context.keyPoints.push(...keyPoints);
    
    // Keep only last 10 key points
    if (context.keyPoints.length > 10) {
      context.keyPoints = context.keyPoints.slice(-10);
    }
  }

  // Extract key points from conversation for better context recall
  extractKeyPoints(userMessage, aiResponse) {
    const keyPoints = [];
    
    // Check for personal information in user message
    const personalInfoRegex = /(hello|hi|assalamu alaikum|kasa hai|kaise ho|how are you)/i;
    if (personalInfoRegex.test(userMessage)) {
      keyPoints.push({
        type: 'greeting',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for family mentions
    const familyRegex = /(maa|papa|bhai|sister|family|ghar|home)/i;
    if (familyRegex.test(userMessage)) {
      keyPoints.push({
        type: 'family',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for health/well-being mentions
    const healthRegex = /(thik|fine|well|sick|ill|bimar)/i;
    if (healthRegex.test(userMessage)) {
      keyPoints.push({
        type: 'health',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
    }
    
    return keyPoints;
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
    } else if (response.includes('Allah knows best') || response.includes('pliant')) {
      return 'humble';
    } else if (response.includes('example') || response.includes('for instance')) {
      return 'explanatory';
    } else if (response.includes('step') || response.includes('first') || response.includes('second')) {
      return 'instructional';
    } else {
      return 'general';
    }
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
    
    // Add contextual guidance for better conversation flow
    prompt += '\n\n**Conversation Guidelines:**';
    prompt += '\n- Maintain natural conversation flow and recall previous exchanges within the session';
    prompt += '\n- Respond contextually to what the user has said before';
    prompt += '\n- If the user mentions something they said earlier, acknowledge it appropriately';
    prompt += '\n- Keep responses conversational and natural, not robotic';
    
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