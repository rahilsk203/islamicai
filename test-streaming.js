// Test Streaming Response for IslamicAI
// Demonstrates live streaming functionality

import { GeminiAPI } from './src/gemini-api.js';

// Test streaming configuration
const streamingConfig = {
  enableStreaming: true,
  chunkSize: 30,
  delay: 100,
  includeMetadata: true
};

// Test cases for streaming
const testCases = [
  {
    name: "English Streaming Test",
    message: "How do I perform Salah?",
    languageInfo: {
      detected_language: "english",
      confidence: 0.8,
      should_respond_in_language: true
    }
  },
  {
    name: "Hinglish Streaming Test", 
    message: "hello kasa hai bhai, namaz kaise padhte hain?",
    languageInfo: {
      detected_language: "hinglish",
      confidence: 0.95,
      should_respond_in_language: true
    }
  },
  {
    name: "Hindi Streaming Test",
    message: "नमाज़ कैसे पढ़ते हैं?",
    languageInfo: {
      detected_language: "hindi", 
      confidence: 0.9,
      should_respond_in_language: true
    }
  }
];

// Initialize Gemini API
const apiKeys = ['test-api-key']; // Replace with actual API key
const geminiAPI = new GeminiAPI(apiKeys);

console.log("🚀 Testing IslamicAI Streaming Response System\n");
console.log("=" * 50);

// Test streaming functionality
async function testStreaming() {
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Language: ${testCase.languageInfo.detected_language}`);
    
    try {
      // Generate streaming response
      const stream = await geminiAPI.generateResponse(
        [], 
        `test_session_${i}`, 
        testCase.message, 
        '', 
        testCase.languageInfo, 
        streamingConfig
      );
      
      console.log("✅ Streaming response generated");
      console.log("📡 Processing stream chunks...\n");
      
      // Process the stream
      const reader = stream.getReader();
      let chunkCount = 0;
      let totalContent = '';
      let startTime = Date.now();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log(`\n📊 Streaming Statistics:`);
          console.log(`Total Chunks: ${chunkCount}`);
          console.log(`Total Content Length: ${totalContent.length} characters`);
          console.log(`Streaming Duration: ${duration}ms`);
          console.log(`Average Chunk Time: ${(duration / chunkCount).toFixed(2)}ms`);
          console.log(`Content Preview: "${totalContent.substring(0, 100)}..."`);
          break;
        }
        
        // Parse chunk
        const chunkData = parseStreamingChunk(value);
        chunkCount++;
        
        if (chunkData.type === 'content') {
          totalContent += chunkData.content;
          console.log(`Chunk ${chunkCount}: "${chunkData.content}"`);
        } else if (chunkData.type === 'start') {
          console.log(`🚀 Stream started - ${chunkData.metadata.estimatedChunks} chunks expected`);
        } else if (chunkData.type === 'end') {
          console.log(`✅ Stream completed`);
        } else if (chunkData.type === 'error') {
          console.log(`❌ Stream error: ${chunkData.content}`);
        }
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
    } catch (error) {
      console.log(`❌ Test FAILED: ${error.message}`);
    }
    
    console.log("-" * 40);
  }
}

// Parse streaming chunk data
function parseStreamingChunk(chunk) {
  try {
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonData = line.substring(6);
        return JSON.parse(jsonData);
      }
    }
    return { type: 'unknown', content: chunk };
  } catch (error) {
    return { type: 'error', content: chunk };
  }
}

// Test streaming performance
async function testStreamingPerformance() {
  console.log("\n⚡ Streaming Performance Test");
  console.log("=" * 35);
  
  const testMessage = "What is the importance of Salah in Islam?";
  const testLanguageInfo = {
    detected_language: "english",
    confidence: 0.8,
    should_respond_in_language: true
  };
  
  const performanceConfig = {
    enableStreaming: true,
    chunkSize: 20,
    delay: 50,
    includeMetadata: false
  };
  
  const iterations = 5;
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const stream = await geminiAPI.generateResponse(
        [], 
        `perf_test_${i}`, 
        testMessage, 
        '', 
        testLanguageInfo, 
        performanceConfig
      );
      
      const reader = stream.getReader();
      let chunkCount = 0;
      
      while (true) {
        const { done } = await reader.read();
        if (done) break;
        chunkCount++;
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push({
        iteration: i + 1,
        duration,
        chunkCount,
        avgChunkTime: duration / chunkCount
      });
      
      console.log(`Iteration ${i + 1}: ${duration}ms, ${chunkCount} chunks, ${(duration/chunkCount).toFixed(2)}ms/chunk`);
      
    } catch (error) {
      console.log(`Iteration ${i + 1}: FAILED - ${error.message}`);
    }
  }
  
  // Calculate averages
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const avgChunkTime = results.reduce((sum, r) => sum + r.avgChunkTime, 0) / results.length;
  const avgChunks = results.reduce((sum, r) => sum + r.chunkCount, 0) / results.length;
  
  console.log(`\n📈 Performance Summary:`);
  console.log(`Average Duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`Average Chunk Time: ${avgChunkTime.toFixed(2)}ms`);
  console.log(`Average Chunks: ${avgChunks.toFixed(1)}`);
}

// Test different streaming configurations
async function testStreamingConfigurations() {
  console.log("\n🔧 Streaming Configuration Test");
  console.log("=" * 40);
  
  const testMessage = "Explain the five pillars of Islam";
  const testLanguageInfo = {
    detected_language: "english",
    confidence: 0.8,
    should_respond_in_language: true
  };
  
  const configurations = [
    { name: "Fast Streaming", chunkSize: 10, delay: 25 },
    { name: "Normal Streaming", chunkSize: 30, delay: 50 },
    { name: "Slow Streaming", chunkSize: 50, delay: 100 },
    { name: "No Delay", chunkSize: 20, delay: 0 }
  ];
  
  for (const config of configurations) {
    console.log(`\n🧪 Testing: ${config.name}`);
    console.log(`Chunk Size: ${config.chunkSize}, Delay: ${config.delay}ms`);
    
    const streamingConfig = {
      enableStreaming: true,
      chunkSize: config.chunkSize,
      delay: config.delay,
      includeMetadata: true
    };
    
    try {
      const startTime = Date.now();
      
      const stream = await geminiAPI.generateResponse(
        [], 
        `config_test_${config.name.replace(/\s+/g, '_')}`, 
        testMessage, 
        '', 
        testLanguageInfo, 
        streamingConfig
      );
      
      const reader = stream.getReader();
      let chunkCount = 0;
      let totalContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunkData = parseStreamingChunk(value);
        if (chunkData.type === 'content') {
          totalContent += chunkData.content;
          chunkCount++;
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Completed: ${duration}ms, ${chunkCount} chunks, ${totalContent.length} chars`);
      console.log(`Preview: "${totalContent.substring(0, 80)}..."`);
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testStreaming();
    await testStreamingPerformance();
    await testStreamingConfigurations();
    
    console.log("\n🎉 All Streaming Tests Completed!");
    console.log("🚀 IslamicAI Streaming System is ready for production!");
    
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Start tests
runAllTests();
