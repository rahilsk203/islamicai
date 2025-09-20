// Simple test function to verify backend connection
export const testConnection = async () => {
  try {
    console.log('Testing connection to IslamicAI backend...');
    
    // Generate a test session ID
    const sessionId = 'test_session_' + Date.now();
    const testMessage = 'What are the five pillars of Islam?';
    
    console.log(`Session ID: ${sessionId}`);
    console.log(`Test message: ${testMessage}`);
    
    // Try to connect to the backend
    const response = await fetch(`http://127.0.0.1:8787?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log('Response:', data.reply?.substring(0, 100) + '...');
      return true;
    } else {
      console.log('❌ Connection failed with status:', response.status);
      console.log('Response:', await response.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('Make sure the backend is running on http://127.0.0.1:8787');
    return false;
  }
};