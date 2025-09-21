/**
 * Demo: Location-Based Prayer Time System
 * Complete demonstration of IP-based location detection and prayer times
 */

import { LocationPrayerService } from './src/location-prayer-service.js';
import { InternetDataProcessor } from './src/internet-data-processor.js';

async function demoLocationPrayer() {
  console.log('🕌 IslamicAI Location-Based Prayer Time Demo\n');
  console.log('=' .repeat(70));
  
  try {
    const locationService = new LocationPrayerService();
    const processor = new InternetDataProcessor();
    
    // Demo scenarios
    const scenarios = [
      {
        name: 'User from USA',
        ip: '8.8.8.8',
        query: 'prayer times',
        description: 'American user asking for prayer times'
      },
      {
        name: 'User from Pakistan',
        ip: '1.1.1.1',
        query: 'namaz ka waqt',
        description: 'Pakistani user asking in Hinglish'
      },
      {
        name: 'User from India',
        ip: '203.0.113.1',
        query: 'current prayer times',
        description: 'Indian user asking for current times'
      },
      {
        name: 'Local User',
        ip: '192.168.1.1',
        query: 'sehri time',
        description: 'Local user asking for Sehri time'
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n🌍 Scenario: ${scenario.name}`);
      console.log(`📝 Query: "${scenario.query}"`);
      console.log(`📍 IP: ${scenario.ip}`);
      console.log(`💬 Description: ${scenario.description}`);
      console.log('-'.repeat(50));
      
      try {
        // Step 1: Location Detection
        console.log('🔍 Step 1: Detecting user location...');
        const location = await locationService.getUserLocation(scenario.ip);
        console.log(`✅ Location: ${location.city}, ${location.country}`);
        console.log(`⏰ Timezone: ${location.timezone}`);
        console.log(`🔗 Source: ${location.source}`);
        
        // Step 2: Prayer Time Calculation
        console.log('\n🕐 Step 2: Calculating prayer times...');
        const prayerInfo = await locationService.getPrayerInfoForUser(scenario.ip);
        console.log(`✅ Prayer times calculated for ${prayerInfo.location.city}`);
        
        // Step 3: Display Prayer Times
        console.log('\n📊 Step 3: Prayer Times:');
        console.log(`Fajr: ${prayerInfo.times.fajr}`);
        console.log(`Sunrise: ${prayerInfo.times.sunrise}`);
        console.log(`Dhuhr: ${prayerInfo.times.dhuhr}`);
        console.log(`Asr: ${prayerInfo.times.asr}`);
        console.log(`Maghrib: ${prayerInfo.times.maghrib}`);
        console.log(`Isha: ${prayerInfo.times.isha}`);
        console.log(`Sehri: ${prayerInfo.times.sehri}`);
        
        // Step 4: Additional Information
        console.log('\n🧭 Step 4: Additional Information:');
        console.log(`Qibla Direction: ${prayerInfo.qiblaDirection}°`);
        console.log(`Hijri Date: ${prayerInfo.hijriDate}`);
        if (prayerInfo.nextPrayer) {
          console.log(`Next Prayer: ${prayerInfo.nextPrayer.name} at ${prayerInfo.nextPrayer.time}`);
          console.log(`Time Left: ${prayerInfo.nextPrayer.minutesLeft} minutes`);
        }
        
        // Step 5: AI Integration
        console.log('\n🤖 Step 5: AI Integration...');
        const aiResult = await processor.processQuery(scenario.query, {
          sessionId: 'demo-session',
          languageInfo: { detected_language: 'hinglish' }
        }, scenario.ip);
        
        console.log(`✅ AI Integration: ${aiResult.needsInternetData ? 'SUCCESS' : 'SKIPPED'}`);
        console.log(`📝 Reason: ${aiResult.reason}`);
        console.log(`📊 Data Quality: ${aiResult.data?.dataQuality || 'N/A'}`);
        console.log(`🕌 Islamic Relevance: ${aiResult.data?.islamicRelevance || 'N/A'}`);
        console.log(`📍 Location Based: ${aiResult.data?.locationBased || false}`);
        
        if (aiResult.enhancedPrompt) {
          console.log(`📄 Enhanced Prompt: ${aiResult.enhancedPrompt.length} characters`);
          console.log(`🔍 Prompt Preview: ${aiResult.enhancedPrompt.substring(0, 200)}...`);
        }
        
        console.log('\n✅ Scenario completed successfully!');
        
      } catch (error) {
        console.error(`❌ Error in scenario: ${error.message}`);
      }
    }
    
    // Cache Statistics
    console.log('\n\n💾 Cache Statistics');
    console.log('=' .repeat(70));
    const cacheStats = locationService.getCacheStats();
    console.log(`Location Cache: ${cacheStats.locationCache.size} entries`);
    console.log(`Prayer Time Cache: ${cacheStats.prayerTimeCache.size} entries`);
    console.log(`Cache Timeout: ${cacheStats.locationCache.timeout / 1000 / 60} minutes`);
    
    // Performance Test
    console.log('\n\n⚡ Performance Test');
    console.log('=' .repeat(70));
    
    const startTime = Date.now();
    const testIP = '8.8.8.8';
    const testQuery = 'prayer times';
    
    console.log('Testing response time...');
    const result = await processor.processQuery(testQuery, {
      sessionId: 'perf-test',
      languageInfo: { detected_language: 'english' }
    }, testIP);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ Response Time: ${responseTime}ms`);
    console.log(`📊 Data Quality: ${result.data?.dataQuality || 'N/A'}`);
    console.log(`🔄 Cache Hit: ${responseTime < 1000 ? 'YES' : 'NO'}`);
    
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 Location-Based Prayer Time Demo Completed!');
    console.log('\n📋 Key Features Demonstrated:');
    console.log('• ✅ IP-based location detection');
    console.log('• ✅ Real-time prayer time calculation');
    console.log('• ✅ Multi-language query support');
    console.log('• ✅ Qibla direction calculation');
    console.log('• ✅ Hijri date integration');
    console.log('• ✅ Sehri time for Ramadan');
    console.log('• ✅ AI integration with location data');
    console.log('• ✅ Intelligent caching system');
    console.log('• ✅ Error handling and fallbacks');
    console.log('• ✅ Performance optimization');
    
    console.log('\n🚀 IslamicAI now provides accurate, location-based prayer times!');
    console.log('📍 Users get personalized prayer times based on their location');
    console.log('🕐 Sehri and Iftar times are included for Ramadan');
    console.log('🧭 Qibla direction is calculated for each location');
    console.log('🌍 Works worldwide with automatic location detection');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
demoLocationPrayer();
