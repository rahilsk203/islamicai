/**
 * Internet Data Processor for IslamicAI
 * Processes and integrates real-time internet data with AI responses
 * Now includes Al Jazeera news integration
 */

import { WebSearch } from './web-search.js';
import { LocationPrayerService } from './location-prayer-service.js';
import { NewsIntegrationService } from './news-integration-service.js';
import { TimesPrayerScraper } from './times-prayer-scraper.js';
import { PerformanceOptimizer } from './performance-optimizer.js';

export class InternetDataProcessor {
  constructor() {
    this.webSearch = new WebSearch();
    this.locationPrayerService = new LocationPrayerService();
    this.newsIntegrationService = new NewsIntegrationService();
    this.timesPrayerScraper = new TimesPrayerScraper();
    this.performanceOptimizer = new PerformanceOptimizer();
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
        'timesprayer_org',
        'kolkata_prayer_times',
        'indian_prayer_times'
      ],
      
      // Rules for data validation
      validateData: true,
      requireIslamicSources: false, // Can use general sources for current info
      maxDataAge: 24 * 60 * 60 * 1000, // 24 hours
      
      // Response integration rules
      integrateWithResponse: true,
      addSourceAttribution: true,
      addTimestamp: true,
      addDisclaimer: true,
      includeAlJazeeraNews: true // Enable Al Jazeera news integration
    };
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
      
      // ⚡ Priority 1: TimesPrayer integration for Indian cities (DSA-optimized)
      console.log('⚡ Checking TimesPrayer integration with DSA optimization...');
      if (await this.performanceOptimizer.isTimesPrayerQueryOptimized(userMessage)) {
        console.log('🕰️ DSA-detected TimesPrayer query - processing with optimization...');
        const result = await this.processTimesPrayerIntegration(userMessage, context);
        
        // ⚡ Cache optimized TimesPrayer data for future O(1) retrieval
        if (result.needsInternetData) {
          await this.performanceOptimizer.cacheInternetData(
            userMessage,
            result.data,
            result.enhancedPrompt,
            'timesprayer'
          );
        }
        
        result.processingTime = Date.now() - startTime;
        console.log(`⚡ TimesPrayer processed with DSA optimization in ${result.processingTime}ms`);
        return result;
      }
      
      // ⚡ Priority 2: Location-based prayer times with DSA optimization
      const isPrayerTimeQuery = this.isPrayerTimeQuery(userMessage);
      if (isPrayerTimeQuery && userIP) {
        console.log('⚡ Detected prayer time query with user IP - processing with DSA optimization...');
        const result = await this.processLocationBasedPrayerTimes(userMessage, userIP, context);
        
        // ⚡ Cache optimized location-based prayer data
        if (result.needsInternetData) {
          await this.performanceOptimizer.cacheInternetData(
            userMessage,
            result.data,
            result.enhancedPrompt,
            'location_prayer'
          );
        }
        
        result.processingTime = Date.now() - startTime;
        console.log(`⚡ Location prayer times processed with DSA optimization in ${result.processingTime}ms`);
        return result;
      }
      
      // ⚡ Priority 3: Al Jazeera News integration (DSA-optimized)
      if (this.processingRules.includeAlJazeeraNews) {
        console.log('⚡ Checking Al Jazeera news integration with DSA optimization...');
        const newsDecision = await this.performanceOptimizer.analyzeNewsRequirement(userMessage);
        
        if (newsDecision.needsNews) {
          console.log('📰 DSA-detected news query - processing with optimization...');
          const result = await this.processAlJazeeraNewsIntegration(userMessage, context, userIP);
          
          // ⚡ Cache optimized news data for future O(1) retrieval
          if (result.needsInternetData) {
            await this.performanceOptimizer.cacheInternetData(
              userMessage,
              result.data,
              result.enhancedPrompt,
              'aljazeera'
            );
          }
          
          result.processingTime = Date.now() - startTime;
          console.log(`⚡ Al Jazeera news processed with DSA optimization in ${result.processingTime}ms`);
          return result;
        }
      }
      
      // ⚡ Priority 4: General web search with DSA optimization
      const searchDecision = await this.performanceOptimizer.analyzeSearchRequirement(userMessage);
      
      if (!searchDecision.needsSearch) {
        // ⚡ Cache no-internet-data result for O(1) future lookups
        await this.performanceOptimizer.cacheNoInternetDataResult(userMessage);
        
        const processingTime = Date.now() - startTime;
        console.log(`⚡ No internet data needed - processed with DSA optimization in ${processingTime}ms`);
        
        return {
          needsInternetData: false,
          reason: searchDecision.reason,
          data: null,
          enhancedPrompt: '',
          processingTime
        };
      }

      console.log(`⚡ Query needs internet search with DSA optimization: ${searchDecision.reason}`);
      
      // Perform search with optimization hints
      const searchResults = await this.webSearch.search(userMessage, {
        maxResults: 5,
        includeIslamicSources: this.processingRules.requireIslamicSources,
        searchEngines: ['duckduckgo'],
        optimizationHints: context.searchHints
      });

      if (!searchResults.success || !searchResults.results.length) {
        console.log('⚡ No internet data found with DSA optimization, caching negative result');
        
        // ⚡ Cache negative result to avoid repeated searches
        await this.performanceOptimizer.cacheNoInternetDataResult(userMessage);
        
        const processingTime = Date.now() - startTime;
        return {
          needsInternetData: false,
          reason: 'no_data_found',
          data: null,
          enhancedPrompt: '',
          processingTime
        };
      }

      // Check if we have intelligent search results
      if (searchResults.intelligent) {
        console.log('⚡ Using intelligent search results with DSA optimization');
      }

      // Process and validate the data with DSA optimization
      const processedData = await this.performanceOptimizer.optimizeSearchResultsProcessing(
        searchResults,
        userMessage,
        this.processSearchResults.bind(this)
      );
      
      // Create enhanced prompt with internet data and DSA optimization
      const enhancedPrompt = await this.performanceOptimizer.optimizePromptCreation(
        processedData,
        userMessage,
        context,
        searchResults,
        this.createEnhancedPrompt.bind(this)
      );
      
      // ⚡ Cache optimized search results for future O(1) retrieval
      await this.performanceOptimizer.cacheInternetData(
        userMessage,
        processedData,
        enhancedPrompt,
        'search'
      );
      
      const processingTime = Date.now() - startTime;
      console.log(`⚡ Internet search processed with DSA optimization in ${processingTime}ms`);
      
      return {
        needsInternetData: true,
        reason: searchDecision.reason,
        data: processedData,
        enhancedPrompt: enhancedPrompt,
        searchResults: searchResults,
        processingTime
      };

    } catch (error) {
      console.error('Internet data processing error:', error);
      
      // ⚡ Use DSA-optimized error handling
      const optimizedError = await this.performanceOptimizer.handleInternetDataError(
        error,
        { userMessage, processingTime: Date.now() - startTime }
      );
      
      return {
        needsInternetData: false,
        reason: 'processing_error',
        error: optimizedError.message,
        data: null,
        enhancedPrompt: '',
        processingTime: Date.now() - startTime
      };
    }
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
        regions: ['main', 'middleEast', 'africa', 'asia'],
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

    // Extract key information
    const keyInfo = this.webSearch.extractKeyInformation(searchResults, userMessage);
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
    
    enhancedPrompt += `\n`;

    // Add key facts
    if (processedData.keyFacts.length > 0) {
      enhancedPrompt += `### Key Facts from Current Data:\n`;
      processedData.keyFacts.slice(0, 5).forEach((fact, index) => {
        enhancedPrompt += `${index + 1}. **${fact.type.toUpperCase()}:** ${fact.value}\n`;
        if (fact.context) {
          enhancedPrompt += `   Context: ${fact.context}\n`;
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
   * Clear all caches including DSA-optimized caches
   */
  clearCaches() {
    this.webSearch.clearCache();
    this.locationPrayerService.clearCaches();
    if (this.newsIntegrationService) {
      this.newsIntegrationService.clearNewsCache();
    }
    if (this.timesPrayerScraper) {
      this.timesPrayerScraper.clearCache();
    }
    
    // ⚡ Clear DSA-optimized caches
    this.performanceOptimizer.clearCaches();
    
    console.log('⚡ All caches cleared including DSA optimization caches');
  }
  
  /**
   * Get performance optimizer statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return {
      optimizerStats: this.performanceOptimizer.getMetrics(),
      webSearchStats: this.webSearch.getCacheStats(),
      processingRules: this.processingRules,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if query is for TimesPrayer.org (Indian cities) with DSA optimization
   * @param {string} userMessage - User's message
   * @returns {boolean} Is TimesPrayer query
   */
  isTimesPrayerQuery(userMessage) {
    // ⚡ Use DSA-optimized query analysis
    return this.performanceOptimizer.isTimesPrayerQueryFast(userMessage);
  }

  /**
   * Process TimesPrayer.org integration
   * @param {string} userMessage - User's message
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Processing result with TimesPrayer data
   */
  async processTimesPrayerIntegration(userMessage, context = {}) {
    try {
      console.log('Processing TimesPrayer.org integration for:', userMessage);
      
      // Determine which city based on query
      const cityKey = this.detectIndianCity(userMessage);
      
      // Get prayer times from TimesPrayer.org
      const prayerData = await this.timesPrayerScraper.getPrayerTimes(cityKey, {
        forceRefresh: false
      });
      
      // Process TimesPrayer data for Islamic AI
      const processedData = {
        originalQuery: userMessage,
        timestamp: new Date().toISOString(),
        sources: ['TimesPrayer.org'],
        results: [{
          title: `Prayer Times for ${prayerData.city}`,
          content: this.timesPrayerScraper.formatForAI(prayerData),
          url: this.timesPrayerScraper.cities[cityKey]?.url || 'https://timesprayer.org',
          source: 'TimesPrayer.org',
          type: 'prayer_times',
          relevance: 'high',
          city: prayerData.city,
          prayerTimes: prayerData.times,
          nextPrayer: prayerData.nextPrayer,
          qiblaDirection: prayerData.qiblaDirection
        }],
        keyFacts: this.extractTimesPrayerFacts(prayerData),
        islamicRelevance: 'high',
        dataQuality: 'excellent'
      };
      
      // Create enhanced prompt with TimesPrayer data
      const enhancedPrompt = this.createTimesPrayerPrompt(processedData, userMessage, prayerData);
      
      return {
        needsInternetData: true,
        reason: 'timesprayer_integration',
        data: processedData,
        enhancedPrompt: enhancedPrompt,
        prayerIntegration: true,
        prayerData: prayerData
      };
      
    } catch (error) {
      console.error('TimesPrayer integration error:', error);
      return {
        needsInternetData: false,
        reason: 'timesprayer_error',
        error: error.message,
        data: null,
        enhancedPrompt: ''
      };
    }
  }

  /**
   * Detect Indian city from user query
   * @param {string} userMessage - User's message
   * @returns {string} City key
   */
  detectIndianCity(userMessage) {
    const lowerQuery = userMessage.toLowerCase();
    
    if (lowerQuery.includes('kolkata') || lowerQuery.includes('calcutta')) {
      return 'kolkata';
    }
    if (lowerQuery.includes('delhi')) {
      return 'delhi';
    }
    if (lowerQuery.includes('mumbai')) {
      return 'mumbai';
    }
    
    // Default to Kolkata
    return 'kolkata';
  }

  /**
   * Extract key facts from TimesPrayer data
   * @param {Object} prayerData - Prayer data from TimesPrayer
   * @returns {Array} Key facts
   */
  extractTimesPrayerFacts(prayerData) {
    const facts = [];
    const { times, city, nextPrayer, qiblaDirection, date } = prayerData;
    
    // Add prayer time facts
    Object.entries(times).forEach(([name, time]) => {
      facts.push({
        type: 'prayer_time',
        value: `${name.charAt(0).toUpperCase() + name.slice(1)}: ${time}`,
        context: `Prayer time for ${city}`,
        source: 'TimesPrayer.org'
      });
    });
    
    // Add next prayer fact
    if (nextPrayer) {
      facts.push({
        type: 'next_prayer',
        value: `${nextPrayer.name} at ${nextPrayer.time}`,
        context: nextPrayer.minutesLeft ? `In ${nextPrayer.minutesLeft} minutes` : 'Next prayer',
        source: 'TimesPrayer.org'
      });
    }
    
    // Add Qibla direction fact
    facts.push({
      type: 'qibla_direction',
      value: qiblaDirection,
      context: `Qibla direction for ${city}`,
      source: 'TimesPrayer.org'
    });
    
    // Add Hijri date fact
    facts.push({
      type: 'hijri_date',
      value: date.hijri,
      context: 'Current Islamic date',
      source: 'TimesPrayer.org'
    });
    
    return facts;
  }

  /**
   * Create enhanced prompt with TimesPrayer data
   * @param {Object} processedData - Processed prayer data
   * @param {string} userMessage - Original user message
   * @param {Object} prayerData - Raw prayer data
   * @returns {string} Enhanced prompt
   */
  createTimesPrayerPrompt(processedData, userMessage, prayerData) {
    let enhancedPrompt = `\n## TimesPrayer.org Integration\n\n`;
    enhancedPrompt += `**User Query:** ${userMessage}\n`;
    enhancedPrompt += `**Source:** TimesPrayer.org\n`;
    enhancedPrompt += `**City:** ${prayerData.city}, ${prayerData.country}\n`;
    enhancedPrompt += `**Timezone:** ${prayerData.timezone}\n`;
    enhancedPrompt += `**Date:** ${prayerData.date.gregorian}\n`;
    enhancedPrompt += `**Hijri Date:** ${prayerData.date.hijri}\n`;
    enhancedPrompt += `**Retrieved:** ${processedData.timestamp}\n\n`;
    
    enhancedPrompt += `### Today's Prayer Times for ${prayerData.city}:\n\n`;
    const { times } = prayerData;
    enhancedPrompt += `- **Fajr:** ${times.fajr}\n`;
    enhancedPrompt += `- **Sunrise:** ${times.sunrise}\n`;
    enhancedPrompt += `- **Dhuhr:** ${times.dhuhr}\n`;
    enhancedPrompt += `- **Asr:** ${times.asr}\n`;
    enhancedPrompt += `- **Maghrib:** ${times.maghrib}\n`;
    enhancedPrompt += `- **Isha:** ${times.isha}\n`;
    enhancedPrompt += `- **Sehri:** ${times.sehri}\n\n`;
    
    enhancedPrompt += `### Additional Information:\n`;
    if (prayerData.nextPrayer) {
      enhancedPrompt += `- **Next Prayer:** ${prayerData.nextPrayer.name} at ${prayerData.nextPrayer.time}\n`;
      if (prayerData.nextPrayer.minutesLeft) {
        enhancedPrompt += `- **Time Remaining:** ${prayerData.nextPrayer.minutesLeft} minutes\n`;
      }
    }
    enhancedPrompt += `- **Qibla Direction:** ${prayerData.qiblaDirection}\n`;
    enhancedPrompt += `- **Source URL:** ${this.timesPrayerScraper.cities[this.detectIndianCity(userMessage)]?.url}\n\n`;
    
    enhancedPrompt += `### Integration Instructions for Islamic AI:\n`;
    enhancedPrompt += `1. **Use Current Prayer Times:** Provide these specific prayer times for ${prayerData.city}\n`;
    enhancedPrompt += `2. **Islamic Context:** Include relevant Islamic guidance about prayer times\n`;
    enhancedPrompt += `3. **Local Information:** Mention this is specifically for ${prayerData.city}, India\n`;
    enhancedPrompt += `4. **Next Prayer Alert:** Highlight the next prayer time and its importance\n`;
    enhancedPrompt += `5. **Qibla Direction:** Include Qibla direction information for prayer\n`;
    enhancedPrompt += `6. **Sehri Time:** Mention Sehri time for Ramadan context\n`;
    enhancedPrompt += `7. **Source Attribution:** Credit TimesPrayer.org as the source\n`;
    enhancedPrompt += `8. **Islamic Closing:** End with appropriate Islamic blessing\n\n`;
    
    enhancedPrompt += `### Special Notes:\n`;
    enhancedPrompt += `- These times are specifically calculated for ${prayerData.city}, India\n`;
    enhancedPrompt += `- TimesPrayer.org provides accurate prayer times for Indian cities\n`;
    enhancedPrompt += `- Encourage users to also check with local mosques for community prayer times\n`;
    enhancedPrompt += `- Remind about the importance of praying on time\n\n`;
    
    return enhancedPrompt;
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
}
