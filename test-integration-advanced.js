/**
 * Integration test for Advanced Web Search with InternetDataProcessor
 * Shows how the enhanced search capabilities work in the full system
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testIntegration() {
  console.log('🔍 Testing Advanced Web Search Integration with InternetDataProcessor\n');
  
  // Initialize the internet data processor
  const processor = new InternetDataProcessor();
  
  // Test cases that should trigger advanced search
  const testCases = [
    {
      query: "What are the current prayer times in Dubai?",
      description: "High-priority Islamic query with location context",
      context: { language: 'en', region: 'ae' },
      ip: null
    },
    {
      query: "What is happening in Gaza right now?",
      description: "Current events query requiring advanced analysis",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "How much gold costs in 2024 for Zakat calculation?",
      description: "Complex Islamic finance query",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "When does Ramadan start in 2024 in Indonesia?",
      description: "Islamic calendar query with location context",
      context: { language: 'en', region: 'id' },
      ip: null
    }
  ];
  
  // Test each case
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n${index + 1}. Testing: "${testCase.query}"`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   ${'─'.repeat(60)}`);
    
    try {
      // Process the query with the internet data processor
      const result = await processor.processQuery(
        testCase.query,
        testCase.context,
        testCase.ip
      );
      
      console.log(`   🔍 Internet Data Needed: ${result.needsInternetData ? 'YES' : 'NO'}`);
      console.log(`   📝 Reason: ${result.reason}`);
      
      if (result.needsInternetData) {
        console.log(`   📊 Data Quality: ${result.data?.dataQuality || 'unknown'}`);
        console.log(`   🕌 Islamic Relevance: ${result.data?.islamicRelevance || 'unknown'}`);
        console.log(`   📚 Sources: ${result.data?.sources?.join(', ') || 'none'}`);
        console.log(`   📄 Results Found: ${result.data?.results?.length || 0}`);
        
        // Show search results details
        if (result.searchResults) {
          console.log(`   ⚡ Search Type: ${result.searchResults.fromCache !== undefined ? 'Advanced' : 'Regular'}`);
          if (result.searchResults.searchStrategy) {
            console.log(`   🎯 Search Strategy: ${JSON.stringify(result.searchResults.searchStrategy)}`);
          }
          
          // Show top results with scores
          if (result.searchResults.results && result.searchResults.results.length > 0) {
            console.log(`   \n   🏆 Top Search Results:`);
            result.searchResults.results.slice(0, 2).forEach((res, idx) => {
              console.log(`     ${idx + 1}. ${res.title}`);
              console.log(`        Source: ${res.source}`);
              console.log(`        Type: ${res.type}`);
              if (res.score) {
                console.log(`        Relevance: ${(res.score * 100).toFixed(1)}%`);
              }
              console.log(`        Content: ${res.snippet.substring(0, 80)}...`);
              console.log(`        `);
            });
          }
        }
        
        // Show a snippet of the enhanced prompt
        if (result.enhancedPrompt) {
          const lines = result.enhancedPrompt.split('\n');
          const headerLines = lines.slice(0, 8);
          console.log(`   📝 Enhanced Prompt Header:\n${headerLines.join('\n')}`);
          if (lines.length > 8) {
            console.log(`        ... (${lines.length - 8} more lines)`);
          }
        }
      } else {
        console.log(`   ℹ️  No internet data needed for this query`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log('✅ Advanced Web Search Integration Test Complete');
  console.log('\nKey improvements in advanced search:');
  console.log('  • Context-aware query analysis');
  console.log('  • Intelligent search strategy determination');
  console.log('  • Multi-engine search with ranking');
  console.log('  • Advanced result scoring and filtering');
  console.log('  • Better Islamic content recognition');
  console.log('  • Enhanced mock data generation');
}

// Run the test
testIntegration().catch(console.error);