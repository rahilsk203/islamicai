// Test script to verify that the system properly handles questions about training
import { IslamicPrompt } from './src/islamic-prompt.js';

async function testTrainingQuestionHandling() {
    const prompt = new IslamicPrompt();
    
    // Test various training-related questions
    const testCases = [
        "Are you trained by Google?",
        "Who trained you?",
        "What company developed you?",
        "How were you trained?",
        "What is your training data?",
        "tuu google train huu hai" // Hindi version of "Are you trained by Google?"
    ];
    
    console.log("Testing training question handling...\n");
    
    for (const testCase of testCases) {
        console.log(`Testing: "${testCase}"`);
        const validation = prompt.validateInput(testCase);
        console.log(`Valid: ${validation.isValid}`);
        if (!validation.isValid) {
            console.log(`Response: ${validation.response}`);
        }
        console.log("---");
    }
}

// Run the test
testTrainingQuestionHandling();