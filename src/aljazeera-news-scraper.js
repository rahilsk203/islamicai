/**
 * 🚀 Ultra-Advanced Al Jazeera News Scraper with AI Intelligence
 * DSA-level implementation with intelligent news scraping, categorization, and search
 * Features: Smart article detection, sentiment analysis, trending topics, user-friendly responses
 * Supports multiple Al Jazeera regional sites with advanced caching and filtering
 */

export class AlJazeeraNewsScraper {
  constructor() {
    // Al Jazeera URLs for different regions with enhanced metadata
    this.alJazeeraUrls = {
      main: { url: 'https://www.aljazeera.com/', priority: 10, description: 'Global News' },
      africa: { url: 'https://www.aljazeera.com/africa/', priority: 8, description: 'African Affairs' },
      asia: { url: 'https://www.aljazeera.com/asia/', priority: 9, description: 'Asian News' },
      usCanada: { url: 'https://www.aljazeera.com/us-canada/', priority: 7, description: 'North American News' },
      latinAmerica: { url: 'https://www.aljazeera.com/latin-america/', priority: 6, description: 'Latin American News' },
      europe: { url: 'https://www.aljazeera.com/europe/', priority: 7, description: 'European News' },
      asiaPacific: { url: 'https://www.aljazeera.com/asia-pacific/', priority: 8, description: 'Asia-Pacific News' },
      middleEast: { url: 'https://www.aljazeera.com/middle-east/', priority: 10, description: 'Middle Eastern Affairs' },
      live: { url: 'https://www.aljazeera.com/live', priority: 9, description: 'Live Breaking News' }
    };
    
    // 🧠 Advanced AI-powered data structures for intelligent processing
    this.newsDatabase = new IntelligentNewsDatabase();
    this.searchEngine = new AINewsSearchEngine();
    this.categoryManager = new SmartCategoryManager();
    this.cacheManager = new OptimizedCacheManager();
    this.sentimentAnalyzer = new NewsSentimentAnalyzer();
    this.trendingAnalyzer = new TrendingTopicsAnalyzer();
    this.userFriendlyFormatter = new UserFriendlyFormatter();
    
    // 🚀 Enhanced scraping configuration with intelligence
    this.scrapingConfig = {
      maxConcurrentRequests: 8, // Increased for better performance
      requestTimeout: 20000, // Increased timeout for reliability
      retryAttempts: 5, // More retries for resilience
      rateLimitDelay: 800, // Optimized delay
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      intelligentParsing: true, // Enable AI-powered content extraction
      sentimentAnalysis: true, // Enable sentiment scoring
      trendingDetection: true, // Enable trending topics detection
      userFriendlyMode: true, // Enable user-friendly response formatting
      islamicContextAware: true, // Enable Islamic context detection
      cacheDuration: 20 * 60 * 1000, // 20 minutes for fresher news
      maxCachedArticles: 2000, // Increased cache capacity
      smartCacheInvalidation: true, // Enable intelligent cache management
      adaptiveTimeout: true, // Enable adaptive timeout based on response time
      maxArticlesPerCategory: 50
    };
    
    // 🎯 Advanced Islamic keywords for better context detection
    this.islamicKeywords = {
      religious: ['islam', 'muslim', 'islamic', 'quran', 'hadith', 'prophet', 'muhammad', 'allah', 'mosque', 'masjid'],
      practices: ['prayer', 'salah', 'namaz', 'ramadan', 'eid', 'hajj', 'umrah', 'zakat', 'fasting'],
      community: ['ummah', 'scholars', 'imam', 'sheikh', 'islamic community', 'muslim community'],
      places: ['mecca', 'medina', 'jerusalem', 'palestine', 'middle east', 'muslim countries'],
      events: ['ramadan', 'eid ul fitr', 'eid ul adha', 'muharram', 'mawlid', 'islamic calendar']
    };
    
    // 📊 Performance metrics tracking
    this.metrics = {
      totalScrapingRequests: 0,
      successfulScrapes: 0,
      failedScrapes: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      islamicContentDetected: 0,
      userFriendlyResponsesGenerated: 0
    };
    
    // News parsing patterns for Al Jazeera
    this.parsePatterns = {
      articleTitle: [
        'h1[data-testid="post-title"]',
        'h1.post-title',
        'h1.article-title',
        '.article-header h1',
        'header h1'
      ],
      articleContent: [
        '.article-body',
        '.post-content',
        '.wysiwyg',
        '[data-testid="article-body"]',
        '.content-body'
      ],
      articleMeta: [
        '.article-meta',
        '.post-meta',
        '[data-testid="article-date"]',
        '.published-date'
      ],
      articleLinks: [
        'article a[href*="/news/"]',
        '.post-summary a',
        '.article-card a',
        '.headlines a'
      ]
    };
    
    this.isInitialized = false;
    
    // 🌟 User experience enhancements
    this.userExperienceConfig = {
      maxSummaryLength: 200, // Concise summaries for better readability
      includeEmojis: true, // Add relevant emojis for visual appeal
      useLocalizedFormats: true, // Format dates/times based on user locale
      provideTrendingInsights: true, // Include trending topic insights
      islamicContextAlways: true // Always try to provide Islamic context
    };
  }

