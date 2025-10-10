/**
 * Response Length Optimizer for IslamicAI
 * Uses advanced DSA techniques to determine optimal response length based on query complexity
 */

export class ResponseLengthOptimizer {
  constructor() {
    // Initialize complexity indicators for O(1) lookup
    this.complexityIndicators = {
      highComplexityKeywords: new Set([
        // Deep analytical questions
        'explain', 'analyze', 'compare', 'contrast', 'evaluate', 'assess', 'examine', 'investigate',
        'comprehensive', 'detailed', 'thorough', 'in-depth', 'extensive', 'complete',
        'relationship', 'connection', 'correlation', 'interrelation', 'interconnection',
        'significance', 'importance', 'impact', 'effect', 'consequence', 'implication',
        'difference', 'distinction', 'similarity', 'resemblance',
        'process', 'procedure', 'mechanism', 'method', 'approach', 'technique',
        'history', 'historical', 'evolution', 'development', 'origin', 'background',
        'philosophy', 'principle', 'concept', 'theory', 'doctrine', 'belief',
        'application', 'implementation', 'practice', 'execution', 'utilization',
        'benefit', 'advantage', 'merit', 'value', 'worth', 'usefulness',
        'challenge', 'difficulty', 'problem', 'issue', 'obstacle', 'complication',
        'solution', 'resolution', 'answer', 'remedy', 'fix', 'approach',
        
        // Islamic-specific complex topics
        'tafsir', 'exegesis', 'interpretation', 'commentary', 'scholarly opinion',
        'fiqh', 'jurisprudence', 'ruling', 'verdict', 'legal opinion',
        'hadith', 'sunnah', 'prophetic tradition', 'narration',
        'aqeedah', 'creed', 'doctrine', 'belief system',
        'seerah', 'biography', 'life of prophet',
        'islamic jurisprudence', 'schools of thought', 'madhhab',
        'theological', 'theology', 'kalam', 'scholastic theology',
        'ethics', 'morality', 'virtue', 'character development',
        'spirituality', 'tasawwuf', 'sufism', 'inner purification',
        'contemporary', 'modern', 'current', 'present-day',
        'integration', 'synthesis', 'combination', 'fusion',
        'perspective', 'viewpoint', 'standpoint', 'position',
        'scholarly debate', 'differences of opinion', 'ikhtilaf',
        'authenticity', 'verification', 'validation', 'confirmation',
        'context', 'circumstance', 'situation', 'condition',
        'practical', 'real-world', 'real-life', 'applied',
        'guidance', 'direction', 'advice', 'counsel',
        'comparative', 'relative', 'relational', 'associative'
      ]),
      
      mediumComplexityKeywords: new Set([
        // Moderate analytical questions
        'how', 'why', 'what', 'when', 'where', 'which',
        'describe', 'discuss', 'outline', 'summarize', 'review',
        'aspect', 'element', 'component', 'feature', 'characteristic',
        'type', 'kind', 'category', 'class', 'group',
        'example', 'instance', 'case', 'illustration', 'sample',
        'reason', 'cause', 'factor', 'element', 'component',
        'result', 'outcome', 'conclusion', 'end', 'finish',
        'step', 'stage', 'phase', 'level', 'degree',
        'part', 'portion', 'segment', 'section', 'division',
        'rule', 'regulation', 'law', 'principle', 'standard',
        'definition', 'meaning', 'explanation', 'clarification',
        'importance', 'significance', 'relevance', 'pertinence',
        'benefit', 'advantage', 'gain', 'profit', 'utility',
        'problem', 'difficulty', 'trouble', 'issue', 'matter',
        'solution', 'answer', 'resolution', 'remedy',
        'procedure', 'method', 'way', 'approach', 'technique',
        'process', 'sequence', 'order', 'progression',
        'structure', 'organization', 'arrangement', 'formation',
        'function', 'role', 'purpose', 'objective', 'goal',
        'characteristic', 'trait', 'quality', 'attribute', 'property'
      ]),
      
      lowComplexityKeywords: new Set([
        // Simple factual questions
        'what is', 'define', 'meaning of', 'translate',
        'when', 'where', 'who', 'which',
        'simple', 'basic', 'fundamental', 'elementary',
        'quick', 'fast', 'brief', 'short', 'concise',
        'summary', 'overview', 'outline', 'synopsis',
        'straightforward', 'direct', 'immediate', 'instant',
        'fact', 'information', 'data', 'detail',
        'yes', 'no', 'true', 'false', 'correct', 'incorrect',
        'list', 'enumerate', 'name', 'identify', 'mention',
        'count', 'number', 'quantity', 'amount',
        'single', 'one', 'individual', 'separate',
        'specific', 'particular', 'exact', 'precise',
        'clear', 'obvious', 'apparent', 'evident',
        'simple explanation', 'basic understanding',
        'in brief', 'in short', 'to sum up',
        'quick answer', 'fast response', 'immediate reply'
      ])
    };
    
    // Question type classification
    this.questionTypes = {
      what: { complexityWeight: 0.3, tokenMultiplier: 1.0 },
      how: { complexityWeight: 0.8, tokenMultiplier: 1.5 },
      why: { complexityWeight: 0.9, tokenMultiplier: 1.7 },
      when: { complexityWeight: 0.2, tokenMultiplier: 0.8 },
      where: { complexityWeight: 0.2, tokenMultiplier: 0.8 },
      which: { complexityWeight: 0.4, tokenMultiplier: 1.0 },
      who: { complexityWeight: 0.3, tokenMultiplier: 0.9 },
      compare: { complexityWeight: 0.9, tokenMultiplier: 1.8 },
      explain: { complexityWeight: 0.8, tokenMultiplier: 1.6 },
      describe: { complexityWeight: 0.6, tokenMultiplier: 1.3 },
      analyze: { complexityWeight: 1.0, tokenMultiplier: 2.0 }
    };
    
    // Topic complexity weights
    this.topicComplexityWeights = {
      'quranic_studies': 0.9,
      'hadith_studies': 0.8,
      'fiqh_jurisprudence': 0.9,
      'seerah_history': 0.7,
      'spiritual_development': 0.6,
      'daily_practice': 0.5,
      'ethics_morality': 0.6,
      'contemporary_issues': 0.8,
      'family_relations': 0.5,
      'business_finance': 0.7,
      'general': 0.4
    };
    
    // Initialize Trie for fast keyword matching
    this.complexityTrie = this._buildComplexityTrie();
  }
  
