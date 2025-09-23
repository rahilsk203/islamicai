import { IntelligentMemory } from './intelligent-memory.js';

export class AdvancedSessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 50; // Increased for better context
    this.maxMemoryItems = 100;
    this.memory = new IntelligentMemory();
    
    // DSA: Enhanced data structures for session management
    this.sessionCache = new Map(); // O(1) access for frequently used sessions
    this.lruSessions = new Map(); // LRU cache for session eviction
    this.cacheCapacity = 1000;
    
    // DSA: Bloom Filter for quick session existence check
    this.sessionBloomFilter = new Set();
    
    // DSA: Hash Map for O(1) session lookup
    this.sessionHashMap = new Map();
  }

  // DSA: LRU Cache Management for sessions
  _manageSessionCache() {
    if (this.sessionCache.size > this.cacheCapacity) {
      const firstKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(firstKey);
    }
  }

  // DSA: Bloom Filter implementation for session existence check
  _addToBloomFilter(sessionId) {
    // Simple implementation using multiple hash functions
    const hashes = [
      this._hash1(sessionId),
      this._hash2(sessionId),
      this._hash3(sessionId)
    ];
    
    hashes.forEach(hash => this.sessionBloomFilter.add(hash));
  }

  _mightExistInBloomFilter(sessionId) {
    const hashes = [
      this._hash1(sessionId),
      this._hash2(sessionId),
      this._hash3(sessionId)
    ];
    
    return hashes.every(hash => this.sessionBloomFilter.has(hash));
  }

  // Simple hash functions for Bloom Filter
  _hash1(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  _hash2(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 7) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  _hash3(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 3) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // DSA: AVL Tree implementation for balanced session history
  createAVLTree() {
    class AVLNode {
      constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.height = 1;
      }
    }

    class AVLTree {
      constructor() {
        this.root = null;
      }

      getHeight(node) {
        return node ? node.height : 0;
      }

      getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
      }

      rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
      }

      rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
      }

      insert(node, data) {
        // Standard BST insertion
        if (!node) return new AVLNode(data);

        if (data.timestamp < node.data.timestamp) {
          node.left = this.insert(node.left, data);
        } else if (data.timestamp > node.data.timestamp) {
          node.right = this.insert(node.right, data);
        } else {
          return node; // Duplicate timestamps not allowed
        }

        // Update height
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // Get balance factor
        const balance = this.getBalance(node);

        // Left Left Case
        if (balance > 1 && data.timestamp < node.left.data.timestamp) {
          return this.rotateRight(node);
        }

        // Right Right Case
        if (balance < -1 && data.timestamp > node.right.data.timestamp) {
          return this.rotateLeft(node);
        }

        // Left Right Case
        if (balance > 1 && data.timestamp > node.left.data.timestamp) {
          node.left = this.rotateLeft(node.left);
          return this.rotateRight(node);
        }

        // Right Left Case
        if (balance < -1 && data.timestamp < node.right.data.timestamp) {
          node.right = this.rotateRight(node.right);
          return this.rotateLeft(node);
        }

        return node;
      }

      // Inorder traversal to get sorted messages
      inorder(node, result) {
        if (node) {
          this.inorder(node.left, result);
          result.push(node.data);
          this.inorder(node.right, result);
        }
      }

      getSortedMessages() {
        const result = [];
        this.inorder(this.root, result);
        return result;
      }
    }

    return new AVLTree();
  }

  // DSA: Segment Tree implementation for efficient range queries on session data
  createSegmentTree(data) {
    const n = data.length;
    const tree = new Array(2 * n);

    // Initialize leaves
    for (let i = 0; i < n; i++) {
      tree[n + i] = data[i];
    }

    // Build tree by calculating parents
    for (let i = n - 1; i > 0; --i) {
      tree[i] = {
        count: (tree[i << 1] ? tree[i << 1].count : 0) + (tree[i << 1 | 1] ? tree[i << 1 | 1].count : 0),
        // Add other aggregations as needed
      };
    }

    return tree;
  }

  // DSA: Disjoint Set Union (DSU) for grouping related conversation topics
  createDSU(maxSize) {
    class DSU {
      constructor(size) {
        this.parent = new Array(size);
        this.rank = new Array(size);
        this.size = size;
        
        for (let i = 0; i < size; i++) {
          this.parent[i] = i;
          this.rank[i] = 0;
        }
      }

      find(x) {
        if (this.parent[x] !== x) {
          this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
      }

      union(x, y) {
        const xRoot = this.find(x);
        const yRoot = this.find(y);

        if (xRoot === yRoot) return;

        // Union by rank
        if (this.rank[xRoot] < this.rank[yRoot]) {
          this.parent[xRoot] = yRoot;
        } else if (this.rank[xRoot] > this.rank[yRoot]) {
          this.parent[yRoot] = xRoot;
        } else {
          this.parent[yRoot] = xRoot;
          this.rank[xRoot]++;
        }
      }
    }

    return new DSU(maxSize);
  }

  // DSA: Enhanced session data structure with multiple indexing strategies
  async getSessionData(sessionId) {
    try {
      // DSA: Check Bloom Filter first for quick existence check
      if (!this._mightExistInBloomFilter(sessionId)) {
        // Session definitely doesn't exist
        return {
          history: [],
          memories: [],
          userProfile: {},
          conversationContext: {},
          lastActivity: new Date().toISOString(),
          conversationFlow: [],
          // DSA: Add advanced data structures
          historyAVL: this.createAVLTree(),
          topicGroups: this.createDSU(100), // For grouping related topics
          accessPattern: [] // Track access patterns for optimization
        };
      }
      
      // DSA: Check cache first for O(1) access
      if (this.sessionCache.has(sessionId)) {
        const cachedData = this.sessionCache.get(sessionId);
        // Update LRU tracking
        this.lruSessions.set(sessionId, Date.now());
        return cachedData;
      }
      
      // DSA: Check HashMap for O(1) lookup
      if (this.sessionHashMap.has(sessionId)) {
        const sessionData = this.sessionHashMap.get(sessionId);
        // Cache the data
        this.sessionCache.set(sessionId, sessionData);
        this.lruSessions.set(sessionId, Date.now());
        this._manageSessionCache();
        return sessionData;
      }
      
      // DSA: Fetch from KV store if not in cache
      const sessionData = await this.kv.get(`session:${sessionId}`);
      const parsedData = sessionData ? JSON.parse(this._decompressSessionData(sessionData)) : {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString(),
        conversationFlow: [],
        // DSA: Add advanced data structures
        historyAVL: this.createAVLTree(),
        topicGroups: this.createDSU(100), // For grouping related topics
        accessPattern: [] // Track access patterns for optimization
      };
      
      // DSA: Add to HashMap and cache for future access
      this.sessionHashMap.set(sessionId, parsedData);
      this.sessionCache.set(sessionId, parsedData);
      this.lruSessions.set(sessionId, Date.now());
      this._addToBloomFilter(sessionId);
      this._manageSessionCache();
      
      return parsedData;
    } catch (error) {
      console.error('Error getting session data:', error);
      return {
        history: [],
        memories: [],
        userProfile: {},
        conversationContext: {},
        lastActivity: new Date().toISOString(),
        conversationFlow: [],
        // DSA: Add advanced data structures
        historyAVL: this.createAVLTree(),
        topicGroups: this.createDSU(100), // For grouping related topics
        accessPattern: [] // Track access patterns for optimization
      };
    }
  }

  // DSA: Enhanced save with advanced indexing
  async saveSessionData(sessionId, sessionData) {
    try {
      // Update last activity
      sessionData.lastActivity = new Date().toISOString();
      
      // Limit memory items
      if (sessionData.memories.length > this.maxMemoryItems) {
        sessionData.memories = this.prioritizeMemories(sessionData.memories)
          .slice(0, this.maxMemoryItems);
      }
      
      // DSA: Update access pattern for optimization
      if (!sessionData.accessPattern) {
        sessionData.accessPattern = [];
      }
      sessionData.accessPattern.push({
        timestamp: Date.now(),
        action: 'save'
      });
      
      // DSA: Maintain access pattern size
      if (sessionData.accessPattern.length > 100) {
        sessionData.accessPattern = sessionData.accessPattern.slice(-50);
      }
      
      // DSA: Update HashMap and cache
      this.sessionHashMap.set(sessionId, sessionData);
      this.sessionCache.set(sessionId, sessionData);
      this.lruSessions.set(sessionId, Date.now());
      this._addToBloomFilter(sessionId);
      this._manageSessionCache();
      
      // DSA: Save to KV store with compression for better performance
      const serializedData = JSON.stringify(sessionData);
      // Simple compression for frequently occurring patterns
      const compressedData = this._compressSessionData(serializedData);
      
      await this.kv.put(`session:${sessionId}`, compressedData, {
        expirationTtl: 86400 * 30 // 30 days
      });
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  // DSA: Enhanced context retrieval with multiple strategies
  async getContextualPrompt(sessionId, userMessage) {
    const sessionData = await this.getSessionData(sessionId);
    
    // DSA: Use different strategies based on session size
    let contextualPrompt;
    
    if (sessionData.history.length < 5) {
      // For new sessions, use basic prompt
      contextualPrompt = this.buildBasePrompt(sessionData.userProfile);
    } else if (sessionData.history.length < 20) {
      // For medium sessions, use standard approach
      contextualPrompt = await this._buildStandardContext(sessionData, userMessage);
    } else {
      // For large sessions, use advanced DSA techniques
      contextualPrompt = await this._buildAdvancedContext(sessionData, userMessage);
    }
    
    return contextualPrompt;
  }

  // DSA: Standard context building
  async _buildStandardContext(sessionData, userMessage) {
    // Get relevant memories
    const relevantMemories = this.memory.getRelevantMemories(
      sessionData.memories, 
      userMessage, 
      5
    );
    
    // Build contextual prompt with enhanced structure
    let contextualPrompt = this.buildBasePrompt(sessionData.userProfile);
    
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
    
    return contextualPrompt;
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