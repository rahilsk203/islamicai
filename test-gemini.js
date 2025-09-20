// Simple test script to verify Gemini API
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key

async function testGeminiAPI() {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, can you respond with 'API is working'?"
              }
            ]
          }
        ]
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
    } else {
      const data = await response.json();
      console.log('Success Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Test Error:', error);
  }
}

testGeminiAPI();
