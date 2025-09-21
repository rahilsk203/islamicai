// Simple test to check if API keys are working
// This will help debug the streaming issue

const testAPIKeys = async () => {
  console.log("🔑 Testing API Key Configuration");
  console.log("=" * 40);
  
  // Check environment variables
  console.log("Environment variables:");
  console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Set" : "Not set");
  console.log("GEMINI_API_KEYS:", process.env.GEMINI_API_KEYS ? "Set" : "Not set");
  
  // Test with a simple request
  const testData = {
    message: "Hello",
    session_id: "test_api_" + Date.now(),
    language_info: {
      detected_language: "english",
      confidence: 0.9,
      should_respond_in_language: true
    }
  };
  
  try {
    console.log("\n📡 Testing regular chat endpoint...");
    const response = await fetch('http://127.0.0.1:8787/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log("📊 Response status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
      return;
    }
    
    const data = await response.json();
    console.log("✅ Chat response received!");
    console.log("📊 Response data:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testAPIKeys();
