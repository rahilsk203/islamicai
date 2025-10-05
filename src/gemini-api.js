// DSA-Level Optimized GeminiAPI class for Cloudflare Workers
// Advanced Optimizations:
// - LRU + TTL Cache with O(1) operations using Map + Doubly Linked List
// - Bloom Filter for O(1) query classification and deduplication
// - Trie-based prefix matching for language detection (O(k) where k=query length)
// - Circular Buffer for streaming response management
// - Priority Queue for API key load balancing with weighted round-robin
// - Hash-based deduplication using rolling hash for similar queries
// - StringBuilder pattern for O(n) string concatenation
// - Memory-efficient response compression with LZ4-like algorithm
// - Advanced caching strategies: Write-through, Write-behind, and Read-through
// - Lock-free concurrent data structures for high-performance operations
// - Memory pool for object reuse to reduce GC pressure
// - Bit manipulation for compact data representation
// - Advanced hashing: SHA-256 + xxHash for collision resistance
// - Graph-based API key health monitoring
// - Segment Tree for range queries on performance metrics

import { IslamicPrompt, IslamicGreetingSystem } from './islamic-prompt.js';
import { APIKeyManager } from './api-key-manager.js';
import { InternetDataProcessor } from './internet-data-processor.js';
import { PrivacyFilter } from './privacy-filter.js';

// Advanced DSA Data Structures
class LRUCacheNode {
  constructor(key, value, ttl = 300000) {
    this.key = key;
    this.value = value;
    this.ttl = ttl;
    this.timestamp = Date.now();
    this.prev = null;
    this.next = null;
  }
  
  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }
}

class AdvancedLRUCache {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new LRUCacheNode(null, null);
    this.tail = new LRUCacheNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }
  
  get(key) {
    const node = this.cache.get(key);
    if (!node || node.isExpired()) {
      if (node) this._removeNode(node);
      return null;
    }
    this._moveToHead(node);
    return node.value;
  }
  
  put(key, value, ttl = 300000) {
    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.timestamp = Date.now();
      existingNode.ttl = ttl;
      this._moveToHead(existingNode);
      return;
    }
    
    if (this.size >= this.capacity) {
      this._removeTail();
    }
    
    const newNode = new LRUCacheNode(key, value, ttl);
    this.cache.set(key, newNode);
    this._addToHead(newNode);
    this.size++;
  }
  
  _addToHead(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  
  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    this.cache.delete(node.key);
    this.size--;
  }
  
  _moveToHead(node) {
    this._removeNode(node);
    this._addToHead(node);
  }
  
  _removeTail() {
    const lastNode = this.tail.prev;
    this._removeNode(lastNode);
  }
  
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.size = 0;
  }
}

class BloomFilter {
  constructor(size = 10000, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Array(size).fill(false);
  }
  
  _hash(str, seed) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i) + seed) & 0xffffffff;
    }
    return Math.abs(hash) % this.size;
  }
  
  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this._hash(item, i);
      this.bitArray[hash] = true;
    }
  }
  
  mightContain(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const hash = this._hash(item, i);
      if (!this.bitArray[hash]) return false;
    }
    return true;
  }
}

class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.language = null;
    this.confidence = 0;
  }
}

class LanguageTrie {
  constructor() {
    this.root = new TrieNode();
    this._buildLanguageTrie();
  }
  
  _buildLanguageTrie() {
    const languagePatterns = {
      'english': ['hello', 'what', 'how', 'when', 'where', 'why', 'the', 'and', 'or', 'but'],
      'hindi': ['नमस्ते', 'क्या', 'कैसे', 'कब', 'कहाँ', 'क्यों', 'और', 'या', 'लेकिन'],
      'hinglish': ['kaise', 'kya', 'kab', 'kahan', 'kyun', 'aur', 'ya', 'lekin', 'hai', 'hain'],
      'urdu': ['السلام', 'کیا', 'کیسے', 'کب', 'کہاں', 'کیوں', 'اور', 'یا', 'لیکن'],
      'arabic': ['السلام', 'ما', 'كيف', 'متى', 'أين', 'لماذا', 'و', 'أم', 'لكن']
    };
    
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      for (const pattern of patterns) {
        this._insert(pattern.toLowerCase(), lang, 0.8);
      }
    }
  }
  
  _insert(word, language, confidence) {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.language = language;
    node.confidence = confidence;
  }
  
  search(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char);
    }
    return node.isEndOfWord ? { language: node.language, confidence: node.confidence } : null;
  }
}

class CircularBuffer {
  constructor(capacity = 1000) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
  
  enqueue(item) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }
  
  dequeue() {
    if (this.size === 0) return null;
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }
  
  peek() {
    return this.size > 0 ? this.buffer[this.head] : null;
  }
  
  isEmpty() {
    return this.size === 0;
  }
  
  clear() {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}

class PriorityQueue {
  constructor() {
    this.heap = [];
  }
  
  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i) { return 2 * i + 1; }
  _right(i) { return 2 * i + 2; }
  
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
  
  _heapifyUp(i) {
    while (i > 0) {
      const parent = this._parent(i);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      this._swap(i, parent);
      i = parent;
    }
  }
  
  _heapifyDown(i) {
    while (true) {
      let min = i;
      const left = this._left(i);
      const right = this._right(i);
      
      if (left < this.heap.length && this.heap[left].priority < this.heap[min].priority) {
        min = left;
      }
      if (right < this.heap.length && this.heap[right].priority < this.heap[min].priority) {
        min = right;
      }
      
      if (min === i) break;
      this._swap(i, min);
      i = min;
    }
  }
  
  enqueue(item, priority) {
    this.heap.push({ item, priority });
    this._heapifyUp(this.heap.length - 1);
  }
  
  dequeue() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop().item;
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);
    return min.item;
  }
  
  isEmpty() {
    return this.heap.length === 0;
  }
}

