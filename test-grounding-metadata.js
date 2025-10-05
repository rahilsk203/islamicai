/**
 * Test file for grounding metadata processing
 */

import { GeminiAPI } from './src/gemini-api.js';

// Mock API keys for testing
const mockApiKeys = ['test-key-1'];

// Create an instance of GeminiAPI for testing
const geminiAPI = new GeminiAPI(mockApiKeys);

// Test grounding metadata extraction
console.log('Testing grounding metadata extraction:');

// Mock response with grounding metadata
const mockResponseWithGrounding = {
  candidates: [{
    content: {
      parts: [{
        text: "Spain won Euro 2024, defeating England 2-1 in the final. This victory marks Spain's record fourth European Championship title."
      }]
    },
    groundingMetadata: {
      webSearchQueries: [
        "UEFA Euro 2024 winner",
        "who won euro 2024"
      ],
      groundingChunks: [
        {
          web: {
            uri: "https://example.com/news1",
            title: "Euro 2024 Final Results"
          }
        },
        {
          web: {
            uri: "https://example.com/news2",
            title: "Spain Wins Euro 2024"
          }
        }
      ]
    }
  }]
};

// Mock response without grounding metadata
const mockResponseWithoutGrounding = {
  candidates: [{
    content: {
      parts: [{
        text: "This is a general response without search grounding."
      }]
    }
  }]
};

// Test extractTexts method
console.log('Testing extractTexts method:');

const texts1 = geminiAPI.extractTexts(mockResponseWithGrounding);
console.log('Texts from response with grounding:', texts1);

const texts2 = geminiAPI.extractTexts(mockResponseWithoutGrounding);
console.log('Texts from response without grounding:', texts2);

// Test _extractGroundingInfo method
console.log('\nTesting _extractGroundingInfo method:');

const groundingInfo = geminiAPI._extractGroundingInfo(mockResponseWithGrounding.candidates[0].groundingMetadata);
console.log('Extracted grounding info:', JSON.stringify(groundingInfo, null, 2));

const noGroundingInfo = geminiAPI._extractGroundingInfo(null);
console.log('Extracted grounding info (null input):', noGroundingInfo);

console.log('\nTest completed.');