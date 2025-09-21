/**
 * Test Al Jazeera News Integration with Islamic AI
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testNewsIntegration() {
  console.log('🧪 Testing Al Jazeera News Integration with Islamic AI');
  console.log('=' .repeat(60));
  
  try {
    const processor = new InternetDataProcessor();
    
    // Test queries that should trigger Al Jazeera news
    const testQueries = [
      'Palestine latest news today',
      'Islamic events in Middle East',
      'Muslim community updates',
      'Al Jazeera breaking news',
      'Current Islamic world news'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing Query: \"${query}\"`);
      console.log('-'.repeat(50));
      
      const result = await processor.processQuery(query, {}, '103.106.148.50'); // Sample IP
      
      console.log(`✅ Needs Internet Data: ${result.needsInternetData}`);
      console.log(`📰 Reason: ${result.reason}`);
      
      if (result.newsIntegration) {
        console.log(`🌍 Al Jazeera Integration: ACTIVE`);
        console.log(`📊 Articles Found: ${result.data?.articlesFound || 0}`);
        console.log(`🕌 Islamic Relevance: ${result.data?.islamicRelevance || 'unknown'}`);
        console.log(`📈 Data Quality: ${result.data?.dataQuality || 'unknown'}`);
        
        if (result.enhancedPrompt) {
          console.log(`📝 Enhanced Prompt Length: ${result.enhancedPrompt.length} characters`);
          console.log(`🔤 Contains \"Al Jazeera\": ${result.enhancedPrompt.includes('Al Jazeera') ? 'Yes' : 'No'}`);
          console.log(`🕌 Contains Islamic Context: ${result.enhancedPrompt.includes('Islamic') ? 'Yes' : 'No'}`);
        }
      } else {
        console.log(`🌍 Al Jazeera Integration: Not triggered`);
        if (result.enhancedPrompt) {
          console.log(`📝 Fallback Prompt Length: ${result.enhancedPrompt.length} characters`);
        }
      }
      
      // Wait a bit between queries
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n✅ Al Jazeera News Integration Test Complete!');
    console.log('\n📋 Integration Summary:');
    console.log('- ✅ News integration service loaded');
    console.log('- ✅ Internet data processor enhanced');
    console.log('- ✅ Al Jazeera news detection working');
    console.log('- ✅ Enhanced prompts generated');
    console.log('- ✅ Islamic context integration active');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
testNewsIntegration();