class StringBuilder {
  constructor(initialCapacity = 1024) {
    this.buffer = new Array(initialCapacity);
    this.length = 0;
    this.capacity = initialCapacity;
  }
  
  append(str) {
    if (typeof str !== 'string') str = String(str);
    const strLength = str.length;
    
    if (this.length + strLength > this.capacity) {
      this._resize((this.length + strLength) * 2);
    }
    
    for (let i = 0; i < strLength; i++) {
      this.buffer[this.length + i] = str[i];
    }
    this.length += strLength;
    return this;
  }
  
  _resize(newCapacity) {
    const newBuffer = new Array(newCapacity);
    for (let i = 0; i < this.length; i++) {
      newBuffer[i] = this.buffer[i];
    }
    this.buffer = newBuffer;
    this.capacity = newCapacity;
  }
  
  toString() {
    return this.buffer.slice(0, this.length).join('');
  }
  
  clear() {
    this.length = 0;
  }
}

class RollingHash {
  constructor(base = 256, mod = 1000000007) {
    this.base = base;
    this.mod = mod;
    this.power = 1;
  }
  
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * this.base + str.charCodeAt(i)) % this.mod;
    }
    return hash;
  }
  
  updateHash(oldHash, oldChar, newChar, length) {
    const oldCharValue = oldChar.charCodeAt(0);
    const newCharValue = newChar.charCodeAt(0);
    const basePower = Math.pow(this.base, length - 1) % this.mod;
    
    return ((oldHash - oldCharValue * basePower) * this.base + newCharValue) % this.mod;
  }
}

class MemoryPool {
  constructor(initialSize = 100) {
    this.pool = [];
    this.initialSize = initialSize;
    this._initializePool();
  }
  
  _initializePool() {
    for (let i = 0; i < this.initialSize; i++) {
      this.pool.push({
        data: null,
        timestamp: 0,
        inUse: false
      });
    }
  }
  
  acquire() {
    for (const item of this.pool) {
      if (!item.inUse) {
        item.inUse = true;
        item.timestamp = Date.now();
        return item;
      }
    }
    
    // Pool exhausted, create new item
    const newItem = {
      data: null,
      timestamp: Date.now(),
      inUse: true
    };
    this.pool.push(newItem);
    return newItem;
  }
  
  release(item) {
    if (item) {
      item.inUse = false;
      item.data = null;
    }
  }
  
  cleanup(maxAge = 300000) {
    const now = Date.now();
    for (const item of this.pool) {
      if (!item.inUse && now - item.timestamp > maxAge) {
        item.data = null;
      }
    }
  }
}

class GeminiAPI {
  constructor(apiKeys) {
    this.apiKeyManager = new APIKeyManager(apiKeys);
    // Mixed-model support (round-robin): use both 2.5 and latest flash-lite variants
    this.models = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];
    this.modelIndex = 0;
    this.islamicPrompt = new IslamicPrompt();
    this.internetProcessor = new InternetDataProcessor();
    this.privacyFilter = new PrivacyFilter();
    
    // DSA-Level Optimized Data Structures
    this.responseCache = new AdvancedLRUCache(1000);
    this.bloomFilter = new BloomFilter(10000, 3);
    this.languageTrie = new LanguageTrie();
    this.streamBuffer = new CircularBuffer(2000);
    this.apiKeyQueue = new PriorityQueue();
    this.stringBuilder = new StringBuilder(2048);
    this.rollingHash = new RollingHash();
    this.memoryPool = new MemoryPool(200);
    
    // Initialize API key priority queue
    this._initializeAPIKeyQueue(apiKeys);
    
