/**
 * Internet Data Processor for IslamicAI
 * Processes and integrates real-time internet data with AI responses
 * Now includes Al Jazeera news integration
 */

import { LocationPrayerService } from './location-prayer-service.js';

export class InternetDataProcessor {
  constructor() {
    // Simplified - removed custom search implementations
    this.locationPrayerService = new LocationPrayerService();
    
    // Configuration to rely entirely on Gemini's built-in Google Search
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
        'gold_prices',
        'current_prices',
        'quran_verses',
        'hadith_references',
        'fiqh_guidance',
        'historical_events'
      ],
      
      // Settings to rely entirely on Gemini search
      validateData: false,
      requireIslamicSources: false,
      maxDataAge: 6 * 60 * 60 * 1000,
      
      // Response integration rules
      integrateWithResponse: true,
      addSourceAttribution: false,
      addTimestamp: false,
      addDisclaimer: false,
      
      // Processing rules - rely entirely on Gemini's Google Search
      enableSemanticSearch: false,
      enableAISearch: false,
      maxSearchResults: 0, // Not used since we're relying on Gemini
      searchTimeout: 0, // Not used since we're relying on Gemini
      cacheTTL: 15 * 60 * 1000,
      
      // Rely entirely on Gemini's built-in Google Search
      relyOnGeminiSearch: true,
      minConfidenceForGeminiSearch: 0.7,
      useGeminiSearchExclusively: true // Use only Gemini's Google Search
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
      
      // Rely entirely on Gemini's built-in Google Search
      if (this.processingRules.useGeminiSearchExclusively) {
        console.log('Using Gemini built-in Google Search exclusively');
        
        // Check if this is a query that should trigger Google Search
        const shouldTriggerSearch = this.shouldTriggerGeminiSearch(userMessage);
        
        if (shouldTriggerSearch) {
          console.log('Query requires real-time data, will trigger Gemini Google Search');
          this.performanceMetrics.searchTriggers++;
          
          // Return a result that indicates Gemini should do the search
          const result = {
            needsInternetData: true,
            reason: 'gemini_search_recommended',
            data: null,
            enhancedPrompt: `USER QUERY REQUIRES REAL-TIME DATA: ${userMessage}\nPlease use Google Search to find current information about this topic.`,
            searchResults: null,
            fromGeminiSearch: true
          };
          this.storeInCache(userMessage, result);
          this._updatePerformanceMetrics(startTime);
          return result;
        } else {
          // For queries that don't need real-time data
          console.log('Query does not require real-time data');
          const result = {
            needsInternetData: false,
            reason: 'no_real_time_data_needed',
            data: null,
            enhancedPrompt: ''
          };
          this.storeInCache(userMessage, result);
          this._updatePerformanceMetrics(startTime);
          return result;
        }
      }
      
      // Fallback (should not be reached with useGeminiSearchExclusively = true)
      const result = {
        needsInternetData: false,
        reason: 'fallback_no_search',
        data: null,
        enhancedPrompt: ''
      };
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
      this.storeInCache(userMessage, result);
      this._updatePerformanceMetrics(startTime);
      return result;
    }
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
      // Reduce cache TTL for news queries to ensure fresh data
      const isNewsQuery = this.shouldTriggerGeminiSearch(query);
      const cacheTTL = isNewsQuery ? (2 * 60 * 1000) : this.processingRules.cacheTTL; // 2 minutes for news, 15 minutes for others
      
      if (Date.now() - timestamp < cacheTTL) {
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
   * Determine if a query should trigger Gemini's Google Search
   * @param {string} userMessage - User's message
   * @returns {boolean} Whether to trigger Google Search
   */
  shouldTriggerGeminiSearch(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Keywords that indicate the query is about general Islamic knowledge (no search needed)
    const generalIslamicKeywords = [
      'meaning of', 'meaning', 'definition of', 'definition', 'explain', 'explanation',
      'concept of', 'concept', 'what is tawhid', 'what is tauhid', 'what is iman',
      'what is islam', 'pillars of', 'five pillars', 'six articles', 'articles of faith',
      'life of prophet', 'prophet muhammad', 'seerah', 'history of', 'story of',
      'teachings of', 'principles of', 'fundamentals of', 'basics of', 'introduction to'
    ];
    
    // Check if this is a general Islamic knowledge query
    const isGeneralIslamicQuery = generalIslamicKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // If it's a general Islamic knowledge query, don't trigger search
    if (isGeneralIslamicQuery) {
      return false;
    }
    
    // Comprehensive triggers for Google Search - focused on current/real-time data needs
    const searchTriggers = [
      // Current events and news
      'latest news', 'current news', 'breaking news', 'today news', 'what happened',
      'recent events', 'latest updates', 'current events', 'news today',
      'breaking', 'happening now', 'latest development',
      'gaza news', 'palestine news', 'israel news', 'middle east news',
      'war news', 'conflict news', 'crisis news',
      
      // Financial data
      'gold price', 'silver price', 'oil price', 'currency rate', 'exchange rate',
      'stock market', 'stock price', 'share price', 'market update',
      'bitcoin price', 'cryptocurrency', 'crypto price',
      
      // Current dates and times
      'today date', 'current date', 'what time', 'current time',
      'what day', 'what month', 'what year',
      
      // Weather
      'weather today', 'current weather', 'temperature today',
      'weather forecast', 'rain today', 'sunny today',
      
      // Technology
      'latest technology', 'new technology', 'tech news', 'latest gadgets',
      'new phone', 'latest smartphone', 'tech update',
      
      // Sports
      'latest sports', 'sports news', 'match result', 'game score',
      'football score', 'cricket score', 'basketball score',
      
      // Islamic current events
      'islamic news', 'muslim news', 'ummah news', 'current islamic events',
      'mosque event', 'islamic center event', 'muslim community news',
      
      // Scientific/medical
      'latest research', 'scientific discovery', 'medical update',
      'new treatment', 'health news', 'medical breakthrough',
      
      // General current information
      'what is the', 'what are the', 'current status', 'latest information',
      'recent study', 'new study', 'research findings',
      
      // Questions about current state
      'how much', 'how many', 'what is current', 'what is latest',
      'current situation', 'present condition', 'nowadays',
      
      // Event-specific
      'upcoming event', 'next event', 'future event',
      'conference', 'seminar', 'workshop', 'meeting',
      
      // Location-based current info
      'in my city', 'near me', 'local news', 'local events',
      'in my area', 'around here', 'nearby',
      
      // Time-sensitive queries
      'today', 'now', 'current', 'latest', 'recent', '2024', '2025',
      'bataa', 'batao', 'bata', 'kya hai', 'kya ho raha', 'kya chal raha'
    ];
    
    // Special handling for prayer times - these always need current data
    const prayerTimeTriggers = [
      'prayer time', 'namaz time', 'azaan time', 'prayer schedule',
      'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
      'salah time', 'prayer times today', 'when is',
      'azaan', 'adhan', 'iqamah',
      'next prayer', 'current prayer', 'prayer for today'
    ];
    
    // Check if any general trigger is present
    const hasGeneralTrigger = searchTriggers.some(trigger => lowerMessage.includes(trigger));
    
    // Check if prayer time trigger is present
    const hasPrayerTimeTrigger = prayerTimeTriggers.some(trigger => lowerMessage.includes(trigger));
    
    // Return true if either general trigger or prayer time trigger is present
    return hasGeneralTrigger || hasPrayerTimeTrigger;
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.locationPrayerService.clearCaches();
    console.log('All caches cleared');
  }

  /**
   * Get processing statistics
   * @returns {Object} Processing statistics
   */
  getProcessingStats() {
    return {
      processingRules: this.processingRules,
      timestamp: new Date().toISOString()
    };
  }
}