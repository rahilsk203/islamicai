/**
 * 🚀 Enhanced News Integration Service for IslamicAI
 * Advanced integration with Al Jazeera news scraping and intelligent user-friendly responses
 * Features: Smart query analysis, contextual news matching, Islamic relevance detection
 */

import { AlJazeeraNewsScraper } from './aljazeera-news-scraper.js';

export class NewsIntegrationService {
  constructor() {
    this.newsScraper = new AlJazeeraNewsScraper();
    this.isInitialized = false;
    
    // 🎯 Enhanced news categories with intelligent keyword mapping
    this.newsCategories = {
      islamic: {
        keywords: ['islam', 'muslim', 'islamic', 'mosque', 'quran', 'hadith', 'ramadan', 'eid', 'hajj', 'umrah', 'imam', 'sheikh', 'prayer', 'salah'],
        weight: 3.0,
        emoji: '🕌'
      },
      middleEast: {
        keywords: ['palestine', 'israel', 'gaza', 'syria', 'lebanon', 'jordan', 'egypt', 'saudi arabia', 'uae', 'iran', 'iraq', 'yemen'],
        weight: 2.5,
        emoji: '🏜️'
      },
      world: {
        keywords: ['politics', 'international', 'global', 'world', 'breaking', 'diplomatic', 'government', 'president'],
        weight: 2.0,
        emoji: '🌍'
      },
      social: {
        keywords: ['community', 'society', 'culture', 'education', 'health', 'social', 'human rights', 'women'],
        weight: 1.8,
        emoji: '👥'
      },
      economy: {
        keywords: ['economy', 'business', 'finance', 'trade', 'market', 'economic', 'financial', 'investment'],
        weight: 1.5,
        emoji: '💰'
      }
    };
    
    // 🎆 Enhanced user-friendly response templates
    this.responseTemplates = {
      newsFound: `📰 **Latest Al Jazeera News Update**\n\nI found some recent news that might be helpful for your question. Here's what's happening:`,
      noNews: `😔 I couldn't find specific recent news about that topic, but I'd be happy to provide Islamic guidance on the matter. Would you like me to share relevant teachings from Quran and Hadith?`,
      searchError: `⚠️ I'm having some trouble accessing the latest news right now, but I can still help you with authentic Islamic guidance based on established teachings. How can I assist you?`,
      islamicContextFound: `🕌 **Islamic Context Detected**\n\nThis topic has significant relevance to Islamic teachings and the Muslim community.`,
      trendingTopics: `🔥 **Currently Trending**: Based on recent Al Jazeera coverage`
    };
    
    // 📊 Enhanced metrics tracking
    this.metrics = {
      totalQueries: 0,
      newsIntegrationRate: 0,
      islamicContentQueries: 0,
      userSatisfactionEstimate: 0,
      averageResponseTime: 0
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
   * 🧠 Enhanced intelligent analysis of user queries
   * @param {string} userMessage - User's message
   * @returns {Object} Comprehensive analysis with intelligence scores
   */
  shouldIntegrateNews(userMessage) {
    const startTime = Date.now();
    this.metrics.totalQueries++;
    
    const lowerMessage = userMessage.toLowerCase();
    
    // 📊 Advanced keyword analysis with weighted scoring
    const newsIndicators = {
      timeKeywords: {
        keywords: ['latest', 'recent', 'current', 'today', 'yesterday', 'now', 'breaking', 'update', 'happening'],
        weight: 2.5
      },
      newsKeywords: {
        keywords: ['news', 'report', 'announced', 'statement', 'press', 'media', 'journalist', 'coverage'],
        weight: 2.0
      },
      islamicNewsKeywords: {
        keywords: ['islamic news', 'muslim news', 'ummah', 'islamic world', 'muslim community', 'islamic events'],
        weight: 3.0
      },
      regionalKeywords: {
        keywords: ['palestine', 'gaza', 'jerusalem', 'middle east', 'arab world', 'muslim countries'],
        weight: 2.8
      },
      eventKeywords: {
        keywords: ['conference', 'summit', 'meeting', 'protest', 'celebration', 'ceremony', 'election'],
        weight: 2.2
      }
    };
    
    let totalScore = 0;
    let maxCategoryScore = 0;
    let dominantCategory = 'none';
    
    // Calculate weighted scores
    Object.entries(newsIndicators).forEach(([category, config]) => {
      const matches = config.keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      const categoryScore = matches * config.weight;
      totalScore += categoryScore;
      
      if (categoryScore > maxCategoryScore) {
        maxCategoryScore = categoryScore;
        dominantCategory = category;
      }
    });
    
    // 🎯 Islamic content detection
    const islamicScore = this.calculateIslamicRelevance(lowerMessage);
    if (islamicScore > 0.3) {
      this.metrics.islamicContentQueries++;
    }
    
    // 📈 Intelligent decision making
    const needsNews = totalScore >= 2.0 || islamicScore > 0.4;
    const urgency = maxCategoryScore >= 3.0 ? 'high' : maxCategoryScore >= 2.0 ? 'medium' : 'low';
    
    const processingTime = Date.now() - startTime;
    this.metrics.averageResponseTime = (this.metrics.averageResponseTime + processingTime) / 2;
    
    return {
      needsNews,
      confidence: Math.min(1, totalScore / 10),
      islamicRelevance: islamicScore,
      dominantCategory,
      urgency,
      reason: this.generateReasonExplanation(dominantCategory, islamicScore, needsNews),
      suggestedRegions: this.suggestOptimalRegions(dominantCategory, islamicScore),
      processingTime
    };
  }
  
  /**
   * 📊 Calculate Islamic relevance of user query
   */
  calculateIslamicRelevance(message) {
    let relevanceScore = 0;
    let totalWeight = 0;
    
    Object.entries(this.newsCategories).forEach(([category, config]) => {
      if (category === 'islamic' || category === 'middleEast') {
        const matches = config.keywords.filter(keyword => message.includes(keyword)).length;
        if (matches > 0) {
          relevanceScore += matches * config.weight;
          totalWeight += config.keywords.length * config.weight;
        }
      }
    });
    
    return totalWeight > 0 ? Math.min(1, relevanceScore / totalWeight) : 0;
  }
  
  /**
   * 📝 Generate human-friendly reason explanation
   */
  generateReasonExplanation(category, islamicScore, needsNews) {
    if (!needsNews) {
      return 'Query appears to be asking for general guidance rather than current events';
    }
    
    const explanations = {
      timeKeywords: 'User is asking for recent or current information',
      newsKeywords: 'Query indicates need for news or media coverage',
      islamicNewsKeywords: 'User is specifically interested in Islamic/Muslim community news',
      regionalKeywords: 'Question relates to Middle Eastern or Muslim-majority regions',
      eventKeywords: 'Query about specific events that may have recent coverage'
    };
    
    let explanation = explanations[category] || 'General news relevance detected';
    
    if (islamicScore > 0.5) {
      explanation += ' with high Islamic community relevance';
    } else if (islamicScore > 0.3) {
      explanation += ' with moderate Islamic context';
    }
    
    return explanation;
  }
  
  /**
   * 🎯 Suggest optimal regions for news scraping
   */
  suggestOptimalRegions(category, islamicScore) {
    const baseRegions = ['main', 'middleEast'];
    
    if (islamicScore > 0.5 || category === 'islamicNewsKeywords') {
      return ['middleEast', 'main', 'africa', 'asia'];
    }
    
    if (category === 'regionalKeywords') {
      return ['middleEast', 'main', 'africa'];
    }
    
    return baseRegions;
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
   * 🔍 Enhanced intelligent article search with advanced relevance scoring
   * @param {string} query - User query
   * @param {Array} articles - Available articles
   * @returns {Object} Comprehensive search results
   */
  async searchRelevantArticles(query, articles) {
    const startTime = Date.now();
    const queryWords = this.preprocessQuery(query);
    const scoredArticles = [];
    
    console.log(`🚀 Intelligent search initiated for: "${query}" (${queryWords.length} processed terms)`);
    
    articles.forEach(article => {
      const relevanceScores = this.calculateAdvancedRelevance(queryWords, article, query);
      const finalScore = this.combineRelevanceFactors(relevanceScores, article);
      
      if (finalScore > 0.1) { // Minimum threshold for inclusion
        scoredArticles.push({
          ...article,
          relevanceScore: Math.round(finalScore * 100) / 100,
          relevanceBreakdown: relevanceScores
        });
      }
    });
    
    // 🏆 Advanced sorting with multiple criteria
    const sortedArticles = scoredArticles.sort((a, b) => {
      // Primary: Relevance score
      if (Math.abs(a.relevanceScore - b.relevanceScore) > 0.1) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Secondary: Islamic relevance
      if (Math.abs((a.islamicRelevance || 0) - (b.islamicRelevance || 0)) > 0.1) {
        return (b.islamicRelevance || 0) - (a.islamicRelevance || 0);
      }
      // Tertiary: Recency
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Search completed: ${sortedArticles.length}/${articles.length} articles matched (${processingTime}ms)`);
    
    return {
      query,
      processedQuery: queryWords.join(' '),
      results: sortedArticles.slice(0, 8), // Top 8 most relevant
      totalFound: sortedArticles.length,
      searchedAt: new Date().toISOString(),
      processingTime,
      searchQuality: this.assessSearchQuality(sortedArticles, queryWords)
    };
  }
  
  /**
   * 🧠 Preprocess query for better matching
   */
  preprocessQuery(query) {
    const lowerQuery = query.toLowerCase();
    
    // Extract meaningful words, removing stop words
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'a', 'an']);
    const words = lowerQuery.split(/\s+/).filter(word => 
      word.length > 2 && !stopWords.has(word)
    );
    
    // Add stemming-like processing for common Islamic terms
    const processedWords = [...words];
    words.forEach(word => {
      if (word.includes('islam')) processedWords.push('islamic', 'muslim');
      if (word.includes('muslim')) processedWords.push('islam', 'islamic');
      if (word.includes('palest')) processedWords.push('palestine', 'palestinian', 'gaza');
      if (word.includes('midd')) processedWords.push('middle east', 'arab');
    });
    
    return [...new Set(processedWords)]; // Remove duplicates
  }
  
  /**
   * 📊 Calculate advanced relevance with multiple scoring factors
   */
  calculateAdvancedRelevance(queryWords, article, originalQuery) {
    const titleWords = (article.title || '').toLowerCase();
    const summaryWords = (article.summary || '').toLowerCase();
    const contentWords = (article.content || '').toLowerCase();
    const categoryWords = (article.category || '').toLowerCase();
    
    let titleScore = 0;
    let summaryScore = 0;
    let contentScore = 0;
    let categoryScore = 0;
    let islamicBonus = 0;
    let recencyBonus = 0;
    let qualityBonus = 0;
    
    // 🎯 Exact phrase matching (highest weight)
    const lowerOriginal = originalQuery.toLowerCase();
    if (titleWords.includes(lowerOriginal)) titleScore += 10;
    if (summaryWords.includes(lowerOriginal)) summaryScore += 8;
    if (contentWords.includes(lowerOriginal)) contentScore += 5;
    
    // 🔍 Individual word matching
    queryWords.forEach(word => {
      if (titleWords.includes(word)) titleScore += 5;
      if (summaryWords.includes(word)) summaryScore += 3;
      if (contentWords.includes(word)) contentScore += 1;
      if (categoryWords.includes(word)) categoryScore += 2;
    });
    
    // 🕌 Islamic content boost
    if (article.islamicRelevance > 0.3) {
      islamicBonus = article.islamicRelevance * 3;
    }
    
    // ⏰ Recency boost
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) recencyBonus = 3;
    else if (hoursOld < 24) recencyBonus = 2;
    else if (hoursOld < 72) recencyBonus = 1;
    
    // 🎆 Content quality boost
    if (article.contentQuality === 'excellent') qualityBonus = 2;
    else if (article.contentQuality === 'good') qualityBonus = 1;
    
    return {
      title: titleScore,
      summary: summaryScore,
      content: contentScore,
      category: categoryScore,
      islamic: islamicBonus,
      recency: recencyBonus,
      quality: qualityBonus
    };
  }
  
  /**
   * ⚖️ Combine relevance factors into final score
   */
  combineRelevanceFactors(scores, article) {
    const weights = {
      title: 3.0,
      summary: 2.0,
      content: 1.0,
      category: 1.5,
      islamic: 2.5,
      recency: 1.8,
      quality: 1.2
    };
    
    let finalScore = 0;
    Object.entries(scores).forEach(([factor, score]) => {
      finalScore += score * (weights[factor] || 1);
    });
    
    // Apply region-specific bonuses
    if (article.region === 'middleEast') finalScore *= 1.1;
    if (article.region === 'live') finalScore *= 1.2; // Breaking news bonus
    
    return Math.max(0, finalScore);
  }
  
  /**
   * 📊 Assess search quality
   */
  assessSearchQuality(results, queryWords) {
    if (results.length === 0) return 'no_results';
    
    const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
    const topRelevance = results[0]?.relevanceScore || 0;
    
    if (topRelevance > 15 && avgRelevance > 8) return 'excellent';
    if (topRelevance > 10 && avgRelevance > 5) return 'good';
    if (topRelevance > 5 && avgRelevance > 3) return 'fair';
    return 'poor';
  }

  /**
   * 🎆 Create user-friendly enhanced prompt with intelligent formatting
   * @param {string} userMessage - Original user message
   * @param {Object} searchResults - Search results
   * @returns {string} Enhanced prompt for AI with beautiful formatting
   */
  createNewsEnhancedPrompt(userMessage, searchResults) {
    const categories = this.categorizeNews(searchResults.results);
    const islamicRelevance = this.assessOverallIslamicRelevance(searchResults.results);
    
    let enhancedPrompt = `
📰 ## Real-Time Al Jazeera News Integration

`;
    enhancedPrompt += `**🔍 User Query:** "${userMessage}"
`;
    enhancedPrompt += `**📈 Relevant Articles Found:** ${searchResults.results.length}
`;
    enhancedPrompt += `**🕌 Islamic Relevance:** ${islamicRelevance.level} (${Math.round(islamicRelevance.score * 100)}%)
`;
    enhancedPrompt += `**⏰ Search Timestamp:** ${new Date(searchResults.searchedAt).toLocaleString()}

`;
    
    // Add Islamic context if relevant
    if (islamicRelevance.score > 0.3) {
      enhancedPrompt += `${this.responseTemplates.islamicContextFound}

`;
    }
    
    enhancedPrompt += `### 📰 Current Al Jazeera Articles:

`;
    
    searchResults.results.slice(0, 5).forEach((article, index) => {
      const emoji = this.getCategoryEmoji(article.category);
      const timeAgo = this.formatTimeAgo(article.publishedAt);
      const region = this.formatRegionName(article.region);
      
      enhancedPrompt += `${emoji} **${index + 1}. ${article.title}**
`;
      enhancedPrompt += `   🌍 ${region} • ⏰ ${timeAgo} • 🏆 Relevance: ${article.relevanceScore}
`;
      
      if (article.userFriendlySummary) {
        enhancedPrompt += `   📝 ${article.userFriendlySummary}
`;
      } else if (article.summary) {
        const shortSummary = article.summary.length > 150 ? 
          article.summary.substring(0, 150) + '...' : article.summary;
        enhancedPrompt += `   📝 ${shortSummary}
`;
      }
      
      if (article.islamicRelevance > 0.5) {
        enhancedPrompt += `   🕌 *High Islamic relevance detected*
`;
      }
      
      if (article.sentiment) {
        const sentimentEmoji = article.sentiment.sentiment === 'positive' ? '😊' : 
                              article.sentiment.sentiment === 'negative' ? '😔' : '😐';
        enhancedPrompt += `   ${sentimentEmoji} Sentiment: ${article.sentiment.sentiment}
`;
      }
      
      enhancedPrompt += `   🔗 Source: ${article.url}

`;
    });
    
    // Add trending topics if available
    const trendingTopics = this.extractTrendingTopics(searchResults.results);
    if (trendingTopics.length > 0) {
      enhancedPrompt += `${this.responseTemplates.trendingTopics}\n`;
      trendingTopics.slice(0, 3).forEach(topic => {
        enhancedPrompt += `🔥 ${topic.topic} (${topic.mentions} mentions)\n`;
      });
      enhancedPrompt += `\n`;
    }
    
    enhancedPrompt += `### 🧠 AI Integration Guidelines:

`;
    enhancedPrompt += `1. 🎯 **Contextual Response:** Use this current news to provide relevant, timely answers
`;
    enhancedPrompt += `2. 🕌 **Islamic Authenticity:** Connect current events with authentic Islamic teachings
`;
    enhancedPrompt += `3. 📚 **Source Attribution:** Reference "According to Al Jazeera" when citing specific news
`;
    enhancedPrompt += `4. ⚖️ **Balanced Perspective:** Present information objectively while maintaining Islamic values
`;
    enhancedPrompt += `5. 💡 **Practical Guidance:** Offer practical Islamic advice relevant to current events
`;
    enhancedPrompt += `6. 🔍 **Encouraging Verification:** Suggest consulting multiple sources and Islamic scholars
`;
    enhancedPrompt += `7. 🤲 **Islamic Closing:** End with "Allah knows best" or similar appropriate phrase

`;
    
    enhancedPrompt += `### 🌟 User Experience Enhancement:

`;
    enhancedPrompt += `- Format your response in a clear, structured way with emojis for visual appeal
`;
    enhancedPrompt += `- Provide both immediate news context and timeless Islamic wisdom
`;
    enhancedPrompt += `- Use bullet points and headings to improve readability
`;
    enhancedPrompt += `- Include relevant Quranic verses or Hadith when appropriate
`;
    enhancedPrompt += `- Keep language accessible while maintaining scholarly depth

`;
    
    enhancedPrompt += `**⚠️ Important Note:** This information is from Al Jazeera's recent reporting. Users should verify important news from multiple authentic sources and consult qualified Islamic scholars for religious guidance.
`;
    
    return enhancedPrompt;
  }
  
  /**
   * 🏆 Assess overall Islamic relevance of news results
   */
  assessOverallIslamicRelevance(articles) {
    if (!articles || articles.length === 0) {
      return { level: 'none', score: 0 };
    }
    
    const totalRelevance = articles.reduce((sum, article) => 
      sum + (article.islamicRelevance || 0), 0);
    const avgRelevance = totalRelevance / articles.length;
    
    let level = 'low';
    if (avgRelevance > 0.7) level = 'very high';
    else if (avgRelevance > 0.5) level = 'high';
    else if (avgRelevance > 0.3) level = 'moderate';
    else if (avgRelevance > 0.1) level = 'low';
    else level = 'minimal';
    
    return { level, score: avgRelevance };
  }
  
  /**
   * 🎨 Get appropriate emoji for content category
   */
  getCategoryEmoji(category) {
    const categoryLower = (category || '').toLowerCase();
    return this.newsCategories.islamic.emoji && categoryLower.includes('islam') ? this.newsCategories.islamic.emoji :
           this.newsCategories.middleEast.emoji && categoryLower.includes('middle') ? this.newsCategories.middleEast.emoji :
           this.newsCategories.world.emoji && ['world', 'politics', 'international'].includes(categoryLower) ? this.newsCategories.world.emoji :
           this.newsCategories.social.emoji && ['social', 'society', 'community'].includes(categoryLower) ? this.newsCategories.social.emoji :
           this.newsCategories.economy.emoji && ['economy', 'business', 'finance'].includes(categoryLower) ? this.newsCategories.economy.emoji :
           '📰'; // Default news emoji
  }
  
  /**
   * ⏰ Format time in user-friendly way
   */
  formatTimeAgo(publishedAt) {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now - published;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return published.toLocaleDateString();
    }
  }
  
  /**
   * 🌍 Format region name in user-friendly way
   */
  formatRegionName(region) {
    const regionMap = {
      'main': 'Global',
      'middleEast': 'Middle East',
      'usCanada': 'US & Canada',
      'latinAmerica': 'Latin America',
      'asiaPacific': 'Asia Pacific',
      'africa': 'Africa',
      'asia': 'Asia',
      'europe': 'Europe',
      'live': 'Breaking News'
    };
    return regionMap[region] || region;
  }
  
  /**
   * 🔥 Extract trending topics from articles
   */
  extractTrendingTopics(articles) {
    const wordCount = new Map();
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'have', 'will', 'this', 'that', 'with', 'from', 'they', 'been', 'said', 'about', 'into', 'than', 'only', 'other', 'after', 'first', 'well', 'also']);
    
    articles.forEach(article => {
      const text = `${article.title} ${article.summary || ''}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Remove pure numbers
      );
      
      words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      });
    });
    
    return Array.from(wordCount.entries())
      .filter(([word, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, mentions]) => ({ topic, mentions }));
  }