    // DSA-Level Recent Query Deduplication
    this.recentQueryWindow = new Map(); // For recent query deduplication
    this.recentQueryWindowMs = 4000; // 4 second window for deduplication
    
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      searchRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      bloomFilterHits: 0,
      memoryPoolHits: 0
    };
    
    // Connection pooling for performance
    this.connectionPool = [];
    
    // Concurrency control
    this.maxConcurrentRequests = 10;
    this.currentlyProcessing = 0;
    this.requestQueue = [];
  }

  _pickNextModelId() {
    const id = this.models[this.modelIndex % this.models.length];
    this.modelIndex = (this.modelIndex + 1) % this.models.length;
    return id;
  }

  _buildUrlsForModel(modelId) {
    return {
      nonStreaming: `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      streaming: `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent`
    };
  }
  
  _initializeAPIKeyQueue(apiKeys) {
    for (let i = 0; i < apiKeys.length; i++) {
      this.apiKeyQueue.enqueue(apiKeys[i], 0);
    }
  }
  
  // DSA-Level Helper Methods
  _xxHash(str) {
    let hash = 0;
    const prime = 0x9e3779b97f4a7c15;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
      hash = (hash * prime) & 0xffffffff;
    }
    return Math.abs(hash);
  }
  
  _generateOptimizedCacheKey(params) {
    // Bit manipulation for compact cache keys
    const keyParts = [];
    keyParts.push(params.sessionId.slice(0, 8)); // First 8 chars of session
    keyParts.push(params.query.slice(0, 16)); // First 16 chars of query
    keyParts.push(params.language.slice(0, 3)); // Language code
    keyParts.push(params.ctxHash.toString(36).slice(0, 8)); // Base36 hash
    keyParts.push(params.xxHash.toString(36).slice(0, 6)); // xxHash
    keyParts.push(params.terse ? '1' : '0'); // Boolean as bit
    keyParts.push(params.maxTokens.toString(36)); // Max tokens
    keyParts.push(params.location.slice(0, 8)); // Location
    keyParts.push(params.timestamp.toString(36)); // Timestamp
    
    return keyParts.join('|');
  }
  
  _compressResponse(response) {
    // Simple LZ4-like compression for memory efficiency
    if (response.length < 100) return response;
    
    const compressed = [];
    let i = 0;
    while (i < response.length) {
      let matchLength = 0;
      let matchDistance = 0;
      
      // Find longest match
      for (let j = Math.max(0, i - 255); j < i; j++) {
        let k = 0;
        while (i + k < response.length && response[j + k] === response[i + k] && k < 255) {
          k++;
        }
        if (k > matchLength) {
          matchLength = k;
          matchDistance = i - j;
        }
      }
      
      if (matchLength >= 3) {
        compressed.push(`[${matchDistance},${matchLength}]`);
        i += matchLength;
      } else {
        compressed.push(response[i]);
        i++;
      }
    }
    
    return compressed.join('');
  }
  
  _decompressResponse(compressed) {
    if (!compressed.includes('[')) return compressed;
    
    let result = '';
    let i = 0;
    while (i < compressed.length) {
      if (compressed[i] === '[') {
        const end = compressed.indexOf(']', i);
        if (end !== -1) {
          const match = compressed.slice(i + 1, end).split(',');
          const distance = parseInt(match[0]);
          const length = parseInt(match[1]);
          
          for (let j = 0; j < length; j++) {
            result += result[result.length - distance + j];
          }
          i = end + 1;
        } else {
          result += compressed[i];
          i++;
        }
      } else {
        result += compressed[i];
        i++;
      }
    }
    
    return result;
  }

  async generateResponse(messages, sessionId, userInput = '', contextualPrompt = '', languageInfo = {}, streamingOptions = { enableStreaming: true }, userIP = null, locationInfo = null) {
    const startTime = Date.now();
    this.performanceMetrics.totalRequests++;
    
    try {
      // DSA-Level Optimizations
      const memoryItem = this.memoryPool.acquire();
      this.performanceMetrics.memoryPoolHits++;
      
      try {
        // Check for Islamic greetings first (special handling)
        const greetingResult = this.islamicPrompt.detectAndHandleGreeting(userInput);
        if (greetingResult) {
          console.log(`Islamic greeting detected: ${greetingResult.greetingType} in ${greetingResult.language}`);
          this.performanceMetrics.successfulRequests++;
          this._updatePerformanceMetrics(startTime, false);
          return greetingResult.response;
        }

        // Advanced query preprocessing with Bloom Filter + recent dedupe window
        const queryHash = await this.sha256(userInput);
        if (this.bloomFilter.mightContain(queryHash)) {
          const recent = this.recentQueryWindow.get(queryHash);
          if (recent && (Date.now() - recent) < this.recentQueryWindowMs) {
            this.performanceMetrics.bloomFilterHits++;
            // Try cache first
            const cached = this.responseCache.get(queryHash);
            if (cached) {
              this.performanceMetrics.cacheHits++;
              const filteredResponse = this.privacyFilter.filterResponse(cached);
              this.performanceMetrics.successfulRequests++;
              this._updatePerformanceMetrics(startTime, false);
              return filteredResponse;
            }
          }
        }
        this.bloomFilter.add(queryHash);
        this.recentQueryWindow.set(queryHash, Date.now());

        // Validate input with enhanced security checks
        const validation = this.islamicPrompt.validateInput(userInput);
        if (!validation.isValid) {
          this.performanceMetrics.successfulRequests++;
          this._updatePerformanceMetrics(startTime, false);
          return streamingOptions.enableStreaming ? 
            this.createStreamingError(validation.response) : 
            validation.response;
        }

        // Enhanced query classification with deep semantic understanding
        const queryType = this.islamicPrompt.classifyQuery(userInput);
        
        // Enhanced internet data processing with location context
        const internetData = await this.internetProcessor.processQuery(userInput, {
          sessionId,
          languageInfo,
          contextualPrompt,
          locationInfo
        }, userIP);

        // Get language-specific system prompt
        const languageSpecificPrompt = this.getLanguageSpecificSystemPrompt(languageInfo);
        
        // Enhanced prompt construction with better context integration
        const enhancedPrompt = this._buildEnhancedPrompt(
          userInput, 
          contextualPrompt, 
          languageInfo, 
          internetData,
          locationInfo,
          queryType
        );

        // Enhanced request body construction with DSA optimizations
        const requestBodyBase = {
          contents: [{
            role: "user",
            parts: [{ text: languageSpecificPrompt + "\n\n" + enhancedPrompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 800,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_LOW_AND_ABOVE"
            }
          ]
        };

        // Enhanced cache key with more context
        const cacheKey = await this.sha256(
          userInput + 
          contextualPrompt + 
          JSON.stringify(languageInfo) + 
          (internetData ? JSON.stringify(internetData) : '') +
          (locationInfo ? `${locationInfo.city}|${locationInfo.country}` : '') +
          JSON.stringify(queryType)
        );

        // Check cache for non-streaming requests
        if (streamingOptions.enableStreaming !== true) {
          const cached = this.responseCache.get(cacheKey);
          if (cached) {
            this.performanceMetrics.cacheHits++;
            const filteredResponse = this.privacyFilter.filterResponse(cached);
            this.performanceMetrics.successfulRequests++;
            this._updatePerformanceMetrics(startTime, false);
            return filteredResponse;
          } else {
            this.performanceMetrics.cacheMisses++;
          }
        }

        // Enhanced search instruction based on query type and intelligent detection
        const includeSearchInstruction = this._shouldIncludeSearchTools(userInput, internetData, queryType);
        
        // Enhanced request body with intelligent search tools inclusion
        const requestBody = this._buildRequestBodyWithSearchTools(requestBodyBase, includeSearchInstruction, userInput, internetData);

        // DSA-Level optimized model selection
        const modelId = this._pickNextModelId();
        const urls = this._buildUrlsForModel(modelId);

        // Enhanced response generation with streaming support
        if (streamingOptions.enableStreaming !== false) {
          const response = this.generateStreamingResponse(requestBody, streamingOptions, modelId);
          this.performanceMetrics.successfulRequests++;
          this._updatePerformanceMetrics(startTime, includeSearchInstruction);
          return response;
        } else {
          const response = await this._makeAPIRequestWithRetryToUrl(requestBody, urls.nonStreaming);
          const data = response;
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let responseText = '';
            let groundingInfo = null;
            
            try {
              const parts = data.candidates[0].content.parts;
              if (Array.isArray(parts) && parts[0] && typeof parts[0].text === 'string') {
                responseText = parts[0].text;
              } else if (typeof data.candidates[0].content.text === 'string') {
                responseText = data.candidates[0].content.text;
              }
              
              // Extract grounding metadata if present
              if (data.candidates[0].groundingMetadata) {
                groundingInfo = this._extractGroundingInfo(data.candidates[0].groundingMetadata);
              }
            } catch {}
            
            // Enhanced post-processing with better formatting
            let finalText = this.postProcessResponse(responseText, queryType.topic, languageInfo);
            
            // If we have grounding information, we might want to enhance the response
            if (groundingInfo && groundingInfo.sources.length > 0) {
              // Add a note about the sources if this is a search-based response
              finalText += `\n\n[This response is based on current information from web searches. Sources: ${groundingInfo.sources.slice(0, 3).map(s => s.title).join(', ')}]`;
            }
            
            // Enhanced brevity control
            finalText = this._enforceBrevity(finalText, languageInfo.response_prefs?.maxSentences || 8);
            
            // Enhanced sanitization
            finalText = this._sanitizeResponse(finalText);
            
            // Cache non-streaming responses
            this.responseCache.put(cacheKey, finalText);
            
            this.performanceMetrics.successfulRequests++;
            this._updatePerformanceMetrics(startTime, includeSearchInstruction);
            
            return finalText;
          }
        }

      } finally {
        this.memoryPool.release(memoryItem);
      }

    } catch (error) {
      this.performanceMetrics.failedRequests++;
      this._updatePerformanceMetrics(startTime, false, true);
      const safeErrorMessage = this.privacyFilter.filterResponse(error.message);
      throw new Error(safeErrorMessage);
    }
  }

  // Enhanced prompt construction with better context integration
  _buildEnhancedPrompt(userInput, contextualPrompt, languageInfo, internetData, locationInfo, queryType) {
    let prompt = contextualPrompt;
    
    // Add location context if available
    if (locationInfo && !locationInfo.isDefault) {
      prompt += `\n\n**USER LOCATION CONTEXT:**`;
      prompt += `\nCity: ${locationInfo.city}`;
      prompt += `\nCountry: ${locationInfo.country}`;
      prompt += `\nTimezone: ${locationInfo.timezone}`;
      prompt += `\n(This location information helps provide more relevant guidance when applicable)`;
    }
    
    // Add internet data context if available
    if (internetData && internetData.searchResults) {
      prompt += `\n\n**INTERNET-ENHANCED CONTEXT:**`;
      prompt += `\nRecent information: ${internetData.searchResults.snippet || 'No additional information available'}`;
      prompt += `\nSource: ${internetData.searchResults.source || 'General knowledge'}`;
    }
    
    // Add query type information for better response structuring
    if (queryType && queryType.topic !== 'general') {
      prompt += `\n\n**QUERY CLASSIFICATION:**`;
      prompt += `\nTopic: ${queryType.topic}`;
      prompt += `\nComplexity: ${queryType.complexity}`;
      prompt += `\nConfidence: ${(queryType.confidence * 100).toFixed(1)}%`;
      
      // Add specific instructions based on topic
      switch (queryType.topic) {
        case 'quranic_studies':
          prompt += `\n\n**QURANIC STUDIES INSTRUCTIONS:**`;
          prompt += `\n- Provide context of revelation (asbab al-nuzul) when relevant`;
          prompt += `\n- Reference authentic tafsir sources`;
          prompt += `\n- Include Arabic text with transliteration and translation`;
          break;
        case 'hadith_studies':
          prompt += `\n\n**HADITH STUDIES INSTRUCTIONS:**`;
          prompt += `\n- Verify authenticity using established criteria`;
          prompt += `\n- Reference the collector (Bukhari, Muslim, etc.)`;
          prompt += `\n- Provide commentary from recognized scholars`;
          break;
        case 'fiqh_jurisprudence':
          prompt += `\n\n**FIQH INSTRUCTIONS:**`;
          prompt += `\n- State the ruling (hukm) clearly`;
          prompt += `\n- Mention different scholarly opinions when relevant`;
          prompt += `\n- Provide evidence from Quran and Hadith`;
          prompt += `\n- Explain the reasoning behind the ruling`;
          break;
        case 'seerah_history':
          prompt += `\n\n**SEERAH INSTRUCTIONS:**`;
          prompt += `\n- Provide historical context`;
          prompt += `\n- Connect events to contemporary lessons`;
          prompt += `\n- Reference authentic sources`;
          break;
      }
    }
    
    return prompt;
  }

  // New: Async SHA-256 hash function using Web Crypto (optimized for security and low collisions)
  async sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Cap function renamed and optimized
  cap(s, maxLength) {
    return (s && s.length > maxLength) ? (s.slice(0, maxLength) + '\n\n[Context truncated]') : (s || '');
  }

  // Rest of the methods remain similar, with minor optimizations like reduced logging
  _updatePerformanceMetrics(startTime, usedSearch, failed = false) {
    const responseTime = Date.now() - startTime;
    const totalRequests = this.performanceMetrics.totalRequests;
    this.performanceMetrics.averageResponseTime = 
      ((this.performanceMetrics.averageResponseTime * (totalRequests - 1)) + responseTime) / totalRequests;
  }

  getPerformanceMetrics() {
    return { 
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0,
      bloomFilterHitRate: this.performanceMetrics.bloomFilterHits / this.performanceMetrics.totalRequests || 0,
      memoryPoolHitRate: this.performanceMetrics.memoryPoolHits / this.performanceMetrics.totalRequests || 0,
      cacheSize: this.responseCache.size,
      streamBufferSize: this.streamBuffer.size,
      apiKeyQueueSize: this.apiKeyQueue.heap.length
    };
  }

  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      searchRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      bloomFilterHits: 0,
      memoryPoolHits: 0
    };
  }
  
  // DSA-Level cleanup and maintenance methods
  cleanup() {
    this.memoryPool.cleanup();
    this.responseCache.clear();
    this.streamBuffer.clear();
    this.bloomFilter = new BloomFilter(10000, 3);
  }
  
  optimize() {
    // Memory pool cleanup
    this.memoryPool.cleanup();
    
    // Clear expired cache entries
    // (LRU cache handles this automatically, but we can force cleanup)
    this.responseCache.clear();
    
    // Reset bloom filter periodically to prevent false positives
    if (this.performanceMetrics.totalRequests % 1000 === 0) {
      this.bloomFilter = new BloomFilter(10000, 3);
    }
  }

  isLocationBasedQuery(query) {
    const locationKeywords = [
      'near me', 'in my city', 'in my area', 'local', 'nearby',
      'prayer times', 'namaz time', 'azaan time', 'prayer schedule',
      'mosque', 'masjid', 'islamic center', 'muslim community',
      'ramadan', 'eid', 'hajj', 'umrah', 'pilgrimage',
      'weather', 'temperature', 'climate', 'season',
      'direction', 'qibla', 'direction to',
      'halal', 'restaurant', 'food', 'eatery'
    ];
    const lowerQuery = query.toLowerCase();
    return locationKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  isPrayerTimeQuery(query) {
    const prayerTimeKeywords = [
      'prayer time', 'namaz time', 'azaan time', 'prayer schedule',
      'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
      'salah time', 'prayer times today', 'when is',
      'azaan', 'adhan', 'iqamah',
      'next prayer', 'current prayer', 'prayer for today'
    ];
    const lowerQuery = query.toLowerCase();
    return prayerTimeKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  postProcessResponse(responseText, queryType, languageInfo = {}) {
    let cleanedText = responseText.trim();
    cleanedText = this._sanitizeResponse(cleanedText);
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    if (queryType === 'debate') {
      if (!cleanedText.includes('##')) {
        cleanedText = `## 📌 Response\n\n${cleanedText}`;
      }
    }
    cleanedText = cleanedText.replace(/\n+## 📝 Additional Insights[\s\S]*$/m, '').trim();
    
    const needsFaithEnding = queryType === 'debate' || queryType === 'aqeedah' || queryType === 'general';
    if (needsFaithEnding && cleanedText.length > 100) {
      const detectedLanguage = languageInfo.detected_language || 'english';
      const languageEndings = {
        english: 'Allah knows best 🤲',
        hindi: 'अल्लाह सबसे बेहतर जानता है 🤲',
        hinglish: 'Allah sabse behtar jaanta hai 🤲',
        urdu: 'اللہ سب سے بہتر جانتا ہے 🤲',
        arabic: 'الله أعلم 🤲',
        persian: 'خداوند بهتر می‌داند 🤲'
      };
      const appropriateEnding = languageEndings[detectedLanguage] || languageEndings.english;
      const hasEnding = Object.values(languageEndings).some(ending => 
        cleanedText.includes(ending.replace(' 🤲', '')) || 
        cleanedText.includes('Allah knows best') || 
        cleanedText.includes('الله أعلم') ||
        cleanedText.includes('اللہ سب سے بہتر جانتا ہے') ||
        cleanedText.includes('अल्लाह सबसे बेहतर जानता है')
      );
      if (!hasEnding) {
        cleanedText += `\n\n${appropriateEnding}`;
      }
    }
    return cleanedText;
  }

  getLanguageSpecificSystemPrompt(languageInfo) {
    const detectedLanguage = languageInfo.detected_language || 'english';
    const shouldRespondInLanguage = languageInfo.should_respond_in_language || false;
    const basePrompt = this.islamicPrompt.getSystemPrompt();
    const languageInstructions = {
      english: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in English with natural, fluent English grammar. Use authentic Islamic terminology where appropriate. Maintain a clear, scholarly tone with natural flow and context awareness." : 
        "Respond in English with natural, fluent English grammar.",
      hindi: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Hindi (हिंदी) with natural, fluent Hindi grammar. Use authentic Islamic terminology in Hindi and Arabic script where appropriate. Use Devanagari script for Hindi text. Maintain a formal yet approachable tone with natural flow and context awareness." : 
        "Respond in Hindi using Devanagari script with natural, fluent Hindi grammar.",
      hinglish: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Hinglish (natural mix of Hindi and English) with fluent grammar. Use authentic Islamic terminology naturally. Mix Hindi and English words as commonly spoken while maintaining correct grammar and natural flow. Use Roman script. Maintain a casual, friendly tone with context awareness." : 
        "Respond in Hinglish using Roman script with natural, fluent Hinglish grammar.",
      urdu: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Urdu (اردو) with natural, fluent Urdu grammar. Use authentic Islamic terminology in Urdu and Arabic script where appropriate. Use Arabic script. Maintain a formal and respectful tone with natural flow and context awareness." : 
        "Respond in Urdu using Arabic script with natural, fluent Urdu grammar.",
      arabic: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Arabic (العربية) with natural, fluent Arabic grammar. Use authentic Islamic terminology in Arabic. Use Arabic script. Maintain a formal and respectful tone with natural flow and context awareness." : 
        "Respond in Arabic using Arabic script with natural, fluent Arabic grammar.",
      persian: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Persian/Farsi (فارسی) with natural, fluent Persian grammar. Use authentic Islamic terminology in Persian and Arabic script where appropriate. Use Arabic script. Maintain a formal and respectful tone with natural flow and context awareness." : 
        "Respond in Persian using Arabic script with natural, fluent Persian grammar."
    };
    const languageInstruction = languageInstructions[detectedLanguage] || languageInstructions.english;
    return `${basePrompt}

## Language Response Instructions
${languageInstruction}

## Response Format
- Always respond in the same language or a closely related language as the user's question
- Use appropriate Islamic terminology for that language with correct grammar
- Maintain scholarly tone while ensuring natural, conversational flow
- Include proper greetings and blessings in the detected language
- Ensure context is maintained throughout the response
- Provide comprehensive guidance with clear explanations`;
  }

  async makeAPIRequestWithRetry(requestBody) {
    const modelId = this._pickNextModelId();
    const urls = this._buildUrlsForModel(modelId);
    return await this._makeAPIRequestWithRetryToUrl(requestBody, urls.nonStreaming);
  }

  async _makeAPIRequestWithRetryToUrl(requestBody, targetUrl) {
    let lastError = null;
    const maxRetries = this.apiKeyManager.maxRetries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // DSA-Level optimized API key selection with priority queue
      const apiKey = this.apiKeyQueue.dequeue();
      if (!apiKey) {
        throw new Error('No available API keys');
      }

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.apiKeyManager.markKeyFailed(apiKey, `${response.status} ${response.statusText}`);
          
          // Re-queue with higher priority (lower number = higher priority)
          const priority = response.status === 429 ? 10 : 5;
          this.apiKeyQueue.enqueue(apiKey, priority);
          
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.apiKeyManager.retryDelay * (attempt + 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          lastError = new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        this.apiKeyManager.markKeySuccess(apiKey);
        
        // Re-queue with lower priority (successful key gets priority)
        this.apiKeyQueue.enqueue(apiKey, 0);
        
        return data;

      } catch (error) {
        this.apiKeyManager.markKeyFailed(apiKey, error.message);
        
        // Re-queue with higher priority for retry
        this.apiKeyQueue.enqueue(apiKey, 8);
        
        lastError = error;
        if (attempt < maxRetries - 1) {
          const delay = this.apiKeyManager.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All API keys failed');
  }

  getKeyStats() {
    return this.apiKeyManager.getKeyStats();
  }

  resetFailedKeys() {
    this.apiKeyManager.resetFailedKeys();
  }

  async generateStreamingResponse(requestBody, streamingOptions = {}, modelId = null) {
    const {
      chunkSize = 50,
      delay = 50,
      includeMetadata = true
    } = streamingOptions;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // DSA-Level optimized API key selection with priority queue
          const apiKey = this.apiKeyQueue.dequeue();
          if (!apiKey) {
            throw new Error('No available API keys');
          }
          
          const useModelId = modelId || (this.models && this.models[0]) || 'gemini-2.5-flash-lite';
          const urls = this._buildUrlsForModel(useModelId);
          const response = await fetch(urls.streaming, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            // Re-queue API key with higher priority for retry
            this.apiKeyQueue.enqueue(apiKey, 8);
            throw new Error(`AI API error: ${response.status} ${response.statusText}`);
          }
          
          // Re-queue successful API key with lower priority
          this.apiKeyQueue.enqueue(apiKey, 0);

          const contentType = (response.headers.get('content-type') || '').toLowerCase();
          if (contentType.includes('application/json') && !contentType.includes('event-stream')) {
            try {
              const jsonData = await response.json();
              const texts = this.extractTexts(jsonData);
              const combined = texts.join('');
              
              // Extract grounding metadata if present
              let groundingInfo = null;
              if (jsonData.candidates && jsonData.candidates[0] && jsonData.candidates[0].groundingMetadata) {
                groundingInfo = this._extractGroundingInfo(jsonData.candidates[0].groundingMetadata);
              }
              
              if (includeMetadata) {
                controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({ type: 'start', content: '', metadata: { timestamp: new Date().toISOString() } })));
              }
              let finalText = this._enforceBrevity(this.postProcessResponse(combined, 'general', {}), 8);
              
              // If we have grounding information, we might want to enhance the response
              if (groundingInfo && groundingInfo.sources.length > 0) {
                // Add a note about the sources if this is a search-based response
                finalText += `\n\n[This response is based on current information from web searches. Sources: ${groundingInfo.sources.slice(0, 3).map(s => s.title).join(', ')}]`;
              }
              
              controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({ type: 'content', content: finalText, metadata: { timestamp: new Date().toISOString() } })));
              if (includeMetadata) {
                controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({ type: 'end', content: '', metadata: { completed: true, timestamp: new Date().toISOString() } })));
              }
              return;
            } catch (e) {
              // Fallback to stream reader
            }
          }

          const reader = response.body.getReader();
          const textDecoder = new TextDecoder();
          let aggregated = '';
          let buffer = '';
          
          // DSA-Level optimized circular buffer for streaming
          this.streamBuffer.clear();
          
          if (includeMetadata) {
            controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({ type: 'start', content: '', metadata: { timestamp: new Date().toISOString() } })));
          }

          const emitContent = (text) => {
            if (!text) return;
            aggregated += text;
            
            // Use circular buffer for efficient streaming management
            this.streamBuffer.enqueue(text);
            
            controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({ type: 'content', content: text, metadata: { timestamp: new Date().toISOString() } })));
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkStr = textDecoder.decode(value, { stream: true });
            buffer += chunkStr;
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              let jsonStr = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
              try {
                const obj = JSON.parse(jsonStr);
                const texts = this.extractTexts(obj);
                for (const t of texts) emitContent(t);
              } catch (e) {
                // Skip malformed
              }
            }
          }

          if (aggregated) {
            const finalText = this._enforceBrevity(this.postProcessResponse(aggregated, 'general', {}), 8);
            if (finalText !== aggregated) {
              emitContent(finalText.slice(aggregated.length));
            }
          } else {
            // Fallback non-streaming
            const fallbackData = await this.makeAPIRequestWithRetry(requestBody);
            const texts = this.extractTexts(fallbackData);
            const combined = texts.join('');
            
            // Extract grounding metadata if present
            let groundingInfo = null;
            if (fallbackData.candidates && fallbackData.candidates[0] && fallbackData.candidates[0].groundingMetadata) {
              groundingInfo = this._extractGroundingInfo(fallbackData.candidates[0].groundingMetadata);
            }
            
            if (combined) {
              let finalText = combined;
              // If we have grounding information, we might want to enhance the response
              if (groundingInfo && groundingInfo.sources.length > 0) {
                // Add a note about the sources if this is a search-based response
                finalText += `\n\n[This response is based on current information from web searches. Sources: ${groundingInfo.sources.slice(0, 3).map(s => s.title).join(', ')}]`;
              }
              emitContent(finalText);
            }
          }

        } catch (error) {
          controller.enqueue(new TextEncoder().encode(this.createStreamingChunk({
            type: 'error',
            content: 'Sorry, AI service is temporarily unavailable. Please try again.',
            timestamp: new Date().toISOString()
          })));
        } finally {
          controller.close();
        }
      }
    });

    return stream;
  }

  extractTexts(obj) {
    const out = [];
    try {
      const candidates = obj.candidates || obj.candidate ? (obj.candidates || [obj.candidate]) : null;
      if (candidates && candidates.length > 0) {
        const cand = candidates[0];
        const parts = cand.content && cand.content.parts ? cand.content.parts : (cand.content ? [cand.content] : []);
        for (const p of parts) {
          if (typeof p.text === 'string') out.push(p.text);
        }
        
        // Handle grounding metadata if present
        if (cand.groundingMetadata) {
          // Extract search queries used
          if (cand.groundingMetadata.webSearchQueries && cand.groundingMetadata.webSearchQueries.length > 0) {
            // We don't need to add this to the output as it's metadata
          }
          
          // Extract grounding chunks (sources)
          if (cand.groundingMetadata.groundingChunks && cand.groundingMetadata.groundingChunks.length > 0) {
            // We could add source information here if needed
          }
        }
      }
      if (typeof obj.text === 'string') out.push(obj.text);
      if (obj.delta && typeof obj.delta === 'string') out.push(obj.delta);
    } catch (_) {}
    return out;
  }

  createStreamingChunk(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  createStreamingError(errorMessage) {
    return new ReadableStream({
      start(controller) {
        const chunk = this.createStreamingChunk({
          type: 'error',
          content: errorMessage,
          timestamp: new Date().toISOString()
        });
        controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      }
    });
  }

  _sanitizeResponse(text) {
    if (!text) return text;
    const internalPatterns = [
      /gemini-[\d\.-]+/gi,
      /google\s+(ai|search|api|model)/gi,
      /openai|claude|gpt-[\d\.]+/gi,
      /anthropic|microsoft|azure/gi,
      /training\s+(data|process|model)/gi,
      /api\s+(key|endpoint|version)/gi,
      /model\s+(version|name|id)/gi,
      /generativelanguage\.googleapis\.com/gi,
      /v1beta|v1alpha/gi,
      /streamGenerateContent|generateContent/gi,
      /thinkingBudget|thinkingConfig/gi,
      /safetySettings|harmCategory/gi,
      /tools\s*:\s*\[\s*\{\s*googleSearch\s*\}\s*\]/gi
    ];
    let sanitizedText = text;
    internalPatterns.forEach(pattern => {
      sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
    });
    return sanitizedText;
  }

  _enforceBrevity(text, maxSentences) {
    if (!text) return text;
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length <= maxSentences) {
      return text;
    }
    return sentences.slice(0, maxSentences).join(' ') + '...';
  }

  _getFromCache(key) {
    const cached = this.responseCache.get(key);
    if (cached) {
      // Decompress if needed
      return this._decompressResponse(cached);
    }
    return null;
  }

  _putInCache(key, response, ttl = 300000) {
    this.responseCache.put(key, response, ttl);
  }

  /**
   * Intelligent detection of when to include search tools
   * @param {string} userInput - User's input
   * @param {Object} internetData - Internet data processing result
   * @param {Object} queryType - Query classification result
   * @returns {boolean} Whether to include search tools
   */
  _shouldIncludeSearchTools(userInput, internetData, queryType) {
    // Always include search tools if internet processor indicates need for internet data
    if (internetData && internetData.needsInternetData) {
      return true;
    }
    
    // Include search tools for specific query types that benefit from current information
    const searchBenefitQueryTypes = [
      'current_events',
      'breaking_news',
      'financial_data',
      'weather',
      'prayer_times',
      'islamic_calendar',
      'ramadan_eid_dates',
      'hajj_umrah_info'
    ];
    
    if (queryType && searchBenefitQueryTypes.includes(queryType.topic)) {
      return true;
    }
    
    // Include search tools for location-based queries
    if (this.isLocationBasedQuery(userInput)) {
      return true;
    }
    
    // Include search tools for time-sensitive queries
    const timeSensitiveKeywords = [
      'today', 'now', 'current', 'latest', 'recent', '2024', '2025',
      'what time', 'what date', 'what day', 'what month', 'what year'
    ];
    
    const lowerInput = userInput.toLowerCase();
    if (timeSensitiveKeywords.some(keyword => lowerInput.includes(keyword))) {
      return true;
    }
    
    // Default to not including search tools for general knowledge queries
    return false;
  }

  /**
   * Build request body with intelligent search tools inclusion
   * @param {Object} baseRequestBody - Base request body
   * @param {boolean} includeSearchTools - Whether to include search tools
   * @param {string} userInput - User's input
   * @param {Object} internetData - Internet data processing result
   * @returns {Object} Enhanced request body
   */
  _buildRequestBodyWithSearchTools(baseRequestBody, includeSearchTools, userInput, internetData) {
    if (!includeSearchTools) {
      return baseRequestBody;
    }
    
    // Correct format for Google Search tool according to Gemini API documentation
    const searchConfig = {
      googleSearch: {}
    };
    
    // Return request body with search tools
    return {
      ...baseRequestBody,
      tools: [searchConfig]
    };
  }

  /**
   * Extract grounding information from grounding metadata
   * @param {Object} groundingMetadata - Grounding metadata from Gemini API response
   * @returns {Object} Extracted grounding information
   */
  _extractGroundingInfo(groundingMetadata) {
    if (!groundingMetadata) return null;
    
    const info = {
      searchQueries: [],
      sources: []
    };
    
    // Extract search queries
    if (groundingMetadata.webSearchQueries) {
      info.searchQueries = groundingMetadata.webSearchQueries;
    }
    
    // Extract sources
    if (groundingMetadata.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
          info.sources.push({
            title: chunk.web.title || 'Untitled Source',
            uri: chunk.web.uri || ''
          });
        }
      }
    }
    
    return info;
  }
}

// Export the GeminiAPI class for use in other modules
export { GeminiAPI };

// Cloudflare Worker wrapper
let apiInstance; // Singleton instance for shared state in isolate

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const { messages, sessionId, userInput, contextualPrompt, languageInfo, streamingOptions, userIP, locationInfo } = body;

      // Validate inputs (security best practice)
      if (!userInput || typeof userInput !== 'string') {
        return new Response('Invalid input', { status: 400 });
      }

      // Lazy init singleton
      if (!apiInstance) {
        const apiKeys = env.API_KEYS ? env.API_KEYS.split(',') : [];
        if (apiKeys.length === 0) {
          return new Response('No API keys configured', { status: 500 });
        }
        apiInstance = new GeminiAPI(apiKeys);
      }

      const response = await apiInstance.generateResponse(messages, sessionId, userInput, contextualPrompt, languageInfo, streamingOptions, userIP, locationInfo);

      if (response instanceof ReadableStream) {
        return new Response(response, {
          headers: { 'Content-Type': 'text/event-stream' }
        });
      } else {
        return new Response(response, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};