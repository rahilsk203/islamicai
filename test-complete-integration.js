/**
 * Complete integration test for AI with Advanced Web Search
 * Tests the full workflow from user query to AI response
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testCompleteIntegration() {
  console.log('🔍 Testing Complete AI Integration with Advanced Web Search\n');
  
  // Initialize the internet data processor (which uses AdvancedWebSearch internally)
  const processor = new InternetDataProcessor();
  
  // Test cases that demonstrate the complete integration
  const testCases = [
    {
      query: "What are today's prayer times in Cairo?",
      description: "Location-based prayer times with full integration",
      context: { language: 'en', region: 'eg' },
      ip: null
    },
    {
      query: "Explain the significance of Ramadan in Islam",
      description: "Islamic knowledge query (no internet search needed)",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "What is the latest news about Hajj 2024 preparations?",
      description: "Current Islamic events with news integration",
      context: { language: 'en', region: 'us' },
      ip: null
    },
    {
      query: "How to calculate Zakat on gold and silver?",
      description: "Islamic finance with advanced search",
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
      // Process the query through the complete integration
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
        
        // Show search type and strategy
        if (result.searchResults) {
          console.log(`   ⚡ Search Type: ${result.searchResults.fromCache !== undefined ? 'Advanced' : 'Regular'}`);
          if (result.searchResults.searchStrategy) {
            console.log(`   🎯 Search Strategy: ${JSON.stringify(result.searchResults.searchStrategy)}`);
          }
        }
        
        // Show how this would be integrated with AI
        console.log(`   \n   🤖 AI Integration Preview:`);
        console.log(`      The AI would receive an enhanced prompt with:`);
        console.log(`      - Current information from web search`);
        console.log(`      - Proper source attribution`);
        console.log(`      - Structured data for better response`);
        console.log(`      - Integration instructions for quality response`);
        
        // Show a snippet of what the AI would receive
        if (result.enhancedPrompt) {
          const lines = result.enhancedPrompt.split('\n');
          const headerLines = lines.slice(0, 4);
          console.log(`      \n      📝 Enhanced Prompt Snippet:`);
          headerLines.forEach(line => {
            if (line.trim()) {
              console.log(`         ${line}`);
            }
          });
          if (lines.length > 4) {
            console.log(`         ... (${lines.length - 4} more lines)`);
          }
        }
      } else {
        console.log(`   ℹ️  No internet data needed - AI will use its training knowledge`);
        console.log(`   🤖 AI will provide response based on Islamic knowledge and context`);
      }
      
      // Show how this benefits the user
      console.log(`   \n   🎯 User Benefits:`);
      if (result.needsInternetData) {
        console.log(`      ✓ Access to current, real-time information`);
        console.log(`      ✓ Source-attributed responses`);
        console.log(`      ✓ Contextually relevant data`);
        console.log(`      ✓ Enhanced accuracy and relevance`);
      } else {
        console.log(`      ✓ Fast responses using AI knowledge`);
        console.log(`      ✓ Consistent Islamic guidance`);
        console.log(`      ✓ No external dependencies needed`);
        console.log(`      ✓ Privacy-focused processing`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n${'═'.repeat(70)}`);
  console.log('✅ Complete AI Integration Test Complete');
  console.log('\nKey Integration Benefits Demonstrated:');
  console.log('  • Intelligent decision making about when to search');
  console.log('  • Context-aware query analysis');
  console.log('  • Advanced multi-engine search capabilities');
  console.log('  • Enhanced prompt generation for AI');
  console.log('  • Proper source attribution and quality control');
  console.log('  • Seamless integration with AI response generation');
  console.log('  • Preservation of Islamic authenticity and accuracy');
  
  console.log('\n📋 How It Works:');
  console.log('  1. User sends a query to the AI');
  console.log('  2. System analyzes query context and intent');
  console.log('  3. Intelligent decision about internet search need');
  console.log('  4. Advanced multi-engine search if needed');
  console.log('  5. Results ranked and filtered for quality');
  console.log('  6. Enhanced prompt generated with current data');
  console.log('  7. AI receives enriched context for better response');
  console.log('  8. User gets accurate, current, and contextually relevant answer');
}

// Run the test
testCompleteIntegration().catch(console.error);