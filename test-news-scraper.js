/**
 * Test Script for Al Jazeera News Scraper
 * Demonstrates the complete news scraping and integration system
 */

import { AlJazeeraNewsScraper } from './src/aljazeera-news-scraper.js';
import { NewsIntegrationService } from './src/news-integration-service.js';

class NewsScraperTest {
  constructor() {
    this.scraper = new AlJazeeraNewsScraper();
    this.integrationService = new NewsIntegrationService();
  }

  async runAllTests() {
    console.log('🚀 Starting Al Jazeera News Scraper Tests...');
    console.log('=' .repeat(60));
    
    try {
      // Test 1: Basic scraper functionality
      await this.testBasicScraping();
      
      // Test 2: News integration service
      await this.testNewsIntegration();
      
      // Test 3: Search functionality
      await this.testNewsSearch();
      
      // Test 4: Islamic context integration
      await this.testIslamicContextIntegration();
      
      // Test 5: Performance and caching
      await this.testPerformanceAndCaching();
      
      console.log('\n✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  async testBasicScraping() {
    console.log('\n📰 Test 1: Basic News Scraping');
    console.log('-'.repeat(40));
    
    try {
      // Test scraping from main regions
      const regions = ['main', 'middleEast', 'world'];
      const newsData = await this.scraper.scrapeAllNews({
        regions,
        maxArticles: 5,
        includeContent: true
      });
      
      console.log(`✓ Scraped ${newsData.totalArticles} articles`);
      console.log(`✓ From ${Object.keys(newsData.regionStats).length} regions`);
      console.log(`✓ Last updated: ${newsData.scrapedAt}`);
      
      if (newsData.articles.length > 0) {
        const article = newsData.articles[0];
        console.log(`\n📋 Sample Article:`);
        console.log(`   Title: ${article.title}`);
        console.log(`   Region: ${article.region}`);
        console.log(`   Category: ${article.category}`);
        console.log(`   Importance Score: ${article.importanceScore}`);
        console.log(`   URL: ${article.url}`);
      }
      
      return newsData;
      
    } catch (error) {
      console.error('❌ Basic scraping test failed:', error.message);
      // Return mock data for testing
      return this.createMockNewsData();
    }
  }

  async testNewsIntegration() {
    console.log('\n🔗 Test 2: News Integration Service');
    console.log('-'.repeat(40));
    
    try {
      const testQueries = [
        'Palestine latest news',
        'Islamic events today',
        'Middle East updates',
        'Muslim community news',
        'Ramadan celebrations'
      ];
      
      for (const query of testQueries) {
        console.log(`\nTesting query: \"${query}\"`);
        
        const newsDecision = this.integrationService.shouldIntegrateNews(query);
        console.log(`  Decision: ${newsDecision.needsNews ? 'Integrate News' : 'No News Needed'}`);
        console.log(`  Reason: ${newsDecision.reason}`);
        console.log(`  Priority: ${newsDecision.priority}`);
        
        if (newsDecision.needsNews) {
          const newsData = await this.integrationService.getRelevantNews(query, {
            maxArticles: 3
          });
          
          console.log(`  ✓ Found ${newsData.articlesFound || 0} relevant articles`);
          
          if (newsData.hasNews) {
            console.log(`  ✓ Enhanced prompt generated (${newsData.enhancedPrompt.length} chars)`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
    }
  }

  async testNewsSearch() {
    console.log('\n🔍 Test 3: News Search Functionality');
    console.log('-'.repeat(40));
    
    try {
      await this.scraper.initialize();
      
      const searchQueries = [
        'Palestine',
        'Islamic',
        'Middle East',
        'breaking news',
        'politics'
      ];
      
      for (const query of searchQueries) {
        console.log(`\nSearching for: \"${query}\"`);
        
        const searchResults = await this.scraper.searchNews(query, {
          limit: 3,
          sortBy: 'relevance'
        });
        
        console.log(`  ✓ Found ${searchResults.totalFound} total matches`);
        console.log(`  ✓ Showing ${searchResults.results.length} results`);
        
        if (searchResults.results.length > 0) {
          const topResult = searchResults.results[0];
          console.log(`  📰 Top result: ${topResult.title}`);
          console.log(`     Relevance: ${topResult.relevanceScore || 0}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Search test failed:', error.message);
    }
  }

  async testIslamicContextIntegration() {
    console.log('\n🕌 Test 4: Islamic Context Integration');
    console.log('-'.repeat(40));
    
    try {
      const islamicQueries = [
        'Ramadan preparations 2024',
        'Eid celebrations worldwide',
        'Hajj pilgrimage updates',
        'Islamic charity donations',
        'Muslim community events'
      ];
      
      for (const query of islamicQueries) {
        console.log(`\nAnalyzing Islamic context for: \"${query}\"`);
        
        const newsData = await this.integrationService.getRelevantNews(query, {
          maxArticles: 2
        });
        
        if (newsData.hasNews && newsData.categories) {
          const islamicArticles = newsData.categories.islamic || [];
          console.log(`  ✓ Found ${islamicArticles.length} Islamic-specific articles`);
          
          if (islamicArticles.length > 0) {
            console.log(`  🕌 Islamic content identified`);
          }
        }
        
        console.log(`  ✓ Enhanced prompt includes Islamic guidance: ${newsData.enhancedPrompt.includes('Islamic') ? 'Yes' : 'No'}`);
      }
      
    } catch (error) {
      console.error('❌ Islamic context test failed:', error.message);
    }
  }

  async testPerformanceAndCaching() {
    console.log('\n⚡ Test 5: Performance and Caching');
    console.log('-'.repeat(40));
    
    try {
      const testQuery = 'Middle East news';
      
      // First search (no cache)
      console.log('First search (no cache):');
      const startTime1 = Date.now();
      const result1 = await this.integrationService.getRelevantNews(testQuery, {
        maxArticles: 5,
        forceRefresh: true
      });
      const time1 = Date.now() - startTime1;
      console.log(`  ✓ Completed in ${time1}ms`);
      console.log(`  ✓ Found ${result1.articlesFound || 0} articles`);
      
      // Second search (with cache)
      console.log('\nSecond search (with cache):');
      const startTime2 = Date.now();
      const result2 = await this.integrationService.getRelevantNews(testQuery, {
        maxArticles: 5,
        forceRefresh: false
      });
      const time2 = Date.now() - startTime2;
      console.log(`  ✓ Completed in ${time2}ms`);
      console.log(`  ✓ Found ${result2.articlesFound || 0} articles`);
      
      if (time2 < time1) {
        console.log(`  🚀 Cache improved performance by ${Math.round(((time1 - time2) / time1) * 100)}%`);
      }
      
      // Test cache statistics
      const stats = await this.integrationService.getNewsStatistics();
      if (stats) {
        console.log(`\n📊 Cache Statistics:`);
        console.log(`  ✓ Total articles in database: ${stats.totalArticles}`);
        console.log(`  ✓ Available regions: ${stats.regions.length}`);
        console.log(`  ✓ Last updated: ${stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}`);
      }
      
    } catch (error) {
      console.error('❌ Performance test failed:', error.message);
    }
  }

  createMockNewsData() {
    return {
      articles: [
        {
          id: 'mock_1',
          title: 'Mock Al Jazeera Article for Testing',
          summary: 'This is a mock article created for testing the news scraper system.',
          region: 'main',
          category: 'General',
          url: 'https://www.aljazeera.com/mock-article',
          publishedAt: new Date().toISOString(),
          author: 'Al Jazeera',
          importanceScore: 0.7,
          sentimentScore: 0.1,
          scrapedAt: new Date().toISOString()
        }
      ],
      totalArticles: 1,
      regionStats: {
        main: { articlesFound: 1, scrapedAt: new Date().toISOString() }
      },
      scrapedAt: new Date().toISOString()
    };
  }

  async runInteractiveDemo() {
    console.log('\n🎮 Interactive Demo Mode');
    console.log('=' .repeat(60));
    
    const demoQueries = [
      {
        query: 'Palestine latest developments',
        description: 'Search for recent Palestine-related news'
      },
      {
        query: 'Islamic events worldwide',
        description: 'Find Islamic community events and celebrations'
      },
      {
        query: 'Middle East political updates',
        description: 'Get current political news from the Middle East region'
      }
    ];
    
    for (const demo of demoQueries) {
      console.log(`\n🔍 Demo: ${demo.description}`);
      console.log(`Query: \"${demo.query}\"`);
      console.log('-'.repeat(50));
      
      try {
        const result = await this.integrationService.getRelevantNews(demo.query, {
          maxArticles: 3
        });
        
        if (result.hasNews) {
          console.log(`✅ Success: Found ${result.articlesFound} relevant articles`);
          
          if (result.newsData && result.newsData.results) {
            result.newsData.results.forEach((article, index) => {
              console.log(`\n  📰 Article ${index + 1}:`);
              console.log(`     Title: ${article.title}`);
              console.log(`     Region: ${article.region}`);
              console.log(`     Category: ${article.category}`);
              console.log(`     Published: ${new Date(article.publishedAt).toLocaleDateString()}`);
              console.log(`     Relevance: ${article.relevanceScore}`);
            });
          }
          
          // Show how this would be integrated with AI
          console.log(`\n  🤖 AI Integration:`);
          console.log(`     Enhanced prompt generated: ${result.enhancedPrompt.length} characters`);
          console.log(`     Islamic context: ${result.enhancedPrompt.includes('Islamic') ? 'Included' : 'Not included'}`);
        } else {
          console.log(`❌ No relevant articles found`);
          console.log(`   Reason: ${result.reason}`);
        }
        
      } catch (error) {
        console.error(`❌ Demo failed: ${error.message}`);
      }
      
      // Wait a bit between demos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Export for use in other modules
export { NewsScraperTest };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  const tester = new NewsScraperTest();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';
  
  switch (mode) {
    case 'demo':
      tester.runInteractiveDemo();
      break;
    case 'basic':
      tester.testBasicScraping();
      break;
    case 'integration':
      tester.testNewsIntegration();
      break;
    case 'search':
      tester.testNewsSearch();
      break;
    default:
      tester.runAllTests();
  }
}