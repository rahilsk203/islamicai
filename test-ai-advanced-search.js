/**
 * Test script for AI integration with Advanced Web Search
 * Tests the full integration of AI with enhanced search capabilities
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';
import { AdvancedWebSearch } from './src/advanced-web-search.js';

async function testAIIntegration() {
  console.log('🔍 Testing AI Integration with Advanced Web Search\n');
  
  // Initialize components
  const internetProcessor = new InternetDataProcessor();
  const advancedSearch = new AdvancedWebSearch();
  
  // Test cases that demonstrate AI integration with advanced search
  const testCases = [
    {
      query: "What are today's prayer times in Istanbul?",
      description: "Location-based prayer times with advanced context analysis",
      context: { language: 'en', region: 'tr' },
      ip: null
    },
    {
      query: "What is the current situation in Syria?",
      description: "Current events query with advanced search strategy",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "How to calculate Zakat for 2024 gold prices?",
      description: "Complex Islamic finance query with multi-engine search",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "When does Ramadan start in 2024 in Malaysia?",
      description: "Islamic calendar query with regional context",
      context: { language: 'en', region: 'my' },
      ip: null
    },
    {
      query: "Latest news about Palestinian refugees",
      description: "Current news query with entity recognition",
      context: { language: 'en', region: 'us' },
      ip: null
    }
  ];
  
  // Test each case
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n${index + 1}. Testing: "${testCase.query}"`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   ${'─'.repeat(60)}`);
    
    try {
      // Test advanced search directly
      console.log('   🧠 Advanced Search Analysis:');
      const searchDecision = advancedSearch.needsInternetSearch(testCase.query);
      console.log(`      Needs Search: ${searchDecision.needsSearch}`);
      console.log(`      Reason: ${searchDecision.reason}`);
      console.log(`      Priority: ${searchDecision.priority}`);
      
      if (searchDecision.context) {
        console.log(`      Context:`);
        console.log(`        Question Type: ${searchDecision.context.questionType}`);
        console.log(`        Temporal Focus: ${searchDecision.context.temporalFocus}`);
        console.log(`        Complexity: ${searchDecision.context.complexity}`);
        console.log(`        Requires Current Data: ${searchDecision.context.requiresCurrentData}`);
      }
      
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
          
          // Show top results with scores
          if (result.searchResults.results && result.searchResults.results.length > 0) {
            console.log(`      \n      🏆 Top Search Results:`);
            result.searchResults.results.slice(0, 2).forEach((res, idx) => {
              console.log(`        ${idx + 1}. ${res.title}`);
              console.log(`           Source: ${res.source}`);
              console.log(`           Type: ${res.type}`);
              if (res.score) {
                console.log(`           Relevance: ${(res.score * 100).toFixed(1)}%`);
              }
              console.log(`           Content: ${res.snippet.substring(0, 60)}...`);
            });
          }
        }
        
        // Show a snippet of the enhanced prompt
        if (result.enhancedPrompt) {
          const lines = result.enhancedPrompt.split('\n');
          const headerLines = lines.slice(0, 5);
          console.log(`      \n      📝 Enhanced Prompt Header:`);
          console.log(`        ${headerLines.join('\n        ')}`);
          if (lines.length > 5) {
            console.log(`        ... (${lines.length - 5} more lines)`);
          }
        }
      } else {
        console.log(`      ℹ️  No internet data needed for this query`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Demonstrate AI prompt enhancement
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🤖 AI Prompt Enhancement Demonstration');
  console.log(`${'─'.repeat(70)}`);
  
  const sampleQuery = "What are today's prayer times in Dubai?";
  console.log(`Sample Query: "${sampleQuery}"`);
  
  const internetData = await internetProcessor.processQuery(sampleQuery, { language: 'en' }, null);
  
  if (internetData.needsInternetData && internetData.enhancedPrompt) {
    console.log('\nEnhanced Prompt for AI:');
    console.log('──────────────────────────────────────────────────────────────────────');
    
    // Show key parts of the enhanced prompt
    const lines = internetData.enhancedPrompt.split('\n');
    const keySections = [];
    
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        if (currentSection) keySections.push(currentSection);
        currentSection = line + '\n';
      } else if (currentSection) {
        currentSection += line + '\n';
      }
    }
    if (currentSection) keySections.push(currentSection);
    
    keySections.slice(0, 3).forEach(section => {
      console.log(section);
    });
    
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log(`Total prompt length: ${internetData.enhancedPrompt.length} characters`);
  }
  
  console.log('\n✅ AI Integration with Advanced Web Search Test Complete');
  console.log('\nKey Integration Benefits:');
  console.log('  • Context-aware query understanding');
  console.log('  • Intelligent search strategy selection');
  console.log('  • Advanced result ranking and filtering');
  console.log('  • Enhanced prompt generation for AI');
  console.log('  • Better Islamic content recognition');
  console.log('  • Improved response quality and relevance');
}

// Run the test
testAIIntegration().catch(console.error);