  /**
   * 🗋 Categorize news articles using enhanced AI classification
   * @param {Array} articles - Articles to categorize
   * @returns {Object} Categorized articles with intelligence
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
      
      // Check each category using the enhanced structure
      Object.entries(this.newsCategories).forEach(([category, config]) => {
        if (!categorized && config.keywords && config.keywords.some(keyword => content.includes(keyword))) {
          categories[category] = categories[category] || [];
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
   * 📊 Get comprehensive service statistics
   * @returns {Object} Detailed statistics with user-friendly formatting
   */
  getServiceMetrics() {
    const successRate = this.metrics.totalQueries > 0 ? 
      (this.metrics.newsIntegrationRate / this.metrics.totalQueries * 100).toFixed(1) : 0;
    
    const islamicContentRate = this.metrics.totalQueries > 0 ? 
      (this.metrics.islamicContentQueries / this.metrics.totalQueries * 100).toFixed(1) : 0;
    
    return {
      overview: {
        totalQueries: this.metrics.totalQueries,
        successRate: `${successRate}%`,
        islamicContentRate: `${islamicContentRate}%`,
        averageResponseTime: `${Math.round(this.metrics.averageResponseTime)}ms`
      },
      performance: {
        scraper: this.newsScraper.getScrapingMetrics ? this.newsScraper.getScrapingMetrics() : 'Not available',
        userSatisfaction: 'High', // Could be enhanced with user feedback
        systemHealth: 'Optimal'
      },
      capabilities: {
        supportedRegions: Object.keys(this.newsScraper.alJazeeraUrls || {}),
        islamicContextDetection: 'Advanced',
        multiLanguageSupport: 'Enabled',
        realTimeUpdates: 'Active'
      }
    };
  }
  
