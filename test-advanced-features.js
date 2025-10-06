/**
 * Test script for Advanced Query Analysis and Response Generation
 */

import { AdvancedQueryAnalyzer } from './src/advanced-query-analyzer.js';
import { EnhancedResponseGenerator } from './src/enhanced-response-generator.js';

// Create instances
const analyzer = new AdvancedQueryAnalyzer();
const generator = new EnhancedResponseGenerator();

// Test cases for query analysis
const testQueries = [
  {
    query: "Assalamu Alaikum! How are you today?",
    description: "Friendly greeting with follow-up question"
  },
  {
    query: "Can you explain the concept of Tawhid in detail?",
    description: "Detailed informational request"
  },
  {
    query: "I'm confused about the rules of fasting during travel. Please help!",
    description: "Personal confusion with urgency"
  },
  {
    query: "Compare Zakat and Sadaqah - which is better?",
    description: "Comparative evaluative question"
  },
  {
    query: "What are the steps to perform Wudu correctly?",
    description: "Instructional request"
  },
  {
    query: "Jazakallah for your help! Can you tell me more about the significance of Friday prayers?",
    description: "Grateful follow-up with informational request"
  }
];

console.log("🔍 Testing Advanced Query Analysis\n");
console.log("=" .repeat(60));

testQueries.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}: ${testCase.description}`);
  console.log(`Query: "${testCase.query}"`);
  
  // Analyze the query
  const analysis = analyzer.analyzeQuery(testCase.query, {
    history: [], // Empty history for testing
    userProfile: { keyFacts: { name: "Ahmed" }, fiqhSchool: "Hanafi" }
  });
  
  console.log(`Intents: ${analysis.intents.join(', ')}`);
  console.log(`Emotions: ${analysis.emotions.join(', ') || 'None detected'}`);
  console.log(`Depth Requirement: ${analysis.depth}`);
  console.log(`Complexity Score: ${analysis.complexity.toFixed(3)}`);
  console.log(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
  
  // Generate response strategy
  const strategy = analyzer.generateResponseStrategy(analysis);
  console.log(`Response Strategy: ${JSON.stringify(strategy)}`);
  
  console.log("-".repeat(50));
});

// Test enhanced response generation
console.log("\n✨ Testing Enhanced Response Generation\n");
console.log("=" .repeat(60));

const sampleResponses = [
  {
    query: "Assalamu Alaikum",
    baseResponse: "Wa Alaikum Assalam! How can I help you today?",
    context: { userProfile: { keyFacts: { name: "Ahmed" } } }
  },
  {
    query: "I'm confused about prayer times",
    baseResponse: "Prayer times are determined by the position of the sun. Fajr begins at dawn, Dhuhr at midday, Asr in the afternoon, Maghrib at sunset, and Isha at night.",
    context: { 
      userProfile: { fiqhSchool: "Shafi" },
      emotions: ["confused"]
    }
  },
  {
    query: "Explain the concept of Iman",
    baseResponse: "Iman (faith) in Islam encompasses belief in Allah, His angels, His books, His messengers, the Day of Judgment, and divine destiny. It's both a declaration and an inner conviction.",
    context: { 
      userProfile: {},
      complexity: 0.8
    }
  }
];

sampleResponses.forEach((test, index) => {
  console.log(`\nEnhancement Test ${index + 1}:`);
  console.log(`Query: "${test.query}"`);
  console.log(`Base Response: ${test.baseResponse}`);
  
  const enhancedResponse = generator.generateEnhancedResponse(
    test.query, 
    test.baseResponse, 
    test.context
  );
  
  console.log(`Enhanced Response: ${enhancedResponse}`);
  console.log("-".repeat(50));
});

// Test user preference optimization
console.log("\n⚙️ Testing User Preference Optimization\n");
console.log("=" .repeat(60));

const preferenceTests = [
  {
    response: "This is a detailed explanation of Islamic principles that requires careful consideration and understanding.",
    preferences: { terse: true },
    description: "Concise preference"
  },
  {
    response: "Allah is one. This is the fundamental principle of Islam.",
    preferences: { verbose: true },
    description: "Verbose preference"
  }
];

preferenceTests.forEach((test, index) => {
  console.log(`\nPreference Test ${index + 1}: ${test.description}`);
  console.log(`Original: ${test.response}`);
  
  const optimized = generator.optimizeForUserPreferences(test.response, test.preferences);
  console.log(`Optimized: ${optimized}`);
});

console.log("\n✅ All advanced feature tests completed successfully!");