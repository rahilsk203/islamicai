/**
 * Test file for complete search functionality flow
 * This test demonstrates the full integration between InternetDataProcessor and GeminiAPI
 */

import { InternetDataProcessor } from './src/internet-data-processor.js';
import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys for testing
const mockApiKeys = ['test-key-1'];

// Create instances for testing
const internetProcessor = new InternetDataProcessor();
const geminiAPI = new GeminiAPI(mockApiKeys);

// Test the complete flow
async function testCompleteFlow() {
  console.log('Testing complete search functionality flow...\n');
  
  // Test cases that demonstrate the full flow
  const testCases = [
    {
      name: 'Prayer time query requiring search',
      input: 'What are the prayer times for today in Mumbai?',
      context: 'User is in Mumbai and wants current prayer times'
    },
    {
      name: 'General Islamic knowledge (no search needed)',
      input: 'Explain the concept of Tawhid in Islam',
      context: 'User wants to understand a fundamental Islamic concept'
    },
    {
      name: 'Current news query',
      input: 'What is the latest news about Islamic finance?',
      context: 'User wants current information about Islamic finance'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`=== ${testCase.name} ===`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Context: ${testCase.context}`);
    
    // Step 1: Process query with InternetDataProcessor
    console.log('\nStep 1: InternetDataProcessor analysis');
    const internetData = await internetProcessor.processQuery(testCase.input, {
      contextualPrompt: testCase.context
    });
    
    console.log(`  Needs internet data: ${internetData.needsInternetData}`);
    console.log(`  Reason: ${internetData.reason}`);
    
    // Step 2: Determine if search tools should be included
    console.log('\nStep 2: GeminiAPI search tool decision');
    const queryType = { topic: internetData.needsInternetData ? 'prayer_times' : 'general' };
    const includeSearch = geminiAPI._shouldIncludeSearchTools(testCase.input, internetData, queryType);
    
    console.log(`  Include search tools: ${includeSearch}`);
    
    // Step 3: Build request body
    console.log('\nStep 3: Request body construction');
    const baseRequestBody = {
      contents: [{
        role: "user",
        parts: [{ text: `${testCase.context}\n\nUser: ${testCase.input}` }]
      }]
    };
    
    const requestBody = geminiAPI._buildRequestBodyWithSearchTools(
      baseRequestBody, 
      includeSearch, 
      testCase.input, 
      internetData
    );
    
    console.log(`  Request body has tools: ${!!requestBody.tools}`);
    if (requestBody.tools) {
      console.log(`  Tools: ${JSON.stringify(requestBody.tools, null, 2)}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test language-specific search triggering
  console.log('Testing language-specific search triggering:');
  
  const languageTests = [
    { input: 'What is the weather in Karachi today?', expected: true },
    { input: 'کراچی میں آج کیا موسم ہے؟', expected: true }, // Urdu
    { input: 'कराची में आज क्या मौसम है?', expected: true }, // Hindi
    { input: 'What is the meaning of Surah Ikhlas?', expected: false },
    { input: 'سورة إخلاص کا مطلب کیا ہے؟', expected: false } // Urdu
  ];
  
  languageTests.forEach((test, index) => {
    const result = internetProcessor.shouldTriggerGeminiSearch(test.input);
    const status = result === test.expected ? 'PASS' : 'FAIL';
    console.log(`  Test ${index + 1}: "${test.input}" => ${result} (${status})`);
  });
  
  console.log('\nComplete flow test finished.');
}

// Run the test
testCompleteFlow().catch(console.error);