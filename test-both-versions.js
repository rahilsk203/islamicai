/**
 * Test script to verify both versions of IslamicPrompt have the comprehensive answer methods
 */

async function testBothVersions() {
  try {
    // Test main version
    console.log('Testing main version (islamic-prompt.js)...');
    const { IslamicPrompt: MainIslamicPrompt } = await import('./src/islamic-prompt.js');
    const mainPrompt = new MainIslamicPrompt();
    
    console.log('- getComprehensiveAnswerEnforcement:', typeof mainPrompt.getComprehensiveAnswerEnforcement === 'function');
    console.log('- getEnhancedResponseStructure:', typeof mainPrompt.getEnhancedResponseStructure === 'function');
    
    // Test the methods work
    const enforcement = mainPrompt.getComprehensiveAnswerEnforcement();
    const structure = mainPrompt.getEnhancedResponseStructure();
    
    console.log('- getComprehensiveAnswerEnforcement content length:', enforcement.length);
    console.log('- getEnhancedResponseStructure content length:', structure.length);
    
    // Test fixed version
    console.log('\nTesting fixed version (islamic-prompt-fixed.js)...');
    const { IslamicPrompt: FixedIslamicPrompt } = await import('./src/islamic-prompt-fixed.js');
    const fixedPrompt = new FixedIslamicPrompt();
    
    console.log('- getComprehensiveAnswerEnforcement:', typeof fixedPrompt.getComprehensiveAnswerEnforcement === 'function');
    console.log('- getEnhancedResponseStructure:', typeof fixedPrompt.getEnhancedResponseStructure === 'function');
    
    // Test the methods work
    const fixedEnforcement = fixedPrompt.getComprehensiveAnswerEnforcement();
    const fixedStructure = fixedPrompt.getEnhancedResponseStructure();
    
    console.log('- getComprehensiveAnswerEnforcement content length:', fixedEnforcement.length);
    console.log('- getEnhancedResponseStructure content length:', fixedStructure.length);
    
    console.log('\n✅ Both versions successfully implement comprehensive answer methods!');
    
  } catch (error) {
    console.error('Error testing both versions:', error);
  }
}

// Run the test
testBothVersions();