  /**
   * Build Trie for fast keyword matching
   * @private
   * @returns {Object} Trie structure
   */
  _buildComplexityTrie() {
    const root = { children: {}, isEnd: false, complexity: null };
    
    // Add all keywords to trie
    const addToTrie = (word, complexity) => {
      let node = root;
      for (const char of word.toLowerCase()) {
        if (!node.children[char]) {
          node.children[char] = { children: {}, isEnd: false, complexity: null };
        }
        node = node.children[char];
      }
      node.isEnd = true;
      node.complexity = complexity;
    };
    
    // Add all complexity indicators to trie
    this.complexityIndicators.highComplexityKeywords.forEach(word => 
      addToTrie(word, 'high'));
    this.complexityIndicators.mediumComplexityKeywords.forEach(word => 
      addToTrie(word, 'medium'));
    this.complexityIndicators.lowComplexityKeywords.forEach(word => 
      addToTrie(word, 'low'));
    
    return root;
  }
  
  /**
   * Search for keywords in trie
   * @private
   * @param {string} text - Text to search in
   * @returns {Array} Found keywords with complexity levels
   */
  _searchInTrie(text) {
    const results = [];
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      let node = this.complexityTrie;
      for (const char of word) {
        if (!node.children[char]) break;
        node = node.children[char];
        if (node.isEnd && node.complexity) {
          results.push({ word, complexity: node.complexity });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Calculate semantic complexity score using advanced algorithms
   * @param {string} query - User query
   * @param {Object} queryType - Classified query type
   * @returns {number} Complexity score (0-1)
   */
  calculateSemanticComplexity(query, queryType) {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // 1. Keyword-based complexity analysis using Trie
    const foundKeywords = this._searchInTrie(query);
    let highCount = 0, mediumCount = 0, lowCount = 0;
    
    foundKeywords.forEach(kw => {
      if (kw.complexity === 'high') highCount++;
      else if (kw.complexity === 'medium') mediumCount++;
      else if (kw.complexity === 'low') lowCount++;
    });
    
    // Weighted score based on keyword complexity
    score += (highCount * 0.4 + mediumCount * 0.2 + lowCount * 0.1) / Math.max(1, foundKeywords.length);
    
    // 2. Query length analysis
    const wordCount = lowerQuery.split(/\s+/).length;
    score += Math.min(0.3, wordCount * 0.05); // Cap at 0.3
    
    // 3. Question mark analysis
    const questionCount = (query.match(/\?/g) || []).length;
    score += Math.min(0.2, questionCount * 0.1); // Cap at 0.2
    
    // 4. Question type complexity
    if (queryType && this.questionTypes[queryType.topic]) {
      score += this.questionTypes[queryType.topic].complexityWeight * 0.2;
    }
    
    // 5. Exclamation mark analysis (indicates emphasis/complexity)
    const exclamationCount = (query.match(/!/g) || []).length;
    score += Math.min(0.1, exclamationCount * 0.05); // Cap at 0.1
    
    // 6. Topic complexity
    if (queryType && this.topicComplexityWeights[queryType.topic]) {
      score += this.topicComplexityWeights[queryType.topic] * 0.2;
    }
    
    // Normalize score to 0-1 range
    return Math.min(1, score);
  }
  
  /**
   * Estimate token count for a given text
   * @param {string} text - Text to estimate tokens for
   * @returns {number} Estimated token count
   */
  estimateTokenCount(text) {
    if (!text) return 0;
    
    // Simple token estimation (can be enhanced with more sophisticated models)
    // Average of 1.3 tokens per word for English text
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount * 1.3);
  }
  
  /**
   * Determine optimal response length based on query complexity
   * @param {string} query - User query
   * @param {Object} queryType - Classified query type
   * @param {Object} userPreferences - User preferences for response style
   * @returns {Object} Response length configuration
   */
  determineOptimalResponseLength(query, queryType, userPreferences = {}) {
    // Calculate semantic complexity
    const complexityScore = this.calculateSemanticComplexity(query, queryType);
    
    // Base token limits
    const baseMinTokens = 50;   // Minimum tokens for any response
    const baseMaxTokens = 2048; // Maximum tokens (Gemini's limit)
    
    // Determine response length category based on complexity
    let lengthCategory;
    if (complexityScore < 0.3) {
      lengthCategory = 'low';
    } else if (complexityScore < 0.7) {
      lengthCategory = 'medium';
    } else {
      lengthCategory = 'high';
    }
    
    // Apply user preferences
    let targetTokens;
    if (userPreferences.terse) {
      // Terse mode - reduce token count
      switch (lengthCategory) {
        case 'low': targetTokens = 75; break;
        case 'medium': targetTokens = 150; break;
        case 'high': targetTokens = 300; break;
        default: targetTokens = 150;
      }
    } else if (userPreferences.verbose) {
      // Verbose mode - increase token count
      switch (lengthCategory) {
        case 'low': targetTokens = 200; break;
        case 'medium': targetTokens = 600; break;
        case 'high': targetTokens = 1536; break;
        default: targetTokens = 600;
      }
    } else {
      // Normal mode
      switch (lengthCategory) {
        case 'low': targetTokens = 100; break;
        case 'medium': targetTokens = 400; break;
        case 'high': targetTokens = 1024; break;
        default: targetTokens = 400;
      }
    }
    
    // Apply custom limits if provided
    if (userPreferences.maxTokens) {
      targetTokens = Math.min(targetTokens, userPreferences.maxTokens);
    }
    
    // Ensure within bounds
    targetTokens = Math.max(baseMinTokens, Math.min(targetTokens, baseMaxTokens));
    
    // Calculate max sentences (approximately 20 words per sentence)
    const maxSentences = Math.max(3, Math.floor(targetTokens / 20));
    
    return {
      lengthCategory,
      complexityScore,
      targetTokens,
      maxTokens: targetTokens,
      maxSentences,
      generationConfig: {
        maxOutputTokens: targetTokens,
        temperature: complexityScore > 0.7 ? 0.6 : 0.4, // Adjust creativity based on complexity
        topK: complexityScore > 0.7 ? 40 : 32,
        topP: 0.95
      }
    };
  }
  
  /**
   * Adjust response length based on real-time feedback
   * @param {Object} feedback - User feedback on response length
   * @param {Object} currentConfig - Current response length configuration
   * @returns {Object} Adjusted configuration
   */
  adjustForFeedback(feedback, currentConfig) {
    if (!feedback || !currentConfig) return currentConfig;
    
    const adjustmentFactor = 0.1; // 10% adjustment
    let newTargetTokens = currentConfig.targetTokens;
    
    if (feedback === 'too_long') {
      newTargetTokens = Math.max(50, Math.floor(currentConfig.targetTokens * (1 - adjustmentFactor)));
    } else if (feedback === 'too_short') {
      newTargetTokens = Math.min(2048, Math.ceil(currentConfig.targetTokens * (1 + adjustmentFactor)));
    }
    
    return {
      ...currentConfig,
      targetTokens: newTargetTokens,
      maxTokens: newTargetTokens,
      maxSentences: Math.max(3, Math.floor(newTargetTokens / 20)),
      generationConfig: {
        ...currentConfig.generationConfig,
        maxOutputTokens: newTargetTokens
      }
    };
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    // In a real implementation, this would track optimization effectiveness
    return {
      optimizationsPerformed: 0,
      averageComplexityScore: 0,
      responseLengthDistribution: { low: 0, medium: 0, high: 0 }
    };
  }
}

// Export singleton instance
export default new ResponseLengthOptimizer();