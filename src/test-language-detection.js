// Test Language Detection for IslamicAI Backend

// Test cases for different languages
const testCases = [
  {
    input: "hinglish maa bol",
    expectedLanguage: "hinglish",
    description: "Hinglish request"
  },
  {
    input: "tuu kon hai",
    expectedLanguage: "hindi", 
    description: "Hindi question"
  },
  {
    input: "atom kaya hai",
    expectedLanguage: "hindi",
    description: "Hindi question about atom"
  },
  {
    input: "Tell me about the five pillars of Islam",
    expectedLanguage: "english",
    description: "English Islamic question"
  },
  {
    input: "السلام عليكم",
    expectedLanguage: "arabic",
    description: "Arabic greeting"
  },
  {
    input: "السلام علیکم",
    expectedLanguage: "urdu",
    description: "Urdu greeting"
  }
];

// Simple language detection function (backend fallback)
function detectLanguageBackend(text) {
  if (/[\u0900-\u097F]/.test(text)) {
    // Check if it's Hinglish (mix of Hindi and English)
    if (/[a-zA-Z]/.test(text)) {
      return 'hinglish';
    }
    return 'hindi';
  } else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    // Check for Urdu-specific characters
    if (/[\u0627-\u064A\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BE\u06C1\u06D2]/.test(text)) {
      return 'urdu';
    }
    return 'arabic';
  } else if (/[a-zA-Z]/.test(text)) {
    return 'english';
  }
  return 'english';
}

// Test the language detection
console.log("🧪 Testing Backend Language Detection...\n");

testCases.forEach((testCase, index) => {
  const detected = detectLanguageBackend(testCase.input);
  const passed = detected === testCase.expectedLanguage;
  
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.input}"`);
  console.log(`Expected: ${testCase.expectedLanguage}`);
  console.log(`Detected: ${detected}`);
  console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('---');
});

console.log("\n✅ Backend language detection test completed!");
