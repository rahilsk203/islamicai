import { useState } from 'react';
import { testConnection } from '../utils/test-connection';

const ConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testConnection();
      setTestResult({
        success: result,
        message: result ? 'Connection successful!' : 'Connection failed!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Backend Connection Test</h3>
      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className={`px-4 py-2 rounded-lg font-medium ${
          isTesting 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>
      
      {testResult && (
        <div className={`mt-3 p-3 rounded-lg ${
          testResult.success 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <p className="font-medium">{testResult.message}</p>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;