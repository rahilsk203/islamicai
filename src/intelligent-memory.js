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

  // Extract important information from conversation
  extractImportantInfo(message, conversationHistory) {
    const importantInfo = {
      userPreferences: this.extractUserPreferences(message),
      islamicTopics: this.extractIslamicTopics(message),
      emotionalContext: this.analyzeEmotionalState(message),
      learningPatterns: this.analyzeLearningPatterns(conversationHistory),
      keyFacts: this.extractKeyFacts(message)
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

  // Create memory object with enhanced metadata
  createMemory(content, type, priority = this.memoryPriority.MEDIUM, metadata = {}) {
    return {
      id: this.generateMemoryId(),
      content,
      type,
      priority,
      timestamp: new Date().toISOString(),
      metadata,
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      tfidfScore: 0, // For TF-IDF scoring
      relevanceScore: 0 // Combined relevance score
    };
  }

  generateMemoryId() {
    return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Update memory access with LRU tracking
  updateMemoryAccess(memory) {
    memory.accessCount++;
    memory.lastAccessed = new Date().toISOString();
    
    // Update LRU cache
    this.lruCache.set(memory.id, Date.now());
    if (this.lruCache.size > this.cacheCapacity) {
      // Remove oldest entry
      const oldestKey = [...this.lruCache.entries()].reduce((a, e) => e[1] < a[1] ? e : a)[0];
      this.lruCache.delete(oldestKey);
    }
  }

  // Get relevant memories for context with enhanced search
  getRelevantMemories(memories, query, limit = 5) {
    if (memories.length === 0) return [];
    
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
}