/**
 * Test script for Advanced Web Search Integration
 * Tests the enhanced internet data processing capabilities
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testAdvancedWebSearch() {
  console.log('🔍 Testing Advanced Web Search Integration\n');
  
  // Initialize the internet data processor
  const processor = new InternetDataProcessor();
  
  // Test cases with different query types
  const testCases = [
    {
      query: "What are today's prayer times in London?",
      description: "Location-based prayer times query",
      ip: "8.8.8.8" // Sample IP for London
    },
    {
      query: "What is the current situation in Palestine?",
      description: "Current events query requiring advanced search",
      ip: null
    },
    {
      query: "How to calculate Zakat for 2024?",
      description: "Islamic finance query",
      ip: null
    },
    {
      query: "What are the dates for Ramadan 2024?",
      description: "Islamic calendar query",
      ip: null
    },
    {
      query: "What is the weather forecast for Mecca today?",
      description: "Weather query with Islamic context",
      ip: null
    },
    {
      query: "What are the latest news about Hajj 2024?",
      description: "Current Islamic events query",
      ip: null
    }
  ];
  
  // Test each case
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n${index + 1}. Testing: "${testCase.query}"`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   ${'─'.repeat(50)}`);
    
    try {
      // Process the query
      const result = await processor.processQuery(
        testCase.query, 
        {
          sessionId: `test-${index + 1}`,
          language: 'en',
          region: 'us'
        }, 
        testCase.ip
      );
      
      console.log(`   🔍 Search Needed: ${result.needsInternetData ? 'YES' : 'NO'}`);
      console.log(`   📝 Reason: ${result.reason}`);
      
      if (result.needsInternetData) {
        console.log(`   📊 Data Quality: ${result.data?.dataQuality || 'unknown'}`);
        console.log(`   🕌 Islamic Relevance: ${result.data?.islamicRelevance || 'unknown'}`);
        console.log(`   📚 Sources: ${result.data?.sources?.join(', ') || 'none'}`);
        console.log(`   📄 Results Found: ${result.data?.results?.length || 0}`);
        
        if (result.searchResults) {
          console.log(`   ⚡ Search Type: ${result.searchResults.fromCache !== undefined ? 'Advanced' : 'Regular'}`);
          if (result.searchResults.searchStrategy) {
            console.log(`   🎯 Search Strategy: ${JSON.stringify(result.searchResults.searchStrategy)}`);
          }
        }
        
        // Show a snippet of the enhanced prompt
        if (result.enhancedPrompt) {
          const promptLines = result.enhancedPrompt.split('\n');
          const snippet = promptLines.slice(0, 10).join('\n');
          console.log(`   📝 Enhanced Prompt Snippet:\n${snippet}${promptLines.length > 10 ? '\n      ...' : ''}`);
        }
      } else {
        console.log(`   ℹ️  No internet data needed for this query`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Show cache statistics
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📊 Cache Statistics:');
  const stats = processor.getProcessingStats();
  console.log(`   Web Search Cache Size: ${stats.webSearchStats.size}`);
  console.log(`   Cache Timeout: ${stats.webSearchStats.timeout}ms`);
  
  console.log('\n✅ Advanced Web Search Integration Test Complete');
}

// Run the test
testAdvancedWebSearch().catch(console.error);