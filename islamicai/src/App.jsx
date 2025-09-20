import { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { sendMessage, createNewSession, getRecentChats } from './utils/api';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your advanced Islamic Scholar AI assistant. I can help you with:\n\n• Qur'an translations and interpretations 📖\n• Authentic Hadith explanations 🕌\n• Fiqh (Islamic jurisprudence) guidance ⚖️\n• Seerah (Prophet's biography) insights 🌟\n• Dua (supplications) and spiritual guidance 🤲\n\nAsk me anything about Islam, and I'll provide scholarly, accurate responses. May Allah guide our conversation! 🤲",
      timestamp: new Date()
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Debug sidebar state
  useEffect(() => {
    console.log('Sidebar state changed:', isSidebarOpen);
  }, [isSidebarOpen]);

  // Make messages available globally for language detection
  useEffect(() => {
    window.recentMessages = messages;
  }, [messages]);
  const [recentChats, setRecentChats] = useState([]);
  const [sessionId, setSessionId] = useState(() => createNewSession());
  const [isLoading, setIsLoading] = useState(false);

  // Load recent chats on component mount
  useEffect(() => {
    setRecentChats(getRecentChats());
  }, []);

  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked, current state:', isSidebarOpen);
    const newState = !isSidebarOpen;
    console.log('Setting sidebar to:', newState);
    setIsSidebarOpen(newState);
    
    // Force a re-render to ensure state updates
    setTimeout(() => {
      console.log('Sidebar state after update:', isSidebarOpen);
    }, 100);
  };

  const startNewChat = () => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your advanced Islamic Scholar AI assistant. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };

  const addMessage = async (content, sender = 'user') => {
    // Validate input
    if (!content || typeof content !== 'string') {
      console.error('Invalid message content:', content);
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender,
      content: content.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If it's a user message, get response from backend
    if (sender === 'user') {
      setIsLoading(true);
      
      try {
        console.log('Sending message to backend:', { sessionId, content: content.trim() });
        const response = await sendMessage(sessionId, content.trim());
        console.log('Received response from backend:', response);
        
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: response.reply || "I'm processing your request...",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: "Sorry, I encountered an error connecting to the backend. Please make sure the IslamicAI backend is running and try again.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Enhanced Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        recentChats={recentChats}
        startNewChat={startNewChat}
      />

      {/* Main Chat Area with Enhanced Responsive Design */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header - Only visible on mobile */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-50 sticky top-0 mobile-header-sticky">
          {/* Debug Info - Only show on mobile */}
          <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-xs p-1 text-center z-10">
            Mobile: Sidebar {isSidebarOpen ? 'OPEN' : 'CLOSED'} | Loading: {isLoading ? 'YES' : 'NO'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked!');
                toggleSidebar();
              }}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all touch-button bg-blue-50 border border-blue-200"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Toggle sidebar"
              type="button"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <i className="fas fa-mosque text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">IslamicAI</h1>
                <p className="text-xs text-gray-500">Scholar Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-red-200"
              title="Test Sidebar Toggle"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <button
              onClick={startNewChat}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
              title="New Chat"
            >
              <i className="fas fa-plus text-lg"></i>
            </button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
        </div>
        
        <ChatInterface 
          messages={messages} 
          onSendMessage={addMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;