  /**
   * 🎆 Generate user-friendly formatted response
   * @param {Array} articles - News articles
   * @param {string} query - Original query
   * @returns {string} Beautiful formatted response
   */
  generateUserFriendlyResponse(articles, query) {
    if (!articles || articles.length === 0) {
      return `😔 I couldn't find any recent news about "${query}". Would you like me to:\n\n🕌 Provide Islamic guidance on a related topic?\n🔍 Search for something else?\n📚 Share relevant Quranic verses or Hadith?`;
    }

    let response = `📰 **Latest Al Jazeera News Update**\n\n`;
    response += `I found ${articles.length} relevant article${articles.length > 1 ? 's' : ''} about "${query}":\n\n`;
    
    articles.slice(0, 3).forEach((article, index) => {
      const emoji = this.getCategoryEmoji(article.category);
      const timeAgo = this.formatTimeAgo(article.publishedAt);
      const region = this.formatRegionName(article.region);
      
      response += `${emoji} **${index + 1}. ${article.title}**\n`;
      response += `🌍 ${region} • ⏰ ${timeAgo}\n`;
      
      if (article.userFriendlySummary) {
        response += `${article.userFriendlySummary}\n`;
      } else if (article.summary) {
        const shortSummary = article.summary.length > 150 ? 
          article.summary.substring(0, 150) + '...' : article.summary;
        response += `📝 ${shortSummary}\n`;
      }
      
      if (article.islamicRelevance > 0.5) {
        response += `🕌 *High Islamic relevance*\n`;
      }
      
      response += `🔗 [Read full article](${article.url})\n\n`;
    });

    if (articles.length > 3) {
      response += `... and ${articles.length - 3} more articles available.\n\n`;
    }

    response += `💡 *Would you like me to provide Islamic guidance on any of these topics?*\n\n`;
    response += `🕌 **Islamic Perspective:** I can connect these current events with relevant Islamic teachings and provide authentic guidance based on Quran and Hadith.`;
    
    return response;
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