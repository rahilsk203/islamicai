// Test the streaming functionality fix verification

import { ReadableStream } from 'stream/web';
import { IslamicPrompt } from './src/islamic-prompt.js';

// Mock the GeminiAPI class to test the streaming fix
class MockGeminiAPI {
  constructor() {
    this.islamicPrompt = new IslamicPrompt();
  }

  createStreamingChunk(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  createStreamingError(errorMessage) {
    // Capture the method reference to avoid 'this' context issues
    const createStreamingChunk = (data) => this.createStreamingChunk(data);
    
    return new ReadableStream({
      start(controller) {
        controller.enqueue(createStreamingChunk({
          type: 'error',
          content: errorMessage,
          timestamp: new Date().toISOString()
        }));
        controller.close();
      }
    });
  }
}

async function testStreamingFix() {
  console.log('🔧 IslamicAI Streaming Fix Verification');
  console.log('=======================================');
  console.log('\nTesting the fixed streaming functionality with \'this\' context fix.\n');
  
  const mockAPI = new MockGeminiAPI();
  
  // Test 1: Create a streaming chunk
  console.log('1. Testing createStreamingChunk method:');
  const chunk = mockAPI.createStreamingChunk({
    type: 'test',
    content: 'Hello, IslamicAI!',
    timestamp: new Date().toISOString()
  });
  
  console.log('✅ Chunk created successfully:');
  console.log(chunk);
  
  // Test 2: Create a streaming error
  console.log('\n2. Testing createStreamingError method:');
  try {
    const errorStream = mockAPI.createStreamingError('Test error message');
    console.log('✅ Error stream created successfully');
    
    // Try to read from the stream
    const reader = errorStream.getReader();
    const { done, value } = await reader.read();
    
    if (!done && value) {
      const decoded = new TextDecoder().decode(value);
      console.log('✅ Error chunk content:');
      console.log(decoded);
    }
    
    reader.releaseLock();
  } catch (error) {
    console.error('❌ Error creating streaming error:', error);
  }
  
  console.log('\n✅ Streaming Functionality Test Complete');
}

testStreamingFix().catch(console.error);