import { useState } from 'react';
import ConnectionTest from './ConnectionTest';

const TestPage = () => {
  const [showTest, setShowTest] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">IslamicAI Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Testing</h2>
          <p className="text-gray-600 mb-4">
            Use this page to test the connection between the frontend and backend.
          </p>
          
          <button
            onClick={() => setShowTest(!showTest)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
          >
            {showTest ? 'Hide Test' : 'Show Connection Test'}
          </button>
          
          {showTest && <ConnectionTest />}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure the backend is running on port 8787</li>
            <li>Check the browser console for JavaScript errors (F12)</li>
            <li>Verify network requests in the Network tab</li>
            <li>Check that CORS is properly configured</li>
            <li>Ensure the API URL is correct in src/utils/api.js</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestPage;