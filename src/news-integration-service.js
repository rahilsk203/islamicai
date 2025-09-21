/**
 * News Integration Service for IslamicAI
 * Integrates Al Jazeera news scraping with the main AI system
 */

import { AlJazeeraNewsScraper } from './aljazeera-news-scraper.js';

export class NewsIntegrationService {
  constructor() {
    this.newsScraper = new AlJazeeraNewsScraper();
    this.isInitialized = false;
    
    // News categories mapping
    this.newsCategories = {
      islamic: ['islam', 'muslim', 'islamic', 'mosque', 'quran', 'hadith', 'ramadan', 'eid', 'hajj', 'umrah'],
      middleEast: ['palestine', 'israel', 'syria', 'lebanon', 'jordan', 'egypt', 'saudi arabia', 'uae'],
      world: ['politics', 'international', 'global', 'world', 'breaking'],
      social: ['community', 'society', 'culture', 'education', 'health'],
      economy: ['economy', 'business', 'finance', 'trade', 'market']
    };
    
    // Response templates
    this.responseTemplates = {
      newsFound: `I found recent news from Al Jazeera that might be relevant to your query. Here's what I discovered:`,
      noNews: `I couldn't find specific recent news about that topic, but I can share general Islamic guidance on the matter.`,
      searchError: `I encountered some difficulty accessing the latest news, but I can still help you with Islamic guidance based on my knowledge.`
    };
  }

  /**
   * Initialize the news integration service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.newsScraper.initialize();
      this.isInitialized = true;
      console.log('News Integration Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize News Integration Service:', error);
      throw error;
    }
  }

  /**
   * Check if user query needs news integration
   * @param {string} userMessage - User's message
   * @returns {Object} Decision and reasoning
   */
  shouldIntegrateNews(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Keywords that indicate need for current news
    const newsKeywords = [
      'latest', 'recent', 'current', 'news', 'today', 'yesterday', 'happening',
      'update', 'breaking', 'now', 'current events', 'what\'s happening',
      'recent developments', 'latest news', 'current situation'
    ];
    
    // Islamic news keywords
    const islamicNewsKeywords = [
      'islamic news', 'muslim news', 'islamic events', 'muslim community',
      'islamic world', 'muslim countries', 'islamic organizations',
      'ramadan news', 'eid celebrations', 'hajj updates', 'mosque news'
    ];
    
    // Regional keywords
    const regionalKeywords = [
      'palestine', 'gaza', 'jerusalem', 'middle east', 'arab world',
      'muslim world', 'islamic countries', 'muslim majority'
    ];
    
    const hasNewsKeywords = newsKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasIslamicNewsKeywords = islamicNewsKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasRegionalKeywords = regionalKeywords.some(keyword => lowerMessage.includes(keyword));
    
    const needsNews = hasNewsKeywords || hasIslamicNewsKeywords || hasRegionalKeywords;
    
    return {
      needsNews,
      reason: hasIslamicNewsKeywords ? 'islamic_news' : 
              hasRegionalKeywords ? 'regional_news' :
              hasNewsKeywords ? 'general_news' : 'no_news_needed',
      priority: hasIslamicNewsKeywords ? 'high' : 
                hasRegionalKeywords ? 'medium' : 'low'
    };
  }

  /**
   * Get relevant news for user query
   * @param {string} userMessage - User's message
   * @param {Object} options - Search options
   * @returns {Promise<Object>} News results and integration data
   */
  async getRelevantNews(userMessage, options = {}) {
    const {
      maxArticles = 10,
      regions = ['main', 'middleEast', 'africa'],
      forceRefresh = false
    } = options;
    
    try {
      await this.initialize();
      
      const newsDecision = this.shouldIntegrateNews(userMessage);
      
      if (!newsDecision.needsNews) {
        return {
          hasNews: false,
          reason: newsDecision.reason,
          enhancedPrompt: ''
        };
      }
      
      console.log(`Fetching news for query: ${userMessage}`);
      
      // Get fresh news data
      const newsData = await this.newsScraper.scrapeAllNews({
        regions,
        maxArticles,
        forceRefresh
      });
      
      if (!newsData.articles || newsData.articles.length === 0) {
        return {
          hasNews: false,
          reason: 'no_articles_found',
          enhancedPrompt: this.responseTemplates.noNews
        };
      }
      
      // Search for relevant articles
      const searchResults = await this.searchRelevantArticles(userMessage, newsData.articles);
      
      if (searchResults.results.length === 0) {
        return {
          hasNews: false,
          reason: 'no_relevant_articles',
          enhancedPrompt: this.responseTemplates.noNews
        };
      }
      
      // Create enhanced prompt with news data
      const enhancedPrompt = this.createNewsEnhancedPrompt(userMessage, searchResults);
      
      return {
        hasNews: true,
        reason: newsDecision.reason,
        newsData: searchResults,
        enhancedPrompt,
        articlesFound: searchResults.results.length,
        categories: this.categorizeNews(searchResults.results)
      };
      
    } catch (error) {
      console.error('Error getting relevant news:', error);
      return {
        hasNews: false,
        reason: 'search_error',
        error: error.message,
        enhancedPrompt: this.responseTemplates.searchError
      };
    }
  }

  /**
   * Search for relevant articles based on user query
   * @param {string} query - User query
   * @param {Array} articles - Available articles
   * @returns {Object} Search results
   */
  async searchRelevantArticles(query, articles) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredArticles = [];
    
    articles.forEach(article => {
      let relevanceScore = 0;
      const titleWords = (article.title || '').toLowerCase();
      const summaryWords = (article.summary || '').toLowerCase();
      const categoryWords = (article.category || '').toLowerCase();
      const contentWords = (article.content || '').toLowerCase();
      
      // Score based on different fields
      queryWords.forEach(word => {
        if (titleWords.includes(word)) relevanceScore += 5;
        if (summaryWords.includes(word)) relevanceScore += 3;
        if (categoryWords.includes(word)) relevanceScore += 2;
        if (contentWords.includes(word)) relevanceScore += 1;
      });
      
      // Boost Islamic content
      const islamicWords = this.newsCategories.islamic;
      islamicWords.forEach(islamicWord => {
        if (titleWords.includes(islamicWord)) relevanceScore += 3;
        if (summaryWords.includes(islamicWord)) relevanceScore += 2;
      });
      
      // Boost recent articles
      const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) relevanceScore += 2;
      else if (hoursOld < 48) relevanceScore += 1;
      
      if (relevanceScore > 0) {
        scoredArticles.push({
          ...article,
          relevanceScore
        });
      }
    });
    
    // Sort by relevance score
    const sortedArticles = scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return {
      query,
      results: sortedArticles.slice(0, 5), // Top 5 most relevant
      totalFound: sortedArticles.length,
      searchedAt: new Date().toISOString()
    };
  }

  /**
   * Create enhanced prompt with news data
   * @param {string} userMessage - Original user message
   * @param {Object} searchResults - Search results
   * @returns {string} Enhanced prompt for AI
   */
  createNewsEnhancedPrompt(userMessage, searchResults) {
    let enhancedPrompt = `\n## Real-Time Al Jazeera News Integration\n\n`;
    enhancedPrompt += `**User Query:** ${userMessage}\n`;
    enhancedPrompt += `**Relevant Articles Found:** ${searchResults.results.length}\n`;
    enhancedPrompt += `**Search Date:** ${searchResults.searchedAt}\n\n`;
    
    enhancedPrompt += `### Current News Articles:\n\n`;
    
    searchResults.results.forEach((article, index) => {
      enhancedPrompt += `**${index + 1}. ${article.title}**\n`;
      enhancedPrompt += `- **Region:** ${article.region}\n`;
      enhancedPrompt += `- **Category:** ${article.category}\n`;
      enhancedPrompt += `- **Published:** ${new Date(article.publishedAt).toLocaleDateString()}\n`;
      enhancedPrompt += `- **Relevance Score:** ${article.relevanceScore}\n`;
      
      if (article.summary) {
        enhancedPrompt += `- **Summary:** ${article.summary}\n`;
      }
      
      if (article.content && article.content.length > 0) {
        const shortContent = article.content.length > 300 ? 
          article.content.substring(0, 300) + '...' : article.content;
        enhancedPrompt += `- **Content:** ${shortContent}\n`;
      }
      
      enhancedPrompt += `- **Source:** ${article.url}\n\n`;
    });
    
    enhancedPrompt += `### Integration Instructions:\n`;
    enhancedPrompt += `1. Use this current news information to enhance your response\n`;
    enhancedPrompt += `2. Reference specific articles when relevant to the user's query\n`;
    enhancedPrompt += `3. Maintain Islamic authenticity and provide appropriate Islamic guidance\n`;
    enhancedPrompt += `4. Connect current events to Islamic teachings and principles\n`;
    enhancedPrompt += `5. Cite Al Jazeera as the source when referencing specific news\n`;
    enhancedPrompt += `6. Balance current information with timeless Islamic wisdom\n`;
    enhancedPrompt += `7. End with appropriate Islamic closing (Allah knows best)\n\n`;
    
    enhancedPrompt += `**Note:** This information is from Al Jazeera and represents current news. Always encourage users to verify important news from multiple authentic sources and seek guidance from qualified Islamic scholars for religious matters.\n`;
    
    return enhancedPrompt;
  }

  /**
   * Categorize news articles
   * @param {Array} articles - Articles to categorize
   * @returns {Object} Categorized articles
   */
  categorizeNews(articles) {
    const categories = {
      islamic: [],
      middleEast: [],
      world: [],
      social: [],
      economy: [],
      other: []
    };
    
    articles.forEach(article => {
      const title = (article.title || '').toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const content = title + ' ' + summary;
      
      let categorized = false;
      
      // Check each category
      Object.entries(this.newsCategories).forEach(([category, keywords]) => {
        if (!categorized && keywords.some(keyword => content.includes(keyword))) {
          categories[category].push(article);
          categorized = true;
        }
      });
      
      // If not categorized, put in 'other'
      if (!categorized) {
        categories.other.push(article);
      }
    });
    
    return categories;
  }

  /**
   * Get news statistics
   * @returns {Promise<Object>} News statistics
   */
  async getNewsStatistics() {
    try {
      await this.initialize();
      return await this.newsScraper.getNewsStats();
    } catch (error) {
      console.error('Error getting news statistics:', error);
      return null;
    }
  }

  /**
   * Clear news cache
   */
  async clearNewsCache() {
    try {
      await this.initialize();
      await this.newsScraper.clearData();
      console.log('News cache cleared successfully');
    } catch (error) {
      console.error('Error clearing news cache:', error);
    }
  }

  /**
   * Format news for user display
   * @param {Object} newsData - News data
   * @returns {string} Formatted news for display
   */
  formatNewsForUser(newsData) {
    if (!newsData.hasNews || !newsData.newsData) {
      return '';
    }
    
    const { results } = newsData.newsData;
    
    let formatted = `\n📰 **Recent Al Jazeera News:**\n\n`;
    
    results.slice(0, 3).forEach((article, index) => {
      formatted += `**${index + 1}. ${article.title}**\n`;
      formatted += `🌍 ${article.region} • 📅 ${new Date(article.publishedAt).toLocaleDateString()}\n`;
      
      if (article.summary) {
        formatted += `${article.summary}\n`;
      }
      
      formatted += `🔗 [Read more](${article.url})\n\n`;
    });
    
    return formatted;
  }

  /**
   * Get trending topics from recent news
   * @returns {Promise<Array>} Trending topics
   */
  async getTrendingTopics() {
    try {
      await this.initialize();
      
      // Get recent news
      const newsData = await this.newsScraper.scrapeAllNews({
        regions: ['main', 'middleEast', 'world'],
        maxArticles: 50
      });
      
      if (!newsData.articles) {
        return [];
      }
      
      // Extract trending topics from titles and summaries
      const wordFreq = new Map();
      
      newsData.articles.forEach(article => {
        const text = `${article.title} ${article.summary || ''}`.toLowerCase();
        const words = text.split(/\s+/).filter(word => 
          word.length > 3 && 
          !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
        );
        
        words.forEach(word => {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });
      });
      
      // Get top trending words
      const trending = Array.from(wordFreq.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ topic: word, mentions: count }));
      
      return trending;
      
    } catch (error) {
      console.error('Error getting trending topics:', error);
      return [];
    }
  }
}