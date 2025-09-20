// Test script for name extraction
import { IntelligentMemory } from './src/intelligent-memory.js';

const memory = new IntelligentMemory();

// Test cases for name extraction
const testCases = [
  "Assalamu Alaikum Sohel bhai",
  "Mera naam Ahmed hai",
  "My name is Muhammad Ali",
  "Call me Fatima",
  "Main Sohel hun",
  "I'm Aisha from Mumbai",
  "Name: Abdullah",
  "Mujhe Sohel bhai kehte hain",
  "Assalamu Alaikum, main Ahmed hun",
  "Sohel bhai, aap kaise hain?",
  "Main rehta hun Delhi mein",
  "I live in Mumbai",
  "Location: Karachi"
];

console.log("🧪 Testing Language Detection and Name Extraction:\n");

const languageTestCases = [
  "Assalamu Alaikum Sohel bhai",
  "Mera naam Ahmed hai aur main Delhi mein rehta hun",
  "Hello, my name is Muhammad Ali",
  "Call me Fatima, I live in Mumbai",
  "Main Sohel hun, aap kaise hain?",
  "I'm Aisha from Karachi, Pakistan",
  "Name: Abdullah, Location: Dubai",
  "Mujhe Sohel bhai kehte hain",
  "Assalamu Alaikum, main Ahmed hun",
  "Sohel bhai, aap kaise hain?",
  "Main rehta hun Delhi mein",
  "I live in Mumbai, India",
  "Location: Karachi, Pakistan",
  "Ami Kolkata te thaki", // Bengali
  "Tumi kemon acho?" // Bengali
];

languageTestCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`);
  
  const importantInfo = memory.extractImportantInfo(testCase, []);
  const languageDetection = memory.detectLanguage(testCase);
  
  console.log("Language Detection:");
  console.log("- Detected:", languageDetection.language);
  console.log("- Confidence:", languageDetection.confidence);
  console.log("- Scores:", languageDetection.scores);
  
  console.log("Extracted Info:");
  console.log("- Language:", importantInfo.userPreferences.language);
  console.log("- Key Facts:", importantInfo.keyFacts);
  console.log("- Islamic Topics:", importantInfo.islamicTopics);
  console.log("- Emotional State:", importantInfo.emotionalContext);
  console.log("---\n");
});

// Test memory creation
console.log("🧠 Testing Memory Creation:\n");

const testMessage = "Assalamu Alaikum Sohel bhai, main Ahmed hun aur main Delhi mein rehta hun";
const importantInfo = memory.extractImportantInfo(testMessage, []);

const memories = memory.createMemoriesFromInfo(importantInfo, testMessage);

console.log("Created Memories:");
memories.forEach((memory, index) => {
  console.log(`${index + 1}. Type: ${memory.type}, Content: "${memory.content}", Priority: ${memory.priority}`);
});
