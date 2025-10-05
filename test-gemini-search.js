/**
 * Test file for Gemini API search functionality
 */

import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys for testing
const mockApiKeys = ['test-key-1', 'test-key-2'];

// Create an instance of GeminiAPI for testing
const geminiAPI = new GeminiAPI(mockApiKeys);

// Test cases for search functionality
const testCases = [
  {
    name: 'Prayer time query',
    input: 'What are the prayer times for today in Karachi?',
    expectedSearch: true
  },
  {
    name: 'General Islamic knowledge query',
    input: 'What is the meaning of Tawhid?',
    expectedSearch: false
  },
  {
    name: 'Current news query',
    input: 'What is the latest news about Palestine?',
    expectedSearch: true
  },
  {
    name: 'Quran verse query',
    input: 'What is the meaning of Quran verse 2:255?',
    expectedSearch: false
  },
  {
    name: 'Financial data query',
    input: 'What is the current gold price?',
    expectedSearch: true
  },
  {
    name: 'Hadith query',
    input: 'Tell me about the hadith regarding patience',
    expectedSearch: false
  }
];

// Test the _shouldIncludeSearchTools method
console.log('Testing _shouldIncludeSearchTools method:');

testCases.forEach((testCase, index) => {
  // Mock internetData and queryType for testing
  const internetData = testCase.expectedSearch ? { needsInternetData: true } : { needsInternetData: false };
  const queryType = testCase.expectedSearch ? { topic: 'prayer_times' } : { topic: 'general' };
  
  const result = geminiAPI._shouldIncludeSearchTools(testCase.input, internetData, queryType);
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: "${testCase.input}"`);
  console.log(`  Expected search: ${testCase.expectedSearch}`);
  console.log(`  Actual result: ${result}`);
  console.log(`  Status: ${result === testCase.expectedSearch ? 'PASS' : 'FAIL'}`);
  console.log('');
});

// Test the _buildRequestBodyWithSearchTools method
console.log('Testing _buildRequestBodyWithSearchTools method:');

const baseRequestBody = {
  contents: [{
    role: "user",
    parts: [{ text: "Test prompt" }]
  }]
};

const withSearch = geminiAPI._buildRequestBodyWithSearchTools(baseRequestBody, true, "What is the weather today?", { needsInternetData: true });
const withoutSearch = geminiAPI._buildRequestBodyWithSearchTools(baseRequestBody, false, "What is Tawhid?", { needsInternetData: false });

console.log('Request body with search tools:');
console.log(JSON.stringify(withSearch, null, 2));
console.log('');

console.log('Request body without search tools:');
console.log(JSON.stringify(withoutSearch, null, 2));
console.log('');

// Test location-based query detection
console.log('Testing location-based query detection:');

const locationQueries = [
  'Mosques near me',
  'Islamic centers in my city',
  'Where is the nearest mosque?',
  'Local halal restaurants'
];

locationQueries.forEach(query => {
  const isLocationBased = geminiAPI.isLocationBasedQuery(query);
  console.log(`"${query}" - Location-based: ${isLocationBased}`);
});

console.log('');

// Test prayer time query detection
console.log('Testing prayer time query detection:');

const prayerTimeQueries = [
  'Fajr time today',
  'When is Asr prayer?',
  'Next prayer time',
  'Isha azaan time',
  'Prayer schedule for tomorrow'
];

prayerTimeQueries.forEach(query => {
  const isPrayerTimeQuery = geminiAPI.isPrayerTimeQuery(query);
  console.log(`"${query}" - Prayer time query: ${isPrayerTimeQuery}`);
});

console.log('');
console.log('Test completed.');