import { AdaptiveLanguageSystem } from './src/adaptive-language-system.js';

async function testHinglishResponse() {
  console.log('🧪 Testing Hinglish Response Handling...\n');
  
  const adaptiveLanguageSystem = new AdaptiveLanguageSystem();
  
  // Test Hinglish response instructions
  console.log('1. Testing Hinglish Response Instructions:\n');
  const hinglishInstructions = adaptiveLanguageSystem.getResponseInstructions('hinglish');
  console.log('Hinglish Instructions:', hinglishInstructions.instruction);
  console.log('Hinglish Greeting:', hinglishInstructions.greeting);
  console.log('Hinglish Ending:', hinglishInstructions.ending);
  console.log('Hinglish Style:', hinglishInstructions.style);
  
  // Check for key elements
  const hasHinglishInstruction = hinglishInstructions.instruction.includes('HINGLISH ONLY');
  const hasExample = hinglishInstructions.instruction.includes('Assalamu Alaikum');
  const hasConversationalStyle = hinglishInstructions.instruction.includes('conversational tone');
  
  console.log('\n✅ Verification Results:');
  console.log(`Has Hinglish Instruction: ${hasHinglishInstruction ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Example: ${hasExample ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Conversational Style: ${hasConversationalStyle ? '✅ YES' : '❌ NO'}`);
  
  // Test language detection with Hinglish text
  console.log('\n2. Testing Hinglish Language Detection:\n');
  const hinglishText = "Assalamu Alaikum! Kaise ho aap? Main IslamicAI hoon, aapka Islamic Scholar AI assistant. Aapko Qur'an, Hadith, Tafseer, Fiqh, ya Seerah se related koi bhi madad chahiye toh batao.";
  
  const languageAnalysis = adaptiveLanguageSystem.analyzeLanguageStyle(hinglishText);
  console.log('Detected Language:', languageAnalysis.language);
  console.log('Confidence:', languageAnalysis.confidence);
  console.log('Total Characters:', languageAnalysis.totalChars);
  
  const isHinglishDetected = languageAnalysis.language === 'hinglish';
  const highConfidence = languageAnalysis.confidence > 0.5;
  
  console.log('\n✅ Verification Results:');
  console.log(`Hinglish Detected: ${isHinglishDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`High Confidence: ${highConfidence ? '✅ YES' : '❌ NO'}`);
  
  // Test adaptation with Hinglish preference
  console.log('\n3. Testing Hinglish Adaptation:\n');
  const sessionId = 'test-session-hinglish';
  const context = {};
  
  const adaptationResult = adaptiveLanguageSystem.adaptLanguage(hinglishText, sessionId, context);
  console.log('Adaptation Result:', adaptationResult);
  
  const correctLanguage = adaptationResult.detectedLanguage === 'hinglish';
  const shouldAdapt = adaptationResult.shouldAdapt;
  
  console.log('\n✅ Verification Results:');
  console.log(`Correct Language Detection: ${correctLanguage ? '✅ YES' : '❌ NO'}`);
  console.log(`Should Adapt: ${shouldAdapt ? '✅ YES' : '❌ NO'}`);
  
  // Test explicit Hinglish command
  console.log('\n4. Testing Explicit Hinglish Command:\n');
  const hinglishCommand = "hinglish mein bol";
  const commandDetection = adaptiveLanguageSystem.detectSwitchCommand(hinglishCommand);
  console.log('Command Detection:', commandDetection);
  
  const commandDetected = commandDetection !== null;
  const correctCommandLanguage = commandDetection?.language === 'hinglish';
  
  console.log('\n✅ Verification Results:');
  console.log(`Command Detected: ${commandDetected ? '✅ YES' : '❌ NO'}`);
  console.log(`Correct Command Language: ${correctCommandLanguage ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🎉 All Hinglish response tests completed!');
  
  return {
    hinglishInstructions: {
      hasHinglishInstruction,
      hasExample,
      hasConversationalStyle
    },
    languageDetection: {
      isHinglishDetected,
      highConfidence
    },
    adaptation: {
      correctLanguage,
      shouldAdapt
    },
    commandDetection: {
      commandDetected,
      correctCommandLanguage
    }
  };
}

// Run the test
testHinglishResponse().catch(console.error);