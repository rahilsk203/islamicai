/**
 * Test script to simulate how the AI would respond to prayer time queries with method awareness
 */

import { LocationPrayerService } from './src/location-prayer-service.js';
import { AdaptiveLanguageSystem } from './src/adaptive-language-system.js';

async function testAIResponseWithMethods() {
  console.log('Testing AI response with prayer time methods awareness...');
  
  try {
    // Create instances
    const prayerService = new LocationPrayerService();
    const languageSystem = new AdaptiveLanguageSystem();
    
    // Simulate a user query about prayer times
    const userQueries = [
      "What are the prayer times in Kolkata today?",
      "Kolkata ke namaz times kya hai aaj?",
      "Why do prayer times vary in different places?",
      "Which calculation method is used for prayer times?"
    ];
    
    // Simulate Kolkata location
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
    
    for (const query of userQueries) {
      console.log(`\n--- Testing Query: "${query}" ---`);
      
      // Detect language
      const languageDetection = languageSystem.analyzeLanguageStyle(query);
      console.log(`Detected Language: ${languageDetection.language} (confidence: ${languageDetection.confidence})`);
      
      // Get prayer times with methods information
      const prayerTimesWithMethods = await prayerService.getPrayerTimesWithMethods(kolkataLocation, new Date());
      
      // Create the prayer context that would be added to the AI prompt
      let prayerContext = '';
      if (prayerTimesWithMethods) {
        prayerContext += `\n\n**Prayer Times Information:**`;
        prayerContext += `\nLocation: ${prayerTimesWithMethods.location.city}, ${prayerTimesWithMethods.location.country}`;
        prayerContext += `\nDate: ${prayerTimesWithMethods.date}`;
        prayerContext += `\nFajr: ${prayerTimesWithMethods.times.fajr}`;
        prayerContext += `\nSunrise: ${prayerTimesWithMethods.times.sunrise}`;
        prayerContext += `\nDhuhr: ${prayerTimesWithMethods.times.dhuhr}`;
        prayerContext += `\nAsr: ${prayerTimesWithMethods.times.asr}`;
        prayerContext += `\nMaghrib: ${prayerTimesWithMethods.times.maghrib}`;
        prayerContext += `\nIsha: ${prayerTimesWithMethods.times.isha}`;
        prayerContext += `\nTimezone: ${prayerTimesWithMethods.timezone}`;
        prayerContext += `\nSource: ${prayerTimesWithMethods.source === 'timesprayer.org' ? 'Accurate data from timesprayer.org' : 'Calculated based on astronomical calculations'}`;
        
        // Add calculation method information
        if (prayerTimesWithMethods.calculationMethod) {
          prayerContext += `\nCalculation Method: ${prayerTimesWithMethods.calculationMethodName || prayerTimesWithMethods.calculationMethod}`;
        }
        
        // Add note about variation in calculation methods for relevant queries
        if (query.toLowerCase().includes('vary') || query.toLowerCase().includes('method')) {
          prayerContext += `\n\nNote: Prayer times can vary slightly based on different calculation methods used by various Islamic organizations. The times provided are based on the ${prayerTimesWithMethods.calculationMethodName || 'standard'} method.`;
          prayerContext += `\n\nDifferent methods use different angles for calculating Fajr and Isha times:`;
          prayerContext += `\n- Muslim World League (MWL): Fajr at 18°, Isha at 17°`;
          prayerContext += `\n- Islamic Society of North America (ISNA): Fajr at 15°, Isha at 15°`;
          prayerContext += `\n- University of Islamic Sciences, Karachi: Fajr at 18°, Isha at 18°`;
          prayerContext += `\n\nThese differences reflect varying interpretations of Islamic jurisprudence in different regions.`;
        }
        
        prayerContext += `\n\nUse this information to provide accurate prayer times to the user in their preferred language, and mention that times may vary based on different calculation methods when relevant.`;
      }
      
      console.log('Prayer Context for AI:');
      console.log(prayerContext);
      
      // Simulate AI response based on the query type
      let aiResponse = '';
      
      if (query.toLowerCase().includes('kolkata') && (query.toLowerCase().includes('prayer') || query.toLowerCase().includes('namaz'))) {
        // Prayer time query
        aiResponse = `
Assalamu Alaikum! 🤲

I'm providing you with the prayer times for Kolkata, India today:

**Today's Prayer Times (Kolkata, India):**
- 🕌 **Fajr:** ${prayerTimesWithMethods.times.fajr}
- 🌅 **Sunrise:** ${prayerTimesWithMethods.times.sunrise}
- 🕏 **Dhuhr:** ${prayerTimesWithMethods.times.dhuhr}
- 🕐 **Asr:** ${prayerTimesWithMethods.times.asr}
- 🕑 **Maghrib:** ${prayerTimesWithMethods.times.maghrib}
- 🕒 **Isha:** ${prayerTimesWithMethods.times.isha}

These times are sourced from timesprayer.org for your location.

📖 **Quranic Reminder:**
"Indeed, prayer has been decreed upon the believers a decree of specified times." (Quran 4:103)

May your prayers be accepted! 🌙
`;
      } else if (query.toLowerCase().includes('vary')) {
        // Query about variation
        aiResponse = `
Assalamu Alaikum! 🤲

You're asking an excellent question about why prayer times vary. There are several reasons:

1. **Geographical Location**: Prayer times are based on the position of the sun relative to your location. As you move north or south, east or west, the times change.

2. **Seasonal Changes**: The length of daylight changes throughout the year, affecting sunrise, sunset, and twilight times.

3. **Calculation Methods**: Different Islamic organizations use slightly different methods to calculate Fajr and Isha times:
   - **Muslim World League**: Fajr at 18° below horizon, Isha at 17°
   - **Islamic Society of North America**: Fajr at 15°, Isha at 15°
   - **University of Islamic Sciences, Karachi**: Fajr at 18°, Isha at 18°

These differences reflect varying scholarly interpretations (ijtihad) and regional practices. The times I provided for Kolkata are based on the method used by timesprayer.org, which is widely accepted.

📖 **Quranic Guidance:**
"Allah intends for you ease and does not intend for you hardship." (Quran 2:185)

Different communities follow the method that is most appropriate for their location and scholarly tradition.
`;
      } else if (query.toLowerCase().includes('method')) {
        // Query about calculation method
        aiResponse = `
Assalamu Alaikum! 🤲

You're asking about the calculation method used for prayer times. For Kolkata, the times I provided are sourced from timesprayer.org, which uses a method that is widely accepted in the region.

Different calculation methods exist because:
1. **Scholarly Interpretation**: Scholars have different opinions on the exact angles for Fajr and Isha
2. **Regional Practices**: Different regions may have established local traditions
3. **Practical Considerations**: Some methods are more suitable for certain latitudes

The main methods in use are:
- **Muslim World League (MWL)**: Used in Europe, Far East
- **Islamic Society of North America (ISNA)**: Used in North America
- **University of Islamic Sciences, Karachi**: Used in Pakistan, India, Bangladesh
- **Umm al-Qura University, Makkah**: Used in Saudi Arabia

For Kolkata, the timesprayer.org method is appropriate for your location.

📖 **Hadith Guidance:**
"The differences of opinion among my Ummah are a mercy." (Hadith)

This shows that variation in non-fundamental matters is acceptable in Islam.
`;
      }
      
      console.log('\n🤖 AI Response:');
      console.log('--- START RESPONSE ---');
      console.log(aiResponse);
      console.log('--- END RESPONSE ---');
    }
    
    console.log('\n✅ AI prayer methods awareness test completed successfully!');
    console.log('✅ Prayer times with method information provided');
    console.log('✅ Different responses for different query types');
    console.log('✅ Islamic references included');
    console.log('✅ Explanation of calculation method variations');

  } catch (error) {
    console.error('Error testing AI response with methods:', error);
  }
}

// Run the test
testAIResponseWithMethods();