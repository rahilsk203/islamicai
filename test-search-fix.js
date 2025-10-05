/**
 * Test file for the search tool fix
 */

import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys for testing
const mockApiKeys = ['test-key-1'];

// Create an instance of GeminiAPI for testing
const geminiAPI = new GeminiAPI(mockApiKeys);

// Test the _buildRequestBodyWithSearchTools method with the fix
console.log('Testing _buildRequestBodyWithSearchTools method (fixed version):');

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

console.log('Test completed.');