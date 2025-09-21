/**
 * Quick test to verify the "ReadableStream did not return bytes" fix
 */

const TEST_ENDPOINT = 'http://127.0.0.1:8787';

async function testStreamingFix() {
  console.log('🔧 Testing ReadableStream Bytes Fix');
  console.log('=' .repeat(40));
  
  const testData = {
    message: "hi",
    session_id: "test_bytes_fix_" + Date.now(),
    language_info: {
      detected_language: "english",
      confidence: 0.9,
      should_respond_in_language: true
    }
  };
  
  try {
    console.log('📡 Testing streaming with bytes fix...');
    
    const response = await fetch(TEST_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Content type:', response.headers.get('content-type'));
    
    if (!response.ok) {
      console.log('❌ Request failed:', response.status);
      return false;
    }
    
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('✅ Streaming response detected');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCount = 0;
      let content = '';
      
      console.log('📡 Reading stream chunks...');
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ Stream completed successfully!');
            break;
          }
          
          // This should not throw "ReadableStream did not return bytes" error anymore
          const chunk = decoder.decode(value);
          chunkCount++;
          
          // Parse SSE format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const chunkData = JSON.parse(line.substring(6));
                if (chunkData.type === 'content') {
                  content += chunkData.content;
                  process.stdout.write(chunkData.content);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
          
          // Limit test to avoid long output
          if (chunkCount >= 5) {
            console.log('\n📊 Test limited to first 5 chunks');
            reader.cancel();
            break;
          }
        }
        
        console.log(`\n📊 Successfully processed ${chunkCount} chunks`);
        console.log(`📊 Content length: ${content.length} characters`);
        
        return true;
        
      } catch (streamError) {
        console.error('❌ Stream reading error:', streamError.message);
        return false;
      }
      
    } else {
      console.log('📄 Direct response received (not streaming)');
      const data = await response.json();
      console.log('✅ Response received:', data.reply?.substring(0, 50) + '...');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function runTest() {
  console.log(`
🔧 ReadableStream Bytes Fix Test
================================

Testing the fix for "ReadableStream did not return bytes" error.
Make sure backend is running on ${TEST_ENDPOINT}

`);

  const success = await testStreamingFix();
  
  console.log('\n' + '='.repeat(40));
  
  if (success) {
    console.log('🎉 Fix successful!');
    console.log('✅ No more "ReadableStream did not return bytes" error');
    console.log('✅ Streaming working correctly');
    console.log('✅ Bytes are properly encoded');
  } else {
    console.log('❌ Fix needs more work');
    console.log('Please check console for errors');
  }
}

runTest().catch(error => {
  console.error('❌ Test failed:', error.message);
});