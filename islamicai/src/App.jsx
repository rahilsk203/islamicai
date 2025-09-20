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
  const [recentChats, setRecentChats] = useState([]);
  const [sessionId, setSessionId] = useState(() => createNewSession());
  const [isLoading, setIsLoading] = useState(false);

  // Load recent chats on component mount
  useEffect(() => {
    setRecentChats(getRecentChats());
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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