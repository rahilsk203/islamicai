import { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { sendMessage, sendMessageStreaming } from './utils/api';
import { useChatMemory, useAutoSave, useSessionManager } from './hooks/useChatMemory';

function App() {
  // Use custom hooks for better memory management
  const { recentChats, saveChat, loadChat, refreshChats } = useChatMemory();
  const { currentSessionId, sessionTitle, setSessionTitle, createNewSession, switchToSession } = useSessionManager();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your Islamic Scholar AI assistant. How can I help you today?",
      timestamp: new Date(),
      isStreaming: false
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);

  // Auto-save functionality
  useAutoSave(currentSessionId, messages, async (sessionId, msgs) => {
    // Only save if there's actual conversation (user + AI messages)
    const userMessages = msgs.filter(msg => msg.sender === 'user');
    const aiMessages = msgs.filter(msg => msg.sender === 'ai');
    
    if (userMessages.length > 0 && aiMessages.length > 1) {
      const savedSession = await saveChat(sessionId, msgs);
      if (savedSession) {
        setSessionTitle(savedSession.title);
      }
    }
  });

  // Debug sidebar state
  useEffect(() => {
    console.log('Sidebar state changed:', isSidebarOpen);
  }, [isSidebarOpen]);

  // Make messages available globally for language detection
  useEffect(() => {
    window.recentMessages = messages;
  }, [messages]);

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
    
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your Islamic Scholar AI assistant. How can I help you today?",
        timestamp: new Date(),
        isStreaming: false
      }
    ]);
    
    // Close sidebar on mobile after starting new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadChatSession = (chatSessionId) => {
    const session = loadChat(chatSessionId);
    if (session) {
      switchToSession(session.id, session.title);
      // Ensure all loaded messages have isStreaming: false
      const updatedMessages = session.messages.map(msg => ({
        ...msg,
        isStreaming: false
      }));
      setMessages(updatedMessages);
      
      // Close sidebar on mobile after loading chat
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const updateStreamingMessage = (messageId, content, isComplete = false) => {
    setMessages(prev => {
      // Find and update only the specific message, prevent duplicates
      const messageExists = prev.find(msg => msg.id === messageId);
      if (!messageExists) {
        console.warn('Message not found for update:', messageId);
        return prev;
      }
      
      return prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: content,
            isStreaming: !isComplete
          };
        }
        return msg;
      });
    });
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
      timestamp: new Date(),
      isStreaming: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If it's a user message, get response from backend with streaming
    if (sender === 'user') {
      setIsLoading(true);
      
      // Create placeholder AI message for streaming
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        sender: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };
      
      // Add AI message placeholder - check for duplicates
      setMessages(prev => {
        // Prevent duplicate AI messages - check if last message is empty AI message
        const lastMessage = prev[prev.length - 1];
        const hasRecentEmptyAiMessage = lastMessage && 
          lastMessage.sender === 'ai' && 
          (!lastMessage.content || lastMessage.content === '') &&
          lastMessage.isStreaming;
        
        if (hasRecentEmptyAiMessage) {
          console.warn('Preventing duplicate AI message, using existing:', lastMessage.id);
          return prev;
        }
        
        return [...prev, aiMessage];
      });
      
      // Set streaming message ID after state update
      setTimeout(() => {
        setMessages(current => {
          const lastMessage = current[current.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
            setStreamingMessageId(lastMessage.id);
          }
          return current;
        });
      }, 0);
      
      try {
        console.log('Sending message with streaming to backend:', { sessionId: currentSessionId, content: content.trim() });
        
        const response = await sendMessageStreaming(currentSessionId, content.trim(), {
          onStreamStart: () => {
            console.log('🏁 Streaming started');
          },
          onStreamChunk: (chunk, fullContent, chunkData) => {
            // Update the streaming message with new content
            updateStreamingMessage(aiMessageId, fullContent, false);
          },
          onStreamEnd: (fullContent) => {
            console.log('✅ Streaming completed');
            updateStreamingMessage(aiMessageId, fullContent, true);
            setStreamingMessageId(null);
            setIsLoading(false);
          },
          onStreamError: (error) => {
            console.error('❌ Streaming error:', error);
            updateStreamingMessage(aiMessageId, `Sorry, I encountered an error during streaming: ${error}`, true);
            setStreamingMessageId(null);
            setIsLoading(false);
          }
        });
        
        // Don't process the return value since everything is handled via callbacks
        console.log('Streaming response completed via callbacks');
        
      } catch (error) {
        console.error('Error with streaming message:', error);
        updateStreamingMessage(aiMessageId, "Sorry, I encountered an error connecting to the backend. Please make sure the IslamicAI backend is running and try again.", true);
        setStreamingMessageId(null);
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
        loadChatSession={loadChatSession}
        currentSessionId={currentSessionId}
      />

      {/* Main Chat Area with Enhanced Responsive Design */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header - Enhanced for Better UX */}
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between relative z-50 sticky top-0 mobile-header-sticky shadow-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
              }}
              className="p-2.5 sm:p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-all touch-button bg-blue-50/80 border border-blue-200/50 backdrop-blur-sm active:scale-95"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Toggle sidebar"
              type="button"
            >
              <i className="fas fa-bars text-base sm:text-lg"></i>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                <i className="fas fa-mosque text-white text-xs sm:text-sm"></i>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">IslamicAI</h1>
                <p className="text-xs text-gray-500 hidden sm:block leading-tight">Scholar Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={startNewChat}
              className="p-2 sm:p-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl transition-all touch-button active:scale-95"
              style={{ minWidth: '44px', minHeight: '44px' }}
              title="New Chat"
            >
              <i className="fas fa-plus text-base sm:text-lg"></i>
            </button>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
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