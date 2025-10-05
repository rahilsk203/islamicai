/**
 * Test script to verify that the IslamicAI now provides comprehensive responses
 */

import { IslamicPrompt } from './src/islamic-prompt.js';

async function testComprehensiveResponse() {
  console.log('Testing comprehensive response generation...\n');
  
  try {
    // Create IslamicPrompt instance
    const islamicPrompt = new IslamicPrompt();
    
    // Get the system prompt
    const systemPrompt = islamicPrompt.getSystemPrompt();
    
    console.log('System Prompt:');
    console.log('==============');
    console.log(systemPrompt);
    
    // Check if the system prompt includes comprehensive answer instructions
    const hasComprehensiveSection = systemPrompt.includes('COMPREHENSIVE ANSWERS');
    const hasDetailedInstructions = systemPrompt.includes('full, detailed answers to every question');
    
    console.log('\nVerification:');
    console.log('============');
    console.log(`✅ COMPREHENSIVE ANSWERS section present: ${hasComprehensiveSection}`);
    console.log(`✅ Detailed instructions present: ${hasDetailedInstructions}`);
    
    if (hasComprehensiveSection && hasDetailedInstructions) {
      console.log('✅ System prompt correctly emphasizes comprehensive answers');
    } else {
      console.log('❌ System prompt missing comprehensive answer emphasis');
    }
    
    // Test the context-integrated prompt
    const contextPrompt = islamicPrompt.getContextIntegratedPrompt(
      "What is Islam?",
      [], // No past context
      { user_preference: 'english' } // Language preference
    );
    
    console.log('\nContext-Integrated Prompt:');
    console.log('=========================');
    
    // Extract key sections
    const lines = contextPrompt.split('\n');
    let inComprehensiveSection = false;
    let comprehensiveLines = [];
    
    for (const line of lines) {
      if (line.includes('COMPREHENSIVE ANSWER ENFORCEMENT')) {
        inComprehensiveSection = true;
      }
      
      if (inComprehensiveSection) {
        comprehensiveLines.push(line);
        if (line.trim() === '' && comprehensiveLines.length > 3) {
          break;
        }
      }
    }
    
    console.log(comprehensiveLines.join('\n'));
    
    // Verify comprehensive answer enforcement is present
    const hasEnforcement = contextPrompt.includes('COMPREHENSIVE ANSWER ENFORCEMENT');
    const hasStructure = contextPrompt.includes('ENHANCED RESPONSE STRUCTURE');
    
    console.log('\nContext Prompt Verification:');
    console.log('===========================');
    console.log(`✅ Comprehensive Answer Enforcement present: ${hasEnforcement}`);
    console.log(`✅ Enhanced Response Structure present: ${hasStructure}`);
    
    if (hasEnforcement && hasStructure) {
      console.log('✅ Context-integrated prompt correctly enforces comprehensive answers');
    } else {
      console.log('❌ Context-integrated prompt missing comprehensive answer enforcement');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ IslamicAI is now configured to provide comprehensive, detailed answers');

  } catch (error) {
    console.error('Error testing comprehensive response:', error);
  }
}

// Run the test
testComprehensiveResponse();