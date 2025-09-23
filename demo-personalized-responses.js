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

async function demoPersonalizedResponses() {
  console.log('🌟 Demonstrating Personalized AI Responses with Memory\n');
  
  // Create session manager with mock KV
  const kv = new MockKVNamespace();
  const sessionManager = new AdvancedSessionManager(kv);
  
  // Test session ID
  const sessionId = 'demo-session-' + Date.now();
  
  console.log('💬 Simulating a conversation to build user profile...\n');
  
  // Simulate a conversation that builds a rich user profile
  const conversation = [
    {
      user: "Assalamu alaikum! My name is Fatima and I'm from Jakarta, Indonesia. I'm preparing for Umrah and have some questions.",
      ai: "Wa Alaikum Assalam Fatima! What a blessed journey you're preparing for. I'm honored to help you with your Umrah preparations. What specific questions do you have about the rituals and preparations?"
    },
    {
      user: "I'm a bit confused about the Ihram requirements. What are the conditions for wearing it correctly?",
      ai: "May Allah make your Umrah journey blessed, Fatima! Ihram is a sacred state with specific requirements:\n\n**For Men:**\n- Two white, unstitched garments (izar and rida)\n- No stitched clothing, no shoes (only sandals below the ankles)\n- No perfume or scented products\n\n**For Women:**\n- Modest clothing that covers the entire body except face and hands\n- No face veil (niqab) or gloves\n- Regular clothes are acceptable\n\n**General Conditions:**\n- Intention (niyyah) must be made\n- Avoid prohibited acts (like cutting hair, using perfume, etc.)\n- Enter the state of Ihram before crossing the Miqat boundary\n\nWould you like me to explain any specific aspect in more detail?"
    },
    {
      user: "Thank you! That's helpful. I'm also wondering about the Tawaf procedure. How many rounds and what's the proper way to perform it?",
      ai: "You're most welcome, Fatima! Tawaf is indeed a beautiful ritual. Here's how to perform it correctly:\n\n**Number of Rounds:** 7 complete rounds around the Kaaba\n\n**Procedure:**\n1. Start at the Black Stone (Hajar al-Aswad)\n2. Walk counterclockwise around the Kaaba\n3. Try to kiss or touch the Black Stone at the start of each round (if possible)\n4. Recite supplications during the rounds\n5. Keep the Kaaba on your right side\n6. Walk normally (not running) except in the first three rounds for men in the designated area\n\n**Important Notes:**\n- Maintain ritual purity (wudu)\n- Men should uncover their right shoulder (idtiba) during the first three rounds\n- Women follow the same procedure without idtiba\n\nMay Allah make your Tawaf accepted! Do you have questions about any specific part?"
    },
    {
      user: "I'm a bit anxious about performing everything correctly. What if I make a mistake during the rituals?",
      ai: "I completely understand your concern, Fatima. Anxiety about performing rituals correctly is natural, especially for such a sacred journey. Here's what you should know:\n\n**Allah's Mercy:**\n- Allah is Most Forgiving and Most Merciful\n- Sincere intention is what matters most\n- Minor mistakes or forgetfulness are forgiven\n\n**If You Make a Mistake:\n- Simply correct it if you realize immediately\n- Continue with the rituals without distress\n- Seek forgiveness (istighfar) sincerely\n\n**Remember:**\n- The Prophet Muhammad (ﷺ) said: \"Actions are judged by intentions\"\n- Focus on humility and devotion rather than perfection\n- Your Umrah will be accepted with sincere effort\n\nYour concern shows your reverence, which is beautiful. Try to relax and focus on connecting with Allah."
    }
  ];
  
  // Process each conversation turn
  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i];
    console.log(`👤 User: ${turn.user}`);
    console.log(`🤖 AI: ${turn.ai}\n`);
    
    // Process the message
    await sessionManager.processMessage(sessionId, turn.user, turn.ai);
  }
  
  // Now demonstrate how the AI uses memory for personalized responses
  console.log('🔄 Now demonstrating how the AI uses memory for personalized responses:\n');
  
  // Get contextual prompt for a new question
  const contextualPrompt = await sessionManager.getContextualPrompt(
    sessionId,
    "Based on our conversation, what dua should I recite during Tawaf?"
  );
  
  console.log('📝 Contextual Prompt Generated for AI:\n');
  console.log(contextualPrompt.substring(0, 1000) + '...\n'); // Show first 1000 chars
  
  // Show the personalized context section
  const personalizedSection = contextualPrompt.split('**Personalized Response Context:**')[1];
  if (personalizedSection) {
    console.log('🎯 Personalized Context Section:\n');
    console.log('**Personalized Response Context:**' + personalizedSection.split('\n\n')[0] + '\n');
  }
  
  console.log('✨ How this enhances the AI response:\n');
  console.log('1. The AI knows your name is Fatima and will address you personally');
  console.log('2. The AI is aware you\'re from Jakarta, Indonesia and can consider cultural context');
  console.log('3. The AI knows you\'re preparing for Umrah and will provide relevant guidance');
  console.log('4. The AI understands your learning pattern (asking detailed questions)');
  console.log('5. The AI recognizes your emotional state (anxious) and will respond with empathy');
  console.log('6. The AI knows this is a developing conversation and will maintain continuity');
  console.log('7. The AI can reference your recent questions about Ihram and Tawaf');
  console.log('8. The AI will provide a response in the same style you\'ve been receiving');
  
  console.log('\n🌟 Result: More personalized, relevant, and empathetic responses!\n');
  
  // Show session data summary
  const sessionData = await sessionManager.getSessionData(sessionId);
  console.log('📊 Session Summary:');
  console.log(`- Conversation turns: ${sessionData.history.length / 2}`);
  console.log(`- Memory items: ${sessionData.memories.length}`);
  console.log(`- User name: ${sessionData.userProfile.keyFacts?.name || 'Not detected'}`);
  console.log(`- User location: ${sessionData.userProfile.keyFacts?.location || 'Not detected'}`);
  console.log(`- Current emotional state: ${sessionData.userProfile.currentEmotionalState || 'Not detected'}`);
  console.log(`- Conversation topics: ${sessionData.conversationContext.topics?.join(', ') || 'None detected'}`);
  
  return sessionData;
}

// Run the demo
demoPersonalizedResponses().catch(console.error);