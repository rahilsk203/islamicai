// Test script to verify session context handling
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

async function testSessionContext() {
  console.log("Testing session context handling...\n");
  
  // Create session manager with mock KV
  const sessionManager = new AdvancedSessionManager(mockKV);
  const sessionId = 'test-session-' + Date.now();
  
  // Simulate conversation
  const conversation = [
    { role: 'user', content: 'hello kasa hai' },
    { role: 'assistant', content: 'Hello! Main theek hoon, shukriya poochne ke liye. Aap kaise hain?' },
    { role: 'user', content: 'ma bii thik huu' },
    { role: 'assistant', content: 'Main bhi theek hoon, yeh sunkar achha laga!' },
    { role: 'user', content: 'abii gaza maa halat kaya aaj kaa date maa' },
    { role: 'assistant', content: 'Gaza mein halaat abhi bhi bahut serious hain...' },
    { role: 'user', content: 'iskaa kuch news sunaa' },
    { role: 'assistant', content: 'Current situation in Gaza remains dire...' },
    { role: 'user', content: 'abii time kitnaa huu hai' },
    { role: 'assistant', content: 'Aap abhi ka time pooch rahe hain...' },
    { role: 'user', content: 'next namza kaa time kitna maa hai bataa mara yaa' }
  ];
  
  // Process each message in the conversation
  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    
    if (message.role === 'user') {
      console.log(`User: ${message.content}`);
      
      // Get contextual prompt for this user message
      const contextualPrompt = await sessionManager.getContextualPrompt(sessionId, message.content);
      console.log(`Contextual prompt built:\n${contextualPrompt.substring(0, 200)}...\n`);
    } else {
      console.log(`Assistant: ${message.content.substring(0, 50)}...\n`);
      
      // Process the assistant response
      await sessionManager.processMessage(sessionId, conversation[i-1].content, message.content);
    }
  }
  
  // Check final session data
  const sessionData = await sessionManager.getSessionData(sessionId);
  console.log(`Final session history length: ${sessionData.history.length}`);
  console.log(`Final session memories count: ${sessionData.memories.length}`);
  
  // Display recent conversation history
  console.log("\nRecent conversation history:");
  const recentHistory = sessionData.history.slice(-4);
  recentHistory.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
  });
}

// Run the test
testSessionContext().catch(console.error);