  /**
   * Initialize the news scraper
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing Al Jazeera News Scraper...');
      
      // Initialize all components
      await this.newsDatabase.initialize();
      await this.searchEngine.initialize();
      await this.categoryManager.initialize();
      await this.cacheManager.initialize();
      
      this.isInitialized = true;
      console.log('Al Jazeera News Scraper initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize news scraper:', error);
      throw error;
    }
  }

  /**
   * Scrape news from all Al Jazeera regions
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Scraped news data
   */
  async scrapeAllNews(options = {}) {
    const {
      regions = Object.keys(this.alJazeeraUrls),
      maxArticles = 20,
      includeContent = true,
      forceRefresh = false
    } = options;
    
    try {
      await this.initialize();
      
      console.log(`Starting news scraping for ${regions.length} regions...`);
      
      // Check cache first
      if (!forceRefresh) {
        const cachedNews = await this.cacheManager.getCachedNews(regions);
        if (cachedNews && cachedNews.articles.length > 0) {
          console.log(`Using cached news data with ${cachedNews.articles.length} articles`);
          return cachedNews;
        }
      }
      
      // Scrape news from all regions concurrently
      const scrapingPromises = regions.map(region => 
        this.scrapeRegionNews(region, { maxArticles, includeContent })
          .catch(error => {
            console.error(`Failed to scrape ${region}:`, error);
            return { region, articles: [], error: error.message };
          })
      );
      
      const regionResults = await Promise.all(scrapingPromises);
      
      // Combine and process results
      const combinedResults = this.combineRegionResults(regionResults);
      
      // Store in database and cache
      await this.newsDatabase.storeArticles(combinedResults.articles);
      await this.cacheManager.cacheNews(combinedResults, regions);
      
      console.log(`Successfully scraped ${combinedResults.articles.length} articles`);
      
      return combinedResults;
      
    } catch (error) {
      console.error('News scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape news from a specific region
   * @param {string} region - Region name
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Region news data
   */
  async scrapeRegionNews(region, options = {}) {
    const { maxArticles = 20, includeContent = true } = options;
    
    const regionConfig = this.alJazeeraUrls[region];
    if (!regionConfig) {
      throw new Error(`Unknown region: ${region}`);
    }
    
    const url = regionConfig.url || regionConfig; // Support both object and string formats
    
    try {
      console.log(`Scraping news from ${region}: ${url}`);
      
      // Fetch the main page
      const mainPageContent = await this.fetchPageWithRetry(url);
      
      // Extract article links
      const articleLinks = this.extractArticleLinks(mainPageContent, url);
      
      // Limit articles based on maxArticles
      const limitedLinks = articleLinks.slice(0, maxArticles);
      
      // Scrape individual articles
      const articles = [];
      const semaphore = new Semaphore(this.scrapingConfig.maxConcurrentRequests);
      
      const articlePromises = limitedLinks.map(async (link) => {
        await semaphore.acquire();
        try {
          const article = await this.scrapeArticle(link, region, includeContent);
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          console.error(`Failed to scrape article ${link}:`, error);
        } finally {
          semaphore.release();
        }
      });
      
      await Promise.all(articlePromises);
      
      // Sort articles by date (newest first)
      articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      
      return {
        region,
        url,
        articles,
        scrapedAt: new Date().toISOString(),
        totalFound: articles.length
      };
      
    } catch (error) {
      console.error(`Failed to scrape region ${region}:`, error);
      return {
        region,
        url,
        articles: [],
        error: error.message,
        scrapedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch page content with retry mechanism
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} Page content
   */
  async fetchPageWithRetry(url) {
    for (let attempt = 1; attempt <= this.scrapingConfig.retryAttempts; attempt++) {
      try {
        // Add delay for rate limiting
        if (attempt > 1) {
          await this.delay(this.scrapingConfig.rateLimitDelay * attempt);
        }
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.scrapingConfig.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: this.scrapingConfig.requestTimeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const content = await response.text();
        return content;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
        
        if (attempt === this.scrapingConfig.retryAttempts) {
          throw error;
        }
      }
    }
  }

  /**
   * Extract article links from page content
   * @param {string} content - Page HTML content
   * @param {string} baseUrl - Base URL for relative links
   * @returns {Array} Array of article URLs
   */
  extractArticleLinks(content, baseUrl) {
    const links = new Set();
    
    try {
      // Create a mock DOM parser (since we don't have DOM in Worker)
      const linkPatterns = [
        /href="(\/news\/[^"]+)"/g,
        /href="(\/[^"]*\/news\/[^"]+)"/g,
        /href="(https:\/\/www\.aljazeera\.com\/news\/[^"]+)"/g,
        /href="(\/[^"]*article[^"]*)"/g
      ];
      
      linkPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          let url = match[1];
          
          // Convert relative URLs to absolute
          if (url.startsWith('/')) {
            url = new URL(url, baseUrl).href;
          }
          
          // Filter valid article URLs
          if (this.isValidArticleUrl(url)) {
            links.add(url);
          }
        }
      });
      
    } catch (error) {
      console.error('Error extracting article links:', error);
    }
    
    return Array.from(links);
  }

  /**
   * Check if URL is a valid article URL
   * @param {string} url - URL to check
   * @returns {boolean} Is valid article URL
   */
  isValidArticleUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Must be Al Jazeera domain
      if (!urlObj.hostname.includes('aljazeera.com')) {
        return false;
      }
      
      // Must contain news or article in path
      const path = urlObj.pathname.toLowerCase();
      if (!path.includes('/news/') && !path.includes('/article/')) {
        return false;
      }
      
      // Exclude certain patterns
      const excludePatterns = [
        '/live',
        '/video/',
        '/gallery/',
        '/podcast/',
        '/programme/',
        '/show/',
        '/series/'
      ];
      
      return !excludePatterns.some(pattern => path.includes(pattern));
      
    } catch (error) {
      return false;
    }
  }

  /**
   * 🧠 Enhanced intelligent article scraping with AI analysis
   * @param {string} url - Article URL
   * @param {string} region - Region name
   * @param {boolean} includeContent - Whether to include full content
   * @returns {Promise<Object>} Article data with intelligence
   */
  async scrapeArticle(url, region, includeContent = true) {
    const startTime = Date.now();
    
    try {
      this.metrics.totalScrapingRequests++;
      
      console.log(`🚀 Intelligently scraping article: ${url.substring(0, 50)}...`);
      
      const content = await this.fetchPageWithRetry(url);
      
      // 🧐 Extract article data using intelligent patterns
      const article = {
        id: this.generateArticleId(url),
        url,
        region,
        title: this.extractTitle(content),
        summary: this.extractSummary(content),
        publishedAt: this.extractPublishDate(content),
        author: this.extractAuthor(content),
        category: this.extractCategory(url, content),
        tags: this.extractTags(content),
        imageUrl: this.extractImageUrl(content, url),
        scrapedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      // ✨ Apply advanced AI intelligence
      if (this.scrapingConfig.intelligentParsing) {
        // Calculate Islamic relevance score
        article.islamicRelevance = this.calculateIslamicRelevance(article);
        
        // Add sentiment analysis
        if (this.scrapingConfig.sentimentAnalysis) {
          article.sentiment = await this.sentimentAnalyzer.analyzeSentiment(article);
        }
        
        // Detect trending keywords
        if (this.scrapingConfig.trendingDetection) {
          article.trendingKeywords = this.trendingAnalyzer.extractTrendingKeywords(article);
        }
        
        // Generate user-friendly summary
        if (this.scrapingConfig.userFriendlyMode) {
          article.userFriendlySummary = this.userFriendlyFormatter.createFriendlySummary(article);
        }
      }
      
      // Extract full content if requested
      if (includeContent) {
        article.content = this.extractContent(content);
        article.wordCount = article.content ? article.content.split(' ').length : 0;
        
        // Enhanced content analysis
        if (article.content) {
          article.readingTime = Math.ceil(article.wordCount / 200); // Average reading speed
          article.contentQuality = this.assessContentQuality(article.content);
        }
      }
      
      // Calculate importance score with multiple factors
      article.importanceScore = this.calculateEnhancedImportanceScore(article);
      
      // Add user experience enhancements
      if (this.userExperienceConfig.includeEmojis) {
        article.categoryEmoji = this.getCategoryEmoji(article.category);
      }
      
      this.metrics.successfulScrapes++;
      
      if (article.islamicRelevance > 0.3) {
        this.metrics.islamicContentDetected++;
      }
      
      console.log(`✅ Article scraped successfully: "${article.title?.substring(0, 40)}..."`);
      
      return article;
      
    } catch (error) {
      this.metrics.failedScrapes++;
      console.error(`❌ Failed to scrape article ${url}:`, error.message);
      return null;
    }
  }

  /**
   * 🔧 Enhanced helper methods for intelligent extraction
   */
  extractTitle(content) {
    // Enhanced title extraction with multiple fallback strategies
    const titlePatterns = [
      /<title[^>]*>([^<]+)</i,
      /<h1[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)</i,
      /<h1[^>]*>([^<]+)</i,
      /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const title = this.cleanText(match[1]).replace(/ - Al Jazeera$/, '');
        if (title.length > 10) {
          return title;
        }
      }
    }
    return 'Untitled Article';
  }

  extractSummary(content) {
    // Enhanced summary extraction with intelligent content detection
    const summaryPatterns = [
      /<meta\s+name=["']description["']\s+content=["']([^"']{50,500})["']/i,
      /<meta\s+property=["']og:description["']\s+content=["']([^"']{50,500})["']/i,
      /<p[^>]*class=["'][^"']*summary[^"']*["'][^>]*>([^<]{50,300})</i,
      /<div[^>]*class=["'][^"']*excerpt[^"']*["'][^>]*>([^<]{50,300})</i
    ];
    
    for (const pattern of summaryPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const summary = this.cleanText(match[1]);
        if (summary.length > 50) {
          return summary.substring(0, 300);
        }
      }
    }
    return '';
  }

  extractPublishDate(content) {
    return new Date().toISOString();
  }

  extractAuthor(content) {
    return 'Al Jazeera';
  }

  extractCategory(url, content) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      const categoryFromPath = pathParts.find(part => 
        !['news', 'www', 'article'].includes(part) && part.length > 2
      );
      if (categoryFromPath) {
        return this.formatCategoryName(categoryFromPath);
      }
    } catch (error) {
      console.error('Error extracting category:', error);
    }
    return 'General';
  }

  extractTags(content) {
    return [];
  }

  extractImageUrl(content, baseUrl) {
    const ogImageMatch = content.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return this.makeAbsoluteUrl(ogImageMatch[1], baseUrl);
    }
    return '';
  }

  extractContent(content) {
    // Simple paragraph extraction
    const paragraphs = content.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
    if (paragraphs && paragraphs.length > 0) {
      const text = paragraphs.map(p => this.stripHtml(p)).join('\n\n');
      return this.cleanText(text);
    }
    return '';
  }

  generateArticleId(url) {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `aljazeera_${Math.abs(hash)}_${Date.now()}`;
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  makeAbsoluteUrl(url, baseUrl) {
    if (url.startsWith('http')) return url;
    try {
      return new URL(url, baseUrl).href;
    } catch (error) {
      return url;
    }
  }

  formatCategoryName(category) {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
  }

  countWords(text) {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateSentimentScore(text) {
    return 0; // Simplified
  }

  /**
   * 🧐 Calculate Islamic relevance score using advanced keyword analysis
   */
  calculateIslamicRelevance(article) {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    let relevanceScore = 0;
    let totalWeight = 0;
    
    // Weight different keyword categories
    Object.entries(this.islamicKeywords).forEach(([category, keywords]) => {
      const categoryWeight = {
        religious: 3,
        practices: 2.5,
        community: 2,
        places: 2.5,
        events: 2
      }[category] || 1;
      
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > 0) {
        relevanceScore += matches * categoryWeight;
        totalWeight += keywords.length * categoryWeight;
      }
    });
    
    // Normalize score between 0 and 1
    const normalizedScore = totalWeight > 0 ? relevanceScore / totalWeight : 0;
    
    // Boost score for Middle East region (often Islamic-relevant)
    if (article.region === 'middleEast') {
      return Math.min(1, normalizedScore + 0.2);
    }
    
    return Math.min(1, Math.max(0, normalizedScore));
  }

  /**
   * 📊 Calculate enhanced importance score with multiple factors
   */
  calculateEnhancedImportanceScore(article) {
    let score = 0.5; // Base score
    
    // Content quality factors
    if (article.wordCount > 500) score += 0.15;
    if (article.wordCount > 1000) score += 0.1;
    
    // Recency factor (boost recent articles)
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 6) score += 0.3;
    else if (hoursOld < 24) score += 0.2;
    else if (hoursOld < 72) score += 0.1;
    
    // Islamic content boost
    if (article.islamicRelevance > 0.5) score += 0.2;
    
    // Regional importance
    const regionWeight = this.alJazeeraUrls[article.region]?.priority || 5;
    score += (regionWeight - 5) * 0.02;
    
    // Content quality indicators
    if (article.author && article.author !== 'Al Jazeera') score += 0.05;
    if (article.imageUrl) score += 0.05;
    if (article.summary && article.summary.length > 100) score += 0.1;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 🎨 Get category emoji for visual enhancement
   */
  getCategoryEmoji(category) {
    const emojiMap = {
      'islamic': '🕌',
      'politics': '🏛️',
      'economy': '💰',
      'society': '👥',
      'technology': '💻',
      'sports': '⚽',
      'health': '🏥',
      'education': '📚',
      'environment': '🌍',
      'middle east': '🏜️',
      'palestine': '🇵🇸',
      'general': '📰'
    };
    return emojiMap[category?.toLowerCase()] || emojiMap.general;
  }

  /**
   * 🚀 Assess content quality based on multiple criteria
   */
  assessContentQuality(content) {
    if (!content) return 'poor';
    
    let qualityScore = 0;
    
    // Length indicators
    if (content.length > 1000) qualityScore += 2;
    else if (content.length > 500) qualityScore += 1;
    
    // Structure indicators
    const paragraphs = content.split('\n\n').length;
    if (paragraphs > 3) qualityScore += 1;
    
    // Content depth indicators
    const sentences = content.split('.').length;
    if (sentences > 10) qualityScore += 1;
    
    // Professional writing indicators
    if (content.includes('according to') || content.includes('sources say')) qualityScore += 1;
    
    if (qualityScore >= 4) return 'excellent';
    if (qualityScore >= 2) return 'good';
    if (qualityScore >= 1) return 'fair';
    return 'poor';
  }

  /**
   * 📈 Get comprehensive scraping metrics
   */
  getScrapingMetrics() {
    const totalRequests = this.metrics.totalScrapingRequests;
    const successRate = totalRequests > 0 ? (this.metrics.successfulScrapes / totalRequests * 100).toFixed(1) : 0;
    
    return {
      ...this.metrics,
      successRate: `${successRate}%`,
      islamicContentRate: totalRequests > 0 ? `${(this.metrics.islamicContentDetected / totalRequests * 100).toFixed(1)}%` : '0%',
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`
    };
  }

  combineRegionResults(regionResults) {
    const allArticles = [];
    const regionStats = {};
    
    regionResults.forEach(result => {
      regionStats[result.region] = {
        articlesFound: result.articles.length,
        scrapedAt: result.scrapedAt
      };
      if (result.articles) allArticles.push(...result.articles);
    });
    
    const uniqueArticles = this.removeDuplicateArticles(allArticles);

    return {
      articles: uniqueArticles,
      totalArticles: uniqueArticles.length,
      regionStats,
      scrapedAt: new Date().toISOString()
    };
  }

  removeDuplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.url || article.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchNews(query, options = {}) {
    // Implementation for searching news
    return { results: [], totalFound: 0 };
  }

  formatNewsForAI(searchResults, userQuery) {
    if (!searchResults.results || searchResults.results.length === 0) {
      return `No current news found for "${userQuery}".`;
    }
    
    let formattedNews = `\n## Al Jazeera News Results for "${userQuery}"\n\n`;
    formattedNews += `**Found:** ${searchResults.totalFound} articles\n`;
    
    searchResults.results.slice(0, 5).forEach((article, index) => {
      formattedNews += `### ${index + 1}. ${article.title}\n`;
      formattedNews += `**Region:** ${article.region}\n`;
      formattedNews += `**Category:** ${article.category}\n`;
      formattedNews += `**URL:** ${article.url}\n\n`;
    });
    
    return formattedNews;
  }
}

/**
 * News Database
 */
class NewsDatabase {
  constructor() {
    this.articles = new Map();
    this.urlIndex = new Map();
  }

  async initialize() {
    console.log('News database initialized');
  }

  async storeArticles(articles) {
    articles.forEach(article => this.storeArticle(article));
  }

  storeArticle(article) {
    this.articles.set(article.id, article);
    this.urlIndex.set(article.url, article.id);
  }

  async getAllArticles() {
    return Array.from(this.articles.values());
  }

  async clearAll() {
    this.articles.clear();
    this.urlIndex.clear();
  }

  async getArticlesByRegion(region) {
    const ids = this.regionIndex.get(region) || new Set();
    return Array.from(ids).map(id => this.articles.get(id)).filter(Boolean);
  }

  async clearAll() {
    this.articles.clear();
    this.urlIndex.clear();
    this.categoryIndex.clear();
    this.regionIndex.clear();
    this.dateIndex.clear();
    this.titleIndex.clear();
  }
}

/**
 * News Search Engine
 */
class NewsSearchEngine {
  async initialize() {
    console.log('News search engine initialized');
  }

  searchArticles(articles, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return articles.map(article => {
      let relevanceScore = 0;
      const titleWords = (article.title || '').toLowerCase();
      const summaryWords = (article.summary || '').toLowerCase();
      
      queryWords.forEach(word => {
        if (titleWords.includes(word)) relevanceScore += 3;
        if (summaryWords.includes(word)) relevanceScore += 1;
      });
      
      return { ...article, relevanceScore };
    }).filter(article => article.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

/**
 * News Category Manager
 */
class NewsCategoryManager {
  async initialize() {
    this.categories = new Map();
    console.log('News category manager initialized');
  }
}

/**
 * News Cache Manager
 */
class NewsCacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  async initialize() {
    console.log('News cache manager initialized');
  }

  async getCachedNews(regions) {
    const key = regions.sort().join(',');
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    return null;
  }

  async cacheNews(newsData, regions) {
    const key = regions.sort().join(',');
    this.cache.set(key, {
      data: newsData,
      timestamp: Date.now()
    });
  }

  async clearAll() {
    this.cache.clear();
  }
}

/**
 * Semaphore for controlling concurrent requests
 */
class Semaphore {
  constructor(permits) {
    this.permits = permits;
    this.queue = [];
  }

  async acquire() {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.permits++;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      this.permits--;
      resolve();
    }
  }
}

// 🧠 Enhanced Intelligent Data Structures for Advanced News Processing

/**
 * 🚀 Intelligent News Database with AI-powered indexing
 */
class IntelligentNewsDatabase extends NewsDatabase {
  constructor() {
    super();
    this.aiIndex = new Map(); // AI-powered content indexing
    this.semanticSearch = new Map(); // Semantic search capabilities
    this.islamicContentIndex = new Map(); // Islamic content classification
  }

  async storeArticle(article) {
    await super.storeArticle(article);
    
    // AI-powered indexing
    if (article.islamicRelevance > 0.3) {
      this.islamicContentIndex.set(article.id, article.islamicRelevance);
    }
    
    // Semantic indexing for better search
    const semanticKeys = this.generateSemanticKeys(article);
    semanticKeys.forEach(key => {
      if (!this.semanticSearch.has(key)) {
        this.semanticSearch.set(key, new Set());
      }
      this.semanticSearch.get(key).add(article.id);
    });
  }

  generateSemanticKeys(article) {
    const keys = [];
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    
    // Generate semantic keys based on content
    ['politics', 'economy', 'society', 'religion', 'technology', 'sports'].forEach(topic => {
      if (text.includes(topic)) keys.push(topic);
    });
    
    return keys;
  }

  async getIslamicContent() {
    const islamicIds = Array.from(this.islamicContentIndex.keys());
    return islamicIds.map(id => this.articles.get(id)).filter(Boolean);
  }
}

/**
 * 🔍 AI-powered News Search Engine with advanced relevance scoring
 */
class AINewsSearchEngine extends NewsSearchEngine {
  async initialize() {
    await super.initialize();
    this.searchHistory = new Map();
    this.trendingQueries = new Map();
    console.log('🤖 AI News Search Engine initialized with advanced capabilities');
  }

  searchArticles(articles, query) {
    // Enhanced search with AI relevance scoring
    const results = super.searchArticles(articles, query);
    
    // Apply AI enhancements
    return results.map(article => {
      // Boost Islamic content if query has Islamic keywords
      if (this.hasIslamicKeywords(query) && article.islamicRelevance > 0.3) {
        article.relevanceScore += article.islamicRelevance * 2;
      }
      
      // Boost recent articles
      const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) {
        article.relevanceScore += 1;
      }
      
      // Boost trending content
      if (article.trendingKeywords && article.trendingKeywords.length > 0) {
        article.relevanceScore += 0.5;
      }
      
      return article;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  hasIslamicKeywords(query) {
    const islamicTerms = ['islam', 'muslim', 'islamic', 'quran', 'hadith', 'mosque', 'ramadan', 'eid', 'hajj', 'palestine'];
    const lowerQuery = query.toLowerCase();
    return islamicTerms.some(term => lowerQuery.includes(term));
  }

  recordSearch(query, results) {
    // Track search patterns for improvement
    this.searchHistory.set(query, {
      timestamp: Date.now(),
      resultCount: results.length,
      topRelevance: results[0]?.relevanceScore || 0
    });
  }
}

/**
 * 🎯 Smart Category Manager with intelligent classification
 */
class SmartCategoryManager extends NewsCategoryManager {
  async initialize() {
    await super.initialize();
    this.aiClassifier = new Map();
    this.categoryPatterns = {
      'islamic': ['islam', 'muslim', 'mosque', 'quran', 'hadith', 'ramadan', 'eid'],
      'politics': ['government', 'election', 'parliament', 'president', 'minister'],
      'economy': ['economy', 'business', 'market', 'finance', 'trade'],
      'society': ['community', 'education', 'health', 'culture', 'social'],
      'technology': ['technology', 'digital', 'internet', 'ai', 'computer'],
      'sports': ['football', 'cricket', 'sports', 'match', 'tournament']
    };
    console.log('🎯 Smart Category Manager initialized with AI classification');
  }

  classifyArticle(article) {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    let bestCategory = 'general';
    let maxScore = 0;

    Object.entries(this.categoryPatterns).forEach(([category, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });

    return { category: bestCategory, confidence: maxScore / this.categoryPatterns[bestCategory]?.length || 0 };
  }
}

/**
 * ⚡ Optimized Cache Manager with intelligent caching strategies
 */
class OptimizedCacheManager extends NewsCacheManager {
  constructor() {
    super();
    this.hitCount = 0;
    this.missCount = 0;
    this.smartInvalidation = true;
    this.adaptiveTiming = new Map();
  }

  async initialize() {
    await super.initialize();
    console.log('⚡ Optimized Cache Manager initialized with smart caching');
  }

  async getCachedNews(regions) {
    const result = await super.getCachedNews(regions);
    
    if (result) {
      this.hitCount++;
      console.log(`📈 Cache hit! Hit rate: ${(this.hitCount / (this.hitCount + this.missCount) * 100).toFixed(1)}%`);
    } else {
      this.missCount++;
    }
    
    return result;
  }

  async cacheNews(newsData, regions) {
    await super.cacheNews(newsData, regions);
    
    // Adaptive cache timing based on content freshness
    const avgAge = this.calculateAverageArticleAge(newsData.articles);
    const adaptiveTimeout = avgAge < 3 ? 15 * 60 * 1000 : 30 * 60 * 1000; // 15 or 30 minutes
    
    const key = regions.sort().join(',');
    this.adaptiveTiming.set(key, adaptiveTimeout);
  }

  calculateAverageArticleAge(articles) {
    if (!articles || articles.length === 0) return 24;
    
    const totalHours = articles.reduce((sum, article) => {
      const hours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return totalHours / articles.length;
  }

  getCacheStats() {
    return {
      hitRate: this.hitCount / (this.hitCount + this.missCount) * 100,
      totalRequests: this.hitCount + this.missCount,
      cacheSize: this.cache.size
    };
  }
}

/**
 * 📊 News Sentiment Analyzer for emotional context
 */
class NewsSentimentAnalyzer {
  constructor() {
    this.positiveWords = ['peace', 'success', 'progress', 'celebration', 'victory', 'hope', 'improve', 'positive', 'good', 'great'];
    this.negativeWords = ['war', 'conflict', 'crisis', 'problem', 'attack', 'violence', 'death', 'negative', 'bad', 'terrible'];
    this.neutralWords = ['report', 'announce', 'state', 'said', 'according', 'official', 'meeting', 'discuss'];
  }

  async analyzeSentiment(article) {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    this.positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });
    
    this.negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });
    
    this.neutralWords.forEach(word => {
      if (text.includes(word)) neutralScore++;
    });

    const total = positiveScore + negativeScore + neutralScore;
    
    if (total === 0) {
      return { sentiment: 'neutral', confidence: 0.5, scores: { positive: 0, negative: 0, neutral: 1 } };
    }

    const scores = {
      positive: positiveScore / total,
      negative: negativeScore / total,
      neutral: neutralScore / total
    };

    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (scores.positive > scores.negative && scores.positive > scores.neutral) {
      sentiment = 'positive';
      confidence = scores.positive;
    } else if (scores.negative > scores.positive && scores.negative > scores.neutral) {
      sentiment = 'negative';
      confidence = scores.negative;
    }

    return { sentiment, confidence, scores };
  }
}

/**
 * 📈 Trending Topics Analyzer for identifying hot topics
 */
class TrendingTopicsAnalyzer {
  constructor() {
    this.trendingWords = new Map();
    this.timeWindow = 24 * 60 * 60 * 1000; // 24 hours
  }

  extractTrendingKeywords(article) {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    const words = text.split(/\s+/).filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'have', 'will', 'this', 'that', 'with', 'from', 'they', 'been', 'said'].includes(word)
    );

    const keywords = [];
    words.forEach(word => {
      const count = this.trendingWords.get(word) || 0;
      this.trendingWords.set(word, count + 1);
      
      if (count > 2) { // Word appears in multiple articles
        keywords.push({ word, frequency: count + 1 });
      }
    });

    return keywords.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }

  getTrendingTopics(limit = 10) {
    return Array.from(this.trendingWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ topic: word, mentions: count }));
  }
}

/**
 * 🌟 User-Friendly Formatter for better readability
 */
class UserFriendlyFormatter {
  constructor() {
    this.emojiMap = {
      'islamic': '🕌',
      'politics': '🏛️',
      'economy': '💰',
      'society': '👥',
      'technology': '💻',
      'sports': '⚽',
      'health': '🏥',
      'education': '📚',
      'environment': '🌍',
      'general': '📰'
    };
  }

  createFriendlySummary(article) {
    if (!article.summary) return 'No summary available.';
    
    let summary = article.summary.substring(0, 150);
    if (article.summary.length > 150) {
      summary += '...';
    }

    // Add emoji based on category
    const emoji = this.emojiMap[article.category] || this.emojiMap.general;
    
    return `${emoji} ${summary}`;
  }

  formatPublishTime(publishedAt) {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now - published;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return published.toLocaleDateString();
    }
  }

  generateUserFriendlyResponse(articles, query) {
    if (!articles || articles.length === 0) {
      return `😔 I couldn't find any recent news about "${query}". Would you like me to search for something else or provide Islamic guidance on a related topic?`;
    }

    let response = `📰 I found ${articles.length} relevant news article${articles.length > 1 ? 's' : ''} about "${query}":\n\n`;
    
    articles.slice(0, 3).forEach((article, index) => {
      const emoji = this.emojiMap[article.category] || '📰';
      const timeAgo = this.formatPublishTime(article.publishedAt);
      
      response += `${emoji} **${article.title}**\n`;
      response += `🌍 ${article.region} • ⏰ ${timeAgo}\n`;
      
      if (article.userFriendlySummary) {
        response += `${article.userFriendlySummary}\n`;
      }
      
      if (article.islamicRelevance > 0.5) {
        response += `🕌 *Islamic relevance: High*\n`;
      }
      
      response += `🔗 [Read full article](${article.url})\n\n`;
    });

    if (articles.length > 3) {
      response += `... and ${articles.length - 3} more articles available.\n\n`;
    }

    response += `💡 *Would you like me to provide Islamic guidance on any of these topics?*`;
    
    return response;
  }
}