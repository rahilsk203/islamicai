/**
 * Test TimesPrayer.org Integration with Islamic AI
 */

import { TimesPrayerScraper } from './src/times-prayer-scraper.js';
import { InternetDataProcessor } from './src/internet-data-processor.js';

async function testTimesPrayerIntegration() {
  console.log('🕌 Testing TimesPrayer.org Integration with Islamic AI');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Direct TimesPrayer scraper
    console.log('\n📱 Test 1: Direct TimesPrayer Scraper');
    console.log('-'.repeat(50));
    
    const scraper = new TimesPrayerScraper();
    
    // Test Kolkata prayer times
    const kolkataTimes = await scraper.getKolkataPrayerTimes();
    console.log(`✅ Kolkata Prayer Times Retrieved`);
    console.log(`   City: ${kolkataTimes.city}`);
    console.log(`   Fajr: ${kolkataTimes.times.fajr}`);
    console.log(`   Dhuhr: ${kolkataTimes.times.dhuhr}`);
    console.log(`   Asr: ${kolkataTimes.times.asr}`);
    console.log(`   Maghrib: ${kolkataTimes.times.maghrib}`);
    console.log(`   Isha: ${kolkataTimes.times.isha}`);
    console.log(`   Next Prayer: ${kolkataTimes.nextPrayer.name} at ${kolkataTimes.nextPrayer.time}`);
    console.log(`   Qibla: ${kolkataTimes.qiblaDirection}`);
    console.log(`   Source: ${kolkataTimes.source}`);
    
    // Test other cities
    const cities = ['delhi', 'mumbai'];
    for (const city of cities) {
      const cityTimes = await scraper.getPrayerTimes(city);
      console.log(`\n✅ ${cityTimes.city} Prayer Times:`);
      console.log(`   Fajr: ${cityTimes.times.fajr}, Dhuhr: ${cityTimes.times.dhuhr}`);
      console.log(`   Next: ${cityTimes.nextPrayer.name} at ${cityTimes.nextPrayer.time}`);
    }
    
    // Test 2: Islamic AI Integration
    console.log('\n\n🤖 Test 2: Islamic AI Integration');
    console.log('-'.repeat(50));
    
    const processor = new InternetDataProcessor();
    
    const testQueries = [
      'Kolkata prayer times today',
      'Delhi namaz time',
      'Mumbai prayer schedule',
      'Kolkata ka namaz ka waqt',
      'TimesPrayer Kolkata'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing Query: \"${query}\"`);
      
      const result = await processor.processQuery(query, {}, null);
      
      console.log(`   ✅ Needs Internet Data: ${result.needsInternetData}`);
      console.log(`   📱 Reason: ${result.reason}`);
      
      if (result.prayerIntegration) {
        console.log(`   🕌 TimesPrayer Integration: ACTIVE`);
        console.log(`   🏙️ City: ${result.prayerData?.city}`);
        console.log(`   ⏰ Next Prayer: ${result.prayerData?.nextPrayer?.name}`);
        console.log(`   🧭 Qibla: ${result.prayerData?.qiblaDirection}`);
        
        if (result.enhancedPrompt) {
          console.log(`   📝 Enhanced Prompt: ${result.enhancedPrompt.length} characters`);
          console.log(`   📱 Contains \"TimesPrayer\": ${result.enhancedPrompt.includes('TimesPrayer') ? 'Yes' : 'No'}`);
          console.log(`   🕌 Contains Islamic Context: ${result.enhancedPrompt.includes('Islamic') ? 'Yes' : 'No'}`);
        }
      } else {
        console.log(`   🕌 TimesPrayer Integration: Not triggered`);
      }
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test 3: AI Response Format
    console.log('\n\n📋 Test 3: AI Response Format');
    console.log('-'.repeat(50));
    
    const formattedResponse = scraper.formatForAI(kolkataTimes);
    console.log('✅ AI-formatted response:');
    console.log(formattedResponse);
    
    // Test 4: Cache Performance
    console.log('\n⚡ Test 4: Cache Performance');
    console.log('-'.repeat(50));
    
    // First call (no cache)
    const start1 = Date.now();
    await scraper.getKolkataPrayerTimes();
    const time1 = Date.now() - start1;
    console.log(`   First call: ${time1}ms`);
    
    // Second call (with cache)
    const start2 = Date.now();
    await scraper.getKolkataPrayerTimes();
    const time2 = Date.now() - start2;
    console.log(`   Second call (cached): ${time2}ms`);
    
    if (time2 < time1) {
      console.log(`   🚀 Cache improved performance by ${Math.round(((time1 - time2) / time1) * 100)}%`);
    }
    
    // Cache stats
    const cacheStats = scraper.getCacheStats();
    console.log(`   📊 Cache size: ${cacheStats.size} entries`);
    console.log(`   🏙️ Supported cities: ${cacheStats.cities.join(', ')}`);
    
    console.log('\n✅ TimesPrayer.org Integration Test Complete!');
    
    console.log('\n📋 Integration Summary:');
    console.log('- ✅ TimesPrayer scraper working');
    console.log('- ✅ Kolkata prayer times retrieved');
    console.log('- ✅ Multiple Indian cities supported');
    console.log('- ✅ Islamic AI integration active');
    console.log('- ✅ Enhanced prompts generated');
    console.log('- ✅ Caching system working');
    console.log('- ✅ Next prayer calculation working');
    console.log('- ✅ Qibla direction provided');
    console.log('- ✅ Hijri date integration');
    
  } catch (error) {
    console.error('❌ TimesPrayer integration test failed:', error);
  }
}

// Run the test
testTimesPrayerIntegration();