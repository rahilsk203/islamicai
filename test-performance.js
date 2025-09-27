import { GeminiAPI } from './src/gemini-api.js';
import { InternetDataProcessor } from './src/internet-data-processor.js';

// Test the performance and search efficiency improvements
async function testPerformanceImprovements() {
  console.log('Testing performance and search efficiency improvements...\n');
  
  // Mock API key
  const mockApiKey = 'test-api-key';
  const geminiAPI = new GeminiAPI(mockApiKey);
  
  // Test cases for different types of queries
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
      message: 'What are today\'s prayer times in London?',
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
    },
    {
      name: 'Science-related question (no search needed)',
      message: 'What is the theory of relativity?',
      expectedSearch: false
    },
    {
      name: 'Science with Islamic perspective (no search needed)',
      message: 'Explain quantum physics from an Islamic perspective',
      expectedSearch: false
    }
  ];
  
  // Mock internet data processor result
  const originalProcessor = geminiAPI.internetProcessor;
  
  // Replace the internet processor with our enhanced version
  geminiAPI.internetProcessor = new InternetDataProcessor();
  
  // Mock the API request to just return the request body
  geminiAPI._makeAPIRequestWithRetryToUrl = async (requestBody) => {
    return {
      requestBody: requestBody,
      candidates: [{
        content: {
          parts: [{
            text: `Test response for: ${requestBody.contents[0].parts[0].text.substring(0, 50)}...`
          }]
        }
      }]
    };
  };
  
  // Test each case
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    
    try {
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
  
  // Test performance metrics
  console.log('Performance Metrics:');
  console.log('Gemini API Metrics:', geminiAPI.getPerformanceMetrics());
  console.log('Internet Processor Metrics:', geminiAPI.internetProcessor.getPerformanceMetrics());
  
  console.log('\nTest completed.');
}

// Run the test
testPerformanceImprovements().catch(console.error);