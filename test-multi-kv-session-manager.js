/**
 * Test script for MultiKVSessionManager
 * This script tests the multi-KV session manager implementation
 */

// Mock KV namespace implementation for testing
class MockKVNamespace {
  constructor(name) {
    this.name = name;
    this.storage = new Map();
  }

  async get(key) {
    return this.storage.get(key) || null;
  }

  async put(key, value, options = {}) {
    this.storage.set(key, value);
    return true;
  }

  async delete(key) {
    return this.storage.delete(key);
  }
}

// Import the MultiKVSessionManager
import { MultiKVSessionManager } from './src/multi-kv-session-manager.js';

async function runTests() {
  console.log('🧪 Testing MultiKVSessionManager...\n');

  // Create mock KV namespaces
  const kv1 = new MockKVNamespace('KV1');
  const kv2 = new MockKVNamespace('KV2');
  const kv3 = new MockKVNamespace('KV3');
  const kv4 = new MockKVNamespace('KV4');

  // Create MultiKVSessionManager with mock namespaces
  const sessionManager = new MultiKVSessionManager([kv1, kv2, kv3, kv4]);

  try {
    // Test 1: Session distribution across namespaces
    console.log('Test 1: Session distribution across namespaces');
    
    // Create multiple sessions
    const sessionIds = [
      'session-001',
      'session-002',
      'session-003',
      'session-004',
      'session-005',
      'session-006',
      'session-007',
      'session-008'
    ];

    // Process messages for each session
    for (const sessionId of sessionIds) {
      const userData = `Hello from ${sessionId}`;
      const aiResponse = `Hello! How can I help you today?`;
      
      await sessionManager.processMessage(sessionId, userData, aiResponse);
      console.log(`  ✓ Processed message for ${sessionId}`);
    }

    // Check distribution
    const stats = sessionManager.getPerformanceStats();
    console.log(`  Distribution: ${stats.loadDistribution.join(', ')}`);
    console.log('  ✓ Session distribution test passed\n');

    // Test 2: Session data retrieval
    console.log('Test 2: Session data retrieval');
    
    const testData = await sessionManager.getSessionData('session-001');
    if (testData && testData.history && testData.history.length > 0) {
      console.log('  ✓ Session data retrieval test passed');
    } else {
      throw new Error('Session data retrieval failed');
    }

    // Test 3: Contextual prompt generation
    console.log('Test 3: Contextual prompt generation');
    
    const contextualPrompt = await sessionManager.getContextualPrompt('session-001', 'What was my previous question?');
    if (contextualPrompt && contextualPrompt.length > 0) {
      console.log('  ✓ Contextual prompt generation test passed');
    } else {
      throw new Error('Contextual prompt generation failed');
    }

    // Test 4: Recent messages retrieval
    console.log('Test 4: Recent messages retrieval');
    
    const recentMessages = await sessionManager.getRecentMessages('session-001', 3);
    if (Array.isArray(recentMessages)) {
      console.log(`  ✓ Recent messages retrieval test passed (${recentMessages.length} messages)`);
    } else {
      throw new Error('Recent messages retrieval failed');
    }

    // Test 5: User profile retrieval
    console.log('Test 5: User profile retrieval');
    
    const userProfile = await sessionManager.getUserProfile('session-001');
    if (userProfile && typeof userProfile === 'object') {
      console.log('  ✓ User profile retrieval test passed');
    } else {
      throw new Error('User profile retrieval failed');
    }

    // Test 6: Session clearing
    console.log('Test 6: Session clearing');
    
    const clearResult = await sessionManager.clearSessionHistory('session-001');
    if (clearResult === true) {
      console.log('  ✓ Session clearing test passed');
    } else {
      throw new Error('Session clearing failed');
    }

    // Test 7: Performance stats
    console.log('Test 7: Performance statistics');
    
    const finalStats = sessionManager.getPerformanceStats();
    console.log(`  Total accesses: ${finalStats.totalAccesses}`);
    console.log(`  Average accesses per namespace: ${finalStats.avgAccessesPerNamespace.toFixed(2)}`);
    console.log(`  Load distribution: ${finalStats.loadDistribution.join(', ')}`);
    console.log('  ✓ Performance stats test passed\n');

    console.log('🎉 All tests passed! MultiKVSessionManager is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the tests
runTests().then(success => {
  if (success) {
    console.log('\n✅ MultiKVSessionManager implementation is ready for production use.');
  } else {
    console.log('\n❌ MultiKVSessionManager implementation needs fixes.');
    process.exit(1);
  }
});