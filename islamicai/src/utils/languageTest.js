// Language Detection Test Utility
import { detectLanguage, enhanceMessageWithLanguage, getLanguageTemplates } from './languageDetection.js';

// Test cases for different languages
const testCases = [
  {
    text: "Assalamu Alaikum, how are you?",
    expectedLanguage: "english",
    description: "English with Islamic greeting"
  },
  {
    text: "अस्सलामु अलैकुम, आप कैसे हैं?",
    expectedLanguage: "hindi",
    description: "Hindi with Islamic greeting"
  },
  {
    text: "Assalamu Alaikum, aap kaise hain?",
    expectedLanguage: "hinglish",
    description: "Hinglish (Hindi + English)"
  },
  {
    text: "السلام عليكم، كيف حالك؟",
    expectedLanguage: "arabic",
    description: "Arabic greeting"
  },
  {
    text: "السلام علیکم، آپ کیسے ہیں؟",
    expectedLanguage: "urdu",
    description: "Urdu greeting"
  },
  {
    text: "سلام علیکم، شما چطور هستید؟",
    expectedLanguage: "persian",
    description: "Persian greeting"
  },
  {
    text: "What is the meaning of Surah Al-Fatiha?",
    expectedLanguage: "english",
    description: "English Islamic question"
  },
  {
    text: "सूरह अल-फातिहा का क्या अर्थ है?",
    expectedLanguage: "hindi",
    description: "Hindi Islamic question"
  },
  {
    text: "Surah Al-Fatiha ka kya matlab hai?",
    expectedLanguage: "hinglish",
    description: "Hinglish Islamic question"
  },
  {
    text: "Tell me about the five pillars of Islam",
    expectedLanguage: "english",
    description: "English Islamic topic"
  },
  {
    text: "इस्लाम के पांच स्तंभों के बारे में बताएं",
    expectedLanguage: "hindi",
    description: "Hindi Islamic topic"
  },
  {
    text: "Islam ke paanch stambhon ke bare mein batao",
    expectedLanguage: "hinglish",
    description: "Hinglish Islamic topic"
  }
];

// Run language detection tests
export const runLanguageDetectionTests = () => {
  console.log("🧪 Running Language Detection Tests...\n");
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach((testCase, index) => {
    const result = detectLanguage(testCase.text);
    const passed = result.language === testCase.expectedLanguage;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`Input: "${testCase.text}"`);
    console.log(`Expected: ${testCase.expectedLanguage}`);
    console.log(`Detected: ${result.language} (confidence: ${result.confidence.toFixed(1)}%)`);
    console.log(`Script: ${result.script}`);
    console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---');
    
    if (passed) passedTests++;
  });
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  return {
    passed: passedTests,
    total: totalTests,
    percentage: (passedTests/totalTests)*100
  };
};

// Test language templates
export const testLanguageTemplates = () => {
  console.log("🌍 Testing Language Templates...\n");
  
  const languages = ['english', 'hindi', 'hinglish', 'urdu', 'arabic', 'persian'];
  
  languages.forEach(lang => {
    const templates = getLanguageTemplates(lang);
    console.log(`${lang.toUpperCase()}:`);
    console.log(`  Greeting: ${templates.greeting}`);
    console.log(`  Thinking: ${templates.thinking}`);
    console.log(`  Blessing: ${templates.blessing}`);
    console.log(`  Scholar: ${templates.scholar}`);
    console.log('---');
  });
};

// Test enhanced message processing
export const testEnhancedMessageProcessing = () => {
  console.log("🔧 Testing Enhanced Message Processing...\n");
  
  const testMessages = [
    "What is Tawheed?",
    "तौहीद क्या है?",
    "Tawheed kya hai?",
    "ما هو التوحيد؟",
    "توحید کیا ہے؟"
  ];
  
  testMessages.forEach((message, index) => {
    const enhanced = enhanceMessageWithLanguage(message);
    console.log(`Message ${index + 1}: "${message}"`);
    console.log(`Detected Language: ${enhanced.detectedLanguage}`);
    console.log(`Confidence: ${enhanced.confidence.toFixed(1)}%`);
    console.log(`Should Respond in Language: ${enhanced.shouldRespondInLanguage}`);
    console.log(`Templates Available: ${Object.keys(enhanced.templates).length} templates`);
    console.log('---');
  });
};

// Run all tests
export const runAllLanguageTests = () => {
  console.log("🚀 Starting Comprehensive Language Detection Tests\n");
  console.log("=" * 60);
  
  const detectionResults = runLanguageDetectionTests();
  console.log("\n" + "=" * 60);
  
  testLanguageTemplates();
  console.log("\n" + "=" * 60);
  
  testEnhancedMessageProcessing();
  console.log("\n" + "=" * 60);
  
  console.log(`\n🎯 Overall Test Results: ${detectionResults.percentage.toFixed(1)}% accuracy`);
  
  return detectionResults;
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-run tests
  // runAllLanguageTests();
}
