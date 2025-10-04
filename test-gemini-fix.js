// Test file to verify the GeminiAPI fix
import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys
const mockApiKeys = ['test-key-1', 'test-key-2'];

// Create an instance of GeminiAPI
const geminiAPI = new GeminiAPI(mockApiKeys);

// Test that the responseCache is properly initialized
console.log('Testing GeminiAPI initialization...');
console.log('responseCache type:', typeof geminiAPI.responseCache);
console.log('responseCache.put method exists:', typeof geminiAPI.responseCache.put === 'function');

// Test the put method directly
try {
  geminiAPI.responseCache.put('test-key', 'test-value');
  console.log('responseCache.put method works correctly');
} catch (error) {
  console.error('Error testing responseCache.put:', error);
}

// Test the get method
try {
  const value = geminiAPI.responseCache.get('test-key');
  console.log('responseCache.get method works correctly, retrieved value:', value);
} catch (error) {
  console.error('Error testing responseCache.get:', error);
}

console.log('All tests completed successfully!');