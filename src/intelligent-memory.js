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
  }

  // DSA: Trie for efficient memory search
  buildMemoryTrie(memories) {
    const trie = {};
    
    memories.forEach(memory => {
      const words = memory.content.toLowerCase().split(/\s+/);
      let current = trie;
      
      words.forEach(word => {
        if (!current[word]) {
          current[word] = { memories: [], children: {} };
        }
        current[word].memories.push(memory);
        current = current[word].children;
      });
    });
    
    return trie;
  }

  // DSA: Binary Search for priority-based memory retrieval
  searchMemoriesByPriority(memories, priority) {
    const sortedMemories = memories.sort((a, b) => b.priority - a.priority);
    const left = 0;
    const right = sortedMemories.length - 1;
    
    return this.binarySearchByPriority(sortedMemories, left, right, priority);
  }

  binarySearchByPriority(memories, left, right, targetPriority) {
    if (left > right) return [];
    
    const mid = Math.floor((left + right) / 2);
    const midPriority = memories[mid].priority;
    
    if (midPriority === targetPriority) {
      // Find all memories with same priority
      const results = [memories[mid]];
      let leftIdx = mid - 1;
      let rightIdx = mid + 1;
      
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
    
    // Enhanced language detection with priority
    const languageScore = this.detectLanguage(message);
    preferences.language = languageScore.language;
    preferences.confidence = languageScore.confidence;

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
    if (message.includes('detailed') || message.includes('explain more')) {
      preferences.responseStyle = 'detailed';
    } else if (message.includes('brief') || message.includes('short')) {
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
      'quran': ['quran', 'qur\'an', 'ayat', 'surah', 'verse'],
      'hadith': ['hadith', 'sunnah', 'narrated', 'prophet said'],
      'fiqh': ['fiqh', 'halal', 'haram', 'prayer', 'namaz', 'fasting', 'roza'],
      'seerah': ['seerah', 'prophet muhammad', 'sahabah', 'companions'],
      'aqeedah': ['aqeedah', 'belief', 'faith', 'iman', 'tawheed'],
      'tasawwuf': ['tasawwuf', 'sufism', 'spirituality', 'zikr'],
      'history': ['islamic history', 'caliphate', 'ummah']
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
      confused: ['confused', 'don\'t understand', 'explain', 'help'],
      sad: ['sad', 'depressed', 'worried', 'anxious'],
      happy: ['happy', 'excited', 'grateful', 'blessed'],
      angry: ['angry', 'frustrated', 'upset', 'annoyed'],
      curious: ['curious', 'wonder', 'question', 'why', 'how']
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
        }
      }
    });

    // Analyze response length preference
    const aiResponses = conversationHistory.filter(msg => msg.role === 'assistant');
    const avgLength = aiResponses.reduce((sum, msg) => sum + msg.content.length, 0) / aiResponses.length;
    
    if (avgLength < 100) patterns.responseLength = 'brief';
    else if (avgLength > 300) patterns.responseLength = 'detailed';
    else patterns.responseLength = 'medium';

    return patterns;
  }

  extractKeyFacts(message) {
    const facts = [];
    const lowerMessage = message.toLowerCase();
    
    // Enhanced name extraction patterns
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
        const cleanName = name.replace(/\b(?:hai|hain|ho|hun|hu|main|mera|mujhe|call|me|is|am|i)\b/gi, '').trim();
        if (cleanName && cleanName.length > 1) {
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
        if (cleanLocation && cleanLocation.length > 1) {
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
    if (lowerMessage.includes('surah') && lowerMessage.includes('verse')) {
      const surahMatch = message.match(/surah\s+([a-zA-Z0-9\s]+)/i);
      if (surahMatch) {
        facts.push({
          type: 'quran_reference',
          value: surahMatch[1].trim(),
          priority: this.memoryPriority.HIGH
        });
      }
    }

    return facts;
  }

  // Advanced language detection with scoring
  detectLanguage(message) {
    const scores = {
      english: 0,
      hindi: 0,
      bengali: 0,
      hinglish: 0
    };

    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    const totalWords = words.length;

    // English detection
    const englishWords = ['the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'this', 'that', 'these', 'those', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'with', 'from', 'for', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among'];
    const englishPattern = /[a-zA-Z]/g;
    const englishChars = (message.match(englishPattern) || []).length;
    
    englishWords.forEach(word => {
      if (lowerMessage.includes(word)) scores.english += 2;
    });
    scores.english += (englishChars / message.length) * 10;

    // Hindi detection
    const hindiPattern = /[\u0900-\u097F]/g;
    const hindiChars = (message.match(hindiPattern) || []).length;
    const hindiWords = ['hai', 'hain', 'ho', 'hun', 'hu', 'main', 'mera', 'mujhe', 'tum', 'aap', 'ye', 'wo', 'us', 'se', 'ke', 'ki', 'ko', 'mein', 'abhi', 'phir', 'bhi', 'to', 'ya', 'aur', 'lekin', 'magar', 'kyun', 'kya', 'kaise', 'kahan', 'kab', 'kuch', 'sab', 'koi', 'kisi', 'jab', 'tab', 'agar', 'toh', 'fir', 'bhi', 'bas', 'sirf', 'bilkul', 'zaroor', 'shayad', 'ho', 'sakta', 'sakti', 'sakte', 'hoga', 'hogi', 'hoge'];
    
    hindiWords.forEach(word => {
      if (lowerMessage.includes(word)) scores.hindi += 3;
    });
    scores.hindi += (hindiChars / message.length) * 15;

    // Bengali detection
    const bengaliPattern = /[\u0980-\u09FF]/g;
    const bengaliChars = (message.match(bengaliPattern) || []).length;
    const bengaliWords = ['ami', 'tumi', 'se', 'ke', 'ki', 'kore', 'korte', 'hobe', 'ache', 'nei', 'ebong', 'kintu', 'tobe', 'jodi', 'tahole', 'karon', 'kintu', 'tobe', 'ebong', 'ar', 'o', 'she', 'tara', 'amra', 'tomra', 'ora', 'amader', 'tomader', 'oder'];
    
    bengaliWords.forEach(word => {
      if (lowerMessage.includes(word)) scores.bengali += 3;
    });
    scores.bengali += (bengaliChars / message.length) * 15;

    // Hinglish detection (mixed language)
    const hinglishWords = ['bhai', 'sister', 'brother', 'aap', 'tum', 'main', 'mera', 'mujhe', 'hai', 'hain', 'ho', 'hun', 'hu', 'ke', 'ki', 'ko', 'se', 'mein', 'abhi', 'phir', 'bhi', 'to', 'ya', 'aur', 'lekin', 'magar', 'kyun', 'kya', 'kaise', 'kahan', 'kab', 'kar', 'karne', 'karte', 'karta', 'karti', 'hota', 'hoti', 'hote', 'hoga', 'hogi', 'hoge', 'sakta', 'sakti', 'sakte', 'chahiye', 'chahiye', 'chahiye', 'dena', 'lena', 'karna', 'hona', 'jana', 'aana', 'jaana', 'aaya', 'gaya', 'gayi', 'gaye'];
    
    hinglishWords.forEach(word => {
      if (lowerMessage.includes(word)) scores.hinglish += 2;
    });

    // Hinglish gets bonus for mixed script
    if (hindiChars > 0 && englishChars > 0) {
      scores.hinglish += 5;
    }

    // Hinglish gets bonus for common mixed phrases
    const mixedPhrases = ['assalamu alaikum', 'salam', 'insha allah', 'mashallah', 'subhanallah', 'alhamdulillah', 'bismillah', 'astaghfirullah', 'la ilaha illallah', 'muhammadur rasulullah'];
    mixedPhrases.forEach(phrase => {
      if (lowerMessage.includes(phrase)) scores.hinglish += 3;
    });

    // Find the language with highest score
    let maxScore = 0;
    let detectedLanguage = 'english';
    let confidence = 0;

    Object.entries(scores).forEach(([lang, score]) => {
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
        confidence = Math.min(score / totalWords, 1);
      }
    });

    // Special case: If Hinglish score is close to Hindi, prefer Hinglish
    if (scores.hinglish > 0 && scores.hindi > 0 && Math.abs(scores.hinglish - scores.hindi) < 2) {
      detectedLanguage = 'hinglish';
      confidence = Math.min((scores.hinglish + scores.hindi) / totalWords, 1);
    }

    return {
      language: detectedLanguage,
      confidence: Math.round(confidence * 100) / 100,
      scores: scores
    };
  }

  // Legacy methods for backward compatibility
  containsHindi(message) {
    return this.detectLanguage(message).language === 'hindi';
  }

  containsBengali(message) {
    return this.detectLanguage(message).language === 'bengali';
  }

  containsHinglish(message) {
    return this.detectLanguage(message).language === 'hinglish';
  }

  // Create memory object
  createMemory(content, type, priority = this.memoryPriority.MEDIUM, metadata = {}) {
    return {
      id: this.generateMemoryId(),
      content,
      type,
      priority,
      timestamp: new Date().toISOString(),
      metadata,
      accessCount: 0,
      lastAccessed: new Date().toISOString()
    };
  }

  generateMemoryId() {
    return 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Update memory access
  updateMemoryAccess(memory) {
    memory.accessCount++;
    memory.lastAccessed = new Date().toISOString();
  }

  // Get relevant memories for context
  getRelevantMemories(memories, query, limit = 5) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredMemories = memories.map(memory => {
      let score = 0;
      const contentWords = memory.content.toLowerCase().split(/\s+/);
      
      // Exact word matches
      queryWords.forEach(queryWord => {
        if (contentWords.includes(queryWord)) {
          score += 2;
        }
        
        // Partial matches
        contentWords.forEach(contentWord => {
          if (contentWord.includes(queryWord) || queryWord.includes(contentWord)) {
            score += 1;
          }
        });
      });
      
      // Priority boost
      score += memory.priority;
      
      // Recency boost
      const daysSinceLastAccess = (Date.now() - new Date(memory.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 7 - daysSinceLastAccess) * 0.1;
      
      return { ...memory, score };
    });
    
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
