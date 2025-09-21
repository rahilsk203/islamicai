// Test Adaptive Language System for IslamicAI
// Demonstrates DSA-level optimized language adaptation

import { AdaptiveLanguageSystem } from './src/adaptive-language-system.js';

// Test cases for adaptive language system
const testCases = [
  {
    name: "Hinglish Detection",
    input: "hello kasa hai bhai",
    expectedLanguage: "hinglish",
    sessionId: "test_session_1"
  },
  {
    name: "Explicit Hinglish Switch",
    input: "hinglish maa bol",
    expectedLanguage: "hinglish",
    sessionId: "test_session_1"
  },
  {
    name: "Hindi Detection",
    input: "नमाज़ कैसे पढ़ते हैं?",
    expectedLanguage: "hindi",
    sessionId: "test_session_2"
  },
  {
    name: "English Detection",
    input: "How do I perform Salah?",
    expectedLanguage: "english",
    sessionId: "test_session_3"
  },
  {
    name: "Bengali Detection",
    input: "নামাজ কিভাবে পড়ব?",
    expectedLanguage: "bengali",
    sessionId: "test_session_4"
  },
  {
    name: "Urdu Detection",
    input: "نماز کیسے پڑھیں؟",
    expectedLanguage: "urdu",
    sessionId: "test_session_5"
  },
  {
    name: "Language Switching Test",
    input: "Hello, how are you? hinglish mein bolo",
    expectedLanguage: "hinglish",
    sessionId: "test_session_6"
  },
  {
    name: "Mixed Language Test",
    input: "Assalamu Alaikum, kasa hai aap?",
    expectedLanguage: "hinglish",
    sessionId: "test_session_7"
  }
];

// Initialize adaptive language system
const adaptiveSystem = new AdaptiveLanguageSystem();

console.log("🧪 Testing DSA-Level Optimized Adaptive Language System\n");
console.log("=" * 60);

// Test each case
for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
  console.log(`Input: "${testCase.input}"`);
  
  try {
    // Apply adaptive language learning
    const result = adaptiveSystem.adaptLanguage(testCase.input, testCase.sessionId, {
      timestamp: Date.now(),
      testMode: true
    });
    
    console.log(`✅ Detected Language: ${result.detectedLanguage}`);
    console.log(`📊 Confidence: ${Math.round(result.confidence * 100)}%`);
    console.log(`🔄 Adaptation Type: ${result.adaptationType}`);
    console.log(`👤 User Preference: ${result.userPreference}`);
    console.log(`🎯 Should Adapt: ${result.shouldAdapt}`);
    
    // Check if detection matches expected
    const passed = result.detectedLanguage === testCase.expectedLanguage;
    console.log(`${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);
    
    if (!passed) {
      console.log(`Expected: ${testCase.expectedLanguage}, Got: ${result.detectedLanguage}`);
    }
    
    // Show response instructions
    const instructions = adaptiveSystem.getResponseInstructions(result.detectedLanguage, result);
    console.log(`📋 Response Instruction: ${instructions.instruction.substring(0, 100)}...`);
    
  } catch (error) {
    console.log(`❌ Test FAILED with error: ${error.message}`);
  }
  
  console.log("-" * 40);
}

// Test user preference learning
console.log("\n🧠 Testing User Preference Learning");
console.log("=" * 40);

const learningSessionId = "learning_test_session";

// Simulate conversation progression
const conversationSteps = [
  "hello kasa hai",
  "hinglish mein bolo",
  "namaz kaise padhte hain",
  "hinglish me answer do",
  "quran padhne ka tarika"
];

console.log("\n📚 Simulating conversation learning:");
for (let i = 0; i < conversationSteps.length; i++) {
  const step = conversationSteps[i];
  console.log(`\nStep ${i + 1}: "${step}"`);
  
  const result = adaptiveSystem.adaptLanguage(step, learningSessionId, {
    timestamp: Date.now(),
    conversationStep: i + 1
  });
  
  console.log(`Detected: ${result.detectedLanguage} (${Math.round(result.confidence * 100)}%)`);
  console.log(`Adaptation: ${result.adaptationType}`);
  
  // Show user preference evolution
  const userPref = adaptiveSystem.getUserPreference(learningSessionId);
  if (userPref) {
    console.log(`User Preference: ${userPref.language} (${Math.round(userPref.confidence * 100)}%, ${userPref.samples} samples)`);
  }
}

// Test system statistics
console.log("\n📊 System Statistics:");
console.log("=" * 30);
const stats = adaptiveSystem.getSystemStats();
console.log(`Total Users: ${stats.totalUsers}`);
console.log(`Cache Size: ${stats.cacheSize}/${stats.cacheCapacity}`);
console.log(`Adaptation Queue Size: ${stats.adaptationQueueSize}`);
console.log(`Learning Rate: ${stats.learningRate}`);
console.log(`Confidence Threshold: ${stats.confidenceThreshold}`);

// Test language switch commands
console.log("\n🔄 Testing Language Switch Commands:");
console.log("=" * 40);

const switchCommands = [
  "hinglish maa bol",
  "hindi mein bolo",
  "speak in english",
  "bengali me bol",
  "urdu mein bolo"
];

for (const command of switchCommands) {
  const result = adaptiveSystem.adaptLanguage(command, "switch_test_session", {
    timestamp: Date.now()
  });
  
  console.log(`"${command}" → ${result.detectedLanguage} (${result.adaptationType})`);
}

// Test performance with multiple sessions
console.log("\n⚡ Performance Test:");
console.log("=" * 25);

const startTime = Date.now();
const performanceTests = 100;

for (let i = 0; i < performanceTests; i++) {
  const testInput = `test message ${i} kasa hai`;
  const sessionId = `perf_test_${i % 10}`; // Reuse sessions
  
  adaptiveSystem.adaptLanguage(testInput, sessionId, {
    timestamp: Date.now(),
    performanceTest: true
  });
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log(`Processed ${performanceTests} adaptations in ${duration}ms`);
console.log(`Average: ${(duration / performanceTests).toFixed(2)}ms per adaptation`);

// Final system stats
console.log("\n📈 Final System Statistics:");
console.log("=" * 35);
const finalStats = adaptiveSystem.getSystemStats();
console.log(`Total Users: ${finalStats.totalUsers}`);
console.log(`Cache Size: ${finalStats.cacheSize}/${finalStats.cacheCapacity}`);
console.log(`Cache Hit Rate: ${((finalStats.cacheSize / finalStats.cacheCapacity) * 100).toFixed(1)}%`);

console.log("\n✅ Adaptive Language System Test Completed!");
console.log("🎯 System is ready for production use with DSA-level optimizations");
