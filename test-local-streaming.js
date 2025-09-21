// Local server test for streaming
// This will help us see the debug logs

import { GeminiAPI } from './src/gemini-api.js';

const testLocalStreaming = async () => {
  console.log("🧪 Testing Local Streaming Implementation");
  console.log("=" * 50);
  
  // Initialize Gemini API with the API key
  const apiKeys = ["AIzaSyCGpimrLEZrz-rN6yVKfvTHG4G1dpOb_fc"];
  const geminiAPI = new GeminiAPI(apiKeys);
  
  const testData = {
    message: "How do I perform Salah?",
    session_id: "test_local_" + Date.now(),
    language_info: {
      detected_language: "english",
      confidence: 0.9,
      should_respond_in_language: true
    },
    streaming_options: {
      enableStreaming: true,
      chunkSize: 20,
      delay: 50,
      includeMetadata: true
    }
  };
  
  try {
    console.log("📡 Testing Gemini API directly...");
    console.log("Request data:", JSON.stringify(testData, null, 2));
    
    // Test regular response first
    console.log("\n🔍 Testing regular response...");
    const regularResponse = await geminiAPI.generateResponse(
      [], 
      testData.session_id, 
      testData.message, 
      '', 
      testData.language_info
    );
    
    console.log("✅ Regular response received!");
    console.log("📊 Response length:", regularResponse.length);
    console.log("📊 Response preview:", regularResponse.substring(0, 100) + "...");
    
    // Test streaming response
    console.log("\n🔍 Testing streaming response...");
    const stream = await geminiAPI.generateResponse(
      [], 
      testData.session_id, 
      testData.message, 
      '', 
      testData.language_info,
      testData.streaming_options
    );
    
    console.log("✅ Streaming response received!");
    console.log("📊 Stream type:", typeof stream);
    console.log("📊 Stream constructor:", stream.constructor.name);
    
    // Process the stream
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalContent = '';
    
    console.log("📡 Processing stream chunks...");
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log("✅ Stream completed!");
        console.log(`📊 Total chunks: ${chunkCount}`);
        console.log(`📊 Total content length: ${totalContent.length}`);
        console.log(`📊 Content preview: "${totalContent.substring(0, 100)}..."`);
        break;
      }
      
      // Handle the chunk properly
      let chunk;
      if (value instanceof Uint8Array) {
        chunk = decoder.decode(value);
      } else if (typeof value === 'string') {
        chunk = value;
      } else {
        console.log(`📦 Raw chunk ${chunkCount + 1} (non-string):`, value);
        continue;
      }
      
      console.log(`📦 Raw chunk ${chunkCount + 1}:`, JSON.stringify(chunk));
      
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            chunkCount++;
            
            if (data.type === 'content') {
              totalContent += data.content;
              console.log(`Chunk ${chunkCount}: "${data.content}"`);
            } else if (data.type === 'start') {
              console.log(`🚀 Stream started - ${data.metadata.estimatedChunks} chunks expected`);
            } else if (data.type === 'end') {
              console.log(`✅ Stream completed`);
            } else if (data.type === 'error') {
              console.log(`❌ Stream error: ${data.content}`);
            }
          } catch (e) {
            console.log(`⚠️ Parse error: ${e.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
  }
};

// Run the test
testLocalStreaming();
