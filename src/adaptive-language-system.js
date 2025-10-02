// DSA-Level Optimized Adaptive Language System for IslamicAI
// Enables automatic language-style adaptation with intelligent learning

export class AdaptiveLanguageSystem {
  constructor() {
    // Simplified data structures for faster language adaptation
    this.userPreferences = new Map();
    this.contextMemory = new Map();
    
    // Enhanced language detection with DSA algorithms
    this.languageModels = {
      // Hinglish model with enhanced pattern matching
      hinglish: {
        // DSA: Trie-based pattern matching for efficient word lookup
        patterns: this.buildTrie([
          'main', 'aap', 'tum', 'ham', 'ye', 'wo', 'kar', 'ke', 'ki', 'ka', 
          'mein', 'se', 'ko', 'par', 'aur', 'ya', 'lekin', 'kyunki', 'kya', 
          'kyun', 'kahan', 'kab', 'kaise', 'kitna', 'kitni', 'kitne', 'bhai', 
          'sister', 'brother', 'time', 'waqt', 'samay', 'current', 'now', 'abhi',
          'tuu', 'bataa', 'sakte', 'hai', 'kaya', 'halat', 'thik', 'hoon', 'hun',
          'hain', 'kasa', 'assalamu', 'alaikum', 'salam', 'allah', 'islam', 'quran'
        ]),
        // DSA: N-gram analysis for better context detection
        ngrams: {
          2: ['ka', 'ki', 'ke', 'me', 'se', 'ko', 'pa', 'le', 'ky', 'ka'],
          3: ['kar', 'ke ', ' me', ' se', ' ko', 'par', 'aur', 'kya', 'kyu', 'kab']
        },
        weight: 4.0, // Increased weight for better detection
        script: 'mixed'
      },
      
      // Hindi model with Devanagari script detection
      hindi: {
        // DSA: Unicode range detection for Devanagari script
        unicodeRanges: [[0x0900, 0x097F]],
        // DSA: Common Hindi words with frequency analysis
        commonWords: ['है', 'हैं', 'का', 'के', 'की', 'में', 'से', 'को', 'पर', 
                     'अल्लाह', 'इस्लाम', 'कुरान', 'हदीस', 'नमाज़', 'रोज़ा'],
        weight: 3.5,
        script: 'devanagari'
      },
      
      // English model
      english: {
        // DSA: Common English function words
        functionWords: ['the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 
                       'will', 'would', 'can', 'could', 'should', 'may', 'might', 'this',
                       'that', 'these', 'those', 'what', 'when', 'where', 'why', 'how'],
        weight: 2.5,
        script: 'latin'
      },
      
      // Urdu model
      urdu: {
        // DSA: Unicode range detection for Arabic script (Urdu)
        unicodeRanges: [[0x0600, 0x06FF], [0x0750, 0x077F]],
        commonWords: ['ہے', 'ہیں', 'کا', 'کے', 'کی', 'میں', 'سے', 'کو', 'پر', 
                     'اللہ', 'اسلام', 'قرآن', 'حدیث'],
        weight: 3.0,
        script: 'arabic'
      }
    };
    
    // Language switch commands with priority detection
    this.switchCommands = {
      hinglish: [
        'hinglish maa bol', 'hinglish mein bol', 'hinglish me bol', 'hinglish me bolo',
        'hinglish mein bolo', 'hinglish me answer', 'hinglish mein answer',
        'hinglish me reply', 'hinglish mein reply', 'hinglish me jawab',
        'hinglish mein jawab', 'hinglish me respond', 'hinglish mein respond'
      ],
      hindi: [
        'hindi mein bol', 'hindi me bol', 'hindi mein bolo', 'hindi me bolo',
        'hindi mein answer', 'hindi me answer', 'hindi mein reply', 'hindi me reply',
        'हिंदी में बोल', 'हिंदी में बोलो', 'हिंदी में जवाब दो'
      ],
      english: [
        'speak in english', 'reply in english', 'answer in english', 'respond in english',
        'english me bol', 'english mein bol', 'english me bolo', 'english mein bolo',
        'talk in english', 'use english', 'english language'
      ],
      urdu: [
        'urdu mein bol', 'urdu me bol', 'urdu mein bolo', 'urdu me bolo',
        'اردو میں بولیں', 'اردو میں جواب دیں'
      ]
    };
    
    // DSA: LRU Cache for language preferences (O(1) access)
    this.preferenceCache = new Map();
    this.cacheCapacity = 1000;
    
    // DSA: Priority queue for language adaptation decisions
    this.adaptationQueue = this.createPriorityQueue();
    
    // Enhanced learning parameters for better adaptation
    this.confidenceThreshold = 0.6; // Increased threshold for more confident decisions
    this.minSamplesForLearning = 2; // Need more samples for learning
  }

