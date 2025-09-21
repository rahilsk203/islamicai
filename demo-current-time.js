/**
 * Demo: Current Time Functionality
 * Shows how the system handles current time queries in different languages
 */

import { WebSearch } from './src/web-search.js';
import { InternetDataProcessor } from './src/internet-data-processor.js';

async function demoCurrentTime() {
  console.log('🕐 IslamicAI Current Time Demo\n');
  console.log('=' .repeat(60));
  
  try {
    const webSearch = new WebSearch();
    const processor = new InternetDataProcessor();
    
    // Demo queries in different languages
    const demoQueries = [
      {
        query: 'current time',
        language: 'English',
        description: 'Standard English query'
      },
      {
        query: 'abhi ka time',
        language: 'Hinglish',
        description: 'Hinglish mixed language query'
      },
      {
        query: 'current waqt',
        language: 'Hinglish',
        description: 'Hinglish with Urdu word'
      },
      {
        query: 'samay kya hai',
        language: 'Hinglish',
        description: 'Hinglish question format'
      },
      {
        query: 'time kya hai abhi',
        language: 'Hinglish',
        description: 'Hinglish question with time reference'
      }
    ];
    
    for (const demo of demoQueries) {
      console.log(`\n🔍 Query: "${demo.query}"`);
      console.log(`Language: ${demo.language} - ${demo.description}`);
      console.log('-'.repeat(50));
      
      // Check if search is needed
      const searchDecision = webSearch.needsInternetSearch(demo.query);
      console.log(`Search Decision: ${searchDecision.needsSearch ? 'YES' : 'NO'} (${searchDecision.reason})`);
      
      if (searchDecision.needsSearch) {
        // Get search results
        const searchResults = await webSearch.search(demo.query, { maxResults: 1 });
        
        if (searchResults.results.length > 0) {
          const result = searchResults.results[0];
          console.log(`\n📊 Search Result:`);
          console.log(`Title: ${result.title}`);
          console.log(`Type: ${result.type}`);
          console.log(`Content: ${result.snippet}`);
          console.log(`Source: ${result.source}`);
          
          // Process the data
          const processedData = await processor.processQuery(demo.query, {
            sessionId: 'demo-session',
            languageInfo: { detected_language: 'hinglish' }
          });
          
          console.log(`\n🤖 AI Integration:`);
          console.log(`Internet Data: ${processedData.needsInternetData ? 'YES' : 'NO'}`);
          console.log(`Enhanced Prompt: ${processedData.enhancedPrompt ? 'YES' : 'NO'}`);
          console.log(`Data Quality: ${processedData.data?.dataQuality || 'N/A'}`);
        }
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Demo Completed Successfully!');
    console.log('\n📋 Key Features Demonstrated:');
    console.log('• Multi-language time query detection');
    console.log('• Real-time current time generation');
    console.log('• Hinglish language support');
    console.log('• Intelligent search results');
    console.log('• AI integration with current data');
    console.log('\n🚀 IslamicAI can now handle current time queries in multiple languages!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
demoCurrentTime();
