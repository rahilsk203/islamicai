export class IntelligentMemory {
  constructor() {
    // Enhanced memory types for behavior tracking
    this.memoryTypes = {
      USER_PREFERENCES: 'preferences',
      IMPORTANT_FACTS: 'facts',
      CONVERSATION_CONTEXT: 'context',
      ISLAMIC_KNOWLEDGE: 'islamic',
      EMOTIONAL_STATE: 'emotional',
      LEARNING_PATTERNS: 'learning',
      // New memory types for enhanced behavior tracking
      BEHAVIORAL_PATTERNS: 'behavioral_patterns',
      RESPONSE_PREFERENCES: 'response_preferences',
      TOPIC_INTERESTS: 'topic_interests',
      LEARNING_PROGRESS: 'learning_progress',
      INTERACTION_FREQUENCY: 'interaction_frequency'
    };
    
    // Enhanced memory priority system
    this.memoryPriority = {
      CRITICAL: 4, // For essential user information
      HIGH: 3,     // For important behavioral patterns
      MEDIUM: 2,   // For general preferences
      LOW: 1       // For minor interaction details
    };
    
    // Enhanced behavior tracking structures
    this.behavioralMemory = {
      patternRecognition: new Map(), // Stores recognized patterns
      preferenceEvolution: new Map(), // Tracks how preferences change over time
      learningAdaptation: new Map() // Stores adaptive learning strategies
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

    // DSA: Recent query dedupe to avoid repeated heavy scoring within short window
    this.recentQuerySet = new Map(); // key -> timestamp
    this.recentQueryWindowMs = 4000;

    // DSA: Tiny LRU for TF-IDF results per (query,len) to reuse scoring
    this.tfidfCache = new Map(); // key -> scored array
    this.tfidfCacheCap = 64;
    
    // DSA: Enhanced memory clustering for faster retrieval
    this.memoryClusters = new Map(); // clusterId -> [memoryIds]
    this.clusterCentroids = new Map(); // clusterId -> centroidVector
  }

  /**
   * Enhanced behavior signals extraction with deeper analysis
   * @param {string} message - User message
   * @returns {Object} Enhanced behavior signals
   */
  extractBehaviorSignals(message) {
    const text = (message || '').toString();
    const lower = text.toLowerCase();
    const arabicMatches = text.match(/[\u0600-\u06FF]/g) || [];
    const signals = {
      emojiCount: (text.match(/[\p{Emoji}\u{1F300}-\u{1FAFF}]/gu) || []).length,
      questionMarks: (text.match(/\?/g) || []).length,
      exclamations: (text.match(/\!/g) || []).length,
      lengthChars: text.length,
      wantsCitations: /cite|reference|source|hawala|daleel/.test(lower),
      wantsQuranOften: /quran|ayat|aayat|surah|ayah|verse/.test(lower),
      prefersHinglish: /(hinglish|roman|mix|urdu|hindi)/.test(lower),
      prefersArabic: arabicMatches.length > 5,
      prefersShort: /short|brief|sankshipt|chhota|small/.test(lower),
      prefersDetailed: /detail|tafseel|long|lamba|comprehensive/.test(lower),
      correctionTone: /(actually|nahi|galat|incorrect|sahi ye hai)/.test(lower),
      // Enhanced signals
      gratitudeExpressions: /(thank|shukran|thanks|jazakallah)/.test(lower),
      confusionIndicators: /(confused|don't understand|help me|can't understand)/.test(lower),
      repetitionPatterns: this._detectRepetition(text),
      complexityPreference: this._detectComplexityPreference(text),
      interactionStyle: this._detectInteractionStyle(text)
    };
    return signals;
  }

  /**
   * Detect repetition patterns in user messages
   * @param {string} text - User message text
   * @returns {Object} Repetition pattern analysis
   * @private
   */
  _detectRepetition(text) {
    // Simple repetition detection based on word frequency
    const words = text.toLowerCase().split(/\s+/);
    const wordFrequency = {};
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const repeatedWords = Object.keys(wordFrequency).filter(word => wordFrequency[word] > 2);
    
    return {
      hasRepetition: repeatedWords.length > 0,
      repeatedWords: repeatedWords,
      repetitionCount: repeatedWords.length
    };
  }

  /**
   * Detect user's complexity preference
   * @param {string} text - User message text
   * @returns {string} Complexity preference level
   * @private
   */
  _detectComplexityPreference(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('simple') || lowerText.includes('basic') || lowerText.includes('easy')) {
      return 'simple';
    } else if (lowerText.includes('advanced') || lowerText.includes('complex') || lowerText.includes('detailed')) {
      return 'complex';
    }
    
    return 'moderate';
  }

  /**
   * Detect user's interaction style
   * @param {string} text - User message text
   * @returns {string} Interaction style
   * @private
   */
  _detectInteractionStyle(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('please') || lowerText.includes('kindly') || lowerText.includes('request')) {
      return 'polite';
    } else if (lowerText.includes('now') || lowerText.includes('quick') || lowerText.includes('fast')) {
      return 'urgent';
    } else if (lowerText.includes('just') || lowerText.includes('only')) {
      return 'direct';
    }
    
    return 'standard';
  }

  /**
   * Enhanced behavior profile computation with deeper insights
   * @param {Array} conversationHistory - Conversation history
   * @returns {Object} Enhanced behavior profile
   */
  computeBehaviorProfile(conversationHistory = []) {
    let userMsgCount = 0;
    let agg = {
      totalEmoji: 0,
      totalQuestions: 0,
      totalExclaims: 0,
      totalChars: 0,
      wantsCitations: 0,
      wantsQuranOften: 0,
      prefersHinglish: 0,
      prefersArabic: 0,
      prefersShort: 0,
      prefersDetailed: 0,
      corrections: 0,
      // Enhanced aggregations
      gratitudeExpressions: 0,
      confusionIndicators: 0,
      repetitionInstances: 0,
      simplePreference: 0,
      complexPreference: 0,
      politeInteractions: 0,
      urgentInteractions: 0,
      directInteractions: 0
    };
    
    for (const msg of conversationHistory) {
      if (msg.role !== 'user') continue;
      userMsgCount++;
      const s = this.extractBehaviorSignals(msg.content || '');
      agg.totalEmoji += s.emojiCount;
      agg.totalQuestions += s.questionMarks;
      agg.totalExclaims += s.exclamations;
      agg.totalChars += s.lengthChars;
      agg.wantsCitations += s.wantsCitations ? 1 : 0;
      agg.wantsQuranOften += s.wantsQuranOften ? 1 : 0;
      agg.prefersHinglish += s.prefersHinglish ? 1 : 0;
      agg.prefersArabic += s.prefersArabic ? 1 : 0;
      agg.prefersShort += s.prefersShort ? 1 : 0;
      agg.prefersDetailed += s.prefersDetailed ? 1 : 0;
      agg.corrections += s.correctionTone ? 1 : 0;
      // Enhanced aggregations
      agg.gratitudeExpressions += s.gratitudeExpressions ? 1 : 0;
      agg.confusionIndicators += s.confusionIndicators ? 1 : 0;
      agg.repetitionInstances += s.repetitionPatterns.hasRepetition ? 1 : 0;
      if (s.complexityPreference === 'simple') agg.simplePreference++;
      if (s.complexityPreference === 'complex') agg.complexPreference++;
      if (s.interactionStyle === 'polite') agg.politeInteractions++;
      if (s.interactionStyle === 'urgent') agg.urgentInteractions++;
      if (s.interactionStyle === 'direct') agg.directInteractions++;
    }
    
    const denom = Math.max(1, userMsgCount);
    const avgLen = Math.round(agg.totalChars / denom);
    const profile = {
      samples: userMsgCount,
      avgMessageLengthChars: avgLen,
      emojiPerMessage: +(agg.totalEmoji / denom).toFixed(2),
      questionPerMessage: +(agg.totalQuestions / denom).toFixed(2),
      exclaimPerMessage: +(agg.totalExclaims / denom).toFixed(2),
      wantsCitationsRatio: +(agg.wantsCitations / denom).toFixed(2),
      quranAffinityRatio: +(agg.wantsQuranOften / denom).toFixed(2),
      hinglishPreferenceRatio: +(agg.prefersHinglish / denom).toFixed(2),
      arabicPreferenceRatio: +(agg.prefersArabic / denom).toFixed(2),
      prefersShortRatio: +(agg.prefersShort / denom).toFixed(2),
      prefersDetailedRatio: +(agg.prefersDetailed / denom).toFixed(2),
      correctionFrequency: +(agg.corrections / denom).toFixed(2),
      // Enhanced profile data
      gratitudeExpressionRatio: +(agg.gratitudeExpressions / denom).toFixed(2),
      confusionIndicatorRatio: +(agg.confusionIndicators / denom).toFixed(2),
      repetitionPatternRatio: +(agg.repetitionInstances / denom).toFixed(2),
      complexityPreference: this._determineComplexityPreference(agg.simplePreference, agg.complexPreference, denom),
      dominantInteractionStyle: this._determineDominantInteractionStyle(
        agg.politeInteractions, agg.urgentInteractions, agg.directInteractions, denom
      ),
      learningAdaptability: this._calculateLearningAdaptability(agg, denom)
    };
    
    return profile;
  }

  /**
   * Determine user's complexity preference
   * @param {number} simpleCount - Count of simple preference expressions
   * @param {number} complexCount - Count of complex preference expressions
   * @param {number} totalCount - Total message count
   * @returns {string} Dominant complexity preference
   * @private
   */
  _determineComplexityPreference(simpleCount, complexCount, totalCount) {
    const simpleRatio = simpleCount / totalCount;
    const complexRatio = complexCount / totalCount;
    
    if (simpleRatio > 0.5) return 'prefers_simple';
    if (complexRatio > 0.5) return 'prefers_complex';
    return 'balanced';
  }

  /**
   * Determine dominant interaction style
   * @param {number} politeCount - Count of polite interactions
   * @param {number} urgentCount - Count of urgent interactions
   * @param {number} directCount - Count of direct interactions
   * @param {number} totalCount - Total message count
   * @returns {string} Dominant interaction style
   * @private
   */
  _determineDominantInteractionStyle(politeCount, urgentCount, directCount, totalCount) {
    const styles = [
      { name: 'polite', count: politeCount },
      { name: 'urgent', count: urgentCount },
      { name: 'direct', count: directCount }
    ];
    
    const dominant = styles.reduce((max, style) => 
      style.count > max.count ? style : max, { name: 'standard', count: 0 }
    );
    
    return dominant.name;
  }

  /**
   * Calculate user's learning adaptability score
   * @param {Object} agg - Aggregated behavior data
   * @param {number} denom - Denominator for ratios
   * @returns {number} Learning adaptability score (0-1)
   * @private
   */
  _calculateLearningAdaptability(agg, denom) {
    // Factors contributing to learning adaptability:
    // 1. Question frequency (curiosity)
    // 2. Correction frequency (willingness to learn)
    // 3. Variety in complexity preference (flexibility)
    // 4. Low repetition (ability to grasp concepts)
    
    const curiosityScore = agg.totalQuestions / denom;
    const correctionScore = agg.corrections / denom;
    const flexibilityScore = (agg.simplePreference > 0 && agg.complexPreference > 0) ? 1 : 0;
    const repetitionScore = 1 - (agg.repetitionInstances / denom);
    
    // Weighted average
    return (
      (curiosityScore * 0.4) +
      (correctionScore * 0.3) +
      (flexibilityScore * 0.2) +
      (repetitionScore * 0.1)
    );
  }

  

  // O(1) incremental update by weighted merge between old and new snapshot
  updateBehaviorProfile(existingProfile = null, newSnapshot) {
    if (!existingProfile) return newSnapshot;
    const wOld = Math.min(0.9, Math.max(0.1, existingProfile.samples / (existingProfile.samples + 1)));
    const wNew = 1 - wOld;
    const mergeNum = (a, b) => +(a * wOld + b * wNew).toFixed(2);
    return {
      samples: existingProfile.samples + 1,
      avgMessageLengthChars: Math.round(existingProfile.avgMessageLengthChars * wOld + newSnapshot.avgMessageLengthChars * wNew),
      emojiPerMessage: mergeNum(existingProfile.emojiPerMessage, newSnapshot.emojiPerMessage),
      questionPerMessage: mergeNum(existingProfile.questionPerMessage, newSnapshot.questionPerMessage),
      exclaimPerMessage: mergeNum(existingProfile.exclaimPerMessage, newSnapshot.exclaimPerMessage),
      wantsCitationsRatio: mergeNum(existingProfile.wantsCitationsRatio, newSnapshot.wantsCitationsRatio),
      quranAffinityRatio: mergeNum(existingProfile.quranAffinityRatio, newSnapshot.quranAffinityRatio),
      hinglishPreferenceRatio: mergeNum(existingProfile.hinglishPreferenceRatio, newSnapshot.hinglishPreferenceRatio),
      arabicPreferenceRatio: mergeNum(existingProfile.arabicPreferenceRatio, newSnapshot.arabicPreferenceRatio),
      prefersShortRatio: mergeNum(existingProfile.prefersShortRatio, newSnapshot.prefersShortRatio),
      prefersDetailedRatio: mergeNum(existingProfile.prefersDetailedRatio, newSnapshot.prefersDetailedRatio),
      correctionFrequency: mergeNum(existingProfile.correctionFrequency, newSnapshot.correctionFrequency)
    };
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
      // Check if memory has content before accessing it
      if (memory.content) {
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
      }
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
      // Check if memory has content before accessing it
      if (memory.content) {
        const words = memory.content.toLowerCase().split(/\s+/);
        const uniqueWords = [...new Set(words)]; // Remove duplicates
        
        uniqueWords.forEach(word => {
          if (!index.has(word)) {
            index.set(word, []);
          }
          index.get(word).push(memory);
        });
      }
    });
    
    return index;
  }

  // DSA: TF-IDF based relevance scoring for better memory retrieval
  calculateTFIDF(query, memories) {
    const normalizedQuery = (query || '').toLowerCase().trim();
    const qKey = `${normalizedQuery}::${memories.length}`;
    const now = Date.now();

    // Recent dedupe: if an identical scoring was just requested, reuse cached
    if (this.recentQuerySet.has(qKey) && (now - this.recentQuerySet.get(qKey)) < this.recentQueryWindowMs) {
      const cached = this.tfidfCache.get(qKey);
      if (cached) return cached;
    }

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
    const totalMemories = Math.max(1, memories.length);

    // Precompute IDF using global counts (single pass)
    const docFreq = new Map();
    for (const mem of memories) {
      const uniq = new Set((mem.content || '').toLowerCase().split(/\s+/));
      for (const qw of queryWords) {
        if (uniq.has(qw)) docFreq.set(qw, (docFreq.get(qw) || 0) + 1);
      }
    }

    const scored = memories.map(memory => {
      let score = 0;
      const content = (memory.content || '').toLowerCase();
      const contentWords = content.split(/\s+/);
      const len = Math.max(1, contentWords.length);

      for (const qw of queryWords) {
        // Term Frequency via single pass count
        let tfCount = 0;
        for (let i = 0; i < contentWords.length; i++) {
          if (contentWords[i] === qw) tfCount++;
        }
        const tf = tfCount / len;
        const df = docFreq.get(qw) || 0;
        const idf = Math.log(totalMemories / (1 + df));
        score += tf * idf;
      }

      // Boost by priority and recency
      score *= memory.priority;
      const daysSinceLastAccess = (now - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0.5, 1.5 - (daysSinceLastAccess / 30));
      score *= recencyBoost;

      return { ...memory, tfidfScore: score };
    });

    // Save to tiny LRU cache
    this.recentQuerySet.set(qKey, now);
    this.tfidfCache.set(qKey, scored);
    if (this.tfidfCache.size > this.tfidfCacheCap) {
      const oldestKey = this.tfidfCache.keys().next().value;
      this.tfidfCache.delete(oldestKey);
    }

    return scored;
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

  /**
   * Enhanced memory creation with behavioral metadata
   * @param {string} content - Memory content
   * @param {string} type - Memory type
   * @param {number} priority - Memory priority
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Enhanced memory object
   */
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
      },
      // Enhanced behavioral metadata
      behavioralInsights: metadata.behavioralInsights || null,
      userPreferences: metadata.userPreferences || null,
      learningContext: metadata.learningContext || null
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
      // Check if memory has content before accessing it
      if (memory.content) {
        const words = memory.content.toLowerCase().split(/\s+/);
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
          totalWords++;
        });
      }
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
    // Check if memories have content before accessing it
    const words1 = memory1.content ? new Set(memory1.content.toLowerCase().split(/\s+/)) : new Set();
    const words2 = memory2.content ? new Set(memory2.content.toLowerCase().split(/\s+/)) : new Set();
    
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

  /**
   * Enhanced memory consolidation with behavioral pattern recognition
   * @param {Array} memories - Array of memories to consolidate
   * @returns {Array} Consolidated memories
   */
  consolidateMemories(memories) {
    const consolidated = [];
    const processed = new Set();
    
    memories.forEach((memory, index) => {
      if (processed.has(index)) return;
      
      // Find similar memories
      const similarMemories = [memory];
      memories.forEach((otherMemory, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const similarity = this._calculateEnhancedSimilarity(memory, otherMemory);
        if (similarity > 0.5) { // High similarity threshold
          similarMemories.push(otherMemory);
          processed.add(otherIndex);
        }
      });
      
      // Consolidate similar memories
      if (similarMemories.length > 1) {
        const consolidatedMemory = this._mergeEnhancedMemories(similarMemories);
        consolidated.push(consolidatedMemory);
      } else {
        consolidated.push(memory);
      }
      
      processed.add(index);
    });
    
    return consolidated;
  }

  /**
   * Enhanced similarity calculation with behavioral factors
   * @param {Object} memory1 - First memory
   * @param {Object} memory2 - Second memory
   * @returns {number} Enhanced similarity score (0-1)
   * @private
   */
  _calculateEnhancedSimilarity(memory1, memory2) {
    // Base similarity from content
    const baseSimilarity = this._calculateSimilarity(memory1, memory2);
    
    // Behavioral similarity factors
    let behavioralSimilarity = 0;
    
    if (memory1.behavioralInsights && memory2.behavioralInsights) {
      // Compare behavioral insights
      const insights1 = memory1.behavioralInsights;
      const insights2 = memory2.behavioralInsights;
      
      // Similarity based on complexity preference
      if (insights1.complexityPreference === insights2.complexityPreference) {
        behavioralSimilarity += 0.2;
      }
      
      // Similarity based on interaction style
      if (insights1.dominantInteractionStyle === insights2.dominantInteractionStyle) {
        behavioralSimilarity += 0.15;
      }
      
      // Similarity based on learning adaptability
      const adaptabilityDiff = Math.abs(insights1.learningAdaptability - insights2.learningAdaptability);
      behavioralSimilarity += (1 - adaptabilityDiff) * 0.15;
    }
    
    // Weighted combination
    return (baseSimilarity * 0.7) + (behavioralSimilarity * 0.3);
  }

  /**
   * Enhanced memory merging with behavioral data preservation
   * @param {Array} memories - Array of memories to merge
   * @returns {Object} Merged memory
   * @private
   */
  _mergeEnhancedMemories(memories) {
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
    
    // Merge behavioral insights (take most recent)
    const behavioralInsights = memories.reduce((latest, m) => {
      if (!latest || (m.behavioralInsights && 
          new Date(m.timestamp) > new Date(latest.timestamp))) {
        return m.behavioralInsights;
      }
      return latest;
    }, null);
    
    return {
      ...primaryMemory,
      content: mergedContent,
      metadata: mergedMetadata,
      priority: mergedPriority,
      accessCount: mergedAccessCount,
      lastAccessed: mergedTimestamp,
      behavioralInsights: behavioralInsights,
      // Keep track of merged memories
      mergedFrom: memories.map(m => m.id)
    };
  }

  // Extract important information from user message for better context retention
  extractImportantInfo(userMessage, conversationHistory) {
    const importantInfo = {
      islamicTopics: [],
      keyFacts: [],
      userPreferences: {},
      emotionalContext: 'neutral',
      learningPatterns: {},
      // Enhanced fields
      behavioralInsights: null,
      responsePreferences: {},
      topicInterests: {},
      learningProgress: {}
    };
    
    // Extract Islamic topics
    importantInfo.islamicTopics = this.extractIslamicTopics(userMessage);
    
    // Extract key facts (names, locations, family members, etc.)
    this.extractKeyFacts(userMessage, importantInfo.keyFacts);
    
    // Extract user preferences
    this.extractUserPreferences(userMessage, importantInfo.userPreferences);
    
    // Extract emotional context
    importantInfo.emotionalContext = this.extractEmotionalContext(userMessage);
    
    // Extract learning patterns
    this.extractLearningPatterns(userMessage, conversationHistory, importantInfo.learningPatterns);
    
    // NEW: Extract behavioral insights
    importantInfo.behavioralInsights = this.computeBehaviorProfile(conversationHistory);
    
    // NEW: Extract response preferences
    importantInfo.responsePreferences = this.extractResponsePreferences(userMessage);
    
    // NEW: Extract topic interests
    importantInfo.topicInterests = this.extractTopicInterests(userMessage);
    
    // NEW: Extract learning progress
    importantInfo.learningProgress = this.assessLearningProgress(conversationHistory);
    
    return importantInfo;
  }

  // Extract key facts for better personalization and context retention
  extractKeyFacts(message, keyFacts) {
    // Extract names
    const nameRegex = /(?:my name is|i am|main hu|mera naam|mujhe bolte|mera nam)(?:\s+)([a-zA-Z\u0900-\u097F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/i;
    const nameMatch = message.match(nameRegex);
    if (nameMatch) {
      keyFacts.push({
        type: 'name',
        value: nameMatch[1].trim(),
        priority: 3
      });
    }
    
    // Extract family mentions
    const familyRegex = /(maa|papa|bhai|sister|behan|family|parivar|ghar|home)/i;
    if (familyRegex.test(message)) {
      keyFacts.push({
        type: 'family',
        value: message,
        priority: 2
      });
    }
    
    // Extract health/well-being mentions
    const healthRegex = /(thik|fine|well|sick|ill|bimar|healthy|fit)/i;
    if (healthRegex.test(message)) {
      keyFacts.push({
        type: 'health',
        value: message,
        priority: 2
      });
    }
    
    // Extract location mentions
    const locationRegex = /(?:i am from|main (?:hu|huun|hoon) from|mera (?:grih|ghar|sheher)|i live in|main (?:rehta|rehti) hu)(?:\s+)([a-zA-Z\u0900-\u097F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/i;
    const locationMatch = message.match(locationRegex);
    if (locationMatch) {
      keyFacts.push({
        type: 'location',
        value: locationMatch[1].trim(),
        priority: 2
      });
    }
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

  extractUserPreferences(message, preferences) {
    const lowerMessage = message.toLowerCase();
    
    // Islamic school preference
    if (lowerMessage.includes('hanafi') || lowerMessage.includes('hanafi school')) {
      preferences.fiqhSchool = 'hanafi';
    } else if (lowerMessage.includes('shafi') || lowerMessage.includes('shafi school')) {
      preferences.fiqhSchool = 'shafi';
    } else if (lowerMessage.includes('maliki') || lowerMessage.includes('maliki school')) {
      preferences.fiqhSchool = 'maliki';
    } else if (lowerMessage.includes('hanbali') || lowerMessage.includes('hanbali school')) {
      preferences.fiqhSchool = 'hanbali';
    }

    // Response style preference
    if (lowerMessage.includes('detailed') || lowerMessage.includes('explain more') || lowerMessage.includes('in detail')) {
      preferences.responseStyle = 'detailed';
    } else if (lowerMessage.includes('brief') || lowerMessage.includes('short') || lowerMessage.includes('concise')) {
      preferences.responseStyle = 'brief';
    } else {
      preferences.responseStyle = 'balanced';
    }

    return preferences;
  }

  extractEmotionalContext(message) {
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

  extractLearningPatterns(message, conversationHistory, patterns) {
    if (conversationHistory.length === 0) return patterns;

    // Analyze question types
    conversationHistory.forEach(msg => {
      if (msg.role === 'user' && msg.content) {
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
    const aiResponses = conversationHistory.filter(msg => msg.role === 'assistant' && msg.content);
    if (aiResponses.length > 0) {
      const avgLength = aiResponses.reduce((sum, msg) => sum + msg.content.length, 0) / aiResponses.length;
      
      if (avgLength < 100) patterns.responseLength = 'brief';
      else if (avgLength > 300) patterns.responseLength = 'detailed';
      else patterns.responseLength = 'medium';
    }

    return patterns;
  }

  /**
   * Extract user response preferences
   * @param {string} message - User message
   * @returns {Object} Response preferences
   */
  extractResponsePreferences(message) {
    const lowerMessage = message.toLowerCase();
    const preferences = {};
    
    // Length preference
    if (lowerMessage.includes('brief') || lowerMessage.includes('short') || lowerMessage.includes('concise')) {
      preferences.length = 'brief';
    } else if (lowerMessage.includes('detailed') || lowerMessage.includes('explain more') || lowerMessage.includes('in detail')) {
      preferences.length = 'detailed';
    } else {
      preferences.length = 'balanced';
    }
    
    // Detail level preference
    if (lowerMessage.includes('simple') || lowerMessage.includes('basic')) {
      preferences.detailLevel = 'basic';
    } else if (lowerMessage.includes('advanced') || lowerMessage.includes('complex')) {
      preferences.detailLevel = 'advanced';
    } else {
      preferences.detailLevel = 'intermediate';
    }
    
    // Example preference
    if (lowerMessage.includes('example') || lowerMessage.includes('for example') || lowerMessage.includes('like')) {
      preferences.examples = true;
    } else if (lowerMessage.includes('no example') || lowerMessage.includes('don\'t need example')) {
      preferences.examples = false;
    } else {
      preferences.examples = true;
    }
    
    // Tone preference
    if (lowerMessage.includes('formal') || lowerMessage.includes('scholarly')) {
      preferences.tone = 'formal';
    } else if (lowerMessage.includes('casual') || lowerMessage.includes('friendly')) {
      preferences.tone = 'casual';
    } else {
      preferences.tone = 'balanced';
    }
    
    return preferences;
  }

  /**
   * Extract topic interests from user message
   * @param {string} message - User message
   * @returns {Object} Topic interests mapping
   */
  extractTopicInterests(message) {
    const lowerMessage = message.toLowerCase();
    const interests = {};
    
    const topics = [
      { name: 'quran', keywords: ['quran', 'surah', 'ayah', 'verse', 'recitation'] },
      { name: 'hadith', keywords: ['hadith', 'sunnah', 'prophet', 'sahih', 'bukhari'] },
      { name: 'fiqh', keywords: ['fiqh', 'halal', 'haram', 'ruling', 'judgment'] },
      { name: 'seerah', keywords: ['seerah', 'history', 'prophet muhammad', 'companions'] },
      { name: 'spirituality', keywords: ['iman', 'faith', 'taqwa', 'repentance', 'dhikr'] },
      { name: 'prayer', keywords: ['prayer', 'namaz', 'salah', 'wudu'] },
      { name: 'fasting', keywords: ['fasting', 'roza', 'ramadan'] },
      { name: 'zakat', keywords: ['zakat', 'charity', 'sadaqah'] },
      { name: 'hajj', keywords: ['hajj', 'pilgrimage', 'umrah'] },
      { name: 'ethics', keywords: ['ethics', 'morals', 'character', 'adab'] },
      { name: 'family', keywords: ['family', 'children', 'parent', 'marriage', 'divorce'] },
      { name: 'business', keywords: ['business', 'trade', 'investment', 'riba'] }
    ];
    
    topics.forEach(topic => {
      const interestLevel = topic.keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (interestLevel > 0) {
        interests[topic.name] = interestLevel;
      }
    });
    
    return interests;
  }

  /**
   * Assess user's learning progress
   * @param {Array} conversationHistory - Conversation history
   * @returns {Object} Learning progress assessment
   */
  assessLearningProgress(conversationHistory) {
    if (conversationHistory.length === 0) {
      return {
        stage: 'beginner',
        topicsEngaged: 0,
        questionComplexity: 'simple',
        comprehensionIndicators: 0
      };
    }
    
    // Count topics engaged with
    const allMessages = conversationHistory
      .filter(msg => msg.role === 'user' && msg.content)
      .map(msg => msg.content.toLowerCase());
    
    const topics = ['quran', 'hadith', 'fiqh', 'seerah', 'spirituality', 'prayer', 
                   'fasting', 'zakat', 'hajj', 'ethics', 'family', 'business'];
    
    const topicsEngaged = topics.filter(topic => 
      allMessages.some(msg => msg.includes(topic))
    ).length;
    
    // Assess question complexity
    const questions = allMessages.filter(msg => msg.includes('?'));
    let complexity = 'simple';
    
    if (questions.some(q => 
      q.includes('how') || q.includes('why') || q.includes('explain'))) {
      complexity = 'moderate';
    }
    
    if (questions.some(q => 
      q.includes('compare') || q.includes('analyze') || q.includes('evaluate'))) {
      complexity = 'complex';
    }
    
    // Count comprehension indicators (follow-up questions, deeper inquiries)
    const comprehensionIndicators = allMessages.filter(msg => 
      msg.includes('more') || msg.includes('further') || msg.includes('elaborate') ||
      msg.includes('detail') || msg.includes('example')
    ).length;
    
    // Determine learning stage
    let stage = 'beginner';
    if (topicsEngaged >= 3 && complexity !== 'simple') {
      stage = 'intermediate';
    }
    if (topicsEngaged >= 6 && complexity === 'complex' && comprehensionIndicators > 2) {
      stage = 'advanced';
    }
    
    return {
      stage: stage,
      topicsEngaged: topicsEngaged,
      questionComplexity: complexity,
      comprehensionIndicators: comprehensionIndicators
    };
  }

  generateMemoryId() {
    return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // DSA: Enhanced memory search with indexing and advanced algorithms
  searchMemories(query, memories, limit = 10) {
    // Use inverted index for fast keyword search
    if (this.memoryIndex.size > 0) {
      const queryWords = query.toLowerCase().split(/\s+/);
      const candidateMemories = new Set();
      
      // Find memories containing any query word with enhanced matching
      queryWords.forEach(word => {
        if (this.memoryIndex.has(word)) {
          this.memoryIndex.get(word).forEach(memory => {
            candidateMemories.add(memory);
          });
        }
      });
      
      // Convert set to array
      const candidates = Array.from(candidateMemories);
      
      // If we have candidates, rank them using TF-IDF with enhanced scoring
      if (candidates.length > 0) {
        const scored = this.calculateTFIDF(query, candidates);
        return scored
          .sort((a, b) => {
            // Enhanced sorting with multiple factors
            const scoreA = (b.tfidfScore || 0) * (b.priority || 1) * (b.decayFactor || 1);
            const scoreB = (a.tfidfScore || 0) * (a.priority || 1) * (a.decayFactor || 1);
            return scoreB - scoreA;
          })
          .slice(0, limit)
          .map(memory => {
            this.updateMemoryAccess(memory);
            return memory;
          });
      }
    }
    
    // Fallback to simple TF-IDF search with enhanced scoring
    const scored = this.calculateTFIDF(query, memories);
    return scored
      .sort((a, b) => {
        // Enhanced sorting with multiple factors
        const scoreA = (b.tfidfScore || 0) * (b.priority || 1) * (b.decayFactor || 1);
        const scoreB = (a.tfidfScore || 0) * (a.priority || 1) * (a.decayFactor || 1);
        return scoreB - scoreA;
      })
      .slice(0, limit)
      .map(memory => {
        this.updateMemoryAccess(memory);
        return memory;
      });
  }
  
  // DSA: Precompute memory index for faster retrieval with enhanced indexing
  precomputeMemoryIndex(memories) {
    this.memoryIndex = this.buildInvertedIndex(memories);
    
    // Additionally build a trie structure for prefix matching
    this.memoryTrie = this.buildMemoryTrie(memories);
    
    // Precompute clusters for faster retrieval
    this.memoryClusters = this._clusterMemories(memories);
  }
  
  // DSA: Clear all memory indexes
  clearMemoryIndexes() {
    this.memoryIndex.clear();
    this.memoryHashMap.clear();
    this.memoryBloomFilter.clear();
    this.memoryCache.clear();
    this.lruCache.clear();
    this.tfidfCache.clear();
    this.recentQuerySet.clear();
    
    // Clear additional structures
    if (this.memoryTrie) {
      this.memoryTrie = null;
    }
    if (this.memoryClusters) {
      this.memoryClusters.clear();
    }
    if (this.clusterCentroids) {
      this.clusterCentroids.clear();
    }
  }
}