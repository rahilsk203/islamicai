/**
 * Test script for prayer times scraping functionality
 */

import { LocationPrayerService } from './src/location-prayer-service.js';

async function testKolkataPrayerTimes() {
  console.log('Testing Kolkata prayer times scraping...');
  
  try {
    // Create an instance of the location prayer service
    const prayerService = new LocationPrayerService();
    
    // Create a mock location object for Kolkata
    const kolkataLocation = {
      lat: 22.5726,
      lng: 88.3639,
      city: 'Kolkata',
      region: 'West Bengal',
      country: 'India',
      timezone: 'Asia/Kolkata',
      ip: 'test',
      source: 'test'
    };
    
    // Get today's prayer times
    console.log('Fetching today\'s prayer times for Kolkata...');
    const todayPrayerTimes = await prayerService.getPrayerTimes(kolkataLocation, new Date());
    console.log('Today\'s Prayer Times:', JSON.stringify(todayPrayerTimes, null, 2));
    
    // Get tomorrow's prayer times
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    console.log('Fetching tomorrow\'s prayer times for Kolkata...');
    const tomorrowPrayerTimes = await prayerService.getPrayerTimes(kolkataLocation, tomorrow);
    console.log('Tomorrow\'s Prayer Times:', JSON.stringify(tomorrowPrayerTimes, null, 2));
    
    // Verify that we got the expected data from timesprayer.org
    if (todayPrayerTimes && todayPrayerTimes.source === 'timesprayer.org') {
      console.log('✅ Successfully fetched prayer times from timesprayer.org');
      console.log('✅ Source:', todayPrayerTimes.source);
      console.log('✅ Date:', todayPrayerTimes.date);
      console.log('✅ Fajr:', todayPrayerTimes.times.fajr);
      console.log('✅ Dhuhr:', todayPrayerTimes.times.dhuhr);
      console.log('✅ Asr:', todayPrayerTimes.times.asr);
      console.log('✅ Maghrib:', todayPrayerTimes.times.maghrib);
      console.log('✅ Isha:', todayPrayerTimes.times.isha);
    } else {
      console.log('⚠️  Fell back to calculated prayer times instead of scraping');
    }
    
    // Test with a city that's not in our mapping to ensure fallback works
    const unknownLocation = {
      lat: 0,
      lng: 0,
      city: 'Unknown City',
      region: 'Unknown Region',
      country: 'Unknown Country',
      timezone: 'UTC',
      ip: 'test',
      source: 'test'
    };
    
    console.log('Testing with unknown city (should fall back to calculation)...');
    const fallbackPrayerTimes = await prayerService.getPrayerTimes(unknownLocation, new Date());
    console.log('Fallback Prayer Times:', JSON.stringify(fallbackPrayerTimes, null, 2));
    
    if (fallbackPrayerTimes && fallbackPrayerTimes.calculationMethod) {
      console.log('✅ Successfully fell back to calculated prayer times');
    }
    
  } catch (error) {
    console.error('Error testing prayer times:', error);
  }
}

// Run the test
testKolkataPrayerTimes();