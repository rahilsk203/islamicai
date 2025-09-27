/**
 * Internet Data Processor for IslamicAI
 * Processes and integrates real-time internet data with AI responses
 * Now includes Al Jazeera news integration
 */

import { WebSearch } from './web-search.js';
import { LocationPrayerService } from './location-prayer-service.js';
import { NewsIntegrationService } from './news-integration-service.js';
import { AdvancedWebSearch } from './advanced-web-search.js'; // Add AdvancedWebSearch import

export class InternetDataProcessor {
  constructor() {
    this.webSearch = new WebSearch();
    this.advancedWebSearch = new AdvancedWebSearch(); // Initialize AdvancedWebSearch
    this.locationPrayerService = new LocationPrayerService();
    this.newsIntegrationService = new NewsIntegrationService();
    
    // Performance optimized processing rules
    this.processingRules = {
      // Rules for when to use internet data
      useInternetFor: [
        'current_events',
        'prayer_times',
        'islamic_calendar',
        'ramadan_eid_dates',
        'hajj_umrah_info',
        'islamic_news',
        'weather_for_prayer',
        'currency_rates',
        'stock_prices',
        'breaking_news',
        'al_jazeera_news',
        'palestinian_news',
        'middle_east_news',
        'muslim_world_news',
        'gold_prices',
        'current_prices',
        'quran_verses',
        'hadith_references',
        'fiqh_guidance',
        'historical_events'
      ],
      
      // Performance optimized settings
      validateData: false, // Disabled for faster processing
      requireIslamicSources: false,
      maxDataAge: 6 * 60 * 60 * 1000, // Reduced to 6 hours for fresher data
      
      // Response integration rules - optimized for speed
      integrateWithResponse: true,
      addSourceAttribution: false, // Disabled for faster processing
      addTimestamp: false, // Disabled for faster processing
      addDisclaimer: false,
      includeAlJazeeraNews: false, // Disabled for faster processing
      
      // Enhanced processing rules - optimized for performance
      enableSemanticSearch: false,
      enableAISearch: false,
      maxSearchResults: 3, // Reduced from 8 for faster results
      searchTimeout: 3000, // Reduced from 8000 for faster timeout
      cacheTTL: 15 * 60 * 1000, // 15 minutes cache for frequently requested data
      
      // NEW: Rely more on Gemini's built-in Google Search
      relyOnGeminiSearch: true, // When true, reduce redundant processing
      minConfidenceForGeminiSearch: 0.7 // Minimum confidence to trigger Gemini search
    };
    
    // Simple in-memory cache for frequently requested data
    this.dataCache = new Map();
    this.cacheTimestamps = new Map();
    this.performanceMetrics = {
      totalQueries: 0,
      cacheHits: 0,
      searchTriggers: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Check cache for existing data
   * @param {string} query - Search query
   * @returns {Object|null} Cached data or null
   */
  checkCache(query) {
    this.performanceMetrics.totalQueries++;
    const cacheKey = this.generateCacheKey(query);
    if (this.dataCache.has(cacheKey)) {
      const timestamp = this.cacheTimestamps.get(cacheKey);
      if (Date.now() - timestamp < this.processingRules.cacheTTL) {
        console.log('Cache hit for query:', query);
        this.performanceMetrics.cacheHits++;
        return this.dataCache.get(cacheKey);
      } else {
        // Expired cache, remove it
        this.dataCache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
      }
    }
    return null;
  }

  /**
   * Store data in cache
   * @param {string} query - Search query
   * @param {Object} data - Data to cache
   */
  storeInCache(query, data) {
    const cacheKey = this.generateCacheKey(query);
    this.dataCache.set(cacheKey, data);
    this.cacheTimestamps.set(cacheKey, Date.now());
    
    // Limit cache size
    if (this.dataCache.size > 100) {
      const firstKey = this.dataCache.keys().next().value;
      this.dataCache.delete(firstKey);
      this.cacheTimestamps.delete(firstKey);
    }
  }

  /**
   * Generate cache key for query
   * @param {string} query - Search query
   * @returns {string} Cache key
   */
  generateCacheKey(query) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `cache_${Math.abs(hash)}`;
  }

  /**
   * Process user query and determine if internet data is needed
   * @param {string} userMessage - User's message
   * @param {Object} context - Additional context
   * @param {string} userIP - User's IP address for location detection
   * @returns {Promise<Object>} Processing decision and data
   */
  async processQuery(userMessage, context = {}, userIP = null) {
    const startTime = Date.now();
    try {
      console.log('Processing query for internet data needs:', userMessage);
      
      // NEW: If relying on Gemini search, do minimal processing
      if (this.processingRules.relyOnGeminiSearch) {
        console.log('Relying on Gemini built-in Google Search, doing minimal processing');
        
        // Check if this is a high-confidence query that should trigger Google Search
        const shouldTriggerSearch = this.shouldTriggerGeminiSearch(userMessage);
        
        if (shouldTriggerSearch) {
          console.log('High-confidence query, will trigger Gemini Google Search');
          this.performanceMetrics.searchTriggers++;
          
          // Return a minimal result that indicates Gemini should do the search
          const result = {
            needsInternetData: true,
            reason: 'gemini_search_recommended',
            data: null,
            enhancedPrompt: `USER QUERY REQUIRES REAL-TIME DATA: ${userMessage}\nPlease use Google Search to find current information about this topic.`,
            searchResults: null,
            fromGeminiSearch: true
          };
          this.storeInCache(userMessage, result); // Cache the result
          this._updatePerformanceMetrics(startTime);
          return result;
        } else {
          // For low-confidence queries, do minimal processing
          console.log('Low-confidence query, minimal processing');
          const result = {
            needsInternetData: false,
            reason: 'low_confidence_for_search',
            data: null,
            enhancedPrompt: ''
          };
          this.storeInCache(userMessage, result); // Cache the result
          this._updatePerformanceMetrics(startTime);
          return result;
        }
      }
      
      // Existing processing logic for when not relying on Gemini search
      // Check cache first for performance
      const cachedResult = this.checkCache(userMessage);
      if (cachedResult) {
        this._updatePerformanceMetrics(startTime);
        return cachedResult;
      }
      
      // Check if query needs Al Jazeera news integration first
      if (this.processingRules.includeAlJazeeraNews) {
        const newsDecision = this.newsIntegrationService.shouldIntegrateNews(userMessage);
        if (newsDecision.needsNews) {
          console.log('Query needs Al Jazeera news integration:', newsDecision.reason);
          const result = await this.processAlJazeeraNewsIntegration(userMessage, context, userIP);
          this.storeInCache(userMessage, result); // Cache the result
          this._updatePerformanceMetrics(startTime);
          return result;
        }
      }
      
      // Check if query needs internet search using advanced analysis
      const advancedSearchDecision = this.advancedWebSearch.needsInternetSearch(userMessage);
      const regularSearchDecision = this.webSearch.needsInternetSearch(userMessage);
      
      // Use advanced search decision for more intelligent processing
      const searchDecision = {
        needsSearch: advancedSearchDecision.needsSearch || regularSearchDecision.needsSearch,
        reason: advancedSearchDecision.needsSearch ? advancedSearchDecision.reason : regularSearchDecision.reason,
        priority: advancedSearchDecision.priority || regularSearchDecision.priority,
        context: advancedSearchDecision.context
      };
      
      // Additional check for financial/price queries that might be missed
      const lowerQuery = userMessage.toLowerCase();
      const priceKeywords = ['gold price', 'silver price', 'gold rate', 'silver rate', 'metal price', 'commodity price', 'dam hai', 'kaya dam', 'price kya'];
      const hasPriceQuery = priceKeywords.some(keyword => lowerQuery.includes(keyword));
      
      // Additional checks for Islamic knowledge queries
      const islamicKnowledgeKeywords = [
        'quran verse', 'surah', 'ayah', 'hadith', 'prophet said', 
        'fiqh', 'halal', 'haram', 'zakat', 'sadaqah', 'dua',
        'islamic history', 'seerah', 'caliph', 'sahaba'
      ];
      const hasIslamicKnowledgeQuery = islamicKnowledgeKeywords.some(keyword => lowerQuery.includes(keyword));
      
      if ((hasPriceQuery || hasIslamicKnowledgeQuery) && !searchDecision.needsSearch) {
        // Override the decision for price or Islamic knowledge queries
        searchDecision.needsSearch = true;
        searchDecision.reason = hasPriceQuery ? 'price_query' : 'islamic_knowledge_query';
        searchDecision.priority = 'high';
        console.log('Overriding search decision for price or Islamic knowledge query');
      }
      
      // Check if query is about prayer times and we have user IP
      const isPrayerTimeQuery = this.isPrayerTimeQuery(userMessage);
      if (isPrayerTimeQuery && userIP) {
        console.log('Detected prayer time query with user IP, getting location-based prayer times');
        const result = await this.processLocationBasedPrayerTimes(userMessage, userIP, context);
        this.storeInCache(userMessage, result); // Cache the result
        this._updatePerformanceMetrics(startTime);
        return result;
      }
      
      if (!searchDecision.needsSearch) {
        const result = {
          needsInternetData: false,
          reason: searchDecision.reason,
          data: null,
          enhancedPrompt: ''
        };
        this.storeInCache(userMessage, result); // Cache the result
        this._updatePerformanceMetrics(startTime);
        return result;
      }

      console.log(`Query needs internet search: ${searchDecision.reason}`);
      this.performanceMetrics.searchTriggers++;
      
      // Use advanced web search for more intelligent queries with optimized options
      let searchResults;
      if (searchDecision.priority === 'high' || (advancedSearchDecision.needsSearch && advancedSearchDecision.priority !== 'low')) {
        console.log('Using advanced web search for high-priority query with optimized settings');
        searchResults = await this.advancedWebSearch.search(userMessage, {
          maxResults: this.processingRules.maxSearchResults,
          includeIslamicSources: true,
          searchEngines: ['duckduckgo'], // Single engine for speed
          timeout: this.processingRules.searchTimeout,
          language: context.language || 'en',
          region: context.region || 'us',
          enableSemanticSearch: this.processingRules.enableSemanticSearch,
          enableAISearch: this.processingRules.enableAISearch
        });
      } else {
        // Fall back to regular web search for lower priority queries
        console.log('Using regular web search with optimized settings');
        searchResults = await this.webSearch.search(userMessage, {
          maxResults: 3, // Reduced for speed
          includeIslamicSources: this.processingRules.requireIslamicSources,
          searchEngines: ['duckduckgo'], // Single engine for speed
          timeout: 2000 // Further reduced timeout
        });
      }

      if (!searchResults.success || !searchResults.results.length) {
        console.log('No internet data found, falling back to training data');
        const result = {
          needsInternetData: false,
          reason: 'no_data_found',
          data: null,
          enhancedPrompt: ''
        };
        this.storeInCache(userMessage, result); // Cache the result
        this._updatePerformanceMetrics(startTime);
        return result;
      }

      // Process and validate the data
      const processedData = await this.processSearchResults(searchResults, userMessage);
      
      // Create enhanced prompt with internet data using appropriate formatting
      let enhancedPrompt;
      if (searchResults.fromCache !== undefined) {
        // Advanced search results
        enhancedPrompt = this.advancedWebSearch.formatForAI(searchResults, userMessage);
      } else {
        // Regular search results
        enhancedPrompt = this.webSearch.formatForAI(searchResults, userMessage);
      }
      
      const result = {
        needsInternetData: true,
        reason: searchDecision.reason,
        data: processedData,
        enhancedPrompt: enhancedPrompt,
        searchResults: searchResults
      };
      
      // Cache the result for performance
      this.storeInCache(userMessage, result);
      this._updatePerformanceMetrics(startTime);
      
      return result;

    } catch (error) {
      console.error('Internet data processing error:', error);
      const result = {
        needsInternetData: false,
        reason: 'processing_error',
        error: error.message,
        data: null,
        enhancedPrompt: ''
      };
      this.storeInCache(userMessage, result); // Cache the result
      this._updatePerformanceMetrics(startTime);
      return result;
    }
  }

  /**
   * Update performance metrics
   * @param {number} startTime - Processing start time
   */
  _updatePerformanceMetrics(startTime) {
    const processingTime = Date.now() - startTime;
    const totalQueries = this.performanceMetrics.totalQueries;
    
    // Update average processing time
    this.performanceMetrics.averageProcessingTime = 
      ((this.performanceMetrics.averageProcessingTime * (totalQueries - 1)) + processingTime) / totalQueries;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalQueries: 0,
      cacheHits: 0,
      searchTriggers: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Process Al Jazeera news integration
   * @param {string} userMessage - User's message
   * @param {Object} context - Additional context
   * @param {string} userIP - User's IP address
   * @returns {Promise<Object>} Processing result with Al Jazeera news data
   */
  async processAlJazeeraNewsIntegration(userMessage, context = {}, userIP = null) {
    try {
      console.log('Processing Al Jazeera news integration for:', userMessage);
      
      // Get relevant news from Al Jazeera
      const newsData = await this.newsIntegrationService.getRelevantNews(userMessage, {
        maxArticles: 10,
        regions: ['main', 'middleEast', 'world', 'africa', 'asia'],
        forceRefresh: false
      });
      
      if (!newsData.hasNews) {
        console.log('No relevant Al Jazeera news found, falling back to regular search');
        // Fall back to regular web search
        const searchDecision = this.webSearch.needsInternetSearch(userMessage);
        if (searchDecision.needsSearch) {
          const searchResults = await this.webSearch.search(userMessage, {
            maxResults: 3,
            includeIslamicSources: true,
            searchEngines: ['duckduckgo']
          });
          
          if (searchResults.success && searchResults.results.length > 0) {
            const processedData = await this.processSearchResults(searchResults, userMessage);
            const enhancedPrompt = this.createEnhancedPrompt(processedData, userMessage, context, searchResults);
            
            return {
              needsInternetData: true,
              reason: 'fallback_web_search',
              data: processedData,
              enhancedPrompt: enhancedPrompt,
              newsIntegration: false
            };
          }
        }
        
        return {
          needsInternetData: false,
          reason: newsData.reason,
          data: null,
          enhancedPrompt: newsData.enhancedPrompt || ''
        };
      }
      
      // Process Al Jazeera news data
      const processedNewsData = {
        originalQuery: userMessage,
        timestamp: new Date().toISOString(),
        sources: ['Al Jazeera News'],
        results: newsData.newsData.results,
        keyFacts: this.extractNewsKeyFacts(newsData.newsData.results),
        islamicRelevance: this.assessNewsIslamicRelevance(newsData.newsData.results),
        dataQuality: 'excellent', // Al Jazeera is a reliable source
        newsCategories: newsData.categories,
        articlesFound: newsData.articlesFound
      };
      
      // Create enhanced prompt with Al Jazeera news
      const enhancedPrompt = this.createAlJazeeraNewsPrompt(processedNewsData, userMessage, newsData);
      
      return {
        needsInternetData: true,
        reason: 'aljazeera_news_integration',
        data: processedNewsData,
        enhancedPrompt: enhancedPrompt,
        newsIntegration: true,
        newsData: newsData
      };
      
    } catch (error) {
      console.error('Al Jazeera news integration error:', error);
      return {
        needsInternetData: false,
        reason: 'news_integration_error',
        error: error.message,
        data: null,
        enhancedPrompt: ''
      };
    }
  }

  /**
   * Process search results and extract relevant information
   * @param {Object} searchResults - Raw search results
   * @param {string} userMessage - Original user message
   * @returns {Promise<Object>} Processed data
   */
  async processSearchResults(searchResults, userMessage) {
    const processedData = {
      originalQuery: userMessage,
      timestamp: new Date().toISOString(),
      sources: searchResults.sources || [],
      results: [],
      keyFacts: [],
      islamicRelevance: 'medium',
      dataQuality: 'unknown'
    };

    // Process each result
    for (const result of searchResults.results) {
      const processedResult = await this.processIndividualResult(result, userMessage);
      if (processedResult) {
        processedData.results.push(processedResult);
        
        // Extract key facts
        if (processedResult.keyFacts && processedResult.keyFacts.length > 0) {
          processedData.keyFacts.push(...processedResult.keyFacts);
        }
      }
    }

    // Assess Islamic relevance
    processedData.islamicRelevance = this.assessIslamicRelevance(processedData.results, userMessage);
    
    // Assess data quality
    processedData.dataQuality = this.assessDataQuality(processedData.results);

    // Extract key information using appropriate method
    let keyInfo;
    if (searchResults.queryAnalysis) {
      // Advanced search results have more detailed analysis
      keyInfo = this.advancedWebSearch.extractKeyInformation(searchResults, userMessage);
    } else {
      // Regular search results
      keyInfo = this.webSearch.extractKeyInformation(searchResults, userMessage);
    }
    processedData.keyFacts = keyInfo.keyFacts || processedData.keyFacts;

    return processedData;
  }

  /**
   * Process individual search result
   * @param {Object} result - Individual search result
   * @param {string} userMessage - Original user message
   * @returns {Promise<Object>} Processed result
   */
  async processIndividualResult(result, userMessage) {
    try {
      const processedResult = {
        title: result.title || 'Untitled',
        content: result.snippet || '',
        url: result.url || '',
        source: result.source || 'Unknown',
        type: result.type || 'general',
        relevance: result.relevance || 'medium',
        timestamp: new Date().toISOString(),
        keyFacts: [],
        islamicContext: null
      };

      // Extract key facts from content
      processedResult.keyFacts = this.extractKeyFactsFromContent(processedResult.content, userMessage);
      
      // Add Islamic context if relevant
      if (this.isIslamicContent(processedResult.content)) {
        processedResult.islamicContext = this.extractIslamicContext(processedResult.content);
      }

      // Validate data quality
      processedResult.quality = this.validateDataQuality(processedResult);

      return processedResult;

    } catch (error) {
      console.error('Error processing individual result:', error);
      return null;
    }
  }

  /**
   * Extract key facts from content
   * @param {string} content - Content to analyze
   * @param {string} userMessage - Original user message
   * @returns {Array} Extracted key facts
   */
  extractKeyFactsFromContent(content, userMessage) {
    const facts = [];
    
    // Look for specific patterns based on query type
    const lowerQuery = userMessage.toLowerCase();
    
    // Date/time patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g,
      /(today|yesterday|tomorrow)/gi,
      /(ramadan|eid|hajj)\s+(\d{4})/gi
    ];
    
    // Time patterns
    const timePatterns = [
      /(\d{1,2}:\d{2}\s*(am|pm)?)/gi,
      /(fajr|dhuhr|asr|maghrib|isha)\s*:?\s*(\d{1,2}:\d{2})/gi
    ];
    
    // Number patterns
    const numberPatterns = [
      /(\d+(?:\.\d+)?\s*(?:million|billion|thousand|%|percent))/gi,
      /(\$\d+(?:\.\d+)?)/g,
      /(\d+(?:\.\d+)?\s*(?:USD|EUR|GBP|SAR|AED))/gi
    ];

    // Extract dates
    datePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        facts.push({
          type: 'date',
          value: matches[0],
          context: this.getContextAroundMatch(content, matches[0])
        });
      }
    });

    // Extract times
    timePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        facts.push({
          type: 'time',
          value: matches[0],
          context: this.getContextAroundMatch(content, matches[0])
        });
      }
    });

    // Extract numbers
    numberPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        facts.push({
          type: 'number',
          value: matches[0],
          context: this.getContextAroundMatch(content, matches[0])
        });
      }
    });

    return facts;
  }

  /**
   * Get context around a match in content
   * @param {string} content - Full content
   * @param {string} match - Matched text
   * @returns {string} Context around match
   */
  getContextAroundMatch(content, match) {
    const index = content.indexOf(match);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + match.length + 50);
    
    return content.substring(start, end).trim();
  }

  /**
   * Check if content is Islamic-related
   * @param {string} content - Content to check
   * @returns {boolean} Is Islamic content
   */
  isIslamicContent(content) {
    const islamicKeywords = [
      'islam', 'muslim', 'quran', 'qur\'an', 'hadith', 'sunnah',
      'prayer', 'namaz', 'ramadan', 'eid', 'hajj', 'umrah',
      'islamic', 'allah', 'muhammad', 'prophet', 'mosque', 'masjid',
      'halal', 'haram', 'zakat', 'sadaqah', 'dua', 'islamic calendar',
      'hijri', 'islamic finance', 'islamic banking', 'islamic center'
    ];
    
    const lowerContent = content.toLowerCase();
    return islamicKeywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Extract Islamic context from content
   * @param {string} content - Content to analyze
   * @returns {Object} Islamic context
   */
  extractIslamicContext(content) {
    const context = {
      hasQuranReference: /quran|qur'an|surah|ayah|verse/gi.test(content),
      hasHadithReference: /hadith|sunnah|narrated|prophet/gi.test(content),
      hasPrayerInfo: /prayer|namaz|fajr|dhuhr|asr|maghrib|isha/gi.test(content),
      hasCalendarInfo: /ramadan|eid|hajj|umrah|islamic calendar|hijri/gi.test(content),
      hasFinancialInfo: /zakat|halal|haram|islamic finance|islamic banking/gi.test(content)
    };
    
    return context;
  }

  /**
   * Assess Islamic relevance of results
   * @param {Array} results - Processed results
   * @param {string} userMessage - Original user message
   * @returns {string} Relevance level
   */
  assessIslamicRelevance(results, userMessage) {
    const islamicResults = results.filter(result => 
      result.islamicContext && 
      Object.values(result.islamicContext).some(Boolean)
    );
    
    const islamicRatio = islamicResults.length / results.length;
    
    if (islamicRatio >= 0.8) return 'high';
    if (islamicRatio >= 0.5) return 'medium';
    if (islamicRatio >= 0.2) return 'low';
    return 'none';
  }

  /**
   * Assess data quality
   * @param {Array} results - Processed results
   * @returns {string} Quality level
   */
  assessDataQuality(results) {
    if (results.length === 0) return 'poor';
    
    const qualityFactors = {
      hasSources: results.filter(r => r.source && r.source !== 'Unknown').length,
      hasUrls: results.filter(r => r.url).length,
      hasKeyFacts: results.filter(r => r.keyFacts && r.keyFacts.length > 0).length,
      averageContentLength: results.reduce((sum, r) => sum + (r.content?.length || 0), 0) / results.length
    };
    
    const qualityScore = (
      (qualityFactors.hasSources / results.length) * 0.3 +
      (qualityFactors.hasUrls / results.length) * 0.2 +
      (qualityFactors.hasKeyFacts / results.length) * 0.3 +
      (qualityFactors.averageContentLength > 100 ? 0.2 : 0)
    );
    
    if (qualityScore >= 0.8) return 'excellent';
    if (qualityScore >= 0.6) return 'good';
    if (qualityScore >= 0.4) return 'fair';
    return 'poor';
  }

  /**
   * Validate data quality
   * @param {Object} result - Individual result
   * @returns {string} Quality assessment
   */
  validateDataQuality(result) {
    let score = 0;
    
    // Check content length
    if (result.content && result.content.length > 50) score += 1;
    
    // Check for source
    if (result.source && result.source !== 'Unknown') score += 1;
    
    // Check for URL
    if (result.url) score += 1;
    
    // Check for key facts
    if (result.keyFacts && result.keyFacts.length > 0) score += 1;
    
    // Check for Islamic context
    if (result.islamicContext) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 3) return 'medium';
    if (score >= 2) return 'low';
    return 'poor';
  }

  /**
   * Create enhanced prompt with internet data
   * @param {Object} processedData - Processed internet data
   * @param {string} userMessage - Original user message
   * @param {Object} context - Additional context
   * @param {Object} searchResults - Original search results
   * @returns {string} Enhanced prompt
   */
  createEnhancedPrompt(processedData, userMessage, context = {}, searchResults = null) {
    let enhancedPrompt = '';
    
    if (!processedData || !processedData.results.length) {
      return enhancedPrompt;
    }

    // Check if this is from advanced search
    if (searchResults && searchResults.fromCache !== undefined) {
      // Use advanced search formatting
      return this.advancedWebSearch.formatForAI(searchResults, userMessage);
    }

    enhancedPrompt += `\n## Real-Time Information Integration\n\n`;
    enhancedPrompt += `**Query:** ${userMessage}\n`;
    enhancedPrompt += `**Data Retrieved:** ${processedData.timestamp}\n`;
    enhancedPrompt += `**Sources:** ${processedData.sources.join(', ')}\n`;
    enhancedPrompt += `**Islamic Relevance:** ${processedData.islamicRelevance}\n`;
    enhancedPrompt += `**Data Quality:** ${processedData.dataQuality}\n`;
    
    // Add note if using intelligent search
    if (searchResults && searchResults.intelligent) {
      enhancedPrompt += `**Note:** Using intelligent search results based on query analysis\n`;
    }
    
    // Add search strategy if available (from advanced search)
    if (searchResults && searchResults.searchStrategy) {
      enhancedPrompt += `**Search Strategy:** ${JSON.stringify(searchResults.searchStrategy)}\n`;
    }
    
    enhancedPrompt += `\n`;

    // Add key facts
    if (processedData.keyFacts.length > 0) {
      enhancedPrompt += `### Key Facts from Current Data:\n`;
      processedData.keyFacts.slice(0, 5).forEach((fact, index) => {
        enhancedPrompt += `${index + 1}. **${fact.type.toUpperCase()}:** ${fact.value}\n`;
        if (fact.context) {
          enhancedPrompt += `   Context: ${fact.context}\n`;
        }
        // Add score if available (from advanced search)
        if (fact.score) {
          enhancedPrompt += `   Relevance Score: ${(fact.score * 100).toFixed(1)}%\n`;
        }
      });
      enhancedPrompt += `\n`;
    }

    // Add detailed results
    enhancedPrompt += `### Detailed Information:\n`;
    processedData.results.slice(0, 3).forEach((result, index) => {
      enhancedPrompt += `\n**${index + 1}. ${result.title}**\n`;
      enhancedPrompt += `Source: ${result.source}\n`;
      enhancedPrompt += `Type: ${result.type}\n`;
      enhancedPrompt += `Content: ${result.content}\n`;
      
      // Add relevance score if available (from advanced search)
      if (result.score) {
        enhancedPrompt += `Relevance Score: ${(result.score * 100).toFixed(1)}%\n`;
      }
      
      if (result.islamicContext) {
        const contextItems = Object.entries(result.islamicContext)
          .filter(([key, value]) => value)
          .map(([key, value]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
          .join(', ');
        
        if (contextItems) {
          enhancedPrompt += `Islamic Context: ${contextItems}\n`;
        }
      }
      
      if (result.url) {
        enhancedPrompt += `URL: ${result.url}\n`;
      }
    });

    // Add integration instructions
    enhancedPrompt += `\n### Integration Instructions:\n`;
    enhancedPrompt += `1. Use this current information to enhance your response\n`;
    enhancedPrompt += `2. Maintain Islamic authenticity and scholarly accuracy\n`;
    enhancedPrompt += `3. Cite sources when referencing specific data\n`;
    enhancedPrompt += `4. Add appropriate Islamic context and guidance\n`;
    enhancedPrompt += `5. Include relevant Islamic teachings related to the current information\n`;
    enhancedPrompt += `6. End with appropriate Islamic closing (e.g., "Allah knows best")\n`;
    
    if (this.processingRules.addDisclaimer) {
      enhancedPrompt += `\n**Note:** This information was retrieved from the internet and should be verified for accuracy. Always prioritize authentic Islamic sources and scholarly consensus.\n`;
    }

    return enhancedPrompt;
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getProcessingStats() {
    return {
      webSearchStats: this.webSearch.getCacheStats(),
      processingRules: this.processingRules,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update processing rules
   * @param {Object} newRules - New processing rules
   */
  updateProcessingRules(newRules) {
    this.processingRules = { ...this.processingRules, ...newRules };
    console.log('Processing rules updated:', this.processingRules);
  }

  /**
   * Check if query is about prayer times
   * @param {string} userMessage - User's message
   * @returns {boolean} Is prayer time query
   */
  isPrayerTimeQuery(userMessage) {
    const lowerQuery = userMessage.toLowerCase();
    const prayerKeywords = [
      'prayer', 'namaz', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
      'sehri', 'iftar', 'prayer time', 'namaz time', 'namaz ka waqt',
      'prayer times', 'namaz ke waqt', 'namaz ki timing', 'namaz ka time',
      'fajr time', 'dhuhr time', 'asr time', 'maghrib time', 'isha time',
      'sehri time', 'iftar time', 'qibla', 'qibla direction'
    ];
    
    return prayerKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Process location-based prayer times
   * @param {string} userMessage - User's message
   * @param {string} userIP - User's IP address
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Processing result with prayer times
   */
  async processLocationBasedPrayerTimes(userMessage, userIP, context) {
    try {
      console.log(`Getting location-based prayer times for IP: ${userIP}`);
      
      // Get comprehensive prayer information
      const prayerInfo = await this.locationPrayerService.getPrayerInfoForUser(userIP);
      
      // Process the prayer data
      const processedData = {
        originalQuery: userMessage,
        timestamp: new Date().toISOString(),
        sources: ['IslamicAI Location Service'],
        results: [{
          title: 'Location-Based Prayer Times',
          content: this.formatPrayerTimesForAI(prayerInfo),
          url: 'https://www.islamicfinder.org/prayer-times/',
          source: 'IslamicAI Location Service',
          type: 'location_prayer_times',
          relevance: 'high',
          locationBased: true
        }],
        keyFacts: this.extractPrayerTimeFacts(prayerInfo),
        islamicRelevance: 'high',
        dataQuality: 'excellent',
        location: prayerInfo.location,
        prayerTimes: prayerInfo.times,
        qiblaDirection: prayerInfo.qiblaDirection
      };
      
      // Create enhanced prompt
      const enhancedPrompt = this.createLocationBasedPrayerPrompt(processedData, userMessage, prayerInfo);
      
      return {
        needsInternetData: true,
        reason: 'location_prayer_times',
        data: processedData,
        enhancedPrompt: enhancedPrompt,
        prayerInfo: prayerInfo
      };
      
    } catch (error) {
      console.error('Location-based prayer time processing error:', error);
      
      // Fallback to regular search
      const searchResults = await this.webSearch.search(userMessage, {
        maxResults: 5,
        includeIslamicSources: true,
        searchEngines: ['duckduckgo']
      });
      
      const processedData = await this.processSearchResults(searchResults, userMessage);
      const enhancedPrompt = this.createEnhancedPrompt(processedData, userMessage, context, searchResults);
      
      return {
        needsInternetData: true,
        reason: 'fallback_search',
        data: processedData,
        enhancedPrompt: enhancedPrompt
      };
    }
  }

  /**
   * Format prayer times for AI consumption
   * @param {Object} prayerInfo - Prayer information
   * @returns {string} Formatted prayer times
   */
  formatPrayerTimesForAI(prayerInfo) {
    const { times, location, hijriDate, qiblaDirection } = prayerInfo;
    
    return `Current Prayer Times for ${location.city}, ${location.country}:
    
Fajr: ${times.fajr}
Sunrise: ${times.sunrise}
Dhuhr: ${times.dhuhr}
Asr: ${times.asr}
Maghrib: ${times.maghrib}
Isha: ${times.isha}

Sehri Time: ${times.sehri}
Hijri Date: ${hijriDate}
Qibla Direction: ${qiblaDirection}° (${this.getCompassDirection(qiblaDirection)})

Location: ${location.city}, ${location.country}
Timezone: ${location.timezone}
Source: IslamicAI Location Service`;
  }

  /**
   * Extract key facts from prayer information
   * @param {Object} prayerInfo - Prayer information
   * @returns {Array} Key facts
   */
  extractPrayerTimeFacts(prayerInfo) {
    const facts = [];
    const { times, location, hijriDate, qiblaDirection } = prayerInfo;
    
    // Add prayer time facts
    Object.entries(times).forEach(([name, time]) => {
      facts.push({
        type: 'prayer_time',
        value: `${name}: ${time}`,
        context: `Prayer time for ${location.city}`
      });
    });
    
    // Add location facts
    facts.push({
      type: 'location',
      value: `${location.city}, ${location.country}`,
      context: 'User location detected'
    });
    
    // Add Qibla direction fact
    facts.push({
      type: 'qibla_direction',
      value: `${qiblaDirection}° (${this.getCompassDirection(qiblaDirection)})`,
      context: 'Direction to face for prayer'
    });
    
    return facts;
  }

  /**
   * Create location-based prayer prompt
   * @param {Object} processedData - Processed data
   * @param {string} userMessage - Original user message
   * @param {Object} prayerInfo - Prayer information
   * @returns {string} Enhanced prompt
   */
  createLocationBasedPrayerPrompt(processedData, userMessage, prayerInfo) {
    let enhancedPrompt = `\n## Location-Based Prayer Times\n\n`;
    enhancedPrompt += `**Query:** ${userMessage}\n`;
    enhancedPrompt += `**Location:** ${prayerInfo.location.city}, ${prayerInfo.location.country}\n`;
    enhancedPrompt += `**Timezone:** ${prayerInfo.location.timezone}\n`;
    enhancedPrompt += `**Hijri Date:** ${prayerInfo.hijriDate}\n`;
    enhancedPrompt += `**Data Retrieved:** ${processedData.timestamp}\n`;
    enhancedPrompt += `**Source:** IslamicAI Location Service\n\n`;
    
    enhancedPrompt += `### Current Prayer Times:\n`;
    const { times } = prayerInfo;
    enhancedPrompt += `- **Fajr:** ${times.fajr}\n`;
    enhancedPrompt += `- **Sunrise:** ${times.sunrise}\n`;
    enhancedPrompt += `- **Dhuhr:** ${times.dhuhr}\n`;
    enhancedPrompt += `- **Asr:** ${times.asr}\n`;
    enhancedPrompt += `- **Maghrib:** ${times.maghrib}\n`;
    enhancedPrompt += `- **Isha:** ${times.isha}\n`;
    enhancedPrompt += `- **Sehri:** ${times.sehri}\n\n`;
    
    enhancedPrompt += `### Additional Information:\n`;
    enhancedPrompt += `- **Qibla Direction:** ${prayerInfo.qiblaDirection}° (${this.getCompassDirection(prayerInfo.qiblaDirection)})\n`;
    enhancedPrompt += `- **Next Prayer:** ${prayerInfo.nextPrayer.name} at ${prayerInfo.nextPrayer.time}\n`;
    enhancedPrompt += `- **Time Until Next Prayer:** ${prayerInfo.nextPrayer.minutesLeft} minutes\n\n`;
    
    enhancedPrompt += `### Integration Instructions:\n`;
    enhancedPrompt += `1. Use these location-specific prayer times in your response\n`;
    enhancedPrompt += `2. Mention the user's location (${prayerInfo.location.city}, ${prayerInfo.location.country})\n`;
    enhancedPrompt += `3. Include Qibla direction information\n`;
    enhancedPrompt += `4. Add Islamic context about the importance of prayer times\n`;
    enhancedPrompt += `5. Mention Sehri time for Ramadan context\n`;
    enhancedPrompt += `6. End with appropriate Islamic closing\n`;
    
    return enhancedPrompt;
  }

  /**
   * Get compass direction from degrees
   * @param {number} degrees - Direction in degrees
   * @returns {string} Compass direction
   */
  getCompassDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.webSearch.clearCache();
    this.locationPrayerService.clearCaches();
    if (this.newsIntegrationService) {
      this.newsIntegrationService.clearNewsCache();
    }
    console.log('All caches cleared including Al Jazeera news cache');
  }

  /**
   * Extract key facts from Al Jazeera news articles
   * @param {Array} articles - News articles
   * @returns {Array} Key facts
   */
  extractNewsKeyFacts(articles) {
    const facts = [];
    
    articles.forEach(article => {
      // Add headline as key fact
      facts.push({
        type: 'news_headline',
        value: article.title,
        context: `From Al Jazeera ${article.region}`,
        source: 'Al Jazeera',
        url: article.url,
        publishedAt: article.publishedAt
      });
      
      // Add category information
      if (article.category) {
        facts.push({
          type: 'news_category',
          value: article.category,
          context: `News category: ${article.category}`,
          source: 'Al Jazeera'
        });
      }
      
      // Add relevance score if available
      if (article.relevanceScore) {
        facts.push({
          type: 'relevance_score',
          value: article.relevanceScore.toString(),
          context: 'Article relevance to user query',
          source: 'IslamicAI Analysis'
        });
      }
    });
    
    return facts.slice(0, 15); // Limit to top 15 facts
  }

  /**
   * Assess Islamic relevance of news articles
   * @param {Array} articles - News articles
   * @returns {string} Islamic relevance level
   */
  assessNewsIslamicRelevance(articles) {
    if (!articles || articles.length === 0) return 'none';
    
    let islamicCount = 0;
    const islamicKeywords = ['islam', 'muslim', 'islamic', 'quran', 'mosque', 'palestine', 'ramadan', 'eid', 'hajj', 'umrah'];
    
    articles.forEach(article => {
      const text = `${article.title} ${article.summary || ''}`.toLowerCase();
      const hasIslamicContent = islamicKeywords.some(keyword => text.includes(keyword));
      if (hasIslamicContent) islamicCount++;
    });
    
    const islamicRatio = islamicCount / articles.length;
    
    if (islamicRatio >= 0.7) return 'high';
    if (islamicRatio >= 0.4) return 'medium';
    if (islamicRatio >= 0.1) return 'low';
    return 'minimal';
  }

  /**
   * Create enhanced prompt with Al Jazeera news data
   * @param {Object} processedData - Processed news data
   * @param {string} userMessage - Original user message
   * @param {Object} newsData - Raw news integration data
   * @returns {string} Enhanced prompt
   */
  createAlJazeeraNewsPrompt(processedData, userMessage, newsData) {
    let enhancedPrompt = `\n## Al Jazeera News Integration\n\n`;
    enhancedPrompt += `**User Query:** ${userMessage}\n`;
    enhancedPrompt += `**News Source:** Al Jazeera (Multiple Regions)\n`;
    enhancedPrompt += `**Articles Found:** ${processedData.articlesFound}\n`;
    enhancedPrompt += `**Islamic Relevance:** ${processedData.islamicRelevance}\n`;
    enhancedPrompt += `**Data Quality:** ${processedData.dataQuality}\n`;
    enhancedPrompt += `**Retrieved:** ${processedData.timestamp}\n\n`;
    
    enhancedPrompt += `### Current Al Jazeera News Articles:\n\n`;
    
    processedData.results.slice(0, 5).forEach((article, index) => {
      enhancedPrompt += `**${index + 1}. ${article.title}**\n`;
      enhancedPrompt += `- **Region:** ${article.region}\n`;
      enhancedPrompt += `- **Category:** ${article.category}\n`;
      enhancedPrompt += `- **Published:** ${new Date(article.publishedAt).toLocaleDateString()}\n`;
      if (article.author && article.author !== 'Al Jazeera') {
        enhancedPrompt += `- **Author:** ${article.author}\n`;
      }
      if (article.summary) {
        enhancedPrompt += `- **Summary:** ${article.summary}\n`;
      }
      if (article.relevanceScore) {
        enhancedPrompt += `- **Relevance:** ${article.relevanceScore}/10\n`;
      }
      enhancedPrompt += `- **Source:** ${article.url}\n\n`;
    });
    
    // Add regional distribution if available
    if (processedData.newsCategories) {
      enhancedPrompt += `### News Distribution by Category:\n`;
      Object.entries(processedData.newsCategories).forEach(([category, articles]) => {
        if (articles.length > 0) {
          enhancedPrompt += `- **${category.charAt(0).toUpperCase() + category.slice(1)}:** ${articles.length} articles\n`;
        }
      });
      enhancedPrompt += `\n`;
    }
    
    enhancedPrompt += `### Integration Instructions for Islamic AI:\n`;
    enhancedPrompt += `1. **Use Current News Context:** Integrate these Al Jazeera news articles into your response\n`;
    enhancedPrompt += `2. **Islamic Perspective:** Provide Islamic context and guidance related to the news\n`;
    enhancedPrompt += `3. **Source Attribution:** Mention Al Jazeera as the news source when referencing articles\n`;
    enhancedPrompt += `4. **Balanced Response:** Balance current events with timeless Islamic wisdom\n`;
    enhancedPrompt += `5. **Authentic Guidance:** Ensure all Islamic guidance is authentic and scholarly\n`;
    enhancedPrompt += `6. **Current Relevance:** Emphasize how Islamic teachings apply to current events\n`;
    enhancedPrompt += `7. **Community Context:** Consider the impact on Muslim communities worldwide\n`;
    enhancedPrompt += `8. **Appropriate Closing:** End with "Allah knows best" or similar Islamic closing\n\n`;
    
    enhancedPrompt += `### Special Notes:\n`;
    enhancedPrompt += `- This information is current as of ${new Date().toLocaleDateString()}\n`;
    enhancedPrompt += `- Al Jazeera is a reputable international news source\n`;
    enhancedPrompt += `- Encourage users to verify important news from multiple sources\n`;
    enhancedPrompt += `- Provide Islamic context for news events when relevant\n`;
    enhancedPrompt += `- Be sensitive to the emotional impact of news on Muslim communities\n\n`;
    
    return enhancedPrompt;
  }

  /**
   * Determine if a query should trigger Gemini's Google Search
   * @param {string} userMessage - User's message
   * @returns {boolean} Whether to trigger Google Search
   */
  shouldTriggerGeminiSearch(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // High-confidence triggers for Google Search
    const highConfidenceTriggers = [
      // Current events and news
      'latest news', 'current news', 'breaking news', 'today news', 'what happened',
      'recent events', 'latest updates', 'current events', 'news today',
      
      // Financial data
      'gold price', 'silver price', 'oil price', 'currency rate', 'exchange rate',
      'stock market', 'stock price', 'share price', 'market update',
      
      // Current dates and times
      'today date', 'current date', 'what time', 'current time',
      
      // Weather
      'weather today', 'current weather', 'temperature today',
      
      // Technology
      'latest technology', 'new technology', 'tech news', 'latest gadgets',
      
      // Sports
      'latest sports', 'sports news', 'match result', 'game score',
      
      // Islamic current events
      'islamic news', 'muslim news', 'ummah news', 'current islamic events'
    ];
    
    // Check if any high-confidence trigger is present
    return highConfidenceTriggers.some(trigger => lowerMessage.includes(trigger));
  }
}
