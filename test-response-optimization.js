/**
 * Test script for Response Length Optimization
 */

import { ResponseLengthOptimizer } from './src/response-length-optimizer.js';
import { IslamicPrompt } from './src/islamic-prompt.js';

// Create instances
const optimizer = new ResponseLengthOptimizer();
const prompt = new IslamicPrompt();

// Test cases
const testCases = [
  {
    query: "What is the meaning of life?",
    description: "Simple philosophical question"
  },
  {
    query: "Explain the concept of Tawhid in detail with examples",
    description: "Complex Islamic theological concept"
  },
  {
    query: "How to perform Wudu?",
    description: "Practical religious instruction"
  },
  {
    query: "Compare and contrast the Hanafi and Shafi schools of Islamic jurisprudence",
    description: "Highly complex comparative analysis"
  },
  {
    query: "Define Salah",
    description: "Simple definition request"
  },
  {
    query: "Analyze the historical development of Islamic architecture and its spiritual significance",
    description: "Complex historical and cultural analysis"
  },
  {
    query: "What are the pillars of Islam?",
    description: "Basic factual question"
  },
  {
    query: "Explain the relationship between Islamic economics and conventional economics, highlighting key differences and similarities with real-world examples",
    description: "Very complex interdisciplinary analysis"
  }
];

console.log("🧪 Testing Response Length Optimization\n");
console.log("=" .repeat(80));

testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}: ${testCase.description}`);
  console.log(`Query: "${testCase.query}"`);
  
  // Classify the query
  const queryType = prompt.classifyQuery(testCase.query);
  console.log(`Classified Topic: ${queryType.topic}`);
  console.log(`Confidence: ${(queryType.confidence * 100).toFixed(1)}%`);
  console.log(`Complexity: ${queryType.complexity}`);
  
  // Calculate semantic complexity
  const complexityScore = optimizer.calculateSemanticComplexity(testCase.query, queryType);
  console.log(`Semantic Complexity Score: ${complexityScore.toFixed(3)}`);
  
  // Determine optimal response length for different modes
  const terseConfig = optimizer.determineOptimalResponseLength(testCase.query, queryType, { terse: true });
  const normalConfig = optimizer.determineOptimalResponseLength(testCase.query, queryType, {});
  const verboseConfig = optimizer.determineOptimalResponseLength(testCase.query, queryType, { verbose: true });
  
  console.log(`Response Length Category: ${normalConfig.lengthCategory}`);
  console.log(`Target Tokens - Terse: ${terseConfig.targetTokens}, Normal: ${normalConfig.targetTokens}, Verbose: ${verboseConfig.targetTokens}`);
  console.log(`Max Sentences - Terse: ${terseConfig.maxSentences}, Normal: ${normalConfig.maxSentences}, Verbose: ${verboseConfig.maxSentences}`);
  
  // Test token estimation
  const estimatedTokens = optimizer.estimateTokenCount(testCase.query);
  console.log(`Estimated Input Tokens: ${estimatedTokens}`);
  
  console.log("-".repeat(60));
});

// Test feedback adjustment
console.log("\n🔄 Testing Feedback Adjustment");
const sampleConfig = optimizer.determineOptimalResponseLength(
  "Explain the concept of Tawhid in detail with examples", 
  prompt.classifyQuery("Explain the concept of Tawhid in detail with examples")
);

console.log(`\nOriginal Configuration:`);
console.log(`Target Tokens: ${sampleConfig.targetTokens}`);
console.log(`Max Sentences: ${sampleConfig.maxSentences}`);

const adjustedForShort = optimizer.adjustForFeedback('too_short', sampleConfig);
console.log(`\nAdjusted for 'too_short' feedback:`);
console.log(`Target Tokens: ${adjustedForShort.targetTokens}`);
console.log(`Max Sentences: ${adjustedForShort.maxSentences}`);

const adjustedForLong = optimizer.adjustForFeedback('too_long', sampleConfig);
console.log(`\nAdjusted for 'too_long' feedback:`);
console.log(`Target Tokens: ${adjustedForLong.targetTokens}`);
console.log(`Max Sentences: ${adjustedForLong.maxSentences}`);

console.log("\n✅ All tests completed successfully!");