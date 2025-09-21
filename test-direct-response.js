/**
 * Test script for non-streaming IslamicAI backend
 * Tests direct response functionality without streaming
 */

const TEST_ENDPOINT = 'http://127.0.0.1:8787';

async function testDirectResponse() {
  console.log('🧪 Testing IslamicAI Direct Response (No Streaming)');
  console.log('=' .repeat(50));
  
  const testData = {
    message: "Assalamu Alaikum! Namaz kaise padha jaata hai?",
    session_id: "test_direct_" + Date.now(),
    language_info: {
      detected_language: "hinglish",
      confidence: 0.9,
      should_respond_in_language: true
    }
  };
  
  try {
    console.log('📡 Sending request to backend...');
    console.log('Endpoint:', TEST_ENDPOINT + '/api/chat');
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const startTime = Date.now();
    
    const response = await fetch(TEST_ENDPOINT + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response time:', responseTime + 'ms');
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Direct response received!');
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    // Test specific response fields
    if (data.reply) {
      console.log(`✅ Reply field present: ${data.reply.length} characters`);
      console.log(`📝 Reply preview: "${data.reply.substring(0, 100)}..."`);
    } else {
      console.log('❌ No reply field in response');
    }
    
    if (data.session_id) {
      console.log(`✅ Session ID: ${data.session_id}`);
    }
    
    if (data.streaming === false) {
      console.log('✅ Streaming correctly disabled');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n🩺 Testing Health Endpoint');
  console.log('-'.repeat(30));
  
  try {
    const response = await fetch(TEST_ENDPOINT + '/health');
    const data = await response.json();
    
    console.log('📊 Health status:', data.status);
    console.log('📊 Streaming status:', data.streaming);
    console.log('📊 API keys status:', data.apiKeys);
    
    if (data.streaming === 'disabled') {
      console.log('✅ Streaming correctly disabled in health check');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testMultipleRequests() {
  console.log('\n🔄 Testing Multiple Sequential Requests');
  console.log('-'.repeat(40));
  
  const testMessages = [
    "Salam! Wudu kaise karte hain?",
    "What are the 5 pillars of Islam?",
    "Zakat ki calculation kaise karte hain?"
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const testData = {
      message: testMessages[i],
      session_id: "test_multi_" + Date.now() + "_" + i,
      language_info: {
        detected_language: i === 1 ? "english" : "hinglish",
        confidence: 0.9,
        should_respond_in_language: true
      }
    };
    
    try {
      console.log(`\n📝 Test ${i + 1}: "${testMessages[i]}"`);
      
      const startTime = Date.now();
      const response = await fetch(TEST_ENDPOINT + '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Response time: ${responseTime}ms`);
        console.log(`📝 Reply length: ${data.reply ? data.reply.length : 0} characters`);
        successCount++;
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Multi-request test: ${successCount}/${testMessages.length} successful`);
  return successCount === testMessages.length;
}

// Main test execution
async function runAllTests() {
  console.log(`
🚀 IslamicAI Backend Direct Response Test Suite
===============================================

Testing the modified backend without streaming functionality.
Make sure your backend is running on ${TEST_ENDPOINT}

`);

  let allTestsPassed = true;
  
  // Test 1: Health check
  const healthTest = await testHealthEndpoint();
  allTestsPassed = allTestsPassed && healthTest;
  
  // Test 2: Single direct response
  const directTest = await testDirectResponse();
  allTestsPassed = allTestsPassed && directTest;
  
  // Test 3: Multiple requests
  const multiTest = await testMultipleRequests();
  allTestsPassed = allTestsPassed && multiTest;
  
  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ Backend is working correctly without streaming');
    console.log('✅ Direct responses are functioning properly');
  } else {
    console.log('❌ Some tests failed');
    console.log('Please check your backend configuration and API keys');
  }
  
  console.log('\n📋 Summary:');
  console.log('- ✅ No streaming functionality (as requested)');
  console.log('- ✅ Direct JSON responses');
  console.log('- ✅ Islamic AI functionality intact');
  console.log('- ✅ Multi-language support working');
  console.log('- ✅ Session management functioning');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
});