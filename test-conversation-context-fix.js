import { GeminiAPI } from './src/gemini-api.js';

// Test the conversation context fix
async function testConversationContextFix() {
  console.log('Testing conversation context fix...\n');
  
  // Mock API key
  const mockApiKey = 'test-api-key';
  const geminiAPI = new GeminiAPI(mockApiKey);
  
  // Mock the API request to capture the request body
  let capturedRequestBodies = [];
  geminiAPI._makeAPIRequestWithRetryToUrl = async (requestBody) => {
    capturedRequestBodies.push(requestBody);
    return {
      candidates: [{
        content: {
          parts: [{
            text: `Test response for conversation context fix`
          }]
        }
      }]
    };
  };
  
  // Test with a contextual prompt that simulates a conversation
  const contextualPrompt = `**Recent Conversation History:**
User: hello kasa hai
IslamicAI: Hello! Main theek hoon, shukriya poochne ke liye...
User: ma bii thik huu
IslamicAI: Main bhi theek hoon, yeh sunkar achha laga!
User: abii gaza maa halat kaya aaj kaa date maa
IslamicAI: Gaza mein halaat abhi bhi bahut serious hain...
User: iskaa kuch news sunaa
IslamicAI: Current situation in Gaza remains dire...
User: abii time kitnaa huu hai
IslamicAI: Aap abhi ka time pooch rahe hain...
User: next namza kaa time kitna maa hai bataa mara yaa

**Conversation Context Instructions:**
- Respond directly to the user's latest message while considering the conversation history
- If the user refers to something mentioned earlier in the conversation, acknowledge it appropriately
- Maintain natural conversation flow and avoid repeating information unnecessarily`;

  try {
    // Generate response with contextual prompt
    const response = await geminiAPI.generateResponse(
      [], 
      'test-session', 
      'next namza kaa time kitna maa hai bataa mara yaa', 
      contextualPrompt, 
      { detected_language: 'hinglish' }, 
      { enableStreaming: false }
    );
    
    // Check if the request was properly formatted
    const requestBody = capturedRequestBodies[capturedRequestBodies.length - 1];
    
    // Check for key elements in the prompt
    const promptText = requestBody.contents[0].parts[0].text;
    
    // Check for conversation context maintenance instruction
    const hasConversationContextInstruction = promptText.includes('MAINTAIN CONVERSATION CONTEXT');
    const hasConversationContextSection = promptText.includes('CONVERSATION CONTEXT MAINTENANCE');
    const hasContextualPrompt = promptText.includes('CONTEXTUAL PROMPT');
    const hasConversationHistory = promptText.includes('Recent Conversation History');
    
    console.log('Conversation Context Fix Test Results:');
    console.log(`✓ Conversation Context Section: ${hasConversationContextSection}`);
    console.log(`✓ Conversation Context Instruction: ${hasConversationContextInstruction}`);
    console.log(`✓ Contextual Prompt Included: ${hasContextualPrompt}`);
    console.log(`✓ Conversation History Present: ${hasConversationHistory}`);
    
    if (hasConversationContextSection && hasConversationContextInstruction) {
      console.log('\n✅ CONVERSATION CONTEXT FIX SUCCESSFULLY APPLIED');
      console.log('The system now includes explicit instructions to maintain conversation context');
      console.log('This should prevent the AI from reverting to previous topics unnecessarily');
    } else {
      console.log('\n❌ CONVERSATION CONTEXT FIX NOT PROPERLY APPLIED');
      console.log('The conversation context maintenance instructions are missing');
    }
    
  } catch (error) {
    console.log(`Error testing conversation context fix: ${error.message}\n`);
  }
  
  console.log('\nTest completed.');
}

// Run the test
testConversationContextFix().catch(console.error);