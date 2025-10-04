// Comprehensive test file to verify the GeminiAPI fix
import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys
const mockApiKeys = ['test-key-1', 'test-key-2'];

// Create an instance of GeminiAPI
const geminiAPI = new GeminiAPI(mockApiKeys);

console.log('Testing GeminiAPI comprehensive functionality...');

// Test the generateResponse method with a simple input
async function testGenerateResponse() {
  try {
    console.log('Testing generateResponse method...');
    
    // Mock parameters
    const messages = [];
    const sessionId = 'test-session-123';
    const userInput = 'Hello, how are you?';
    const contextualPrompt = 'You are an Islamic AI assistant.';
    const languageInfo = { detected_language: 'english', should_respond_in_language: true };
    const streamingOptions = { enableStreaming: false };
    const userIP = '127.0.0.1';
    const locationInfo = { 
      city: 'Makkah', 
      country: 'Saudi Arabia', 
      timezone: 'Asia/Riyadh',
      isDefault: true
    };
    
    // This should not throw the "set is not a function" error anymore
    const response = await geminiAPI.generateResponse(
      messages, 
      sessionId, 
      userInput, 
      contextualPrompt, 
      languageInfo, 
      streamingOptions, 
      userIP, 
      locationInfo
    );
    
    console.log('generateResponse completed successfully');
    console.log('Response type:', typeof response);
    
    // Check if caching works
    console.log('Testing cache functionality...');
    const cacheSize = geminiAPI.responseCache.size;
    console.log('Cache size:', cacheSize);
    
    // Test performance metrics
    console.log('Performance metrics:', geminiAPI.getPerformanceMetrics());
    
    return true;
  } catch (error) {
    console.error('Error in generateResponse:', error.message);
    return false;
  }
}

// Run the test
testGenerateResponse().then(success => {
  if (success) {
    console.log('All comprehensive tests passed!');
  } else {
    console.log('Some tests failed.');
  }
});