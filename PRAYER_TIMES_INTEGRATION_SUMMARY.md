# Prayer Times Integration with IslamicAI

## Overview

This document explains how the prayer time scraping functionality integrates with the main IslamicAI system to provide accurate, location-based prayer times to users.

## System Architecture

### 1. Data Flow
```
User Request → IP Detection → Location Service → Prayer Time Service → AI Context → User Response
```

### 2. Key Components

#### LocationPrayerService
- Detects user location based on IP address
- Coordinates with TimesPrayerScraper for accurate prayer times
- Falls back to astronomical calculations when needed
- Implements caching for performance

#### TimesPrayerScraper
- Scrapes prayer times from timesprayer.org for supported cities
- Contains mapping for 50+ major Islamic cities
- Returns accurate, up-to-date prayer times
- Gracefully handles unsupported locations

#### IslamicPrompt (Context Integration)
- Integrates prayer time information into AI prompts
- Ensures relevant information is available for AI responses
- Maintains conversation context and flow

## How It Works

### 1. User Request Processing
When a user asks about prayer times:
1. The system detects the user's location via IP geolocation
2. LocationPrayerService is called with the location data
3. TimesPrayerScraper attempts to fetch accurate prayer times
4. If successful, the data is cached and returned
5. If unsuccessful, the system falls back to astronomical calculations

### 2. AI Integration
The prayer time data is integrated into the AI context:
- Added to the prompt with clear formatting
- Includes Quranic references for spiritual context
- Provides practical guidance for prayer observance

### 3. Response Generation
The AI generates a response that:
- Clearly presents the prayer times
- Provides Islamic context and guidance
- Includes relevant Quranic verses
- Maintains the IslamicAI tone and style

## Supported Cities

The system supports prayer time scraping for major cities including:
- **India**: Kolkata, Delhi, Mumbai, Bangalore, Hyderabad, Chennai, and 15+ others
- **Middle East**: Makkah, Madina, Riyadh, Jeddah, Dubai, Abu Dhabi, Doha, Kuwait
- **South Asia**: Dhaka, Karachi, Lahore, Islamabad
- **Southeast Asia**: Jakarta, Kuala Lumpur, Singapore
- **Other Regions**: Istanbul, Tehran, Cairo, and more

## Example Integration

### User Query
"What are the prayer times in Kolkata today?"

### System Response
1. **Location Detection**: Identifies user in Kolkata
2. **Prayer Time Fetch**: Gets accurate times from timesprayer.org:
   ```
   Fajr: 04:15
   Sunrise: 05:29
   Dhuhr: 11:26
   Asr: 14:47
   Maghrib: 17:20
   Isha: 18:35
   ```
3. **AI Context Integration**: Adds this information to the AI prompt
4. **Response Generation**: Creates a comprehensive, Islamic-guided response

### Sample AI Response
```
Assalamu Alaikum! 🤲

I'm happy to provide you with the prayer times for Kolkata today:

🕘 **Today's Prayer Times in Kolkata, India:**
- 🕌 **Fajr:** 04:15
- 🌅 **Sunrise:** 05:29
- 🕏 **Dhuhr:** 11:26
- 🕐 **Asr:** 14:47
- 🕑 **Maghrib:** 17:20
- 🕒 **Isha:** 18:35

These times are accurately sourced from timesprayer.org for your location.

📖 **Quranic Reminder:**
"Allah intends for you ease and does not intend for you hardship." (Quran 2:185)

May your prayers be accepted and your day be blessed! 🌙
```

## Benefits

1. **Accuracy**: Uses real data from timesprayer.org for supported cities
2. **Reliability**: Falls back to precise calculations for unsupported locations
3. **Performance**: Implements caching to reduce redundant requests
4. **Integration**: Seamlessly works with the existing IslamicAI architecture
5. **Scalability**: Supports 50+ major Islamic cities worldwide

## Testing

The implementation has been thoroughly tested with:
- Direct prayer time requests for supported cities
- Fallback scenarios for unsupported locations
- Cache functionality verification
- Integration with the AI context system

All tests pass successfully, confirming the system works as intended.