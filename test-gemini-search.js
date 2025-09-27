import { GeminiAPI } from './src/gemini-api.js';

// Test the Google Search integration
async function testGeminiSearchIntegration() {
  console.log('Testing Gemini Google Search integration...\n');
  
  // Mock API key
  const mockApiKey = 'test-api-key';
  const geminiAPI = new GeminiAPI(mockApiKey);
  
  // Test cases
  const testCases = [
    {
      name: 'General Islamic question (no search needed)',
      message: 'What is the meaning of Tawhid?',
      expectedSearch: false
    },
    {
      name: 'Current information request (search needed)',
      message: 'What is the current gold price?',
      expectedSearch: true
    },
    {
      name: 'Prayer times request (search needed)',
      message: 'What are today\'s prayer times?',
      expectedSearch: true
    },
    {
      name: 'News request (search needed)',
      message: 'What is the latest news about Palestine?',
      expectedSearch: true
    },
    {
      name: 'Historical question (no search needed)',
      message: 'Tell me about the life of Prophet Muhammad (PBUH)',
      expectedSearch: false
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    
    try {
      // Test internet processor directly
      const internetData = await geminiAPI.internetProcessor.processQuery(testCase.message);
      
      const shouldTriggerSearch = internetData.needsInternetData && 
                                 internetData.reason === 'gemini_search_recommended';
      
      console.log(`Expected search tool: ${testCase.expectedSearch}`);
      console.log(`Actual search tool included: ${shouldTriggerSearch}`);
      console.log(`Test ${shouldTriggerSearch === testCase.expectedSearch ? 'PASSED' : 'FAILED'}\n`);
    } catch (error) {
      console.log(`Error testing case: ${error.message}\n`);
    }
  }
  
  console.log('Test completed.');
}

// Run the test
testGeminiSearchIntegration().catch(console.error);