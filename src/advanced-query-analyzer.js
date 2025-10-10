/**
 * Advanced Query Analyzer for IslamicAI
 * Uses deep semantic analysis and context understanding to provide better responses
 */

export class AdvancedQueryAnalyzer {
  constructor() {
    // Intent classification patterns
    this.intentPatterns = {
      'greeting': [
        'hello', 'hi', 'hey', 'assalamu', 'salam', 'ismaa', 'greetings',
        'good morning', 'good afternoon', 'good evening'
      ],
      'informational': [
        'what', 'how', 'why', 'when', 'where', 'which', 'explain', 'define',
        'tell me', 'describe', 'information', 'details', 'about'
      ],
      'instructional': [
        'how to', 'steps', 'guide', 'teach', 'show', 'demonstrate', 'tutorial',
        'procedure', 'method', 'way', 'process'
      ],
      'comparative': [
        'compare', 'contrast', 'difference', 'similar', 'versus', 'vs',
        'better', 'worse', 'prefer', 'advantage', 'disadvantage'
      ],
      'evaluative': [
        'should', 'is it', 'can i', 'is this', 'evaluate', 'assess', 'analyze',
        'review', 'opinion', 'thoughts', 'recommend'
      ],
      'personal': [
        'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'personal', 'situation',
        'problem', 'issue', 'difficulty', 'challenge'
      ]
    };

    // Emotional context indicators
    this.emotionalIndicators = {
      'confused': ['confused', 'dont understand', 'cant grasp', 'lost', 'unclear'],
      'seeking_guidance': ['need help', 'guide me', 'show me', 'teach me', 'help'],
      'grateful': ['thank', 'thanks', 'shukran', 'jazakallah', 'grateful', 'appreciate'],
      'urgent': ['urgent', 'asap', 'quick', 'fast', 'immediately', 'now'],
      'curious': ['wonder', 'curious', 'interested', 'fascinating', 'intriguing'],
      'concerned': ['worried', 'concerned', 'anxious', 'troubled', 'distressed']
    };

    // Depth level indicators
    this.depthIndicators = {
      'surface': ['brief', 'short', 'quick', 'summary', 'overview', 'in brief'],
      'moderate': ['explain', 'describe', 'detail', 'elaborate', 'further'],
      'deep': ['comprehensive', 'thorough', 'in-depth', 'detailed', 'extensive', 'complete']
    };

    // Initialize data structures for fast lookups
    this._initializeOptimizedStructures();
  }

  /**
   * Initialize optimized data structures for fast lookups
   * @private
   */
  _initializeOptimizedStructures() {
    // Convert arrays to Sets for O(1) lookup
    this.intentSets = {};
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      this.intentSets[intent] = new Set(patterns);
    }

    this.emotionSets = {};
    for (const [emotion, indicators] of Object.entries(this.emotionalIndicators)) {
      this.emotionSets[emotion] = new Set(indicators);
    }

