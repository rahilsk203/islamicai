// DSA-Level Optimized Adaptive Language System for IslamicAI
// Enables automatic language-style adaptation with intelligent learning

export class AdaptiveLanguageSystem {
  constructor() {
    // Simplified data structures for faster language adaptation
    this.userPreferences = new Map();
    this.contextMemory = new Map();
    
    // Language detection patterns with optimized scoring
    this.languagePatterns = {
      // Hinglish patterns (highest priority for mixed languages)
      hinglish: {
        patterns: [
          /(?:main|aap|tum|ham|ye|wo)\s+[a-zA-Z]+\s+(?:kar|karte|karta|karti)/gi,
          /[a-zA-Z]+\s+(?:ke|ki|ka)\s+(?:liye|mein|se|ko|par)/gi,
          /(?:kasa|kon|kaya|kya|kyun|kahan|kab|kaise)\s+(?:hai|hain|ho|hun)/gi,
          /(?:assalamu alaikum|salam|insha allah|mashallah|subhanallah|alhamdulillah)/gi,
          /(?:bhai|sister|brother|aap|tum|main|mera|mujhe)\s+[a-zA-Z]+/gi,
          /(?:current|time|waqt|samay|abhi|now)\s+(?:time|waqt|samay|kya|hai)/gi,
          /(?:kya|kyun|kahan|kab|kaise|kitna|kitni|kitne)\s+(?:time|waqt|samay)/gi,
          /(?:hoon|ho|hai|hain|hun|kar|karo|kare|karna|karte|karta|karti|kari)/gi,
          /(?:kya|kyun|kahan|kab|kaise|kitna|kitni|kitne|kis|kisi|kuch|kuchh)/gi,
          /(?:hoon|hai|hoon|kar|karo|kare|karna|karte|karta|karti|kari|liye|se|mein|par)/gi
        ],
        keywords: [
          'main', 'aap', 'tum', 'ham', 'ye', 'wo', 'kar', 'raha', 'hun', 'hain', 'hai',
          'ke', 'ki', 'ka', 'mein', 'se', 'ko', 'par', 'liye', 'aur', 'ya', 'lekin',
          'kyunki', 'jab', 'tab', 'agar', 'to', 'phir', 'abhi', 'usne', 'hamne', 'aapne',
          'tuu', 'kasa', 'kon', 'kaya', 'saktaa', 'sakte', 'sakti', 'sakta', 'hoon', 'ho',
          'hoi', 'hoa', 'hoiye', 'hoja', 'hojao', 'hojaye', 'kya', 'kyun', 'kahan', 'kab',
          'kaise', 'kitna', 'kitni', 'kitne', 'bhai', 'sister', 'brother', 'time', 'waqt',
          'samay', 'current', 'now', 'abhi', 'time', 'waqt', 'samay', 'hoon', 'ho', 'hun',
          'hain', 'hai', 'karo', 'kare', 'karna', 'karte', 'karta', 'karti', 'kari', 'liye',
          'se', 'mein', 'par', 'kis', 'kisi', 'kuch', 'kuchh', 'assalamu', 'alaikum', 'salam',
          'islamic', 'quran', 'hadith', 'tafseer', 'fiqh', 'seerah', 'dua', 'namaz', 'roza',
          'zakat', 'hajj', 'masjid', 'imam', 'allah', 'muhammad', 'prophet', 'islam'
        ],
        weight: 3.5, // Increased weight for better detection
        script: 'mixed'
      },
      
      // Hindi patterns
      hindi: {
        patterns: [
          /[\u0900-\u097F]+/g,
          /(?:है|हैं|का|के|की|में|से|को|पर|अल्लाह|इस्लाम|कुरान|हदीस)/gi
        ],
        keywords: [
          'है', 'हैं', 'का', 'के', 'की', 'में', 'से', 'को', 'पर', 'अल्लाह', 'इस्लाम',
          'कुरान', 'हदीस', 'नमाज़', 'रोज़ा', 'ज़कात', 'हज', 'मस्जिद', 'इमाम', 'मौलाना'
        ],
        weight: 2.8,
        script: 'devanagari'
      },
      
      // English patterns
      english: {
        patterns: [
          /(?:the|and|is|are|was|were|have|has|had|will|would|can|could|should|may|might)\s+/gi,
          /(?:this|that|these|those|what|when|where|why|how|who|which|with|from|for|about)\s+/gi,
          /\b(?:do|does|did|am|are|is|was|were|be|been|being)\b/gi,
          /\b(?:how\s+do|what\s+is|where\s+is|when\s+is|why\s+is|who\s+is)\b/gi
        ],
        keywords: [
          'islam', 'quran', 'hadith', 'prayer', 'fasting', 'zakat', 'hajj', 'mosque',
          'imam', 'allah', 'muhammad', 'prophet', 'islamic', 'muslim', 'assalamu', 'alaikum',
          'how', 'what', 'where', 'when', 'why', 'who', 'which', 'perform', 'do', 'does'
        ],
        weight: 2.0,
        script: 'latin'
      },
      
      // Bengali patterns
      bengali: {
        patterns: [
          /[\u0980-\u09FF]+/g,
          /(?:ইসলাম|কুরআন|হাদিস|নামাজ|রোজা|জাকাত|হজ|মসজিদ|ইমাম|আল্লাহ)/gi
        ],
        keywords: [
          'ইসলাম', 'কুরআন', 'হাদিস', 'নামাজ', 'রোজা', 'জাকাত', 'হজ', 'মসজিদ', 'ইমাম', 'আল্লাহ'
        ],
        weight: 2.5,
        script: 'bengali'
      },
      
      // Urdu patterns
      urdu: {
        patterns: [
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g,
          /(?:ہے|ہیں|کا|کے|کی|میں|سے|کو|پر|اللہ|اسلام|قرآن|حدیث)/gi
        ],
        keywords: [
          'ہے', 'ہیں', 'کا', 'کے', 'کی', 'میں', 'سے', 'کو', 'پر', 'اللہ', 'اسلام',
          'قرآن', 'حدیث', 'نماز', 'روزہ', 'زکات', 'حج', 'مسجد', 'امام'
        ],
        weight: 2.3,
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
      bengali: [
        'bengali me bol', 'bengali mein bol', 'bengali me bolo', 'bengali mein bolo',
        'বাংলায় বল', 'বাংলায় বলুন', 'বাংলায় উত্তর দিন'
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
    
    // Simplified learning parameters for faster processing
    this.confidenceThreshold = 0.5;
    this.minSamplesForLearning = 1;
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
   * Simplified adaptation method for faster processing
   * @param {string} userMessage - User's message
   * @param {string} sessionId - Session identifier
   * @param {Object} context - Additional context
   * @returns {Object} Language adaptation result
   */
  adaptLanguage(userMessage, sessionId, context = {}) {
    // Quick cache check
    const cacheKey = `${sessionId}_${userMessage.length}`;
    if (this.preferenceCache.has(cacheKey)) {
      const cached = this.preferenceCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.result;
      }
    }

    // Detect explicit language switch commands
    const switchCommand = this.detectSwitchCommand(userMessage);
    if (switchCommand) {
      this.updateUserPreference(sessionId, switchCommand.language, 1.0, 'explicit_command');
      const result = {
        detectedLanguage: switchCommand.language,
        confidence: 1.0,
        adaptationType: 'explicit_switch',
        shouldAdapt: true,
        userPreference: switchCommand.language,
        switchCommand: switchCommand.command
      };
      
      this.cacheResult(cacheKey, result);
      return result;
    }

    // Simplified language analysis
    const languageAnalysis = this.analyzeLanguageStyle(userMessage);
    
    // Get user's historical preferences
    const userPreference = this.getUserPreference(sessionId);
    
    // Simplified adaptation logic
    const adaptationResult = {
      detectedLanguage: languageAnalysis.language,
      confidence: languageAnalysis.confidence,
      adaptationType: 'quick_detection',
      shouldAdapt: languageAnalysis.confidence > 0.3,
      userPreference: languageAnalysis.language
    };

    // Cache the result
    this.cacheResult(cacheKey, adaptationResult);
    
    return adaptationResult;
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
   * Simplified language analysis for faster processing
   * @param {string} message - User message
   * @returns {Object} Language analysis result
   */
  analyzeLanguageStyle(message) {
    const totalChars = message.length;
    
    if (totalChars === 0) {
      return { language: 'english', confidence: 0 };
    }

    // Simplified scoring for each language
    const scores = {};
    
    // Quick Hinglish detection (highest priority)
    const hinglishMatches = message.match(/(?:main|aap|tum|ham|ye|wo|kar|ke|ki|ka|mein|se|ko|par|aur|ya|lekin|kyunki|kya|kyun|kahan|kab|kaise|kitna|bhai|sister|brother|time|waqt|samay|current|now|abhi)/gi);
    scores.hinglish = hinglishMatches ? (hinglishMatches.length * 2) / totalChars : 0;
    
    // Quick Hindi detection
    const hindiMatches = message.match(/[ऀ-ॿ]+/g);
    scores.hindi = hindiMatches ? hindiMatches.length / totalChars : 0;
    
    // Quick English detection
    const englishMatches = message.match(/(?:the|and|is|are|was|were|have|has|had|will|would|can|could|should|may|might|this|that|these|those|what|when|where|why|how|who|which)/gi);
    scores.english = englishMatches ? englishMatches.length / totalChars : 0.1;

    // Find the language with highest score
    const detectedLanguage = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    const confidence = Math.min(scores[detectedLanguage] * 100, 100);

    return {
      language: detectedLanguage,
      confidence: confidence / 100
    };
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
   * Get language-specific response instructions
   * @param {string} language - Target language
   * @param {Object} adaptationData - Adaptation data
   * @returns {Object} Response instructions
   */
  getResponseInstructions(language, adaptationData = {}) {
    const instructions = {
      english: {
        instruction: "RESPOND IN ENGLISH ONLY. Use proper English grammar and Islamic terminology in English.",
        greeting: "Assalamu Alaikum!",
        ending: "Allah knows best 🤲",
        style: "formal"
      },
      
      hinglish: {
        instruction: "RESPOND IN HINGLISH ONLY (Hindi + English mix). Use natural Hinglish that mixes Hindi and English words as commonly spoken. Use Roman script for Hindi words. Maintain a friendly, conversational tone while being respectful and scholarly. Example: 'Assalamu Alaikum! Kaise ho aap? Main IslamicAI hoon, aapka Islamic Scholar AI assistant. Aapko Qur'an, Hadith, Tafseer, Fiqh, ya Seerah se related koi bhi madad chahiye toh batao. Main yahan hoon aapki help karne ke liye. Allah aapko khush rakhe! 🤲'",
        greeting: "Assalamu Alaikum!",
        ending: "Allah sabse behtar jaanta hai 🤲",
        style: "conversational"
      },
      
      hindi: {
        instruction: "RESPOND IN HINDI ONLY (हिंदी में). Use proper Hindi grammar and Islamic terminology in Hindi. Use Devanagari script.",
        greeting: "अस्सलामु अलैकुम!",
        ending: "अल्लाह सबसे बेहतर जानता है 🤲",
        style: "formal"
      },
      
      bengali: {
        instruction: "RESPOND IN BENGALI ONLY (বাংলায়). Use proper Bengali grammar and Islamic terminology in Bengali. Use Bengali script.",
        greeting: "আসসালামু আলাইকুম!",
        ending: "আল্লাহ সবচেয়ে ভালো জানেন 🤲",
        style: "formal"
      },
      
      urdu: {
        instruction: "RESPOND IN URDU ONLY (اردو میں). Use proper Urdu grammar and Islamic terminology in Urdu. Use Arabic script.",
        greeting: "السلام علیکم!",
        ending: "اللہ سب سے بہتر جانتا ہے 🤲",
        style: "formal"
      }
    };

    const baseInstruction = instructions[language] || instructions.english;
    
    return {
      ...baseInstruction,
      adaptationType: adaptationData.adaptationType,
      confidence: adaptationData.confidence,
      userPreference: adaptationData.userPreference,
      learningData: adaptationData.learningData
    };
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
}
