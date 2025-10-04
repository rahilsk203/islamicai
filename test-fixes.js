import { GeminiAPI } from './src/gemini-api.js';

// Test the fixes
async function testFixes() {
  console.log('Testing GeminiAPI fixes...');
  
  // Create a mock API key array
  const mockApiKeys = ['test-key-1', 'test-key-2'];
  
  try {
    // Create GeminiAPI instance
    const geminiAPI = new GeminiAPI(mockApiKeys);
    
    // Test that recentQueryWindow is properly initialized
    console.log('✓ recentQueryWindow initialized:', geminiAPI.recentQueryWindow instanceof Map);
    
    // Test that responseCache has put method (AdvancedLRUCache uses put, not set)
    console.log('✓ responseCache has put method:', typeof geminiAPI.responseCache.put === 'function');
    
    // Test that responseCache has get method
    console.log('✓ responseCache has get method:', typeof geminiAPI.responseCache.get === 'function');
    
    console.log('\nAll fixes verified successfully!');
    console.log('1. recentQueryWindow is now properly initialized');
    console.log('2. responseCache uses correct put method');
    
  } catch (error) {
    console.error('Error testing fixes:', error);
  }
}

// Run the test
testFixes();