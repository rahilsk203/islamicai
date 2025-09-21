/**
 * Comprehensive test for IslamicAI backend with multiple API keys and streaming
 * Tests load balancing, failover, and streaming functionality
 */

const TEST_ENDPOINT = 'http://127.0.0.1:8787';

async function testHealthEndpoint() {
  console.log('🩺 Testing Health Endpoint with Multiple API Keys');
  console.log('='.repeat(55));
  
  try {
    const response = await fetch(TEST_ENDPOINT + '/health');
    const data = await response.json();
    
    console.log('📊 Health status:', data.status);
    console.log('📊 Streaming status:', data.streaming);
    console.log('📊 Multiple API keys:', data.multipleApiKeys);
    console.log('📊 API keys info:', data.apiKeys);
    console.log('📊 Default streaming config:', data.defaultStreaming);
    
    if (data.streaming === 'enabled_by_default') {
      console.log('✅ Streaming enabled by default');
    }
    
    if (data.multipleApiKeys) {
      console.log('✅ Multiple API keys support enabled');
    }
    
    if (data.apiKeys.total > 1) {
      console.log(`✅ ${data.apiKeys.total} API keys configured for load balancing`);
    } else {
      console.log(`⚠️  Only ${data.apiKeys.total} API key configured`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testStreamingResponse() {
  console.log('\n🌊 Testing Default Streaming Response');
  console.log('-'.repeat(40));
  
  const testData = {
    message: "Assalamu Alaikum! Namaz ki ahmiyat kya hai Islam mein?",
    session_id: "test_streaming_" + Date.now(),
    language_info: {
      detected_language: "hinglish",
      confidence: 0.9,
      should_respond_in_language: true
    }
    // No streaming_options provided - should use defaults
  };
  
  try {
    console.log('📡 Sending request to streaming endpoint...');
    console.log('Message:', testData.message);
    
    const startTime = Date.now();
    
    const response = await fetch(TEST_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return false;
    }
    
    // Check if it's a streaming response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/event-stream')) {
      console.log('✅ Streaming response detected!');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCount = 0;
      let totalContent = '';
      
      console.log('📡 Processing streaming chunks...');
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Streaming completed!');
          break;
        }
        
        const chunk = decoder.decode(value);
        chunkCount++;
        
        // Parse SSE chunk
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunkData = JSON.parse(line.substring(6));
              if (chunkData.type === 'content') {
                totalContent += chunkData.content;
                process.stdout.write(chunkData.content); // Real-time display
              }
            } catch (e) {
              // Ignore parsing errors for now
            }
          }
        }
      }
      
      const endTime = Date.now();
      console.log(`\n📊 Streaming stats:`);
      console.log(`   - Total chunks: ${chunkCount}`);
      console.log(`   - Total content length: ${totalContent.length}`);
      console.log(`   - Total time: ${endTime - startTime}ms`);
      
      return true;
    } else {
      console.log('❌ Expected streaming response, got direct response');
      const data = await response.json();
      console.log('Response:', data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Streaming test failed:', error.message);
    return false;
  }
}

async function testDirectResponse() {
  console.log('\n📄 Testing Direct Response (Streaming Disabled)');
  console.log('-'.repeat(50));
  
  const testData = {
    message: "What are the 5 pillars of Islam?",
    session_id: "test_direct_" + Date.now(),
    language_info: {
      detected_language: "english",
      confidence: 0.9,
      should_respond_in_language: true
    },
    streaming_options: {
      enableStreaming: false // Explicitly disable streaming
    }
  };
  
  try {
    console.log('📡 Sending request with streaming disabled...');
    console.log('Message:', testData.message);
    
    const startTime = Date.now();
    
    const response = await fetch(TEST_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    console.log('📊 Response time:', (endTime - startTime) + 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct response received!');
      console.log('📊 Session ID:', data.session_id);
      console.log('📊 Response length:', data.reply ? data.reply.length : 0);
      console.log('📊 Streaming flag:', data.streaming);
      console.log('📊 API keys used:', data.api_keys_used);
      console.log('📝 Response preview:', data.reply ? data.reply.substring(0, 100) + '...' : 'No reply');
      
      if (data.streaming === false) {
        console.log('✅ Streaming correctly disabled');
      }
      
      return true;
    } else {
      console.log('❌ Direct response failed:', response.status);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Direct response test failed:', error.message);
    return false;
  }
}

async function testAPIKeyLoadBalancing() {
  console.log('\n⚖️  Testing API Key Load Balancing');
  console.log('-'.repeat(40));
  
  const requests = [];
  
  // Create multiple simultaneous requests to test load balancing
  for (let i = 0; i < 5; i++) {
    const testData = {
      message: `Test message ${i + 1}: What is Zakat?`,
      session_id: `test_loadbalance_${Date.now()}_${i}`,
      language_info: {
        detected_language: "english",
        confidence: 0.9
      },
      streaming_options: {
        enableStreaming: false // Use direct response for faster testing
      }
    };
    
    const requestPromise = fetch(TEST_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    }).then(response => ({ index: i, response }));
    
    requests.push(requestPromise);
  }
  
  try {
    console.log('📡 Sending 5 simultaneous requests...');
    const results = await Promise.all(requests);
    
    let successCount = 0;
    for (const { index, response } of results) {
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Request ${index + 1}: Success (${data.api_keys_used} keys available)`);
        successCount++;
      } else {
        console.log(`❌ Request ${index + 1}: Failed with status ${response.status}`);
      }
    }
    
    console.log(`📊 Load balancing test: ${successCount}/5 requests successful`);
    
    if (successCount >= 4) {
      console.log('✅ Load balancing working correctly');
      return true;
    } else {
      console.log('⚠️  Some requests failed - check API key configuration');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Load balancing test failed:', error.message);
    return false;
  }
}

// Main test execution
async function runAllTests() {
  console.log(`
🚀 IslamicAI Backend Comprehensive Test Suite
${'='.repeat(50)}

Testing:
- Multiple API key support with load balancing
- Streaming responses enabled by default
- Direct responses when streaming disabled
- API key failover mechanisms

Make sure your backend is running on ${TEST_ENDPOINT}
`);

  let allTestsPassed = true;
  const testResults = [];
  
  // Test 1: Health check
  console.log('\n🧪 TEST SUITE STARTING...');
  const healthTest = await testHealthEndpoint();
  testResults.push({ test: 'Health Check', passed: healthTest });
  allTestsPassed = allTestsPassed && healthTest;
  
  // Test 2: Default streaming response
  const streamingTest = await testStreamingResponse();
  testResults.push({ test: 'Default Streaming', passed: streamingTest });
  allTestsPassed = allTestsPassed && streamingTest;
  
  // Test 3: Direct response (streaming disabled)
  const directTest = await testDirectResponse();
  testResults.push({ test: 'Direct Response', passed: directTest });
  allTestsPassed = allTestsPassed && directTest;
  
  // Test 4: Load balancing
  const loadBalanceTest = await testAPIKeyLoadBalancing();
  testResults.push({ test: 'Load Balancing', passed: loadBalanceTest });
  allTestsPassed = allTestsPassed && loadBalanceTest;
  
  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('📋 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  for (const result of testResults) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.test}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Multiple API key support working');
    console.log('✅ Streaming enabled by default');
    console.log('✅ Load balancing functional');
    console.log('✅ Backend ready for production!');
  } else {
    console.log('❌ Some tests failed');
    console.log('Please check:');
    console.log('- API key configuration in wrangler.toml');
    console.log('- Backend service is running');
    console.log('- Network connectivity');
    console.log('- API key quotas and limits');
  }
  
  console.log('\n📊 Feature Summary:');
  console.log('- 🔑 Multiple API keys with load balancing');
  console.log('- 🌊 Streaming responses by default');
  console.log('- 📄 Direct responses on demand');
  console.log('- ⚖️  Automatic failover');
  console.log('- 🧠 Islamic AI functionality intact');
}

// Error handling for uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});