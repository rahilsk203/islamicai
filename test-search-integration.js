/**
 * Test file for Gemini API and InternetDataProcessor integration
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';

// Create an instance of InternetDataProcessor for testing
const internetProcessor = new InternetDataProcessor();

// Test cases for search triggering
const testCases = [
  {
    name: 'Prayer time query in English',
    input: 'What are the prayer times for today in Delhi?',
    expectedTrigger: true
  },
  {
    name: 'Prayer time query in Hindi',
    input: 'आज दिल्ली में नमाज का समय क्या है?',
    expectedTrigger: true
  },
  {
    name: 'Prayer time query in Urdu',
    input: 'آج دہلی میں نماز کا وقت کیا ہے؟',
    expectedTrigger: true
  },
  {
    name: 'General Islamic knowledge query',
    input: 'What is the meaning of Surah Al-Fatiha?',
    expectedTrigger: false
  },
  {
    name: 'Current news query',
    input: 'What is the latest news about Islamic conferences?',
    expectedTrigger: true
  },
  {
    name: 'Financial data query',
    input: 'What is the current price of gold in Pakistan?',
    expectedTrigger: true
  },
  {
    name: 'Weather query',
    input: 'What is the weather like in Mecca today?',
    expectedTrigger: true
  },
  {
    name: 'Historical query (should not trigger search)',
    input: 'Tell me about the history of Islam',
    expectedTrigger: false
  },
  {
    name: 'Quran translation query (should not trigger search)',
    input: 'Translate Quran 2:255',
    expectedTrigger: false
  }
];

console.log('Testing InternetDataProcessor search triggering:');

let passCount = 0;
let totalCount = testCases.length;

testCases.forEach((testCase, index) => {
  const result = internetProcessor.shouldTriggerGeminiSearch(testCase.input);
  
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Input: "${testCase.input}"`);
  console.log(`  Expected trigger: ${testCase.expectedTrigger}`);
  console.log(`  Actual result: ${result}`);
  
  if (result === testCase.expectedTrigger) {
    console.log(`  Status: PASS`);
    passCount++;
  } else {
    console.log(`  Status: FAIL`);
  }
  console.log('');
});

console.log(`Test Results: ${passCount}/${totalCount} tests passed`);

// Test cache functionality
console.log('Testing cache functionality:');

const testQuery = 'What are the prayer times today?';
const cacheResult1 = internetProcessor.checkCache(testQuery);

console.log('First cache check (should be null):', cacheResult1);

// Store something in cache
const testData = {
  needsInternetData: true,
  reason: 'test_data',
  data: { test: 'data' }
};

internetProcessor.storeInCache(testQuery, testData);

const cacheResult2 = internetProcessor.checkCache(testQuery);

console.log('Second cache check (should have data):', cacheResult2);

// Test cache key generation
console.log('Testing cache key generation:');

const queries = [
  'Test query 1',
  'Test query 2',
  'Test query 1' // Same as first
];

const keys = queries.map(query => internetProcessor.generateCacheKey(query));
console.log('Cache keys:', keys);

// Test that same queries produce same keys
console.log('First and third queries have same key:', keys[0] === keys[2]);

console.log('');
console.log('Integration test completed.');