import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    // Validate input
    if (!inputValue || typeof inputValue !== 'string' || isLoading) {
      console.log('Send button disabled - invalid input or loading');
      return;
    }

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      console.log('Send button disabled - empty message');
      return;
    }

    console.log('Sending message:', trimmedValue);
    
    // Clear input and reset textarea height
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message
    onSendMessage(trimmedValue, 'user');
  };

  const handleQuickPrompt = (prompt) => {
    if (typeof prompt === 'string' && prompt.trim()) {
      setInputValue(prompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const welcomeActions = [
    { 
      id: 1, 
      text: "Five Pillars", 
      icon: "fas fa-star", 
      prompt: "Tell me about the five pillars of Islam",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    { 
      id: 2, 
      text: "Kindness to Parents", 
      icon: "fas fa-heart", 
      prompt: "What does Islam say about kindness to parents?",
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200"
    },
    { 
      id: 3, 
      text: "Concept of Tawheed", 
      icon: "fas fa-lightbulb", 
      prompt: "Explain the concept of Tawheed in Islam",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    { 
      id: 4, 
      text: "Performing Salah", 
      icon: "fas fa-pray", 
      prompt: "How to perform Salah (prayer) correctly?",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
              <MessageBubble 
                message={message} 
                isStreaming={message.sender === 'ai' && isLoading && messages[messages.length - 1].id === message.id}
              />
            </div>
          ))}
          
          {/* Welcome Actions */}
          {messages.length === 1 && messages[0].sender === 'ai' && (
            <div className="mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Quick Start Topics</h3>
                <p className="text-sm text-gray-500">Choose a topic to begin your Islamic journey</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {welcomeActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickPrompt(action.prompt)}
                    className={`group relative p-3 ${action.bgColor} border ${action.borderColor} rounded-xl hover:shadow-md transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <i className={`${action.icon} text-white text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">
                          {action.text}
                        </h4>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          {/* Input Tools */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <i className="fas fa-paperclip text-sm"></i>
              </button>
              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                <i className="fas fa-microphone text-sm"></i>
              </button>
              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                <i className="fas fa-image text-sm"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded font-mono">Enter</kbd>
              <span>to send</span>
            </div>
          </div>
          
          {/* Input Container */}
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Qur'an, Hadith, Fiqh, Seerah, or any Islamic topic..."
                className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all bg-white text-gray-800 placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg"
                rows="1"
                disabled={isLoading}
              />
              
              {/* Character count and status */}
              <div className="absolute right-4 bottom-3 flex items-center space-x-2">
                {inputValue.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {inputValue.length}/2000
                  </span>
                )}
                {isLoading && (
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSend}
              disabled={!inputValue?.trim() || isLoading}
              className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                inputValue?.trim() && !isLoading
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              ) : (
                <i className="fas fa-paper-plane text-sm"></i>
              )}
            </button>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <i className="fas fa-shield-alt"></i>
                <span>Secure & Private</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-brain"></i>
                <span>AI-Powered</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-star text-yellow-400"></i>
              <span>IslamicAI v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;