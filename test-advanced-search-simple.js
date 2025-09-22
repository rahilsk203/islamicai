/**
 * Simple test for Advanced Web Search
 * Demonstrates the enhanced capabilities
 */

import { AdvancedWebSearch } from './src/advanced-web-search.js';

async function testAdvancedSearch() {
  console.log('🔍 Testing Advanced Web Search\n');
  
  // Initialize the advanced web search
  const advancedSearch = new AdvancedWebSearch();
  
  // Test queries
  const testQueries = [
    "What are today's prayer times in Karachi?",
    "Current situation in Palestine",
    "Zakat calculation 2024",
    "Ramadan 2024 dates",
    "Weather in Mecca today",
    "Latest news about Hajj 2024"
  ];
  
  // Test each query
  for (const [index, query] of testQueries.entries()) {
    console.log(`\n${index + 1}. Query: "${query}"`);
    
    // Test needsInternetSearch
    const searchDecision = advancedSearch.needsInternetSearch(query);
    console.log(`   Needs Search: ${searchDecision.needsSearch}`);
    console.log(`   Reason: ${searchDecision.reason}`);
    console.log(`   Priority: ${searchDecision.priority}`);
    
    if (searchDecision.context) {
      console.log(`   Context Analysis:`);
      console.log(`     Question Type: ${searchDecision.context.questionType}`);
      console.log(`     Temporal Focus: ${searchDecision.context.temporalFocus}`);
      console.log(`     Complexity: ${searchDecision.context.complexity}`);
      console.log(`     Requires Current Data: ${searchDecision.context.requiresCurrentData}`);
    }
    
    // Test actual search (will use mock data)
    console.log(`   \n   Performing search...`);
    const results = await advancedSearch.search(query, {
      maxResults: 3,
      includeIslamicSources: true
    });
    
    console.log(`   Success: ${results.success}`);
    console.log(`   Results Found: ${results.results?.length || 0}`);
    console.log(`   Sources: ${results.sources?.join(', ') || 'none'}`);
    
    if (results.results && results.results.length > 0) {
      console.log(`   \n   Top Result:`);
      const topResult = results.results[0];
      console.log(`     Title: ${topResult.title}`);
      console.log(`     Source: ${topResult.source}`);
      console.log(`     Type: ${topResult.type}`);
      if (topResult.score) {
        console.log(`     Relevance Score: ${(topResult.score * 100).toFixed(1)}%`);
      }
      console.log(`     Content: ${topResult.snippet.substring(0, 100)}...`);
    }
    
    console.log(`   ${'─'.repeat(50)}`);
  }
  
  console.log('\n✅ Advanced Web Search Test Complete');
}

// Run the test
testAdvancedSearch().catch(console.error);