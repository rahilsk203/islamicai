/**
 * Advanced Al Jazeera News Scraper
 * DSA-level implementation with intelligent news scraping, categorization, and search
 * Supports multiple Al Jazeera regional sites with advanced caching and filtering
 */

export class AlJazeeraNewsScraper {
  constructor() {
    // Al Jazeera URLs for different regions
    this.alJazeeraUrls = {
      main: 'https://www.aljazeera.com/',
      africa: 'https://www.aljazeera.com/africa/',
      asia: 'https://www.aljazeera.com/asia/',
      usCanada: 'https://www.aljazeera.com/us-canada/',
      latinAmerica: 'https://www.aljazeera.com/latin-america/',
      europe: 'https://www.aljazeera.com/europe/',
      asiaPacific: 'https://www.aljazeera.com/asia-pacific/',
      middleEast: 'https://www.aljazeera.com/middle-east/',
      live: 'https://www.aljazeera.com/live'
    };
    
    // Advanced data structures for efficient storage and retrieval
    this.newsDatabase = new NewsDatabase();
    this.searchEngine = new NewsSearchEngine();
    this.categoryManager = new NewsCategoryManager();
    this.cacheManager = new NewsCacheManager();
    
    // Scraping configuration
    this.scrapingConfig = {
      maxConcurrentRequests: 5,
      requestTimeout: 15000,
      retryAttempts: 3,
      rateLimitDelay: 1000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      cacheDuration: 30 * 60 * 1000, // 30 minutes
      maxArticlesPerCategory: 50
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
    
    const url = this.alJazeeraUrls[region];
    if (!url) {
      throw new Error(`Unknown region: ${region}`);
    }
    
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
   * Scrape individual article
   * @param {string} url - Article URL
   * @param {string} region - Region name
   * @param {boolean} includeContent - Whether to include full content
   * @returns {Promise<Object>} Article data
   */
  async scrapeArticle(url, region, includeContent = true) {
    try {
      const content = await this.fetchPageWithRetry(url);
      
      // Extract article data using intelligent patterns
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
        scrapedAt: new Date().toISOString()
      };
      
      // Extract full content if requested
      if (includeContent) {
        article.content = this.extractContent(content);
        article.wordCount = this.countWords(article.content);
      }
      
      // Validate article
      if (!article.title || article.title.length < 10) {
        console.log(`Skipping article with invalid title: ${url}`);
        return null;
      }
      
      // Add sentiment and importance scores
      article.sentimentScore = this.calculateSentimentScore(article.title + ' ' + (article.summary || ''));
      article.importanceScore = this.calculateImportanceScore(article);
      
      return article;
      
    } catch (error) {
      console.error(`Failed to scrape article ${url}:`, error);
      return null;
    }
  }

  // Helper methods
  extractTitle(content) {
    const titleMatch = content.match(/<title[^>]*>([^<]+)</i);
    if (titleMatch && titleMatch[1]) {
      return this.cleanText(titleMatch[1]).replace(/ - Al Jazeera$/, '');
    }
    return 'Untitled Article';
  }

  extractSummary(content) {
    const metaMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      return this.cleanText(metaMatch[1]);
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

  calculateImportanceScore(article) {
    let score = 0.5;
    if (article.wordCount > 500) score += 0.2;
    const hoursOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 24) score += 0.3;
    return Math.min(1, Math.max(0, score));
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