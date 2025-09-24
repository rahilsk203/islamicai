// Simple test script to verify API with manual IP
async function testAPIWithManualIP() {
    try {
        const response = await fetch('http://localhost:8787/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'what time is it',
                session_id: 'test-session-123',
                manual_ip: '8.8.8.8',
                streaming_options: {
                    enableStreaming: false
                }
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        const text = await response.text();
        console.log('Response text:', text);
        
        // Try to parse as JSON
        try {
            const data = JSON.parse(text);
            console.log('API Response:');
            console.log('Reply:', data.reply);
            console.log('Location Info:', data.location_info);
        } catch (parseError) {
            console.log('Failed to parse JSON:', parseError.message);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testAPIWithManualIP();