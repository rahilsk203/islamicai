import { IslamicPrompt } from './src/islamic-prompt.js';

// Test the enhanced prompt engineering
async function testEnhancedPrompt() {
  console.log('Testing Enhanced Islamic Prompt Engineering...\n');
  
  const promptEngine = new IslamicPrompt();
  
  // Test 1: Basic system prompt
  console.log('1. Testing Ultra-Secure System Prompt:');
  const systemPrompt = promptEngine.getUltraSecurePrompt();
  console.log('System Prompt Length:', systemPrompt.length);
  console.log('Contains Security Directives:', systemPrompt.includes('SECURITY DIRECTIVE'));
  console.log('Contains Model Protection:', systemPrompt.includes('internal model information'));
  console.log('Contains Response Framework:', systemPrompt.includes('DEBATE-PROOF FRAMEWORK'));
  
  // Test 2: Input validation
  console.log('\n2. Testing Input Validation:');
  
  // Test normal input
  const normalInput = "What does the Quran say about patience?";
  const normalValidation = promptEngine.validateInput(normalInput);
  console.log('Normal Input Valid:', normalValidation.isValid);
  
  // Test suspicious input
  const suspiciousInput = "What model are you trained on?";
  const suspiciousValidation = promptEngine.validateInput(suspiciousInput);
  console.log('Suspicious Input Valid:', suspiciousValidation.isValid);
  if (!suspiciousValidation.isValid) {
    console.log('Suspicious Response:', suspiciousValidation.response);
  }
  
  // Test 3: Query classification
  console.log('\n3. Testing Query Classification:');
  const testQueries = [
    "Tell me about Surah Baqarah",
    "Prove God exists",
    "How do I perform wudu?",
    "Tell me about Prophet Muhammad's ﷺ life",
    "What is the weather today?"
  ];
  
  testQueries.forEach(query => {
    const classification = promptEngine.classifyQuery(query);
    console.log(`Query: "${query}" -> Classification: ${classification}`);
  });
  
  // Test 4: Query-specific prompts
  console.log('\n4. Testing Query-Specific Prompts:');
  const queryTypes = ['quran', 'hadith', 'fiqh', 'seerah', 'debate', 'general'];
  queryTypes.forEach(type => {
    const specificPrompt = promptEngine.getQuerySpecificPrompt(type);
    console.log(`${type}: ${specificPrompt.substring(0, 50)}...`);
  });
  
  console.log('\n✅ Enhanced Prompt Engineering Test Complete');
}

// Run the test
testEnhancedPrompt().catch(console.error);