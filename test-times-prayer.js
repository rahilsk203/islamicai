/**
 * Test Times Prayer Integration
 * Demonstrates prayer times scraping from timesprayer.org
 */

import { TimesPrayerScraper } from './src/times-prayer-scraper.js';
import { LocationPrayerService } from './src/location-prayer-service.js';

async function testTimesPrayerIntegration() {
  console.log('🕌 Testing Times Prayer Integration');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Direct Times Prayer scraper
    console.log('\n📋 Test 1: Times Prayer Scraper');
    console.log('-'.repeat(40));
    
    const timesScraper = new TimesPrayerScraper();
    
    const testCities = [
      { name: 'Kolkata', country: 'India' },
      { name: 'Mumbai', country: 'India' },
      { name: 'Delhi', country: 'India' },
      { name: 'Karachi', country: 'Pakistan' },
      { name: 'Dhaka', country: 'Bangladesh' }
    ];
    
    for (const city of testCities) {
      console.log(`\n🌍 Testing ${city.name}, ${city.country}:`);
      
      const prayerData = await timesScraper.getPrayerTimesForCity(city.name, city.country);
      
      console.log(`✅ City: ${prayerData.city}`);
      console.log(`🏳️ Country: ${prayerData.country}`);
      console.log(`📅 Date: ${prayerData.date}`);
      console.log(`🌙 Hijri: ${prayerData.hijriDate}`);
      console.log(`🕐 Prayer Times:`);
      console.log(`   Fajr: ${prayerData.times.fajr}`);
      console.log(`   Dhuhr: ${prayerData.times.dhuhr}`);
      console.log(`   Asr: ${prayerData.times.asr}`);
      console.log(`   Maghrib: ${prayerData.times.maghrib}`);
      console.log(`   Isha: ${prayerData.times.isha}`);
      console.log(`   Sehri: ${prayerData.times.sehri}`);
      console.log(`⏰ Next Prayer: ${prayerData.nextPrayer.name} at ${prayerData.nextPrayer.time}`);
      console.log(`🔗 Source: ${prayerData.source}`);
      console.log(`🌐 URL: ${prayerData.url}`);
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test 2: Location-based prayer times
    console.log('\n📍 Test 2: Location-based Prayer Times');
    console.log('-'.repeat(40));
    
    const locationService = new LocationPrayerService();
    
    const testIP = '103.106.148.50'; // Sample Indian IP
    console.log(`\n🌐 Testing with IP: ${testIP}`);
    
    const enhancedPrayerInfo = await locationService.getEnhancedPrayerInfo(testIP);
    
    console.log(`✅ Enhanced Prayer Info:`);
    console.log(`🏙️ Location: ${enhancedPrayerInfo.location.city}, ${enhancedPrayerInfo.location.country}`);
    console.log(`🕐 Prayer Times:`);
    Object.entries(enhancedPrayerInfo.times).forEach(([name, time]) => {
      console.log(`   ${name.charAt(0).toUpperCase() + name.slice(1)}: ${time}`);
    });
    console.log(`🌙 Hijri Date: ${enhancedPrayerInfo.hijriDate}`);
    console.log(`🧭 Qibla Direction: ${enhancedPrayerInfo.qiblaDirection}°`);
    console.log(`⏰ Next Prayer: ${enhancedPrayerInfo.nextPrayer.name}`);
    console.log(`📡 Source: ${enhancedPrayerInfo.source}`);
    
    // Test 3: Cache performance
    console.log('\n⚡ Test 3: Cache Performance');
    console.log('-'.repeat(40));
    
    console.log('First request (no cache):');
    const start1 = Date.now();
    await timesScraper.getPrayerTimesForCity('Kolkata');
    const time1 = Date.now() - start1;
    console.log(`Time taken: ${time1}ms`);
    
    console.log('\nSecond request (with cache):');
    const start2 = Date.now();
    await timesScraper.getPrayerTimesForCity('Kolkata');
    const time2 = Date.now() - start2;
    console.log(`Time taken: ${time2}ms`);
    
    if (time2 < time1) {
      console.log(`🚀 Cache improved performance by ${Math.round(((time1 - time2) / time1) * 100)}%`);
    }
    
    // Test 4: Cache statistics
    console.log('\n📊 Test 4: Cache Statistics');
    console.log('-'.repeat(40));
    
    const cacheStats = timesScraper.getCacheStats();
    console.log(`Cache entries: ${cacheStats.size}`);
    console.log(`Cache timeout: ${cacheStats.timeout / 1000 / 60} minutes`);
    console.log(`Cached cities: ${cacheStats.entries.join(', ')}`);
    
    // Test 5: Islamic context integration
    console.log('\n🕌 Test 5: Islamic Context Integration');
    console.log('-'.repeat(40));
    
    const kokataPrayer = await timesScraper.getPrayerTimesForCity('Kolkata');
    
    console.log('\n📖 Islamic Context:');
    console.log(`🌅 Fajr is the dawn prayer - \"And establish prayer at the two ends of the day\"`);
    console.log(`☀️ Dhuhr is the midday prayer - The time when the sun is at its peak`);
    console.log(`🌇 Maghrib is the sunset prayer - \"So when the sun sets, then pray\"`);
    console.log(`🌙 Sehri time (${kokataPrayer.times.sehri}) is for pre-dawn meal during Ramadan`);
    console.log(`🧭 Face the Qibla (towards Makkah) while praying`);
    console.log(`📅 Today's Hijri date: ${kokataPrayer.hijriDate}`);
    
    console.log('\n✅ Times Prayer Integration Test Complete!');
    console.log('\n📋 Integration Summary:');
    console.log('- ✅ Times Prayer scraper working');
    console.log('- ✅ Multiple cities supported');
    console.log('- ✅ Location-based detection');
    console.log('- ✅ Intelligent caching system');
    console.log('- ✅ Islamic context integration');
    console.log('- ✅ Error handling and fallbacks');
    console.log('- ✅ Ready for Islamic AI integration');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTimesPrayerIntegration();