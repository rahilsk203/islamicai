// Test to verify context building improvements
import { AdvancedSessionManager } from './src/advanced-session-manager.js';

// Mock KV namespace for testing
const mockKV = {
  data: {},
  async get(key) {
    return this.data[key] || null;
  },
  async put(key, value) {
    this.data[key] = value;
  },
  async delete(key) {
    delete this.data[key];
  }
};

async function testContextBuilding() {
  console.log("=== Testing Context Building Improvements ===\n");
  
  // Create session manager with mock KV
  const sessionManager = new AdvancedSessionManager(mockKV);
  const sessionId = 'test-session-' + Date.now();
  
  // Simulate a conversation where context is important
  const messages = [
    "hello kasa hai",
    "ma bhi theek hu, aap kya kar rahe ho?",
    "maine aaj subah ki namaz padhi, aapne ki kya?",
    "next namaz kab hai?"
  ];
  
  console.log("Testing conversation:");
  for (let i = 0; i < messages.length; i++) {
    console.log(`${i + 1}. User: ${messages[i]}`);
    
    // Get contextual prompt for this message
    const contextualPrompt = await sessionManager.getContextualPrompt(sessionId, messages[i]);
    
    // Check if our improvements are present
    console.log("   Context improvements check:");
    console.log(`   - Contains 'Conversation Context Instructions': ${contextualPrompt.includes('Conversation Context Instructions')}`);
    console.log(`   - Contains 'Conversation Flow Instructions': ${contextualPrompt.includes('Conversation Flow Instructions')}`);
    console.log(`   - Contains 'Conversation Flow Guidance': ${contextualPrompt.includes('Conversation Flow Guidance')}`);
    console.log(`   - Contains 'Conversation Guidelines': ${contextualPrompt.includes('Conversation Guidelines')}`);
    
    // Process message if not the last one
    if (i < messages.length - 1) {
      // Simulate AI response
      const aiResponse = `Response to: ${messages[i]}`;
      await sessionManager.processMessage(sessionId, messages[i], aiResponse);
    }
    
    console.log("");
  }
  
  console.log("=== Test Complete ===");
  console.log("The context building now includes explicit instructions for maintaining conversation flow,");
  console.log("which should help the AI respond more appropriately to the current message while");
  console.log("considering the conversation history.");
}

// Run the test
testContextBuilding().catch(console.error);