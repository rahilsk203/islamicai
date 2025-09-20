import { useState, useEffect } from 'react';

const SaveStatusIndicator = ({ isSaving, lastSaved }) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  if (isSaving) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Saving...</span>
      </div>
    );
  }

  if (showSaved) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in-up">
        <i className="fas fa-check-circle"></i>
        <span className="text-sm">Chat saved</span>
      </div>
    );
  }

  return null;
};

export default SaveStatusIndicator;