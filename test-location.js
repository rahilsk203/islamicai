// Simple test script to verify location detection
async function testLocationDetection() {
    try {
        // Test with a known public IP address (Google's DNS server)
        const testIP = '8.8.8.8';
        
        console.log('Testing location detection with IP:', testIP);
        
        // Import the location service
        const { LocationPrayerService } = await import('./src/location-prayer-service.js');
        const locationService = new LocationPrayerService();
        
        // Test location detection
        const location = await locationService.getUserLocation(testIP);
        
        console.log('Location detection result:');
        console.log('- City:', location.city);
        console.log('- Region:', location.region);
        console.log('- Country:', location.country);
        console.log('- Timezone:', location.timezone);
        console.log('- Coordinates:', location.lat, ',', location.lng);
        console.log('- Source:', location.source);
        
        // Test with unknown IP
        console.log('\nTesting with unknown IP:');
        const unknownLocation = await locationService.getUserLocation('unknown');
        console.log('Default location result:');
        console.log('- City:', unknownLocation.city);
        console.log('- Region:', unknownLocation.region);
        console.log('- Country:', unknownLocation.country);
        console.log('- Source:', unknownLocation.source);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testLocationDetection();