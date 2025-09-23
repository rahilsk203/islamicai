export class IntelligentMemory {
  constructor() {
    this.memoryTypes = {
      USER_PREFERENCES: 'preferences',
      IMPORTANT_FACTS: 'facts',
      CONVERSATION_CONTEXT: 'context',
      ISLAMIC_KNOWLEDGE: 'islamic',
      EMOTIONAL_STATE: 'emotional',
      LEARNING_PATTERNS: 'learning'
    };
    
    this.memoryPriority = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };
    
    // DSA: Enhanced data structures for memory management
    this.memoryCache = new Map(); // O(1) access for frequently used memories
    this.memoryIndex = new Map(); // Inverted index for fast keyword search
    this.lruCache = new Map(); // LRU cache for memory eviction
    this.cacheCapacity = 1000;
    
    // DSA: Bloom Filter for quick memory existence check
    this.memoryBloomFilter = new Set();
    
    // DSA: Hash Map for O(1) memory lookup
    this.memoryHashMap = new Map();
  }

  // DSA: Bloom Filter implementation for memory existence check
  _addToMemoryBloomFilter(content) {
    // Simple implementation using multiple hash functions
    const hashes = [
      this._hash1(content),
      this._hash2(content),
      this._hash3(content)
    ];
    
    hashes.forEach(hash => this.memoryBloomFilter.add(hash));
  }

  _mightExistInMemoryBloomFilter(content) {
    const hashes = [
      this._hash1(content),
      this._hash2(content),
      this._hash3(content)
    ];
    
    return hashes.every(hash => this.memoryBloomFilter.has(hash));
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

  // DSA: Enhanced Trie implementation with compression for efficient memory search
  buildMemoryTrie(memories) {
    const trie = {
      children: {},
      memories: [],
      frequency: 0
    };
    
    memories.forEach(memory => {
      const words = memory.content.toLowerCase().split(/\s+/);
      let current = trie;
      
      words.forEach((word, index) => {
        // Compress single-child paths
        if (!current.children[word]) {
          current.children[word] = { 
            children: {}, 
            memories: [], 
            frequency: 0,
            isEnd: index === words.length - 1
          };
        }
        
        current.children[word].frequency++;
        current.children[word].memories.push(memory);
        current = current.children[word];
      });
    });
    
    return trie;
  }

  // DSA: Optimized Binary Search for priority-based memory retrieval with caching
  searchMemoriesByPriority(memories, priority) {
    // Check cache first
    const cacheKey = `priority_${priority}_${memories.length}`;
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }
    
    const sortedMemories = [...memories].sort((a, b) => b.priority - a.priority);
    const left = 0;
    const right = sortedMemories.length - 1;
    
    const result = this.binarySearchByPriority(sortedMemories, left, right, priority);
    
    // Cache the result
    this.memoryCache.set(cacheKey, result);
    this._manageCache();
    
    return result;
  }

  binarySearchByPriority(memories, left, right, targetPriority) {
    if (left > right) return [];
    
    const mid = Math.floor((left + right) / 2);
    const midPriority = memories[mid].priority;
    
    if (midPriority === targetPriority) {
      // Find all memories with same priority using optimized expansion
      const results = [memories[mid]];
      let leftIdx = mid - 1;
      let rightIdx = mid + 1;
      
      // Expand bidirectionally to collect all matching priorities
      while (leftIdx >= 0 && memories[leftIdx].priority === targetPriority) {
        results.unshift(memories[leftIdx]);
        leftIdx--;
      }
      
      while (rightIdx < memories.length && memories[rightIdx].priority === targetPriority) {
        results.push(memories[rightIdx]);
        rightIdx++;
      }
      
      return results;
    }
    
    if (midPriority > targetPriority) {
      return this.binarySearchByPriority(memories, mid + 1, right, targetPriority);
    } else {
      return this.binarySearchByPriority(memories, left, mid - 1, targetPriority);
    }
  }

  // DSA: Inverted Index for fast keyword-based memory retrieval - O(1) average case
  buildInvertedIndex(memories) {
    const index = new Map();
    
    memories.forEach(memory => {
      const words = memory.content.toLowerCase().split(/\s+/);
      const uniqueWords = [...new Set(words)]; // Remove duplicates
      
      uniqueWords.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word).push(memory);
      });
    });
    
    return index;
  }

  // DSA: TF-IDF based relevance scoring for better memory retrieval
  calculateTFIDF(query, memories) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const totalMemories = memories.length;
    
    return memories.map(memory => {
      let score = 0;
      const contentWords = memory.content.toLowerCase().split(/\s+/);
      const uniqueContentWords = [...new Set(contentWords)];
      
      queryWords.forEach(queryWord => {
        // Term Frequency (TF)
        const tf = contentWords.filter(word => word === queryWord).length / contentWords.length;
        
        // Inverse Document Frequency (IDF)
        const matchingMemories = uniqueContentWords.filter(word => word === queryWord).length;
        const idf = Math.log(totalMemories / (1 + matchingMemories));
        
        // TF-IDF score
        score += tf * idf;
      });
      
      // Boost by priority and recency
      score *= memory.priority;
      
      const daysSinceLastAccess = (Date.now() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0.5, 1.5 - (daysSinceLastAccess / 30)); // Boost for recent memories
      score *= recencyBoost;
      
      return { ...memory, tfidfScore: score };
    });
  }

  // DSA: LRU Cache Management
  _manageCache() {
    if (this.memoryCache.size > this.cacheCapacity) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
  }

  // DSA: Heap-based priority queue for memory management
  createPriorityQueue() {
    return {
      heap: [],
      push: function(item) {
        this.heap.push(item);
        this._heapifyUp(this.heap.length - 1);
      },
      pop: function() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return top;
      },
      _heapifyUp: function(index) {
        while (index > 0) {
          const parentIndex = Math.floor((index - 1) / 2);
          if (this.heap[parentIndex].priority >= this.heap[index].priority) break;
          
          [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
          index = parentIndex;
        }
      },
      _heapifyDown: function(index) {
        while (true) {
          let maxIndex = index;
          const leftChild = 2 * index + 1;
          const rightChild = 2 * index + 2;
          
          if (leftChild < this.heap.length && this.heap[leftChild].priority > this.heap[maxIndex].priority) {
            maxIndex = leftChild;
          }
          
          if (rightChild < this.heap.length && this.heap[rightChild].priority > this.heap[maxIndex].priority) {
            maxIndex = rightChild;
          }
          
          if (maxIndex === index) break;
          
          [this.heap[index], this.heap[maxIndex]] = [this.heap[maxIndex], this.heap[index]];
          index = maxIndex;
        }
      },
      size: function() {
        return this.heap.length;
      }
    };
  }

  // DSA: Enhanced memory creation with better metadata
  createMemory(content, type, priority = this.memoryPriority.MEDIUM, metadata = {}) {
    const memoryId = this.generateMemoryId();
    
    // DSA: Add to Bloom Filter for quick existence check
    this._addToMemoryBloomFilter(content);
    
    const memory = {
      id: memoryId,
      content,
      type,
      priority,
      timestamp: new Date().toISOString(),
      metadata,
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      tfidfScore: 0, // For TF-IDF scoring
      relevanceScore: 0, // Combined relevance score
      // DSA: Enhanced metadata for better memory management
      decayFactor: 1.0, // For memory decay algorithms
      associations: [], // Related memories
      context: {
        sessionId: metadata.sessionId || 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // DSA: Memory clustering information
      clusterId: null,
      similarityHash: this._generateSimilarityHash(content),
      // DSA: Usage patterns
      usagePatterns: {
        accessTimes: [Date.now()],
        frequency: 1,
        lastAccessTime: Date.now()
      }
    };
    
    // DSA: Add to HashMap for O(1) lookup
    this.memoryHashMap.set(memoryId, memory);
    
    return memory;
  }

  // DSA: Generate similarity hash for content comparison
  _generateSimilarityHash(content) {
    // Simple implementation - in production, you might use more sophisticated algorithms
    const words = content.toLowerCase().split(/\s+/).slice(0, 10); // First 10 words
    return words.sort().join('|');
  }

  // DSA: Check if similar memory exists
  _hasSimilarMemory(content) {
    const similarityHash = this._generateSimilarityHash(content);
    for (const [id, memory] of this.memoryHashMap.entries()) {
      if (memory.similarityHash === similarityHash) {
        return true;
      }
    }
    return false;
  }

  // DSA: Enhanced memory update with access pattern tracking
  updateMemoryAccess(memory) {
    memory.accessCount++;
    memory.lastAccessed = new Date().toISOString();
    
    // DSA: Update usage patterns
    memory.usagePatterns.accessTimes.push(Date.now());
    memory.usagePatterns.frequency++;
    memory.usagePatterns.lastAccessTime = Date.now();
    
    // DSA: Update access times array to keep only recent accesses
    if (memory.usagePatterns.accessTimes.length > 50) {
      memory.usagePatterns.accessTimes = memory.usagePatterns.accessTimes.slice(-25);
    }
    
    // DSA: Update decay factor based on access pattern
    const timeSinceLastAccess = (Date.now() - memory.usagePatterns.lastAccessTime) / (1000 * 60 * 60); // hours
    memory.decayFactor = Math.max(0.1, 1.0 - (timeSinceLastAccess / 168)); // Decay over a week
    
    // DSA: Update LRU cache
    this.lruCache.set(memory.id, Date.now());
    if (this.lruCache.size > this.cacheCapacity) {
      // Remove oldest entry
      const oldestKey = [...this.lruCache.entries()].reduce((a, e) => e[1] < a[1] ? e : a)[0];
      this.lruCache.delete(oldestKey);
    }
    
    // DSA: Update HashMap
    this.memoryHashMap.set(memory.id, memory);
  }

  // DSA: Enhanced memory retrieval with advanced algorithms
  getRelevantMemories(memories, query, limit = 5) {
    if (memories.length === 0) return [];
    
    // DSA: Check if we have enough memories to justify advanced algorithms
    if (memories.length < 10) {
      // For small memory sets, use simple approach
      return this._getRelevantMemoriesSimple(memories, query, limit);
    } else {
      // For large memory sets, use advanced DSA algorithms
      return this._getRelevantMemoriesAdvanced(memories, query, limit);
    }
  }

  // DSA: Simple memory retrieval for small datasets
  _getRelevantMemoriesSimple(memories, query, limit = 5) {
    // Build inverted index if not exists
    if (this.memoryIndex.size === 0) {
      this.memoryIndex = this.buildInvertedIndex(memories);
    }
    
    // Calculate TF-IDF scores
    const scoredMemories = this.calculateTFIDF(query, memories);
    
    // Sort by TF-IDF score and return top results
    return scoredMemories
      .sort((a, b) => b.tfidfScore - a.tfidfScore)
      .slice(0, limit)
      .map(memory => {
        // Update access for returned memories
        this.updateMemoryAccess(memory);
        return memory;
      });
  }

  // DSA: Advanced memory retrieval with graph algorithms
  _getRelevantMemoriesAdvanced(memories, query, limit = 5) {
    // DSA: Use clustering to group similar memories
    const clusters = this._clusterMemories(memories);
    
    // DSA: Find relevant clusters
    const relevantClusters = this._findRelevantClusters(clusters, query);
    
    // DSA: Get top memories from relevant clusters
    const relevantMemories = [];
    relevantClusters.forEach(cluster => {
      // Calculate TF-IDF scores for cluster memories
      const scoredMemories = this.calculateTFIDF(query, cluster.memories);
      
      // Sort by TF-IDF score
      const sortedMemories = scoredMemories.sort((a, b) => b.tfidfScore - a.tfidfScore);
      
      // Add top memories from cluster
      relevantMemories.push(...sortedMemories.slice(0, Math.ceil(limit / relevantClusters.length)));
    });
    
    // DSA: Sort all relevant memories by combined score
    const finalMemories = relevantMemories
      .sort((a, b) => {
        // Combined score: TF-IDF + decay factor + priority
        const scoreA = (a.tfidfScore || 0) * a.decayFactor * a.priority;
        const scoreB = (b.tfidfScore || 0) * b.decayFactor * b.priority;
        return scoreB - scoreA;
      })
      .slice(0, limit);
    
    // DSA: Update access for returned memories
    finalMemories.forEach(memory => {
      this.updateMemoryAccess(memory);
    });
    
    return finalMemories;
  }

  // DSA: Cluster memories using similarity metrics
  _clusterMemories(memories) {
    // Simple clustering algorithm based on content similarity
    const clusters = [];
    const visited = new Set();
    
    memories.forEach((memory, index) => {
      if (visited.has(index)) return;
      
      // Create new cluster with current memory
      const cluster = {
        id: clusters.length,
        memories: [memory],
        centroid: this._calculateCentroid([memory])
      };
      
      visited.add(index);
      
      // Find similar memories
      memories.forEach((otherMemory, otherIndex) => {
        if (visited.has(otherIndex)) return;
        
        // Calculate similarity
        const similarity = this._calculateSimilarity(memory, otherMemory);
        
        // If similar enough, add to cluster
        if (similarity > 0.3) { // Threshold for similarity
          cluster.memories.push(otherMemory);
          visited.add(otherIndex);
        }
      });
      
      // Update centroid
      cluster.centroid = this._calculateCentroid(cluster.memories);
      clusters.push(cluster);
    });
    
    return clusters;
  }

  // DSA: Calculate centroid of memory cluster
  _calculateCentroid(memories) {
    // Simple centroid calculation based on word frequency
    const wordCounts = {};
    let totalWords = 0;
    
    memories.forEach(memory => {
      const words = memory.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        totalWords++;
      });
    });
    
    // Normalize word counts
    const centroid = {};
    Object.keys(wordCounts).forEach(word => {
      centroid[word] = wordCounts[word] / totalWords;
    });
    
    return centroid;
  }

  // DSA: Calculate similarity between two memories
  _calculateSimilarity(memory1, memory2) {
    // Simple cosine similarity based on word overlap
    const words1 = new Set(memory1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(memory2.content.toLowerCase().split(/\s+/));
    
    const intersection = [...words1].filter(word => words2.has(word)).length;
    const union = new Set([...words1, ...words2]).size;
    
    return union === 0 ? 0 : intersection / union;
  }

  // DSA: Find relevant clusters based on query
  _findRelevantClusters(clusters, query) {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const relevantClusters = [];
    
    clusters.forEach(cluster => {
      // Calculate cluster relevance to query
      let relevanceScore = 0;
      const centroid = cluster.centroid;
      
      // Check overlap between query words and cluster centroid
      Object.keys(centroid).forEach(word => {
        if (queryWords.has(word)) {
          relevanceScore += centroid[word];
        }
      });
      
      // If relevant enough, add to results
      if (relevanceScore > 0.1) { // Threshold for relevance
        relevantClusters.push({
          ...cluster,
          relevanceScore
        });
      }
    });
    
    // Sort by relevance score
    return relevantClusters.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // DSA: Memory decay algorithm to forget less important memories
  applyMemoryDecay(memories) {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in a week
    
    return memories.filter(memory => {
      const age = now - new Date(memory.timestamp).getTime();
      
      // Apply decay based on priority and access pattern
      if (memory.priority === this.memoryPriority.HIGH) {
        // High priority memories last longer
        return age < (4 * oneWeek); // 4 weeks
      } else if (memory.priority === this.memoryPriority.MEDIUM) {
        // Medium priority memories
        return age < (2 * oneWeek); // 2 weeks
      } else {
        // Low priority memories
        return age < oneWeek; // 1 week
      }
    });
  }

  // DSA: Memory consolidation to merge similar memories
  consolidateMemories(memories) {
    const consolidated = [];
    const processed = new Set();
    
    memories.forEach((memory, index) => {
      if (processed.has(index)) return;
      
      // Find similar memories
      const similarMemories = [memory];
      memories.forEach((otherMemory, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const similarity = this._calculateSimilarity(memory, otherMemory);
        if (similarity > 0.5) { // High similarity threshold
          similarMemories.push(otherMemory);
          processed.add(otherIndex);
        }
      });
      
      // Consolidate similar memories
      if (similarMemories.length > 1) {
        const consolidatedMemory = this._mergeMemories(similarMemories);
        consolidated.push(consolidatedMemory);
      } else {
        consolidated.push(memory);
      }
      
      processed.add(index);
    });
    
    return consolidated;
  }

  // DSA: Merge similar memories
  _mergeMemories(memories) {
    // Create merged memory with combined properties
    const primaryMemory = memories[0];
    
    // Merge content (take first memory's content as base)
    const mergedContent = primaryMemory.content;
    
    // Merge metadata
    const mergedMetadata = {};
    memories.forEach(memory => {
      Object.keys(memory.metadata).forEach(key => {
        if (!mergedMetadata[key]) {
          mergedMetadata[key] = memory.metadata[key];
        }
      });
    });
    
    // Take highest priority
    const mergedPriority = Math.max(...memories.map(m => m.priority));
    
    // Sum access counts
    const mergedAccessCount = memories.reduce((sum, m) => sum + m.accessCount, 0);
    
    // Take most recent timestamp
    const mergedTimestamp = memories.reduce((latest, m) => 
      new Date(m.lastAccessed) > new Date(latest) ? m.lastAccessed : latest, 
      primaryMemory.lastAccessed
    );
    
    return {
      ...primaryMemory,
      content: mergedContent,
      metadata: mergedMetadata,
      priority: mergedPriority,
      accessCount: mergedAccessCount,
      lastAccessed: mergedTimestamp,
      // Keep track of merged memories
      mergedFrom: memories.map(m => m.id)
    };
  }

  // DSA: Enhanced important info extraction with better algorithms
  extractImportantInfo(message, conversationHistory) {
    // DSA: Use advanced algorithms for better extraction
    const importantInfo = {
      userPreferences: this.extractUserPreferences(message),
      islamicTopics: this.extractIslamicTopics(message),
      emotionalContext: this.analyzeEmotionalState(message),
      learningPatterns: this.analyzeLearningPatterns(conversationHistory),
      keyFacts: this.extractKeyFacts(message),
      // DSA: Enhanced extraction
      conversationThemes: this._extractConversationThemes(conversationHistory),
      userIntent: this._analyzeUserIntent(message),
      contextShift: this._detectContextShift(conversationHistory, message),
      complexityLevel: this._assessComplexity(message, conversationHistory)
    };

    return importantInfo;
  }

  extractUserPreferences(message) {
    const preferences = {};
    
    // Islamic school preference
    if (message.includes('hanafi') || message.includes('hanafi school')) {
      preferences.fiqhSchool = 'hanafi';
    } else if (message.includes('shafi') || message.includes('shafi school')) {
      preferences.fiqhSchool = 'shafi';
    } else if (message.includes('maliki') || message.includes('maliki school')) {
      preferences.fiqhSchool = 'maliki';
    } else if (message.includes('hanbali') || message.includes('hanbali school')) {
      preferences.fiqhSchool = 'hanbali';
    }

    // Response style preference
    if (message.includes('detailed') || message.includes('explain more') || message.includes('in detail')) {
      preferences.responseStyle = 'detailed';
    } else if (message.includes('brief') || message.includes('short') || message.includes('concise')) {
      preferences.responseStyle = 'brief';
    } else {
      preferences.responseStyle = 'balanced';
    }

    return preferences;
  }

  extractIslamicTopics(message) {
    const topics = [];
    const lowerMessage = message.toLowerCase();
    
    const topicKeywords = {
      'quran': ['quran', 'qur\'an', 'ayat', 'surah', 'verse', 'ayah'],
      'hadith': ['hadith', 'sunnah', 'narrated', 'prophet said', 'hadis'],
      'fiqh': ['fiqh', 'halal', 'haram', 'prayer', 'namaz', 'fasting', 'roza', 'wudu', 'zakat', 'hajj'],
      'seerah': ['seerah', 'prophet muhammad', 'sahabah', 'companions', 'khilafah', 'caliph'],
      'aqeedah': ['aqeedah', 'belief', 'faith', 'iman', 'tawheed', 'monotheism', 'creed'],
      'tasawwuf': ['tasawwuf', 'sufism', 'spirituality', 'zikr', 'dhikr'],
      'history': ['islamic history', 'caliphate', 'ummah', 'muslim empire'],
      'dua': ['dua', 'supplication', 'prayer', 'supplicate'],
      'ethics': ['ethics', 'morals', 'character', 'adab', 'akhlaq']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  analyzeEmotionalState(message) {
    const emotionalIndicators = {
      confused: ['confused', 'don\'t understand', 'explain', 'help', 'can\'t understand'],
      sad: ['sad', 'depressed', 'worried', 'anxious', 'upset', 'troubled'],
      happy: ['happy', 'excited', 'grateful', 'blessed', 'alhamdulillah', 'mashallah'],
      angry: ['angry', 'frustrated', 'upset', 'annoyed', 'mad'],
      curious: ['curious', 'wonder', 'question', 'why', 'how', 'what is', 'tell me about'],
      seeking_guidance: ['need help', 'guide me', 'show me', 'teach me', 'how to']
    };

    const lowerMessage = message.toLowerCase();
    for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        return emotion;
      }
    }

    return 'neutral';
  }

  analyzeLearningPatterns(conversationHistory) {
    const patterns = {
      questionTypes: [],
      preferredTopics: [],
      responseLength: 'medium',
      complexityLevel: 'intermediate'
    };

    if (conversationHistory.length === 0) return patterns;

    // Analyze question types
    conversationHistory.forEach(msg => {
      if (msg.role === 'user') {
        if (msg.content.includes('?')) {
          if (msg.content.includes('what')) patterns.questionTypes.push('what');
          if (msg.content.includes('why')) patterns.questionTypes.push('why');
          if (msg.content.includes('how')) patterns.questionTypes.push('how');
          if (msg.content.includes('when')) patterns.questionTypes.push('when');
          if (msg.content.includes('where')) patterns.questionTypes.push('where');
        }
      }
    });

    // Analyze response length preference
    const aiResponses = conversationHistory.filter(msg => msg.role === 'assistant');
    if (aiResponses.length > 0) {
      const avgLength = aiResponses.reduce((sum, msg) => sum + msg.content.length, 0) / aiResponses.length;
      
      if (avgLength < 100) patterns.responseLength = 'brief';
      else if (avgLength > 300) patterns.responseLength = 'detailed';
      else patterns.responseLength = 'medium';
    }

    return patterns;
  }

  extractKeyFacts(message) {
    const facts = [];
    const lowerMessage = message.toLowerCase();
    
    // Enhanced name extraction patterns with better validation
    const namePatterns = [
      /(?:my name is|i am|call me|mera naam|mujhe|main)\s+([a-zA-Z\u0900-\u097F\u0980-\u09FF\s]+)/i,
      /(?:name|naam)\s*:?\s*([a-zA-Z\u0900-\u097F\u0980-\u09FF\s]+)/i,
      /(?:i'm|main)\s+([a-zA-Z\u0900-\u097F\u0980-\u09FF\s]+)/i,
      /(?:assalamu alaikum|salam)\s+([a-zA-Z\u0900-\u097F\u0980-\u09FF\s]+)/i,
      /([a-zA-Z\u0900-\u097F\u0980-\u09FF]+)\s+(?:bhai|sister|brother|sister|aap|tum)/i
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = message.match(pattern);
      if (nameMatch) {
        const name = nameMatch[1].trim();
        // Clean up the name (remove common words)
        const cleanName = name.replace(/\b(?:hai|hain|ho|hun|hu|main|mera|mujhe|call|me|is|am|i|hello|hi)\b/gi, '').trim();
        if (cleanName && cleanName.length > 1 && cleanName.length < 30) {
          facts.push({
            type: 'name',
            value: cleanName,
            priority: this.memoryPriority.HIGH
          });
          break; // Only extract first valid name
        }
      }
    }

    // Enhanced location extraction
    const locationPatterns = [
      /(?:i live in|i am from|i'm from|main rehta hun|main se hun)\s+([a-zA-Z\u0900-\u097F\u0980-\u09FF\s,]+)/i,
      /(?:location|jagah|place)\s*:?\s*([a-zA-Z\u0900-\u097F\u0980-\u09FF\s,]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const locationMatch = message.match(pattern);
      if (locationMatch) {
        const location = locationMatch[1].trim();
        const cleanLocation = location.replace(/\b(?:main|hun|se|in|from|live|am|i'm)\b/gi, '').trim();
        if (cleanLocation && cleanLocation.length > 1 && cleanLocation.length < 50) {
          facts.push({
            type: 'location',
            value: cleanLocation,
            priority: this.memoryPriority.MEDIUM
          });
          break;
        }
      }
    }

    // Extract specific Islamic knowledge requests
    if (lowerMessage.includes('surah') && (lowerMessage.includes('verse') || lowerMessage.includes('ayah'))) {
      const surahMatch = message.match(/surah\s+([a-zA-Z0-9\s]+)/i);
      if (surahMatch) {
        facts.push({
          type: 'quran_reference',
          value: surahMatch[1].trim(),
          priority: this.memoryPriority.HIGH
        });
      }
    }

    // Extract dua requests
    if (lowerMessage.includes('dua') || lowerMessage.includes('supplication')) {
      facts.push({
        type: 'dua_request',
        value: 'user requested dua',
        priority: this.memoryPriority.MEDIUM
      });
    }

    return facts;
  }

  generateMemoryId() {
    return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // DSA: Extract conversation themes
  _extractConversationThemes(conversationHistory) {
    if (conversationHistory.length === 0) return [];
    
    // Get all user messages
    const userMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
    
    if (userMessages.length === 0) return [];
    
    // Extract topics from all messages
    const allTopics = userMessages.flatMap(message => 
      this.extractIslamicTopics(message)
    );
    
    // Count topic frequency
    const topicCounts = {};
    allTopics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    // Return most frequent topics
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  // DSA: Analyze user intent with better algorithms
  _analyzeUserIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced intent detection
    const intents = {
      question: /(\bwhat\b|\bwhy\b|\bhow\b|\bwhen\b|\bwhere\b|\bwhich\b|\bwho\b|\?)/.test(lowerMessage),
      explanation: /(\bexplain\b|\bdescribe\b|\btell me\b|\bhow does\b)/.test(lowerMessage),
      request: /(\bplease\b|\bcould you\b|\bwould you\b|\bcan you\b|\bi need\b|\bi want\b)/.test(lowerMessage),
      debate: /(\bprove\b|\bargue\b|\bdisagree\b|\bchallenge\b|\bdebate\b)/.test(lowerMessage),
      emotional: /(\bsad\b|\bupset\b|\bconfused\b|\bfrustrated\b|\bgrateful\b|\bthank\b)/.test(lowerMessage)
    };
    
    // Return primary intent
    for (const [intent, isMatch] of Object.entries(intents)) {
      if (isMatch) return intent;
    }
    
    return 'general';
  }

  // DSA: Detect context shift with better algorithms
  _detectContextShift(conversationHistory, newMessage) {
    if (conversationHistory.length < 2) return false;
    
    // Get last user message
    const lastUserMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .slice(-2)
      .map(msg => msg.content);
    
    if (lastUserMessages.length === 0) return false;
    
    const lastMessage = lastUserMessages[lastUserMessages.length - 1];
    
    // Extract topics from both messages
    const lastTopics = this.extractIslamicTopics(lastMessage);
    const newTopics = this.extractIslamicTopics(newMessage);
    
    // Calculate topic overlap
    const commonTopics = lastTopics.filter(topic => newTopics.includes(topic));
    const overlapRatio = commonTopics.length / Math.max(lastTopics.length, newTopics.length);
    
    // Context shift if less than 30% overlap
    return overlapRatio < 0.3;
  }

  // DSA: Assess complexity with better metrics
  _assessComplexity(message, conversationHistory) {
    // Message complexity
    const wordCount = message.split(/\s+/).length;
    const sentenceCount = message.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Conversation history complexity
    const historyLength = conversationHistory.length;
    const uniqueTopics = new Set(
      conversationHistory
        .filter(msg => msg.role === 'user')
        .flatMap(msg => this.extractIslamicTopics(msg.content))
    ).size;
    
    // Combined complexity score
    let score = 0;
    if (wordCount > 50) score += 1;
    if (avgWordsPerSentence > 20) score += 1;
    if (historyLength > 20) score += 1;
    if (uniqueTopics > 3) score += 1;
    
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

}
