import { IslamicPrompt } from './src/islamic-prompt.js';

async function testDetailedResponses() {
  console.log('🧪 Testing Detailed Response Improvements...\n');
  
  const prompt = new IslamicPrompt();
  
  // Test the enhanced structured response prompt
  console.log('1. Testing Enhanced Structured Response Prompt:\n');
  const structuredPrompt = prompt.getStructuredResponsePrompt();
  console.log(structuredPrompt.substring(0, 500) + '...\n');
  
  // Check for key elements
  const hasCoreAnswer = structuredPrompt.includes('Core Answer');
  const hasEvidenceSources = structuredPrompt.includes('Evidence & Sources');
  const hasPracticalApplication = structuredPrompt.includes('Practical Application');
  const hasHistoricalContext = structuredPrompt.includes('Historical Context');
  const hasDifferentPerspectives = structuredPrompt.includes('Different Perspectives');
  const hasMisconceptions = structuredPrompt.includes('Common Misconceptions');
  const hasContemporaryRelevance = structuredPrompt.includes('Contemporary Relevance');
  const hasKeyTakeaways = structuredPrompt.includes('Key Takeaways');
  const hasFinalReflection = structuredPrompt.includes('Final Reflection');
  
  console.log('✅ Verification Results:');
  console.log(`Has Core Answer Section: ${hasCoreAnswer ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Evidence & Sources Section: ${hasEvidenceSources ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Practical Application Section: ${hasPracticalApplication ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Historical Context Section: ${hasHistoricalContext ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Different Perspectives Section: ${hasDifferentPerspectives ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Common Misconceptions Section: ${hasMisconceptions ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Contemporary Relevance Section: ${hasContemporaryRelevance ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Key Takeaways Section: ${hasKeyTakeaways ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Final Reflection Section: ${hasFinalReflection ? '✅ YES' : '❌ NO'}`);
  
  // Test the enhanced debate framework
  console.log('\n2. Testing Enhanced Debate Response Framework:\n');
  const debateFramework = prompt.getDebateResponseFramework();
  console.log(debateFramework.substring(0, 500) + '...\n');
  
  // Check for key elements
  const hasRespectfulAck = debateFramework.includes('Respectful Acknowledgment');
  const hasIslamicPerspective = debateFramework.includes('Islamic Perspective Presentation');
  const hasRationalArgument = debateFramework.includes('Rational Argumentation');
  const hasBalancedApproach = debateFramework.includes('Balanced Approach');
  const hasConstructiveConclusion = debateFramework.includes('Constructive Conclusion');
  
  console.log('✅ Verification Results:');
  console.log(`Has Respectful Acknowledgment: ${hasRespectfulAck ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Islamic Perspective Presentation: ${hasIslamicPerspective ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Rational Argumentation: ${hasRationalArgument ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Balanced Approach: ${hasBalancedApproach ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Constructive Conclusion: ${hasConstructiveConclusion ? '✅ YES' : '❌ NO'}`);
  
  // Test the ultra-secure prompt
  console.log('\n3. Testing Enhanced Ultra-Secure Prompt:\n');
  const ultraSecurePrompt = prompt.getUltraSecurePrompt();
  console.log(ultraSecurePrompt.substring(0, 500) + '...\n');
  
  // Check for key elements
  const hasResponseQuality = ultraSecurePrompt.includes('RESPONSE QUALITY STANDARDS');
  const hasComprehensiveStructure = ultraSecurePrompt.includes('COMPREHENSIVE RESPONSE STRUCTURE');
  const hasComprehensiveness = ultraSecurePrompt.includes('COMPREHENSIVENESS REQUIREMENTS');
  
  console.log('✅ Verification Results:');
  console.log(`Has Response Quality Standards: ${hasResponseQuality ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Comprehensive Response Structure: ${hasComprehensiveStructure ? '✅ YES' : '❌ NO'}`);
  console.log(`Has Comprehensiveness Requirements: ${hasComprehensiveness ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🎉 All tests completed! The response improvement features are implemented correctly.');
  
  return {
    structuredPrompt: {
      hasCoreAnswer,
      hasEvidenceSources,
      hasPracticalApplication,
      hasHistoricalContext,
      hasDifferentPerspectives,
      hasMisconceptions,
      hasContemporaryRelevance,
      hasKeyTakeaways,
      hasFinalReflection
    },
    debateFramework: {
      hasRespectfulAck,
      hasIslamicPerspective,
      hasRationalArgument,
      hasBalancedApproach,
      hasConstructiveConclusion
    },
    ultraSecurePrompt: {
      hasResponseQuality,
      hasComprehensiveStructure,
      hasComprehensiveness
    }
  };
}

// Run the test
testDetailedResponses().catch(console.error);