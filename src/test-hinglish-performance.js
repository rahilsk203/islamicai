import { AdaptiveLanguageSystem } from './adaptive-language-system.js';

// Test Hinglish detection performance
async function testHinglishPerformance() {
  console.log('Testing Hinglish detection performance...');
  
  const languageSystem = new AdaptiveLanguageSystem();
  
  // Test cases
  const testCases = [
    'Assalamu Alaikum! Kaise ho aap?',
    'main IslamicAI hoon, aapka Islamic Scholar AI assistant',
    'Quran ke baare mein kuch sikhna chahenge?',
    'namaz ke liye kya kya zaroori hai?',
    'ramadan aur eid ki dua kya hai?',
    'Allah ke bare mein kuch batao',
    'hajj ke niyam kya hain?',
    'zakat kis tarah calculate karte hain?'
  ];
  
  let totalTime = 0;
  let correctDetections = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const startTime = Date.now();
    const result = languageSystem.adaptLanguage(testCases[i], `test-session-${i}`);
    const endTime = Date.now();
    
    const detectionTime = endTime - startTime;
    totalTime += detectionTime;
    
    console.log(`\\nTest ${i + 1}:`);
    console.log(`Message: "${testCases[i]}"`);
    console.log(`Detected Language: ${result.detectedLanguage}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Detection Time: ${detectionTime}ms`);
    
    if (result.detectedLanguage === 'hinglish') {
      correctDetections++;
    }
  }
  
  console.log('\\n--- Performance Summary ---');
  console.log(`Average Detection Time: ${(totalTime / testCases.length).toFixed(2)}ms`);
  console.log(`Hinglish Detection Accuracy: ${((correctDetections / testCases.length) * 100).toFixed(1)}%`);
  console.log(`Total Processing Time: ${totalTime}ms`);
  
  console.log('\\n✅ Hinglish performance test completed!');
}

// Run the test
testHinglishPerformance().catch(console.error);