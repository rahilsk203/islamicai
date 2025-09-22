const GeminiAPI = require('./src/gemini-api');

async function testHinglishWeatherDetection() {
  const geminiAPI = new GeminiAPI();
  
  // Test the Hinglish weather query
  const userInput = "kitnaa hai oo puch raha huu garmi in kolkata";
  
  console.log('Testing Hinglish weather query detection:');
  console.log('Input:', userInput);
  
  const toolDetectionResult = geminiAPI.intelligentToolDetection(userInput);
  
  console.log('Tool Detection Result:');
  console.log(JSON.stringify(toolDetectionResult, null, 2));
  
  if (toolDetectionResult.needsTools && toolDetectionResult.primaryTool.tool === 'weather') {
    console.log('✅ SUCCESS: Weather tool correctly detected for Hinglish query');
  } else {
    console.log('❌ FAILURE: Weather tool not detected for Hinglish query');
  }
  
  // Test a few more variations
  const testCases = [
    "kolkata mein aaj ki garmi kya hai",
    "bangalore weather kaisa hai",
    "delhi mein tapman kya hai"
  ];
  
  console.log('\nTesting additional Hinglish variations:');
  for (const testCase of testCases) {
    console.log(`\nInput: ${testCase}`);
    const result = geminiAPI.intelligentToolDetection(testCase);
    console.log(`Detected tools: ${result.tools.map(t => t.tool).join(', ')}`);
    if (result.needsTools && result.tools.some(t => t.tool === 'weather')) {
      console.log('✅ Weather tool detected');
    } else {
      console.log('❌ Weather tool not detected');
    }
  }
}

testHinglishWeatherDetection().catch(console.error);