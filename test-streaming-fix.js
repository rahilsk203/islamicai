// Quick test for streaming endpoint
// Test the fixed streaming API endpoint

const testStreamingEndpoint = async () => {
  console.log("🧪 Testing Streaming Endpoint Fix");
  console.log("=" * 40);
  
  const testData = {
    message: "How do I perform Salah?",
    session_id: "test_streaming_" + Date.now(),
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
    console.log("📡 Sending request to /api/stream...");
    console.log("Request data:", JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://127.0.0.1:8787/api/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
      return;
    }
    
    console.log("✅ Streaming response received!");
    console.log("📡 Processing stream...");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log("✅ Stream completed!");
        console.log(`📊 Total chunks: ${chunkCount}`);
        console.log(`📊 Total content length: ${totalContent.length}`);
        console.log(`📊 Content preview: "${totalContent.substring(0, 100)}..."`);
        break;
      }
      
      const chunk = decoder.decode(value);
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
  }
};

// Run the test
testStreamingEndpoint();
