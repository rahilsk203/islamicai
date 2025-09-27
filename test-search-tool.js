import { GeminiAPI } from './src/gemini-api.js';

// Test the search tool inclusion logic
async function testSearchToolInclusion() {
  console.log('Testing search tool inclusion logic...\n');
  
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
  
  // Mock internet data processor result
  const mockInternetProcessor = {
    processQuery: async (userMessage) => {
      const lowerMessage = userMessage.toLowerCase();
      
      // Determine if search is needed based on message content
      const needsSearch = 
        lowerMessage.includes('current') ||
        lowerMessage.includes('today') ||
        lowerMessage.includes('price') ||
        lowerMessage.includes('news') ||
        lowerMessage.includes('prayer time');
      
      // Determine reason based on message content
      let reason = 'no_search_needed';
      if (lowerMessage.includes('price')) reason = 'price_query';
      else if (lowerMessage.includes('news')) reason = 'current_info';
      else if (lowerMessage.includes('prayer time')) reason = 'location_prayer_times';
      else if (lowerMessage.includes('current')) reason = 'current_info';
      else if (lowerMessage.includes('today')) reason = 'current_info';
      
      return {
        needsInternetData: needsSearch,
        reason: reason,
        data: null,
        enhancedPrompt: needsSearch ? `USER QUERY REQUIRES REAL-TIME DATA: ${userMessage}` : ''
      };
    }
  };
  
  // Replace the internet processor with our mock
  geminiAPI.internetProcessor = mockInternetProcessor;
  
  // Test each case
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    
    try {
      // Mock the API request to just return the request body
      geminiAPI._makeAPIRequestWithRetryToUrl = async (requestBody) => {
        return {
          requestBody: requestBody,
          candidates: [{
            content: {
              parts: [{
                text: `Test response for: ${testCase.message}`
              }]
            }
          }]
        };
      };
      
      // Generate response (this will trigger our search tool logic)
      const response = await geminiAPI.generateResponse(
        [{ role: 'user', parts: [{ text: testCase.message }] }],
        'test-session',
        testCase.message,
        '',
        { detected_language: 'english' },
        { enableStreaming: false }
      );
      
      // Check if search tool was included
      const requestBody = response.requestBody;
      const hasSearchTool = requestBody.tools && requestBody.tools.length > 0 && 
                           requestBody.tools.some(tool => tool.googleSearch);
      
      console.log(`Expected search tool: ${testCase.expectedSearch}`);
      console.log(`Actual search tool included: ${hasSearchTool}`);
      console.log(`Test ${hasSearchTool === testCase.expectedSearch ? 'PASSED' : 'FAILED'}\n`);
    } catch (error) {
      console.log(`Error testing case: ${error.message}\n`);
    }
  }
  
  console.log('Test completed.');
}

// Run the test
testSearchToolInclusion().catch(console.error);