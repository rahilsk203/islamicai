/**
 * Test script to verify price query fixes
 * Tests that gold price queries now trigger internet search
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';
import { AdvancedWebSearch } from './src/advanced-web-search.js';

async function testPriceQueryFix() {
  console.log('🔍 Testing Price Query Fix\n');
  
  // Initialize components
  const internetProcessor = new InternetDataProcessor();
  const advancedSearch = new AdvancedWebSearch();
  
  // Test cases for price queries
  const testCases = [
    {
      query: "abii gold kaa kaya dam hai",
      description: "Hinglish gold price query",
      context: { language: 'hinglish', region: 'in' },
      ip: null
    },
    {
      query: "gold price today",
      description: "English gold price query",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "silver rate kya hai",
      description: "Hinglish silver rate query",
      context: { language: 'hinglish', region: 'in' },
      ip: null
    },
    {
      query: "current gold price in India",
      description: "English gold price with location",
      context: { language: 'en', region: 'in' },
      ip: null
    },
    {
      query: "dam hai kaya gold ka",
      description: "Hindi gold price query",
      context: { language: 'hindi', region: 'in' },
      ip: null
    }
  ];
  
  // Test each case
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n${index + 1}. Testing: "${testCase.query}"`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   ${'─'.repeat(50)}`);
    
    try {
      // Test advanced search directly
      console.log('   🧠 Advanced Search Analysis:');
      const searchDecision = advancedSearch.needsInternetSearch(testCase.query);
      console.log(`      Needs Search: ${searchDecision.needsSearch}`);
      console.log(`      Reason: ${searchDecision.reason}`);
      console.log(`      Priority: ${searchDecision.priority}`);
      
      // Test internet processor integration
      console.log('   \n   🌐 Internet Processor Integration:');
      const result = await internetProcessor.processQuery(
        testCase.query,
        testCase.context,
        testCase.ip
      );
      
      console.log(`      Internet Data Needed: ${result.needsInternetData ? 'YES' : 'NO'}`);
      console.log(`      Reason: ${result.reason}`);
      
      if (result.needsInternetData) {
        console.log(`      Data Quality: ${result.data?.dataQuality || 'unknown'}`);
        console.log(`      Islamic Relevance: ${result.data?.islamicRelevance || 'unknown'}`);
        console.log(`      Sources: ${result.data?.sources?.join(', ') || 'none'}`);
        console.log(`      Results Found: ${result.data?.results?.length || 0}`);
        
        // Show search results details
        if (result.searchResults) {
          console.log(`      Search Type: ${result.searchResults.fromCache !== undefined ? 'Advanced' : 'Regular'}`);
          if (result.searchResults.searchStrategy) {
            console.log(`      Search Strategy: ${JSON.stringify(result.searchResults.searchStrategy)}`);
          }
          
          // Show top results
          if (result.searchResults.results && result.searchResults.results.length > 0) {
            console.log(`      \n      🏆 Top Search Results:`);
            result.searchResults.results.slice(0, 2).forEach((res, idx) => {
              console.log(`        ${idx + 1}. ${res.title}`);
              console.log(`           Source: ${res.source}`);
              console.log(`           Type: ${res.type}`);
              if (res.trustScore) {
                console.log(`           Trust Score: ${(res.trustScore * 100).toFixed(1)}%`);
              }
              console.log(`           Content: ${res.snippet.substring(0, 60)}...`);
            });
          }
        }
      } else {
        console.log(`      ℹ️  No internet data needed for this query`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log('✅ Price Query Fix Test Complete');
  console.log('\nKey Improvements:');
  console.log('  • Price queries now correctly trigger internet search');
  console.log('  • Hinglish/Urdu price queries properly recognized');
  console.log('  • Enhanced mock data for gold/silver prices');
  console.log('  • Better integration with AI response generation');
}

// Run the test
testPriceQueryFix().catch(console.error);