    this.depthSets = {};
    for (const [depth, indicators] of Object.entries(this.depthIndicators)) {
      this.depthSets[depth] = new Set(indicators);
    }
  }

  /**
   * Analyze user query for intent, emotion, and context
   * @param {string} query - User's query
   * @param {Object} context - Conversation context
   * @returns {Object} Detailed analysis of the query
   */
  analyzeQuery(query, context = {}) {
    const lowerQuery = query.toLowerCase().trim();
    const words = lowerQuery.split(/\s+/);

    // 1. Intent Analysis
    const intents = this._detectIntents(words, lowerQuery);

    // 2. Emotional Context Analysis
    const emotions = this._detectEmotions(words, lowerQuery);

    // 3. Depth Requirement Analysis
    const depth = this._detectDepthRequirement(words, lowerQuery);

    // 4. Entity Extraction
    const entities = this._extractEntities(query);

    // 5. Contextual Relevance
    const contextRelevance = this._assessContextRelevance(query, context);

    // 6. Urgency Detection
    const urgency = this._detectUrgency(words, lowerQuery);

    // 7. Complexity Scoring
    const complexity = this._calculateComplexity(query, intents, entities);

    return {
      originalQuery: query,
      intents,
      emotions,
      depth,
      entities,
      contextRelevance,
      urgency,
      complexity,
      confidence: this._calculateConfidence(intents, emotions, contextRelevance)
    };
  }

  /**
   * Detect user intents from query
   * @private
   * @param {Array} words - Query words
   * @param {string} lowerQuery - Lowercase query
   * @returns {Array} Detected intents
   */
  _detectIntents(words, lowerQuery) {
    const intents = [];

    // Check for direct intent matches
    for (const [intent, patternSet] of Object.entries(this.intentSets)) {
      if (words.some(word => patternSet.has(word)) || 
          Array.from(patternSet).some(pattern => lowerQuery.includes(pattern))) {
        intents.push(intent);
      }
    }

    // Special case for greeting (exact matches)
    if (this.intentSets.greeting.has(words[0]) || 
        (words.length > 1 && this.intentSets.greeting.has(words[0] + ' ' + words[1]))) {
      // Ensure greeting is prioritized
      if (!intents.includes('greeting')) {
        intents.unshift('greeting');
      }
    }

    return intents.length > 0 ? intents : ['informational']; // Default to informational
  }

  /**
   * Detect emotional context from query
   * @private
   * @param {Array} words - Query words
   * @param {string} lowerQuery - Lowercase query
   * @returns {Array} Detected emotions
   */
  _detectEmotions(words, lowerQuery) {
    const emotions = [];

    for (const [emotion, indicatorSet] of Object.entries(this.emotionSets)) {
      if (words.some(word => indicatorSet.has(word)) || 
          Array.from(indicatorSet).some(indicator => lowerQuery.includes(indicator))) {
        emotions.push(emotion);
      }
    }

    return emotions;
  }

  /**
   * Detect required depth of response
   * @private
   * @param {Array} words - Query words
   * @param {string} lowerQuery - Lowercase query
   * @returns {string} Depth level
   */
  _detectDepthRequirement(words, lowerQuery) {
    // Check for explicit depth indicators
    for (const [depth, indicatorSet] of Object.entries(this.depthSets)) {
      if (words.some(word => indicatorSet.has(word)) || 
          Array.from(indicatorSet).some(indicator => lowerQuery.includes(indicator))) {
        return depth;
      }
    }

    // Default depth based on query characteristics
    const questionWords = ['explain', 'describe', 'detail', 'how', 'why'];
    const hasQuestionWord = questionWords.some(word => lowerQuery.includes(word));
    
    if (hasQuestionWord) {
      return 'moderate';
    }
    
    return 'surface';
  }

  /**
   * Extract entities from query
   * @private
   * @param {string} query - User query
   * @returns {Object} Extracted entities
   */
  _extractEntities(query) {
    const entities = {
      persons: [],
      locations: [],
      organizations: [],
      dates: [],
      times: [],
      numbers: [],
      religiousTerms: []
    };

    // Religious terms extraction
    const religiousTerms = [
      'quran', 'surah', 'ayah', 'verse', 'hadith', 'sunnah', 'prophet',
      'allah', 'god', 'prayer', 'salah', 'namaz', 'fasting', 'roza',
      'zakat', 'hajj', 'umrah', 'pilgrimage', 'islam', 'muslim',
      'iman', 'faith', 'taqwa', 'repentance', 'tawbah', 'jannah', 'hell'
    ];

    const lowerQuery = query.toLowerCase();
    religiousTerms.forEach(term => {
      if (lowerQuery.includes(term)) {
        entities.religiousTerms.push(term);
      }
    });

    // Number extraction
    const numbers = query.match(/\b\d+\b/g);
    if (numbers) {
      entities.numbers = numbers.map(Number);
    }

    return entities;
  }

  /**
   * Assess contextual relevance to conversation history
   * @private
   * @param {string} query - User query
   * @param {Object} context - Conversation context
   * @returns {number} Relevance score (0-1)
   */
  _assessContextRelevance(query, context) {
    if (!context || !context.history || context.history.length === 0) {
      return 0.5; // Neutral relevance when no context
    }

    const lowerQuery = query.toLowerCase();
    const recentMessages = context.history.slice(-3); // Last 3 messages
    let relevanceScore = 0;
    let totalComparisons = 0;

    // Check for keyword overlap with recent messages
    recentMessages.forEach(msg => {
      if (msg && msg.content) {
        const lowerContent = msg.content.toLowerCase();
        const queryWords = new Set(lowerQuery.split(/\s+/));
        const contentWords = new Set(lowerContent.split(/\s+/));
        
        // Calculate Jaccard similarity
        const intersection = [...queryWords].filter(word => contentWords.has(word)).length;
        const union = new Set([...queryWords, ...contentWords]).size;
        
        if (union > 0) {
          relevanceScore += intersection / union;
          totalComparisons++;
        }
      }
    });

    return totalComparisons > 0 ? relevanceScore / totalComparisons : 0.5;
  }

  /**
   * Detect urgency from query
   * @private
   * @param {Array} words - Query words
   * @param {string} lowerQuery - Lowercase query
   * @returns {boolean} Whether query is urgent
   */
  _detectUrgency(words, lowerQuery) {
    return words.some(word => this.emotionSets.urgent?.has(word)) || 
           Array.from(this.emotionSets.urgent || []).some(indicator => lowerQuery.includes(indicator));
  }

  /**
   * Calculate complexity of query
   * @private
   * @param {string} query - User query
   * @param {Array} intents - Detected intents
   * @param {Object} entities - Extracted entities
   * @returns {number} Complexity score (0-1)
   */
  _calculateComplexity(query, intents, entities) {
    let score = 0;
    
    // Length factor (0-0.3)
    const wordCount = query.split(/\s+/).length;
    score += Math.min(0.3, wordCount * 0.05);
    
    // Intent complexity factor (0-0.3)
    const complexIntents = ['comparative', 'evaluative'];
    const intentComplexity = intents.some(intent => complexIntents.includes(intent)) ? 0.3 : 0.1;
    score += intentComplexity;
    
    // Entity richness factor (0-0.2)
    const entityCount = Object.values(entities).flat().length;
    score += Math.min(0.2, entityCount * 0.05);
    
    // Question mark factor (0-0.1)
    const questionCount = (query.match(/\?/g) || []).length;
    score += Math.min(0.1, questionCount * 0.05);
    
    // Exclamation mark factor (0-0.1)
    const exclamationCount = (query.match(/!/g) || []).length;
    score += Math.min(0.1, exclamationCount * 0.05);
    
    return Math.min(1, score);
  }

  /**
   * Calculate confidence in analysis
   * @private
   * @param {Array} intents - Detected intents
   * @param {Array} emotions - Detected emotions
   * @param {number} contextRelevance - Context relevance score
   * @returns {number} Confidence score (0-1)
   */
  _calculateConfidence(intents, emotions, contextRelevance) {
    // Base confidence
    let confidence = 0.7;
    
    // Adjust based on number of detected intents (more = less confident)
    confidence -= (intents.length - 1) * 0.05;
    
    // Adjust based on number of detected emotions (more = less confident)
    confidence -= emotions.length * 0.05;
    
    // Adjust based on context relevance (high relevance = more confident)
    confidence += (contextRelevance - 0.5) * 0.2;
    
    // Ensure within bounds
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate response strategy based on analysis
   * @param {Object} analysis - Query analysis result
   * @returns {Object} Response strategy
   */
  generateResponseStrategy(analysis) {
    const strategy = {
      tone: 'respectful',
      depth: analysis.depth,
      formality: 'moderate',
      empathy: analysis.emotions.length > 0,
      examples: analysis.complexity > 0.5,
      citations: analysis.complexity > 0.3,
      structure: 'logical',
      personalization: analysis.contextRelevance > 0.6
    };

    // Adjust tone based on emotions
    if (analysis.emotions.includes('grateful')) {
      strategy.tone = 'warm';
    } else if (analysis.emotions.includes('concerned')) {
      strategy.tone = 'reassuring';
    } else if (analysis.emotions.includes('confused')) {
      strategy.tone = 'patient';
    }

    // Adjust formality based on context
    if (analysis.intents.includes('greeting')) {
      strategy.formality = 'friendly';
    } else if (analysis.complexity > 0.7) {
      strategy.formality = 'formal';
    }

    // Adjust structure based on complexity
    if (analysis.complexity > 0.6) {
      strategy.structure = 'detailed';
    } else if (analysis.complexity < 0.3) {
      strategy.structure = 'concise';
    }

    return strategy;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      queriesAnalyzed: 0,
      averageAnalysisTime: 0,
      intentDetectionAccuracy: 0,
      emotionDetectionAccuracy: 0
    };
  }
}

// Export singleton instance
export default new AdvancedQueryAnalyzer();