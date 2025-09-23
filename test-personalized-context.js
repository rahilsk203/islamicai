import { AdvancedSessionManager } from './src/advanced-session-manager.js';

// Mock KV namespace for testing
class MockKVNamespace {
  constructor() {
    this.storage = new Map();
  }
  
  async get(key) {
    return this.storage.get(key) || null;
  }
  
  async put(key, value, options = {}) {
    this.storage.set(key, value);
    return Promise.resolve();
  }
  
  async delete(key) {
    this.storage.delete(key);
    return Promise.resolve();
  }
}

async function testPersonalizedContext() {
  console.log('🧪 Testing Personalized Context Feature...\n');
  
  // Create session manager with mock KV
  const kv = new MockKVNamespace();
  const sessionManager = new AdvancedSessionManager(kv);
  
  // Test session ID
  const sessionId = 'test-session-' + Date.now();
  
  // Simulate a conversation with user preferences
  console.log('💬 Simulating conversation to build user profile...\n');
  
  // First message - user introduces themselves
  await sessionManager.processMessage(
    sessionId,
    "Assalamu alaikum, my name is Ahmed and I live in Cairo, Egypt. I'm interested in learning about Islamic finance.",
    "Wa Alaikum Assalam Ahmed! It's wonderful to meet you. Islamic finance is a fascinating field that encompasses principles of justice, ethics, and risk-sharing in financial transactions. How can I assist you with learning about Islamic finance today?"
  );
  
  // Second message - user asks about specific topic
  await sessionManager.processMessage(
    sessionId,
    "Can you explain what riba is and why it's prohibited in Islam?",
    "Riba, often translated as 'interest' or 'usury', is strictly prohibited in Islam. The Quran explicitly condemns riba in multiple verses, such as in Surah Al-Baqarah (2:275-281). Riba is considered harmful because it:\n\n1. Creates inequality and exploitation\n2. Encourages unjust enrichment\n3. Undermines the spirit of mutual assistance in commerce\n4. Leads to economic instability\n\nIslamic finance offers alternatives like profit-and-loss sharing (Mudarabah), asset-backed financing (Murabaha), and leasing (Ijarah) that comply with Sharia principles."
  );
  
  // Third message - user shows emotional state
  await sessionManager.processMessage(
    sessionId,
    "I'm confused about how these principles apply to modern banking. It seems so complex!",
    "I understand your confusion, Ahmed. The transition from conventional to Islamic banking can seem complex at first. Let me simplify this for you:\n\nModern Islamic banks operate on fundamental principles:\n\n1. **Asset-Backed Transactions**: Every financial product must be tied to a real asset\n2. **Risk Sharing**: Both parties share the risks and rewards of investments\n3. **Ethical Investments**: Avoiding industries harmful to society\n4. **Transparency**: Clear disclosure of all terms and conditions\n\nThink of it as banking with a conscience - where financial transactions align with moral and spiritual values. Would you like me to explain any specific Islamic banking product in more detail?"
  );
  
  // Fourth message - user asks for specific guidance
  await sessionManager.processMessage(
    sessionId,
    "I'd like to open an Islamic bank account. What should I look for?",
    "Excellent question, Ahmed! When opening an Islamic bank account, look for these key features:\n\n1. **Sharia Compliance Certificate**: Ensure the bank has proper certification from recognized scholars\n2. **Transparency in Operations**: Clear explanations of how products work\n3. **Profit Distribution**: For savings accounts, look for accounts that offer actual profit sharing rather than fixed 'interest'\n4. **Ethical Investment Policies**: The bank should avoid investing in prohibited industries\n5. **Scholarly Oversight**: A Sharia board that supervises operations\n\nIn Egypt, several banks offer Islamic banking services. Would you like specific recommendations for banks in Cairo?"
  );
  
  // Get the contextual prompt for the next message
  const contextualPrompt = await sessionManager.getContextualPrompt(
    sessionId,
    "Can you recommend some Islamic banks in Cairo?"
  );
  
  console.log('📝 Generated Contextual Prompt:\n');
  console.log(contextualPrompt);
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Verify that personalized context is included
  const hasPersonalizedContext = contextualPrompt.includes('Personalized Response Context');
  const hasUserName = contextualPrompt.includes('Ahmed');
  const hasUserLocation = contextualPrompt.includes('Cairo');
  const hasUserTopics = contextualPrompt.includes('Islamic finance');
  const hasUserEmotionalState = contextualPrompt.includes('confused');
  
  console.log('✅ Verification Results:\n');
  console.log(`Has Personalized Context Section: ${hasPersonalizedContext ? '✅ YES' : '❌ NO'}`);
  console.log(`Includes User Name: ${hasUserName ? '✅ YES' : '❌ NO'}`);
  console.log(`Includes User Location: ${hasUserLocation ? '✅ YES' : '❌ NO'}`);
  console.log(`References User Topics: ${hasUserTopics ? '✅ YES' : '❌ NO'}`);
  console.log(`Acknowledges Emotional State: ${hasUserEmotionalState ? '✅ YES' : '❌ NO'}`);
  
  if (hasPersonalizedContext && hasUserName && hasUserLocation && hasUserTopics) {
    console.log('\n🎉 ALL TESTS PASSED! Personalized context feature is working correctly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please check the implementation.');
  }
  
  // Show session data summary
  const sessionData = await sessionManager.getSessionData(sessionId);
  console.log('\n📊 Session Data Summary:');
  console.log(`- Total Messages: ${sessionData.history.length}`);
  console.log(`- Memory Items: ${sessionData.memories.length}`);
  console.log(`- User Name: ${sessionData.userProfile.keyFacts?.name || 'Not detected'}`);
  console.log(`- User Location: ${sessionData.userProfile.keyFacts?.location || 'Not detected'}`);
  console.log(`- Preferred Language: ${sessionData.userProfile.preferredLanguage || 'Not detected'}`);
  console.log(`- Fiqh School: ${sessionData.userProfile.fiqhSchool || 'Not specified'}`);
  console.log(`- Response Style: ${sessionData.userProfile.responseStyle || 'Not specified'}`);
  console.log(`- Current Emotional State: ${sessionData.userProfile.currentEmotionalState || 'Not detected'}`);
  
  return {
    hasPersonalizedContext,
    hasUserName,
    hasUserLocation,
    hasUserTopics,
    hasUserEmotionalState
  };
}

// Run the test
testPersonalizedContext().catch(console.error);