/**
 * Internet Data Processor for IslamicAI
 * Processes and integrates real-time internet data with AI responses
 */

import { WebSearch } from './web-search.js';
import { LocationPrayerService } from './location-prayer-service.js';

export class InternetDataProcessor {
  constructor() {
    this.webSearch = new WebSearch();
    this.locationPrayerService = new LocationPrayerService();
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
        'breaking_news'
      ],
      
      // Rules for data validation
      validateData: true,
      requireIslamicSources: false, // Can use general sources for current info
      maxDataAge: 24 * 60 * 60 * 1000, // 24 hours
      
      // Response integration rules
      integrateWithResponse: true,
      addSourceAttribution: true,
      addTimestamp: true,
      addDisclaimer: true
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
    try {
      console.log('Processing query for internet data needs:', userMessage);
      
      // Check if query needs internet search
      const searchDecision = this.webSearch.needsInternetSearch(userMessage);
      
      // Check if query is about prayer times and we have user IP
      const isPrayerTimeQuery = this.isPrayerTimeQuery(userMessage);
      if (isPrayerTimeQuery && userIP) {
        console.log('Detected prayer time query with user IP, getting location-based prayer times');
        return await this.processLocationBasedPrayerTimes(userMessage, userIP, context);
      }
      
      if (!searchDecision.needsSearch) {
        return {
          needsInternetData: false,
          reason: searchDecision.reason,
          data: null,
          enhancedPrompt: ''
        };
      }

      console.log(`Query needs internet search: ${searchDecision.reason}`);
      
      // Perform search
      const searchResults = await this.webSearch.search(userMessage, {
        maxResults: 5,
        includeIslamicSources: this.processingRules.requireIslamicSources,
        searchEngines: ['duckduckgo'] // Start with free engine
      });

      if (!searchResults.success || !searchResults.results.length) {
        console.log('No internet data found, falling back to training data');
        return {
          needsInternetData: false,
          reason: 'no_data_found',
          data: null,
          enhancedPrompt: ''
        };
      }

      // Check if we have intelligent search results
      if (searchResults.intelligent) {
        console.log('Using intelligent search results');
      }

      // Process and validate the data
      const processedData = await this.processSearchResults(searchResults, userMessage);
      
      // Create enhanced prompt with internet data
      const enhancedPrompt = this.createEnhancedPrompt(processedData, userMessage, context, searchResults);
      
      return {
        needsInternetData: true,
        reason: searchDecision.reason,
        data: processedData,
        enhancedPrompt: enhancedPrompt,
        searchResults: searchResults
      };

    } catch (error) {
      console.error('Internet data processing error:', error);
      return {
        needsInternetData: false,
        reason: 'processing_error',
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
   * Clear all caches
   */
  clearCaches() {
    this.webSearch.clearCache();
    this.locationPrayerService.clearCaches();
    console.log('All caches cleared');
  }
}
