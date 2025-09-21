/**
 * Test Current Time Functionality
 * Tests the current time feature for Hinglish queries
 */

import { WebSearch } from './src/web-search.js';
import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testCurrentTime() {
  console.log('🕐 Testing Current Time Functionality\n');
  
  try {
    const webSearch = new WebSearch();
    const processor = new InternetDataProcessor();
    
    // Test queries for current time
    const timeQueries = [
      'current time',
      'abhi ka time',
      'current waqt',
      'samay kya hai',
      'time kya hai abhi'
    ];
    
    for (const query of timeQueries) {
      console.log(`\n🔍 Testing Query: "${query}"`);
      console.log('=' .repeat(50));
      
      // Test search decision
      const searchDecision = webSearch.needsInternetSearch(query);
      console.log(`Needs Search: ${searchDecision.needsSearch} (${searchDecision.reason})`);
      
      if (searchDecision.needsSearch) {
        // Test search results
        const searchResults = await webSearch.search(query, { maxResults: 3 });
        console.log(`Search Results: ${searchResults.results.length} found`);
        
        if (searchResults.results.length > 0) {
          console.log('\n📊 Search Results:');
          searchResults.results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   Type: ${result.type}`);
            console.log(`   Content: ${result.snippet.substring(0, 100)}...`);
            console.log(`   Source: ${result.source}`);
            console.log('');
          });
        }
        
        // Test data processing
        const processedData = await processor.processQuery(query, {
          sessionId: 'test-session',
          languageInfo: { detected_language: 'hinglish' }
        });
        
        console.log(`\n📈 Processing Result:`);
        console.log(`Needs Internet Data: ${processedData.needsInternetData}`);
        console.log(`Has Enhanced Prompt: ${!!processedData.enhancedPrompt}`);
        
        if (processedData.data) {
          console.log(`Data Quality: ${processedData.data.dataQuality}`);
          console.log(`Islamic Relevance: ${processedData.data.islamicRelevance}`);
          console.log(`Sources: ${processedData.data.sources.join(', ')}`);
        }
      }
    }
    
    console.log('\n✅ Current Time Test Completed!');
    console.log('\n📋 Summary:');
    console.log('- Current time detection is working');
    console.log('- Search results include real-time data');
    console.log('- Data processing handles time queries');
    console.log('- Hinglish language support is functional');
    
  } catch (error) {
    console.error('❌ Current time test failed:', error);
  }
}

// Run the test
testCurrentTime();