  /**
   * DSA: Trie implementation for efficient pattern matching
   */
  buildTrie(words) {
    const trie = { children: {}, isEnd: false };
    
    for (const word of words) {
      let node = trie;
      for (const char of word.toLowerCase()) {
        if (!node.children[char]) {
          node.children[char] = { children: {}, isEnd: false };
        }
        node = node.children[char];
      }
      node.isEnd = true;
    }
    
    return trie;
  }

  /**
   * DSA: Search word in trie
   */
  searchInTrie(trie, word) {
    let node = trie;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  /**
   * DSA: N-gram extraction for better language detection
   */
  extractNGrams(text, n) {
    const ngrams = [];
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n).toLowerCase());
    }
    return ngrams;
  }

  /**
   * DSA: Unicode script detection
   */
  detectScriptByUnicode(text) {
    const scripts = {
      devanagari: 0,
      arabic: 0,
      latin: 0
    };
    
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097F) {
        scripts.devanagari++;
      } else if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F)) {
        scripts.arabic++;
      } else if (code >= 0x0041 && code <= 0x007A) {
        scripts.latin++;
      }
    }
    
    // Return the script with highest count
    return Object.keys(scripts).reduce((a, b) => scripts[a] > scripts[b] ? a : b);
  }

  /**
   * DSA: Enhanced language detection with multiple algorithms
   */
  analyzeLanguageStyle(message) {
    if (!message || message.length === 0) {
      return { language: 'english', confidence: 0 };
    }

    const scores = {};
    const lowerMessage = message.toLowerCase();
    
    // DSA: Script-based detection
    const script = this.detectScriptByUnicode(message);
    if (script === 'devanagari') {
      scores.hindi = 0.8;
    } else if (script === 'arabic') {
      scores.urdu = 0.8;
    } else if (script === 'latin') {
      scores.english = 0.3; // Base score for Latin script
    }

    // DSA: Pattern matching for Hinglish
    let hinglishScore = 0;
    const words = lowerMessage.split(/\s+/);
    
    // Check each word against Hinglish trie
    for (const word of words) {
      if (this.searchInTrie(this.languageModels.hinglish.patterns, word)) {
        hinglishScore += 2; // Higher weight for exact matches
      }
    }
    
    // DSA: N-gram analysis for Hinglish
    const bigrams = this.extractNGrams(lowerMessage, 2);
    const trigrams = this.extractNGrams(lowerMessage, 3);
    
    let ngramScore = 0;
    for (const bigram of bigrams) {
      if (this.languageModels.hinglish.ngrams[2].includes(bigram)) {
        ngramScore += 0.5;
      }
    }
    
    for (const trigram of trigrams) {
      if (this.languageModels.hinglish.ngrams[3].includes(trigram)) {
        ngramScore += 0.8;
      }
    }
    
    scores.hinglish = (hinglishScore + ngramScore) / words.length;
    
    // DSA: Function word detection for English
    const englishWords = lowerMessage.match(/\b(the|and|is|are|was|were|have|has|had|will|would|can|could|should|may|might|this|that|these|those|what|when|where|why|how|who|which)\b/g);
    if (englishWords) {
      scores.english = (scores.english || 0) + (englishWords.length / words.length);
    }
    
    // DSA: Hindi word detection
    const hindiMatches = message.match(/[\u0900-\u097F]+/g);
    if (hindiMatches) {
      scores.hindi = (scores.hindi || 0) + (hindiMatches.length / words.length);
    }
    
    // DSA: Urdu word detection
    const urduMatches = message.match(/[\u0600-\u06FF\u0750-\u077F]+/g);
    if (urduMatches) {
      scores.urdu = (scores.urdu || 0) + (urduMatches.length / words.length);
    }
    
    // Apply weights
    if (scores.hinglish) scores.hinglish *= this.languageModels.hinglish.weight;
    if (scores.hindi) scores.hindi *= this.languageModels.hindi.weight;
    if (scores.english) scores.english *= this.languageModels.english.weight;
    if (scores.urdu) scores.urdu *= this.languageModels.urdu.weight;
    
    // Find the language with highest score
    const detectedLanguage = Object.keys(scores).length > 0 ? 
      Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b) : 
      'english';
    
    const confidence = scores[detectedLanguage] || 0.1;
    
    return {
      language: detectedLanguage,
      confidence: Math.min(confidence, 1.0)
    };
  }

  /**
   * DSA: Priority queue implementation for language adaptation decisions
   */
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
   * Detect language in user message (backward compatibility)
   * @param {string} message - User message
   * @returns {Object} Language detection result
   */
  detectLanguage(message) {
    return this.analyzeLanguageStyle(message);
  }

  /**
   * Detect explicit language switch commands
   * @param {string} message - User message
   * @returns {Object|null} Switch command info or null
   */
  detectSwitchCommand(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    for (const [language, commands] of Object.entries(this.switchCommands)) {
      for (const command of commands) {
        if (lowerMessage.includes(command.toLowerCase())) {
          return {
            language: language,
            command: command,
            confidence: 1.0
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Detect language switch command (alias for backward compatibility)
   * @param {string} message - User message
   * @returns {Object|null} Switch command info or null
   */
  detectLanguageSwitchCommand(message) {
    return this.detectSwitchCommand(message);
  }

  /**
   * Apply adaptive learning to determine response language
   * @param {Object} languageAnalysis - Current language analysis
   * @param {Object} userPreference - User's historical preference
   * @param {string} sessionId - Session identifier
   * @param {Object} context - Additional context
   * @returns {Object} Adaptation result
   */
  applyAdaptiveLearning(languageAnalysis, userPreference, sessionId, context) {
    const currentLanguage = languageAnalysis.language;
    const currentConfidence = languageAnalysis.confidence;
    
    // If current detection is highly confident, use it
    if (currentConfidence > this.confidenceThreshold) {
      this.updateUserPreference(sessionId, currentLanguage, currentConfidence, 'high_confidence');
      
      return {
        detectedLanguage: currentLanguage,
        confidence: currentConfidence,
        adaptationType: 'high_confidence_detection',
        shouldAdapt: true,
        userPreference: currentLanguage,
        learningData: {
          samples: userPreference?.samples || 0,
          confidence: currentConfidence,
          adaptationReason: 'high_confidence_detection'
        }
      };
    }

    // If user has strong historical preference, use it
    if (userPreference && userPreference.samples >= this.minSamplesForLearning) {
      const preferenceConfidence = userPreference.confidence;
      
      if (preferenceConfidence > 0.6) {
        return {
          detectedLanguage: userPreference.language,
          confidence: preferenceConfidence,
          adaptationType: 'historical_preference',
          shouldAdapt: true,
          userPreference: userPreference.language,
          learningData: {
            samples: userPreference.samples,
            confidence: preferenceConfidence,
            adaptationReason: 'historical_preference'
          }
        };
      }
    }

    // Default to current detection with learning
    this.updateUserPreference(sessionId, currentLanguage, currentConfidence, 'learning');
    
    return {
      detectedLanguage: currentLanguage,
      confidence: currentConfidence,
      adaptationType: 'learning_mode',
      shouldAdapt: currentConfidence > 0.3,
      userPreference: currentLanguage,
      learningData: {
        samples: userPreference?.samples || 0,
        confidence: currentConfidence,
        adaptationReason: 'learning_mode'
      }
    };
  }

  /**
   * Simplified adaptation method for faster processing
   * @param {string} userMessage - User's message
   * @param {string} sessionId - Session identifier
   * @param {Object} context - Additional context
   * @returns {Object} Language adaptation information
   */
  adaptLanguage(userMessage, sessionId, context = {}) {
    // Check for explicit language switch commands first
    const switchCommand = this.detectSwitchCommand(userMessage);
    if (switchCommand) {
      this.updateUserPreference(sessionId, switchCommand.language, 0.95, 'explicit_command');
      return {
        detectedLanguage: switchCommand.language,
        confidence: 0.95,
        shouldAdapt: true,
        adaptationType: 'explicit_command',
        userPreference: switchCommand.language,
        learningData: { method: 'command', confidence: 0.95 }
      };
    }
    
    // Get user's language preference from context or storage
    const userPrefData = this.getUserPreference(sessionId);
    const userPreference = userPrefData ? userPrefData.language : 'english';
    
    // Detect language in the current message
    const detectionResult = this.analyzeLanguageStyle(userMessage);
    
    // Check for conversational context clues (greetings, personal check-ins)
    const isGreeting = this.isGreeting(userMessage);
    const isPersonalCheckIn = this.isPersonalCheckIn(userMessage);
    
    // Check for contextual connections with previous messages
    const contextualConnection = this.analyzeContextualConnection(userMessage, context.previousMessages || []);
    
    // NEW: If there's a strong contextual connection, maintain consistency
    if (contextualConnection.isStrongConnection) {
      return {
        detectedLanguage: contextualConnection.suggestedLanguage,
        confidence: contextualConnection.confidence,
        shouldAdapt: true,
        adaptationType: 'contextual_consistency',
        userPreference: contextualConnection.suggestedLanguage,
        learningData: { 
          method: 'contextual_connection', 
          confidence: contextualConnection.confidence,
          connectionType: contextualConnection.connectionType
        }
      };
    }
    
    // NEW: For high-confidence detections, respond in the detected language
    if (detectionResult.confidence > 0.7) {
      console.log(`High confidence language detection: ${detectionResult.language} (${detectionResult.confidence})`);
      return {
        detectedLanguage: detectionResult.language,
        confidence: detectionResult.confidence,
        shouldAdapt: true,
        adaptationType: 'high_confidence_detection',
        userPreference: detectionResult.language, // Respond in detected language
        learningData: { method: 'high_confidence_detection', confidence: detectionResult.confidence }
      };
    }
    
    // If this is a greeting or personal check-in, maintain natural conversation flow
    if (isGreeting || isPersonalCheckIn) {
      // For natural conversation flow, respond in the same style as the user
      return {
        detectedLanguage: detectionResult.language,
        confidence: detectionResult.confidence,
        shouldAdapt: true,
        adaptationType: 'conversational_flow',
        userPreference: detectionResult.language,
        learningData: { method: 'conversational_flow', confidence: detectionResult.confidence }
      };
    }
    
    // Use detected language if confidence is high
    if (detectionResult.confidence > this.confidenceThreshold) {
      // Update preference if consistently using the same language
      if (detectionResult.language === userPreference || 
          (context.previousMessages && this.isConsistentLanguage(context.previousMessages, detectionResult.language))) {
        this.updateUserPreference(sessionId, detectionResult.language, detectionResult.confidence, 'automatic_detection');
      }
      
      return {
        detectedLanguage: detectionResult.language,
        confidence: detectionResult.confidence,
        shouldAdapt: detectionResult.language !== userPreference,
        adaptationType: 'automatic_detection',
        userPreference: detectionResult.language, // Respond in detected language
        learningData: { method: 'detection', confidence: detectionResult.confidence }
      };
    }
    
    // If user has explicitly set a language preference, use it
    const { previousMessages = [], userProfile = {}, timestamp = Date.now(), userLanguagePreference = null } = context;
    if (userLanguagePreference) {
      return {
        detectedLanguage: userLanguagePreference.toLowerCase(),
        confidence: 1.0,
        shouldAdapt: true,
        adaptationType: 'user_profile_preference',
        userPreference: userLanguagePreference,
        learningData: { method: 'user_profile_preference', confidence: 1.0 }
      };
    }
    
    // Fall back to user preference
    return {
      detectedLanguage: userPreference,
      confidence: 0.7,
      shouldAdapt: false,
      adaptationType: 'user_preference',
      userPreference: userPreference,
      learningData: { method: 'preference', confidence: 0.7 }
    };
  }

  /**
   * Update user language preference with learning
   * @param {string} sessionId - Session identifier
   * @param {string} language - Detected language
   * @param {number} confidence - Detection confidence
   * @param {string} source - Source of the update
   */
  updateUserPreference(sessionId, language, confidence, source) {
    if (!this.userPreferences.has(sessionId)) {
      this.userPreferences.set(sessionId, {
        language: language,
        confidence: confidence,
        samples: 1,
        lastUpdated: Date.now(),
        sources: [source],
        adaptationHistory: []
      });
    } else {
      const preference = this.userPreferences.get(sessionId);
      
      // Apply learning algorithm
      const newConfidence = (preference.confidence * preference.samples + confidence) / (preference.samples + 1);
      const newSamples = preference.samples + 1;
      
      // Update preference
      preference.language = language;
      preference.confidence = newConfidence;
      preference.samples = newSamples;
      preference.lastUpdated = Date.now();
      preference.sources.push(source);
      
      // Keep adaptation history (last 10)
      preference.adaptationHistory.push({
        language,
        confidence,
        source,
        timestamp: Date.now()
      });
      
      if (preference.adaptationHistory.length > 10) {
        preference.adaptationHistory.shift();
      }
    }
  }

  /**
   * Get user's language preference
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} User preference or null
   */
  getUserPreference(sessionId) {
    return this.userPreferences.get(sessionId) || null;
  }

  /**
   * Get character distribution analysis
   * @param {string} text - Input text
   * @returns {Object} Character distribution
   */
  getCharDistribution(text) {
    const distribution = {};
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097F) {
        distribution.devanagari = (distribution.devanagari || 0) + 1;
      } else if (code >= 0x0600 && code <= 0x06FF) {
        distribution.arabic = (distribution.arabic || 0) + 1;
      } else if (code >= 0x0041 && code <= 0x007A) {
        distribution.latin = (distribution.latin || 0) + 1;
      } else if (code >= 0x0980 && code <= 0x09FF) {
        distribution.bengali = (distribution.bengali || 0) + 1;
      }
    }
    return distribution;
  }

  /**
   * Detect scripts in the text
   * @param {string} text - Input text
   * @returns {Array} Detected scripts
   */
  detectScripts(text) {
    const scripts = new Set();
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097F) {
        scripts.add('devanagari');
      } else if (code >= 0x0600 && code <= 0x06FF) {
        scripts.add('arabic');
      } else if (code >= 0x0041 && code <= 0x007A) {
        scripts.add('latin');
      } else if (code >= 0x0980 && code <= 0x09FF) {
        scripts.add('bengali');
      }
    }
    return Array.from(scripts);
  }

  /**
   * Cache result for performance optimization
   * @param {string} key - Cache key
   * @param {Object} result - Result to cache
   */
  cacheResult(key, result) {
    this.preferenceCache.set(key, {
      result,
      timestamp: Date.now()
    });
    
    // Manage cache size
    if (this.preferenceCache.size > this.cacheCapacity) {
      const firstKey = this.preferenceCache.keys().next().value;
      this.preferenceCache.delete(firstKey);
    }
  }

  /**
   * Get response instructions based on language adaptation
   * @param {string} detectedLanguage - Detected language
   * @param {Object} adaptation - Language adaptation result
   * @returns {string} Response instructions
   */
  getResponseInstructions(detectedLanguage, adaptation) {
    // If user has a language preference, use it
    if (adaptation.userPreference) {
      const lang = adaptation.userPreference.toLowerCase();
      switch (lang) {
        case 'hinglish':
          return "Respond in Hinglish (mix of Hindi and English) with Islamic terminology in Arabic. Use casual, friendly tone.";
        case 'hindi':
          return "Respond in Hindi with Islamic terminology in Arabic. Use formal yet approachable tone.";
        case 'urdu':
          return "Respond in Urdu with Islamic terminology in Arabic. Use formal and respectful tone.";
        case 'english':
          return "Respond in English with Islamic terminology in Arabic. Use clear and scholarly tone.";
        default:
          return "Respond in English with Islamic terminology in Arabic. Use clear and scholarly tone.";
      }
    }
    
    // Otherwise, use detected language
    switch (detectedLanguage) {
      case 'hinglish':
        return "Respond in Hinglish (mix of Hindi and English) with Islamic terminology in Arabic. Use casual, friendly tone.";
      case 'hindi':
        return "Respond in Hindi with Islamic terminology in Arabic. Use formal yet approachable tone.";
      case 'urdu':
        return "Respond in Urdu with Islamic terminology in Arabic. Use formal and respectful tone.";
      default:
        return "Respond in English with Islamic terminology in Arabic. Use clear and scholarly tone.";
    }
  }

  /**
   * Get system statistics for monitoring
   * @returns {Object} System statistics
   */
  getSystemStats() {
    return {
      totalUsers: this.userPreferences.size,
      cacheSize: this.preferenceCache.size,
      cacheCapacity: this.cacheCapacity,
      adaptationQueueSize: this.adaptationQueue.size(),
      learningRate: this.learningRate,
      confidenceThreshold: this.confidenceThreshold,
      minSamplesForLearning: this.minSamplesForLearning
    };
  }

  /**
   * Reset user preferences (for testing or user request)
   * @param {string} sessionId - Session identifier
   */
  resetUserPreferences(sessionId) {
    this.userPreferences.delete(sessionId);
    
    // Clear cache entries for this user
    for (const [key, value] of this.preferenceCache.entries()) {
      if (key.startsWith(sessionId)) {
        this.preferenceCache.delete(key);
      }
    }
  }

  // Check if message is a greeting
  isGreeting(message) {
    const greetings = [
      'hello', 'hi', 'hey', 'assalamu alaikum', 'salam', 'namaste',
      'kasa hai', 'kaise ho', 'how are you', 'kya haal hai',
      'assalamu alaikum', 'salam', 'namaste', 'hello', 'hi'
    ];
    const lowerMessage = message.toLowerCase();
    return greetings.some(greeting => lowerMessage.includes(greeting));
  }

  // Check if message is a personal check-in
  isPersonalCheckIn(message) {
    const checkIns = [
      'kasa hai', 'kaise ho', 'how are you', 'kya haal hai', 'thik ho',
      'how is everything', 'kaisa chal raha hai', 'how is life',
      'kasa', 'kaise ho', 'kya haal hai'
    ];
    const lowerMessage = message.toLowerCase();
    return checkIns.some(checkIn => lowerMessage.includes(checkIn));
  }

  /**
   * Check if language is consistent across previous messages
   * @param {Array} previousMessages - Previous messages in session
   * @param {string} language - Language to check consistency for
   * @returns {boolean} Whether language is consistent
   */
  isConsistentLanguage(previousMessages, language) {
    if (!previousMessages || previousMessages.length === 0) return false;
    
    // Count how many previous messages match the detected language
    let matchCount = 0;
    previousMessages.forEach(msg => {
      const detection = this.analyzeLanguageStyle(msg.content);
      if (detection.language === language) {
        matchCount++;
      }
    });
    
    // If more than 60% of recent messages match, consider it consistent
    return matchCount / previousMessages.length > 0.6;
  }

  /**
   * Analyze contextual connection between current message and previous messages
   * @param {string} currentMessage - Current user message
   * @param {Array} previousMessages - Previous messages in session
   * @returns {Object} Connection analysis result
   */
  analyzeContextualConnection(currentMessage, previousMessages) {
    // If no previous messages, no connection possible
    if (!previousMessages || previousMessages.length === 0) {
      return {
        isStrongConnection: false,
        suggestedLanguage: null,
        confidence: 0,
        connectionType: null
      };
    }

    // Get the most recent message
    const lastMessage = previousMessages[previousMessages.length - 1];
    
    // Check if current message is a direct continuation or response to the last message
    const isDirectResponse = this.isDirectResponse(currentMessage, lastMessage);
    
    if (isDirectResponse) {
      // Use the language of the last message for consistency
      const lastMessageLanguage = this.analyzeLanguageStyle(lastMessage.content);
      return {
        isStrongConnection: true,
        suggestedLanguage: lastMessageLanguage.language,
        confidence: 0.9,
        connectionType: 'direct_response'
      };
    }
    
    // Check for topic continuity
    const isTopicContinuation = this.isTopicContinuation(currentMessage, previousMessages);
    
    if (isTopicContinuation) {
      // Use the dominant language in recent messages
      const dominantLanguage = this.getDominantLanguage(previousMessages);
      return {
        isStrongConnection: true,
        suggestedLanguage: dominantLanguage.language,
        confidence: 0.8,
        connectionType: 'topic_continuation'
      };
    }
    
    // Check for reference to previous content
    const hasReference = this.hasReferenceToPreviousContent(currentMessage, previousMessages);
    
    if (hasReference) {
      // Use the language of the referenced message
      const referencedLanguage = this.getReferencedLanguage(currentMessage, previousMessages);
      return {
        isStrongConnection: true,
        suggestedLanguage: referencedLanguage.language,
        confidence: 0.85,
        connectionType: 'content_reference'
      };
    }
    
    return {
      isStrongConnection: false,
      suggestedLanguage: null,
      confidence: 0,
      connectionType: null
    };
  }

  /**
   * Check if current message is a direct response to the last message
   * @param {string} currentMessage - Current user message
   * @param {Object} lastMessage - Last message in conversation
   * @returns {boolean} Whether it's a direct response
   */
  isDirectResponse(currentMessage, lastMessage) {
    const currentLower = currentMessage.toLowerCase();
    const lastLower = lastMessage.content.toLowerCase();
    
    // Common response indicators
    const responseIndicators = [
      'yes', 'no', 'yeah', 'nah', 'okay', 'ok', 'right', 'exactly', 
      'haan', 'ji haan', 'bilkul', 'han', 'nhi', 'nahi'
    ];
    
    // Check if current message starts with a response indicator
    for (const indicator of responseIndicators) {
      if (currentLower.startsWith(indicator + ' ') || currentLower === indicator) {
        return true;
      }
    }
    
    // Check if last message was a question
    if (lastLower.includes('?') || lastLower.endsWith('؟') || 
        lastLower.includes('kya') || lastLower.includes('kyun') || 
        lastLower.includes('kaise') || lastLower.includes('what') || 
        lastLower.includes('how') || lastLower.includes('why')) {
      // And current message seems to be answering it
      const answerWords = ['because', 'kyunki', 'isliye', 'that\'s', 'ye hai'];
      for (const word of answerWords) {
        if (currentLower.includes(word)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if current message continues the same topic
   * @param {string} currentMessage - Current user message
   * @param {Array} previousMessages - Previous messages in session
   * @returns {boolean} Whether it's a topic continuation
   */
  isTopicContinuation(currentMessage, previousMessages) {
    if (previousMessages.length < 2) return false;
    
    // Get keywords from recent messages
    const recentMessages = previousMessages.slice(-3);
    const allContent = recentMessages.map(msg => msg.content).join(' ');
    const keywords = this.extractKeywords(allContent);
    const currentKeywords = this.extractKeywords(currentMessage);
    
    // Check overlap
    const overlap = keywords.filter(keyword => 
      currentKeywords.some(currentKeyword => 
        currentKeyword.includes(keyword) || keyword.includes(currentKeyword)
      )
    );
    
    // If more than 30% overlap, consider it topic continuation
    return overlap.length / Math.max(keywords.length, 1) > 0.3;
  }

  /**
   * Check if current message references previous content
   * @param {string} currentMessage - Current user message
   * @param {Array} previousMessages - Previous messages in session
   * @returns {boolean} Whether it references previous content
   */
  hasReferenceToPreviousContent(currentMessage, previousMessages) {
    const currentLower = currentMessage.toLowerCase();
    const referencePhrases = [
      'as i said', 'jaisa maine kaha', 'like i mentioned', 
      'as mentioned', 'jaise maine bataya', 'what you said',
      'aapne kaha', 'tumne bola', 'you said', 'earlier you',
      'pichle sawal', 'previous question', 'last time'
    ];
    
    for (const phrase of referencePhrases) {
      if (currentLower.includes(phrase)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get the language of the referenced message
   * @param {string} currentMessage - Current user message
   * @param {Array} previousMessages - Previous messages in session
   * @returns {Object} Language analysis of referenced message
   */
  getReferencedLanguage(currentMessage, previousMessages) {
    // For simplicity, use the language of the last message
    if (previousMessages.length > 0) {
      const lastMessage = previousMessages[previousMessages.length - 1];
      return this.analyzeLanguageStyle(lastMessage.content);
    }
    
    return { language: 'english', confidence: 0.5 };
  }

  /**
   * Get dominant language in recent messages
   * @param {Array} previousMessages - Previous messages in session
   * @returns {Object} Dominant language analysis
   */
  getDominantLanguage(previousMessages) {
    if (previousMessages.length === 0) {
      return { language: 'english', confidence: 0.5 };
    }
    
    // Analyze languages in recent messages
    const languageCounts = {};
    previousMessages.slice(-5).forEach(msg => {
      const analysis = this.analyzeLanguageStyle(msg.content);
      const lang = analysis.language;
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
    
    // Find dominant language
    let dominantLanguage = 'english';
    let maxCount = 0;
    
    for (const [lang, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        dominantLanguage = lang;
        maxCount = count;
      }
    }
    
    return {
      language: dominantLanguage,
      confidence: maxCount / Math.min(previousMessages.length, 5)
    };
  }

  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @returns {Array} Extracted keywords
   */
  extractKeywords(text) {
    // Simple keyword extraction - remove common words and split
    const commonWords = [
      'the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
      'will', 'would', 'can', 'could', 'should', 'may', 'might', 'this',
      'that', 'these', 'those', 'what', 'when', 'where', 'why', 'how',
      'mein', 'hai', 'hain', 'ka', 'ke', 'ki', 'ko', 'se', 'par',
      'है', 'हैं', 'का', 'के', 'की', 'में', 'से', 'को', 'पर'
    ];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 2) // Only words with 3+ characters
      .filter(word => !commonWords.includes(word)); // Remove common words
  }

}
