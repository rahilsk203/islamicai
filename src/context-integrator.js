/**
 * ContextIntegrator - DSA-based intelligent context integration system
 * 
 * This class implements a sophisticated context integration system that prioritizes
 * responding based on the user's current message, only integrating past context
 * when there's contextual or logical connection.
 */
export class ContextIntegrator {
  constructor() {
    // Initialize data structures for efficient context analysis
    this._initializeOptimizedDataStructures();
  }

  /**
   * Initialize optimized data structures for DSA-level performance
   * @private
   */
  _initializeOptimizedDataStructures() {
    // Pre-computed keyword sets for O(1) lookups
    this.contextualConnectionKeywords = new Set([
      // Reference/continuation words
      'above', 'previous', 'before', 'earlier', 'mentioned', 'discussed', 'talked',
      'refer', 'regarding', 'concerning', 'about', 'related', 'connected',
      'same', 'similar', 'like you said', 'as you mentioned', 'you said',
      
      // Islamic context words
      'quran', 'hadith', 'allah', 'prophet', 'muhammad', 'islam', 'muslim',
      'prayer', 'namaz', 'fasting', 'roza', 'zakat', 'hajj', 'pilgrimage',
      'verse', 'ayah', 'surah', 'sunnah', 'sahaba', 'companions',
      
      // Continuation phrases
      'also', 'furthermore', 'moreover', 'additionally', 'besides', 'in addition',
      'similarly', 'likewise', 'equally', 'correspondingly', 'further',
      
      // Question/clarification words
      'what', 'how', 'why', 'when', 'where', 'which', 'explain', 'elaborate',
      'clarify', 'detail', 'expand', 'tell me more', 'can you explain',
      'help me understand', 'i dont understand', 'confused'
    ]);
    
    // Topic clustering keywords for semantic grouping
    this.topicClusters = {
      'quranic_studies': ['quran', 'surah', 'ayah', 'verse', 'recitation', 'tilawah', 'revelation'],
      'hadith_studies': ['hadith', 'sunnah', 'prophet', 'sahih', 'narration', 'authentic', 'bukhari', 'muslim'],
      'fiqh_jurisprudence': ['fiqh', 'halal', 'haram', 'ruling', 'judgment', 'legal', 'madhhab', 'hanafi', 'shafi', 'maliki', 'hanbali'],
      'seerah_history': ['seerah', 'history', 'battle', 'migration', 'hijrah', 'companions', 'khilafah', 'caliph'],
      'spiritual_development': ['iman', 'faith', 'taqwa', 'repentance', 'dua', 'supplication', 'dhikr', 'remembrance'],
      'daily_practice': ['prayer', 'namaz', 'wudu', 'fasting', 'roza', 'zakat', 'hajj', 'pilgrimage'],
      'ethics_morality': ['ethics', 'morals', 'character', 'adab', 'manners', 'virtue', 'patience', 'gratitude'],
      'contemporary_issues': ['modern', 'today', 'current', 'now', '21st century', 'contemporary', 'technology', 'social media'],
      'family_relations': ['family', 'children', 'parent', 'husband', 'wife', 'marriage', 'divorce', 'inheritance'],
      'business_finance': ['business', 'trade', 'investment', 'riba', 'interest', 'halal income', 'zakat calculation']
    };
    
    // Semantic similarity vectors for concept matching
    this.semanticVectors = {
      'prayer': ['salah', 'namaz', 'worship', 'ritual', 'obligation', 'five times', 'congregation'],
      'fasting': ['roza', 'sawm', 'ramadan', 'abstinence', 'spiritual discipline', 'dawn to sunset'],
      'charity': ['zakat', 'sadaqah', 'giving', 'wealth distribution', 'obligatory charity', 'voluntary charity'],
      'pilgrimage': ['hajj', 'umrah', 'mecca', 'kaaba', 'sacred journey', 'spiritual journey'],
      'faith': ['iman', 'belief', 'trust', 'conviction', 'certainty', 'doubt'],
      'repentance': ['tawbah', 'forgiveness', 'returning', 'regret', 'amendment', 'seeking pardon']
    };
    
    // Cache for computed context weights
    this.contextWeightCache = new Map();
    this.cacheMaxSize = 1000;
    this.cacheTTL = 300000; // 5 minutes
    
    // Performance metrics
    this.metrics = {
      analysesPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // DSA: Bloom Filter for fast duplicate detection
    this.bloomFilter = new Set();
    
    // DSA: Trie structure for fast prefix matching
    this.keywordTrie = this._buildKeywordTrie();
    
    // DSA: LRU cache for expensive operations
    this.lruCache = new Map();
  }

  /**
   * Build Trie structure for fast keyword matching
   * @private
   * @returns {Object} Trie structure
   */
  _buildKeywordTrie() {
    const trie = {};
    
    // Add all contextual connection keywords to trie
    this.contextualConnectionKeywords.forEach(keyword => {
      let current = trie;
      for (const char of keyword) {
        if (!current[char]) {
          current[char] = {};
        }
        current = current[char];
      }
      current.isEnd = true;
    });
    
    return trie;
  }

  /**
   * Check if text contains any contextual connection keywords using Trie
   * @param {string} text - Text to check
   * @returns {boolean} True if keyword found
   * @private
   */
  _containsContextualKeyword(text) {
    const lowerText = text.toLowerCase();
    
    // Use Trie for efficient prefix matching
    for (let i = 0; i < lowerText.length; i++) {
      let current = this.keywordTrie;
      for (let j = i; j < lowerText.length; j++) {
        const char = lowerText[j];
        if (!current[char]) break;
        current = current[char];
        if (current.isEnd) return true;
      }
    }
    
    return false;
  }

  /**
   * Analyze contextual connections between current message and past context
   * @param {string} currentMessage - The user's current message
   * @param {Array} pastContext - Array of past messages/contexts
   * @returns {Object} Analysis results with connection scores
   */
  analyzeContextualConnections(currentMessage, pastContext) {
    this.metrics.analysesPerformed++;
    
    const lowerCurrentMessage = currentMessage.toLowerCase();
    const results = {
      hasDirectReference: false,
      connectionScore: 0,
      relevantContexts: [],
      topicClusters: [],
      urgencyLevel: 0,
      semanticSimilarity: 0
    };
    
    // Check for direct references to past context
    results.hasDirectReference = this._hasDirectReference(lowerCurrentMessage);
    
    // Calculate connection scores for each past context item
    pastContext.forEach((context, index) => {
      const score = this._calculateConnectionScore(lowerCurrentMessage, context);
      if (score > 0.3) { // Threshold for relevance
        results.relevantContexts.push({
          context,
          score,
          index
        });
      }
      results.connectionScore += score;
    });
    
    // Normalize connection score
    if (pastContext.length > 0) {
      results.connectionScore = results.connectionScore / pastContext.length;
    }
    
    // Identify topic clusters
    results.topicClusters = this._identifyTopicClusters(lowerCurrentMessage);
    
    // Determine urgency level
    results.urgencyLevel = this._determineUrgencyLevel(lowerCurrentMessage);
    
    // Calculate semantic similarity
    results.semanticSimilarity = this._calculateSemanticSimilarity(lowerCurrentMessage, pastContext);
    
    return results;
  }

  /**
   * Check if current message has direct reference to past context
   * @param {string} message - Lowercase message
   * @returns {boolean} True if direct reference found
   * @private
   */
  _hasDirectReference(message) {
    return Array.from(this.contextualConnectionKeywords).some(keyword => 
      message.includes(keyword)
    );
  }

  /**
   * Calculate connection score between current message and context item
   * @param {string} currentMessage - Lowercase current message
   * @param {Object} contextItem - Context item to compare
   * @returns {number} Connection score (0-1)
   * @private
   */
  _calculateConnectionScore(currentMessage, contextItem) {
    // Extract content from context item
    const contextContent = (contextItem.content || contextItem.text || '').toLowerCase();
    
    // If context is empty, return 0
    if (!contextContent) return 0;
    
    // Check cache first
    const cacheKey = this._generateCacheKey(currentMessage, contextContent);
    const cached = this._getFromCache(cacheKey);
    if (cached !== null) {
      this.metrics.cacheHits++;
      return cached;
    }
    
    this.metrics.cacheMisses++;
    
    let score = 0;
    
    // Word overlap scoring (Jaccard similarity)
    const currentWords = new Set(currentMessage.split(/\s+/));
    const contextWords = new Set(contextContent.split(/\s+/));
    const intersection = [...currentWords].filter(word => contextWords.has(word)).length;
    const union = new Set([...currentWords, ...contextWords]).size;
    const jaccardScore = union > 0 ? intersection / union : 0;
    
    // Keyword-based scoring
    let keywordScore = 0;
    const commonKeywords = [...currentWords].filter(word => 
      this.contextualConnectionKeywords.has(word)
    ).length;
    keywordScore = commonKeywords / Math.max(1, currentWords.size);
    
    // Topic cluster matching
    let topicScore = 0;
    const currentTopics = this._identifyTopicClusters(currentMessage);
    const contextTopics = this._identifyTopicClusters(contextContent);
    const commonTopics = currentTopics.filter(topic => contextTopics.includes(topic)).length;
    topicScore = commonTopics / Math.max(1, currentTopics.length);
    
    // Semantic vector similarity
    let semanticScore = 0;
    semanticScore = this._calculateSemanticVectorSimilarity(currentMessage, contextContent);
    
    // Position weighting (more recent contexts are more relevant)
    // This would be implemented if we had positional information
    
    // Combine scores with weights
    score = (jaccardScore * 0.4) + (keywordScore * 0.2) + (topicScore * 0.2) + (semanticScore * 0.2);
    
    // Boost score if there's a direct reference
    if (this._hasDirectReference(currentMessage)) {
      score = Math.min(1.0, score * 1.5);
    }
    
    // Cache the result
    this._putInCache(cacheKey, score);
    
    return score;
  }

  /**
   * Identify topic clusters in text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of identified topic clusters
   * @private
   */
  _identifyTopicClusters(text) {
    const identifiedClusters = [];
    
    Object.entries(this.topicClusters).forEach(([cluster, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        identifiedClusters.push(cluster);
      }
    });
    
    return identifiedClusters;
  }

  /**
   * Determine urgency level of message
   * @param {string} message - Lowercase message
   * @returns {number} Urgency level (0-1)
   * @private
   */
  _determineUrgencyLevel(message) {
    // Urgency indicators
    const urgencyIndicators = [
      'urgent', 'asap', 'immediately', 'now', 'quick', 'fast', 'hurry',
      'emergency', 'critical', 'important', 'need help', 'struggling',
      'stuck', 'cant understand', 'dont know', 'help me'
    ];
    
    // Check for urgency indicators
    const hasUrgency = urgencyIndicators.some(indicator => message.includes(indicator));
    
    // Questions often indicate higher priority
    const questionCount = (message.match(/\?/g) || []).length;
    const questionScore = Math.min(1, questionCount * 0.2);
    
    // Exclamation marks indicate emphasis
    const exclamationCount = (message.match(/\!/g) || []).length;
    const exclamationScore = Math.min(0.5, exclamationCount * 0.1);
    
    // Combine scores
    let urgencyLevel = hasUrgency ? 0.8 : 0.2;
    urgencyLevel = Math.min(1, urgencyLevel + questionScore + exclamationScore);
    
    return urgencyLevel;
  }

  /**
   * Calculate semantic similarity between current message and past context
   * @param {string} currentMessage - Current message
   * @param {Array} pastContext - Array of past context items
   * @returns {number} Semantic similarity score (0-1)
   * @private
   */
  _calculateSemanticSimilarity(currentMessage, pastContext) {
    if (pastContext.length === 0) return 0;
    
    let totalSimilarity = 0;
    let itemCount = 0;
    
    pastContext.forEach(contextItem => {
      const contextContent = (contextItem.content || contextItem.text || '').toLowerCase();
      if (contextContent) {
        const similarity = this._calculateSemanticVectorSimilarity(currentMessage, contextContent);
        totalSimilarity += similarity;
        itemCount++;
      }
    });
    
    return itemCount > 0 ? totalSimilarity / itemCount : 0;
  }

  /**
   * Calculate semantic vector similarity between two texts
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Semantic similarity score (0-1)
   * @private
   */
  _calculateSemanticVectorSimilarity(text1, text2) {
    let maxSimilarity = 0;
    
    // For each concept in our semantic vectors
    Object.entries(this.semanticVectors).forEach(([concept, relatedTerms]) => {
      // Check if either text contains the concept or related terms
      const text1ContainsConcept = text1.includes(concept) || 
        relatedTerms.some(term => text1.includes(term));
      const text2ContainsConcept = text2.includes(concept) || 
        relatedTerms.some(term => text2.includes(term));
      
      // If both texts relate to the same concept, increase similarity
      if (text1ContainsConcept && text2ContainsConcept) {
        maxSimilarity = Math.max(maxSimilarity, 0.7); // Strong similarity
      } else if (text1ContainsConcept || text2ContainsConcept) {
        maxSimilarity = Math.max(maxSimilarity, 0.3); // Some similarity
      }
    });
    
    return maxSimilarity;
  }

  /**
   * Create a sophisticated weighting system for context prioritization
   * @param {string} currentMessage - Current user message
   * @param {Array} pastContext - Array of past context items
   * @param {Object} analysisResults - Results from contextual analysis
   * @returns {Object} Weighted context with detailed scoring
   */
  createWeightedContext(currentMessage, pastContext, analysisResults) {
    const weightedContext = {
      currentMessage: {
        content: currentMessage,
        weight: 0.7, // 70% base weight
        priority: 1.0,
        scoreDetails: {
          baseWeight: 0.7,
          urgencyBoost: 0,
          relevanceBoost: 0,
          recencyBoost: 0
        }
      },
      pastContext: [],
      overallWeights: {
        currentMessage: 0.7,
        pastContext: 0.3,
        total: 1.0
      }
    };
    
    // Calculate urgency boost for current message
    const urgencyBoost = analysisResults.urgencyLevel * 0.2;
    weightedContext.currentMessage.scoreDetails.urgencyBoost = urgencyBoost;
    weightedContext.currentMessage.weight += urgencyBoost;
    
    // Calculate relevance boost for current message
    const relevanceBoost = Math.min(0.1, analysisResults.connectionScore * 0.1);
    weightedContext.currentMessage.scoreDetails.relevanceBoost = relevanceBoost;
    weightedContext.currentMessage.weight += relevanceBoost;
    
    // Cap current message weight at 0.9
    weightedContext.currentMessage.weight = Math.min(0.9, weightedContext.currentMessage.weight);
    
    // Process past context items
    if (analysisResults.relevantContexts.length > 0) {
      // Calculate total available weight for past context
      const availablePastWeight = 1.0 - weightedContext.currentMessage.weight;
      
      // Sort relevant contexts by score
      const sortedContexts = analysisResults.relevantContexts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Limit to top 5 for efficiency
      
      // Distribute weights among past contexts
      const weightedPastContexts = this._distributePastContextWeights(
        sortedContexts, 
        availablePastWeight
      );
      
      weightedContext.pastContext = weightedPastContexts;
      
      // Update overall weights
      weightedContext.overallWeights.pastContext = weightedPastContexts.reduce(
        (sum, ctx) => sum + ctx.weight, 0
      );
      weightedContext.overallWeights.currentMessage = weightedContext.currentMessage.weight;
      weightedContext.overallWeights.total = weightedContext.overallWeights.currentMessage + 
        weightedContext.overallWeights.pastContext;
    } else {
      // No relevant past context, give all weight to current message
      weightedContext.currentMessage.weight = 1.0;
      weightedContext.overallWeights.currentMessage = 1.0;
      weightedContext.overallWeights.pastContext = 0;
      weightedContext.overallWeights.total = 1.0;
    }
    
    return weightedContext;
  }

  /**
   * Distribute weights among past context items
   * @param {Array} relevantContexts - Array of relevant context items with scores
   * @param {number} availableWeight - Total weight available for distribution
   * @returns {Array} Weighted past context items
   * @private
   */
  _distributePastContextWeights(relevantContexts, availableWeight) {
    // Apply DSA-based distribution algorithm
    const weightedContexts = [];
    let remainingWeight = availableWeight;
    let totalScore = relevantContexts.reduce((sum, ctx) => sum + ctx.score, 0);
    
    // If all scores are zero, distribute evenly
    if (totalScore === 0) {
      const evenWeight = availableWeight / relevantContexts.length;
      return relevantContexts.map((ctx, index) => ({
        content: ctx.context.content || ctx.context.text,
        weight: evenWeight,
        priority: ctx.score,
        index: ctx.index,
        scoreDetails: {
          baseScore: ctx.score,
          positionFactor: 1.0,
          recencyBoost: 0,
          relevanceBoost: 0
        }
      }));
    }
    
    // Distribute based on scores with position weighting
    relevantContexts.forEach((ctx, index) => {
      // Calculate base weight from score proportion
      const scoreProportion = ctx.score / totalScore;
      let baseWeight = scoreProportion * availableWeight;
      
      // Apply position weighting (more recent = higher weight)
      const positionFactor = Math.max(0.5, 1.0 - (index * 0.1)); // 1.0, 0.9, 0.8, etc.
      baseWeight *= positionFactor;
      
      // Apply recency boost if available (would need timestamp data)
      const recencyBoost = 0; // Placeholder for recency-based boosting
      
      // Calculate final weight
      const finalWeight = Math.min(remainingWeight, baseWeight + recencyBoost);
      
      // Ensure we don't exceed available weight
      remainingWeight = Math.max(0, remainingWeight - finalWeight);
      
      weightedContexts.push({
        content: ctx.context.content || ctx.context.text,
        weight: finalWeight,
        priority: ctx.score,
        index: ctx.index,
        scoreDetails: {
          baseScore: ctx.score,
          positionFactor: positionFactor,
          recencyBoost: recencyBoost,
          relevanceBoost: baseWeight - (scoreProportion * availableWeight)
        }
      });
    });
    
    return weightedContexts;
  }

  /**
   * Apply performance optimizations using DSA principles
   * @param {Array} contextItems - Array of context items to optimize
   * @returns {Array} Optimized context items
   */
  applyPerformanceOptimizations(contextItems) {
    // DSA Optimization 1: Remove redundant/very similar contexts using Bloom Filter
    const optimizedContexts = this._removeRedundantContextsWithBloomFilter(contextItems);
    
    // DSA Optimization 2: Compress long contexts
    const compressedContexts = this._compressLongContexts(optimizedContexts);
    
    // DSA Optimization 3: Prioritize based on information density
    const prioritizedContexts = this._prioritizeByInformationDensity(compressedContexts);
    
    // DSA Optimization 4: Apply LRU caching for repeated operations
    const cachedContexts = this._applyLRUCaching(prioritizedContexts);
    
    return cachedContexts;
  }

  /**
   * Remove redundant/very similar contexts using Bloom Filter for O(1) duplicate detection
   * @param {Array} contextItems - Array of context items
   * @returns {Array} De-duplicated context items
   * @private
   */
  _removeRedundantContextsWithBloomFilter(contextItems) {
    if (contextItems.length <= 1) return contextItems;
    
    const uniqueContexts = [];
    
    for (const context of contextItems) {
      const content = context.content || context.text || '';
      
      // Create a hash signature for the content
      const signature = this._hashContent(content);
      
      // Use Bloom Filter for O(1) duplicate check
      if (!this.bloomFilter.has(signature)) {
        uniqueContexts.push(context);
        this.bloomFilter.add(signature);
      }
    }
    
    return uniqueContexts;
  }

  /**
   * Hash content for duplicate detection
   * @param {string} content - Content to hash
   * @returns {string} Hash signature
   * @private
   */
  _hashContent(content) {
    // Simple but effective hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Compress long contexts to improve performance
   * @param {Array} contextItems - Array of context items
   * @returns {Array} Compressed context items
   * @private
   */
  _compressLongContexts(contextItems) {
    return contextItems.map(context => {
      const content = context.content || context.text || '';
      
      // Only compress if content is very long
      if (content.length > 500) {
        // Extract key sentences (first and last)
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 2) {
          const compressedContent = `${sentences[0]} ... ${sentences[sentences.length - 1]}`;
          return {
            ...context,
            content: compressedContent,
            originalLength: content.length,
            compressed: true
          };
        }
      }
      
      return context;
    });
  }

  /**
   * Prioritize contexts based on information density
   * @param {Array} contextItems - Array of context items
   * @returns {Array} Prioritized context items
   * @private
   */
  _prioritizeByInformationDensity(contextItems) {
    return contextItems.map(context => {
      const content = context.content || context.text || '';
      
      // Calculate information density (unique words / total words)
      const words = content.toLowerCase().split(/\s+/);
      const uniqueWords = new Set(words);
      const density = uniqueWords.size / Math.max(1, words.length);
      
      return {
        ...context,
        informationDensity: density
      };
    }).sort((a, b) => (b.informationDensity || 0) - (a.informationDensity || 0));
  }

  /**
   * Apply LRU caching for expensive operations
   * @param {Array} contextItems - Array of context items
   * @returns {Array} Context items (potentially from cache)
   * @private
   */
  _applyLRUCaching(contextItems) {
    // This is a simplified LRU implementation
    // In a production system, you might want to cache specific operations
    return contextItems;
  }

  /**
   * Integrate context based on analysis results using sophisticated weighting
   * @param {string} currentMessage - Current user message
   * @param {Array} pastContext - Array of past context items
   * @param {Object} analysisResults - Results from contextual analysis
   * @param {Object} languagePreferences - User's language preferences
   * @returns {Object} Integrated context with prioritization
   */
  integrateContext(currentMessage, pastContext, analysisResults, languagePreferences = null) {
    const integratedContext = {
      currentMessage,
      prioritizedContext: [],
      integratedPrompt: '',
      contextWeight: 0,
      integrationStrategy: '',
      weightedContext: null
    };
    
    // Create sophisticated weighting system
    const weightedContext = this.createWeightedContext(
      currentMessage, 
      pastContext, 
      analysisResults
    );
    
    integratedContext.weightedContext = weightedContext;
    
    // Apply performance optimizations
    const optimizedPastContext = this.applyPerformanceOptimizations(weightedContext.pastContext);
    
    // Build prioritized context array
    // Always include current message with high priority
    integratedContext.prioritizedContext.push({
      content: currentMessage,
      type: 'current_message',
      priority: 1.0,
      weight: weightedContext.currentMessage.weight
    });
    
    // Determine integration strategy based on analysis and weighting
    if (analysisResults.hasDirectReference) {
      integratedContext.integrationStrategy = 'direct_reference';
    } else if (analysisResults.connectionScore > 0.5) {
      integratedContext.integrationStrategy = 'high_similarity';
    } else if (analysisResults.semanticSimilarity > 0.4) {
      integratedContext.integrationStrategy = 'semantic_similarity';
    } else if (analysisResults.urgencyLevel > 0.7) {
      integratedContext.integrationStrategy = 'high_urgency';
    } else if (weightedContext.overallWeights.pastContext > 0.2) {
      integratedContext.integrationStrategy = 'weighted_integration';
    } else {
      integratedContext.integrationStrategy = 'current_focus';
    }
    
    // Add optimized past contexts with their calculated weights
    optimizedPastContext.forEach(contextItem => {
      integratedContext.prioritizedContext.push({
        content: contextItem.content,
        type: 'past_context',
        priority: contextItem.priority,
        weight: contextItem.weight,
        index: contextItem.index
      });
    });
    
    // Calculate overall context weight
    integratedContext.contextWeight = this._calculateOverallContextWeight(
      integratedContext.prioritizedContext
    );
    
    // Build integrated prompt
    integratedContext.integratedPrompt = this._buildIntegratedPrompt(
      integratedContext.prioritizedContext,
      integratedContext.integrationStrategy,
      weightedContext,
      languagePreferences
    );
    
    return integratedContext;
  }

  /**
   * Calculate overall context weight
   * @param {Array} prioritizedContext - Array of prioritized context items
   * @returns {number} Overall context weight
   * @private
   */
  _calculateOverallContextWeight(prioritizedContext) {
    let totalWeight = 0;
    let totalItems = 0;
    
    prioritizedContext.forEach(item => {
      totalWeight += item.weight;
      totalItems++;
    });
    
    return totalItems > 0 ? totalWeight / totalItems : 0;
  }

  /**
   * Build integrated prompt from prioritized context
   * @param {Array} prioritizedContext - Array of prioritized context items
   * @param {string} strategy - Integration strategy used
   * @param {Object} weightedContext - Weighted context information
   * @param {Object} languagePreferences - User's language preferences
   * @returns {string} Integrated prompt
   * @private
   */
  _buildIntegratedPrompt(prioritizedContext, strategy, weightedContext, languagePreferences = null) {
    // Sort by priority (highest first)
    const sortedContext = [...prioritizedContext].sort((a, b) => b.priority - a.priority);
    
    let prompt = '';
    
    // Add current message first (highest priority)
    const currentMessageItem = sortedContext.find(item => item.type === 'current_message');
    if (currentMessageItem) {
      prompt += `**CURRENT USER MESSAGE (PRIMARY FOCUS - ${(weightedContext.currentMessage.weight * 100).toFixed(1)}% weight):**\n${currentMessageItem.content}\n\n`;
    }
    
    // Add relevant past context if any and if strategy warrants it
    const pastContextItems = sortedContext.filter(item => item.type === 'past_context');
    if (pastContextItems.length > 0 && strategy !== 'current_focus') {
      prompt += '**RELEVANT CONTEXT FROM PREVIOUS MESSAGES:**\n';
      pastContextItems.forEach(item => {
        const weightPercent = (item.weight * 100).toFixed(1);
        prompt += `- [${weightPercent}% weight] ${item.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add instruction for response prioritization based on strategy
    prompt += '**RESPONSE INSTRUCTIONS:**\n';
    prompt += '1. PRIMARY FOCUS: Respond directly and comprehensively to the CURRENT USER MESSAGE above\n';
    
    // Adjust instructions based on integration strategy
    switch (strategy) {
      case 'direct_reference':
        prompt += '2. CONTEXTUAL INTEGRATION: You explicitly referenced previous content. Integrate relevant past information directly.\n';
        break;
      case 'high_similarity':
        prompt += '2. CONTEXTUAL INTEGRATION: The current message is highly similar to previous discussions. Reference relevant context.\n';
        break;
      case 'semantic_similarity':
        prompt += '2. CONTEXTUAL INTEGRATION: The current message shares semantic concepts with previous discussions. Connect ideas appropriately.\n';
        break;
      case 'high_urgency':
        prompt += '2. CONTEXTUAL INTEGRATION: This is an urgent matter. Focus on the current question but reference critical context if needed.\n';
        break;
      case 'weighted_integration':
        prompt += '2. CONTEXTUAL INTEGRATION: Relevant past context has been weighted and provided. Integrate appropriately based on weights.\n';
        break;
      default:
        prompt += '2. CONTEXTUAL INTEGRATION: Only reference past context when directly relevant to the current question\n';
    }
    
    prompt += '3. AVOID: Do not summarize or repeat information from past context unless specifically requested\n';
    prompt += `4. PRIORITY: Current message takes ${(weightedContext.currentMessage.weight * 100).toFixed(1)}% priority, past context takes ${(weightedContext.overallWeights.pastContext * 100).toFixed(1)}% maximum\n`;
    
    // Add language preference instructions if available
    if (languagePreferences && languagePreferences.user_preference) {
      const userLanguage = languagePreferences.user_preference;
      prompt += `5. LANGUAGE PREFERENCE: Respond in ${userLanguage} as specified in the user's profile.\n`;
      
      // Add contextual connection information
      if (languagePreferences.learning_data && languagePreferences.learning_data.connectionType) {
        const connectionType = languagePreferences.learning_data.connectionType;
        switch (connectionType) {
          case 'direct_response':
            prompt += '6. CONTEXTUAL CONNECTION: This is a direct response to the previous message. Maintain consistency in tone and language.\n';
            break;
          case 'topic_continuation':
            prompt += '6. CONTEXTUAL CONNECTION: This continues the ongoing topic. Build upon previous discussion points.\n';
            break;
          case 'content_reference':
            prompt += '6. CONTEXTUAL CONNECTION: This references previous content. Ensure coherence with earlier explanations.\n';
            break;
          case 'contextual_consistency':
            prompt += '6. CONTEXTUAL CONNECTION: Maintain contextual consistency with the ongoing conversation flow.\n';
            break;
        }
      }
    }
    
    return prompt;
  }

  /**
   * Generate cache key for context weight calculations
   * @param {string} currentMessage - Current message
   * @param {string} contextContent - Context content
   * @returns {string} Cache key
   * @private
   */
  _generateCacheKey(currentMessage, contextContent) {
    // Simple hash function for cache key
    const combined = `${currentMessage}::${contextContent}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Get value from cache with TTL check
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   * @private
   */
  _getFromCache(key) {
    const cached = this.contextWeightCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.value;
    }
    
    if (cached) {
      this.contextWeightCache.delete(key);
    }
    
    return null;
  }

  /**
   * Put value in cache with LRU eviction
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @private
   */
  _putInCache(key, value) {
    if (this.contextWeightCache.size >= this.cacheMaxSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.contextWeightCache.keys().next().value;
      this.contextWeightCache.delete(firstKey);
    }
    
    this.contextWeightCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Get performance metrics including DSA optimization stats
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / Math.max(1, this.metrics.cacheHits + this.metrics.cacheMisses),
      bloomFilterSize: this.bloomFilter.size,
      cacheSize: this.contextWeightCache.size
    };
  }

  /**
   * Clear all caches and reset performance metrics
   */
  resetPerformanceData() {
    this.contextWeightCache.clear();
    this.bloomFilter.clear();
    this.lruCache.clear();
    this.metrics = {
      analysesPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.contextWeightCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.contextWeightCache.size,
      maxSize: this.cacheMaxSize,
      ttl: this.cacheTTL,
      metrics: this.metrics
    };
  }
}