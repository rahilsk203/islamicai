import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { getLanguageUIText } from '../utils/api.js';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [uiText, setUiText] = useState(getLanguageUIText('english'));
  const [screenSize, setScreenSize] = useState('desktop');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Function to get responsive placeholder based on screen size
  const getResponsivePlaceholder = (originalPlaceholder) => {
    if (screenSize === 'mobile') {
      // Short placeholder for mobile
      if (currentLanguage === 'hindi') {
        return 'कुरान, हदीस या इस्लामी विषय पूछें...';
      } else if (currentLanguage === 'urdu') {
        return 'قرآن، حدیث یا اسلامی موضوع پوچھیں...';
      } else if (currentLanguage === 'arabic') {
        return 'اسأل عن القرآن والحديث...';
      } else if (currentLanguage === 'hinglish') {
        return 'Qur\'an, Hadith ya Islamic topic pucho...';
      } else {
        return 'Ask about Islamic topics...';
      }
    } else if (screenSize === 'tablet') {
      // Medium placeholder for tablet
      if (currentLanguage === 'hindi') {
        return 'कुरान, हदीस, फ़िक़्ह या सीरा के बारे में पूछें...';
      } else if (currentLanguage === 'urdu') {
        return 'قرآن، حدیث، فقہ یا سیرت کے بارے میں پوچھیں...';
      } else if (currentLanguage === 'arabic') {
        return 'اسأل عن القرآن والحديث والفقه والسيرة...';
      } else if (currentLanguage === 'hinglish') {
        return 'Qur\'an, Hadith, Fiqh ya Seerah ke baare mein pucho...';
      } else {
        return 'Ask about Qur\'an, Hadith, Fiqh, or Seerah...';
      }
    } else {
      // Full placeholder for desktop
      return originalPlaceholder;
    }
  };

  // Update screen size on resize
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Simple language detection from last user message
  const detectLanguageFromMessage = (message) => {
    if (!message) return 'english';
    
    const text = message.toLowerCase();
    
    // Check for Hinglish patterns
    if (text.includes('tuu') || text.includes('kasa') || text.includes('kon') || 
        text.includes('kaya') || text.includes('saktaa') || text.includes('hoon') ||
        text.includes('hai') || text.includes('hain') || text.includes('hun')) {
      return 'hinglish';
    }
    
    // Check for Hindi (Devanagari script)
    if (/[\u0900-\u097F]/.test(message)) {
      return 'hindi';
    }
    
    // Check for Urdu/Arabic script
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(message)) {
      return 'urdu';
    }
    
    return 'english';
  };

  // Update language when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
      if (lastUserMessage) {
        const detectedLang = detectLanguageFromMessage(lastUserMessage.text);
        if (detectedLang !== currentLanguage) {
          setCurrentLanguage(detectedLang);
          setUiText(getLanguageUIText(detectedLang));
        }
      }
    }
  }, [messages, currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-resize textarea - but keep it single line for placeholder
    if (textareaRef.current) {
      if (value.trim().length === 0) {
        // When empty, keep single line height
        textareaRef.current.style.height = '44px';
        textareaRef.current.style.whiteSpace = 'nowrap';
        textareaRef.current.style.overflow = 'hidden';
      } else {
        // When user types, allow multi-line
        textareaRef.current.style.whiteSpace = 'normal';
        textareaRef.current.style.overflow = 'hidden';
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
      }
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
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.whiteSpace = 'nowrap';
      textareaRef.current.style.overflow = 'hidden';
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
    <div className="flex flex-col h-full bg-white relative">
      {/* Messages Container - Enhanced Mobile Support */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-fade-in-up">
              <MessageBubble 
                message={message} 
                isStreaming={message.isStreaming || (message.sender === 'ai' && isLoading && messages[messages.length - 1].id === message.id)}
              />
            </div>
          ))}
          
          {/* Loading handled by MessageBubble component when streaming */}
          
          {/* Welcome Actions - Enhanced Mobile Layout */}
          {messages.length === 1 && messages[0].sender === 'ai' && (
            <div className="mt-4 sm:mt-6">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Quick Start Topics</h3>
                <p className="text-xs sm:text-sm text-gray-500">Choose a topic to begin your Islamic journey</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {welcomeActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickPrompt(action.prompt)}
                    className={`group relative p-3 sm:p-4 ${action.bgColor} border ${action.borderColor} rounded-xl hover:shadow-md transition-all duration-200 text-left touch-manipulation active:scale-95 transform hover:-translate-y-1`}
                    style={{ minHeight: '60px', animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                        <i className={`${action.icon} text-white text-xs sm:text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-gray-800 truncate group-hover:text-gray-900 transition-colors">
                          {action.text}
                        </h4>
                        <p className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                          Tap to explore
                        </p>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Mobile-First Input Area - Fixed at Bottom */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* Mobile-Optimized Input Tools */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="text-xs text-gray-500 hidden sm:block">
              Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 border border-gray-300 rounded font-mono text-xs">Enter</kbd> to send
            </div>
            {/* Mobile typing indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="hidden sm:inline">AI is thinking...</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Input Container */}
          <div className="relative">
            <div className="flex items-end space-x-2 sm:space-x-3 input-container">
              {/* Input Field - Mobile Optimized */}
              <div className="flex-1 relative group">
                {/* Main Input Container */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-300/80 group-focus-within:border-blue-400 transition-all duration-300 shadow-sm group-focus-within:shadow-md hover:shadow-md">
                  <div className="relative flex items-center">
                    {/* Enhanced Mobile Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={getResponsivePlaceholder(uiText.placeholder)}
                      className="w-full px-3 sm:px-4 py-3 pr-10 sm:pr-12 border-0 rounded-2xl focus:ring-0 focus:outline-none resize-none transition-all duration-300 bg-transparent text-gray-800 placeholder-gray-500 text-sm sm:text-base leading-relaxed min-h-[44px] max-h-[120px] sm:max-h-[200px] overflow-hidden touch-manipulation mobile-input"
                      rows="1"
                      disabled={isLoading}
                      maxLength={2000}
                      autoComplete="off"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      spellCheck="true"
                      style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        fontSize: '16px', // Prevents zoom on iOS
                        WebkitAppearance: 'none',
                        borderRadius: 0
                      }}
                    />
                    
                    {/* Enhanced Language Indicator */}
                    {currentLanguage !== 'english' && (
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-1.5 sm:px-2 py-1 rounded-full text-xs font-medium">
                        <i className="fas fa-globe text-xs"></i>
                        <span className="capitalize text-xs hidden sm:inline">{currentLanguage}</span>
                      </div>
                    )}
                    
                    {/* Enhanced Right Side Elements */}
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                      {/* Character Counter - Mobile Optimized */}
                      {inputValue.length > 0 && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-1.5 sm:px-2 py-1 rounded-full">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            inputValue.length > 1800 ? 'bg-red-500' : 
                            inputValue.length > 1500 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}></div>
                          <span className={`text-xs font-semibold ${
                            inputValue.length > 1800 ? 'text-red-600' : 
                            inputValue.length > 1500 ? 'text-yellow-600' : 'text-emerald-600'
                          }`}>
                            {inputValue.length > 1000 ? `${Math.round(inputValue.length/100)*100}` : inputValue.length}
                            <span className="hidden sm:inline">/2000</span>
                          </span>
                        </div>
                      )}
                      
                      {/* Loading Indicator - Mobile Optimized */}
                      {isLoading && (
                        <div className="flex items-center space-x-1 bg-blue-50 px-1.5 sm:px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Mobile Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue?.trim() || isLoading}
                className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 group ${  
                  inputValue?.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }}
                title={isLoading ? "Sending..." : "Send Message"}
                type="button"
                aria-label={isLoading ? "Sending message" : "Send message"}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fas fa-paper-plane text-sm transform group-hover:translate-x-0.5 transition-transform"></i>
                )}
              </button>
            </div>
          </div>
          
          {/* Simplified Mobile Footer */}
          <div className="flex items-center justify-center mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              IslamicAI v2.0 - <span className="hidden sm:inline">Your Islamic Scholar Assistant</span><span className="sm:hidden">Scholar Assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;