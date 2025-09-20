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
      {/* Messages Container - ChatGPT Style */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-fade-in-up">
              <MessageBubble 
                message={message} 
                isStreaming={message.sender === 'ai' && isLoading && messages[messages.length - 1].id === message.id}
              />
            </div>
          ))}
          
          {/* Enhanced Loading State */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="max-w-2xl w-full">
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-mosque text-emerald-500 animate-pulse"></i>
                      <span className="text-sm font-medium text-gray-600">IslamicAI is researching...</span>
                      <div className="flex space-x-1">
                        <i className="fas fa-book-quran text-emerald-400 text-xs animate-pulse"></i>
                        <i className="fas fa-star text-amber-400 text-xs animate-pulse" style={{animationDelay: '0.3s'}}></i>
                        <i className="fas fa-hands-praying text-blue-400 text-xs animate-pulse" style={{animationDelay: '0.6s'}}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Welcome Actions */}
          {messages.length === 1 && messages[0].sender === 'ai' && (
            <div className="mt-4 sm:mt-6">
              <div className="text-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Quick Start Topics</h3>
                <p className="text-xs sm:text-sm text-gray-500">Choose a topic to begin your Islamic journey</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {welcomeActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickPrompt(action.prompt)}
                    className={`group relative p-3 ${action.bgColor} border ${action.borderColor} rounded-xl hover:shadow-md transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <i className={`${action.icon} text-white text-xs sm:text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-xs sm:text-sm text-gray-800">
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

      {/* ChatGPT-Style Input Area - Fixed at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Input Tools - Simplified */}
          <div className="flex items-center justify-between mb-3 input-tools">
            <div className="flex items-center space-x-2">
              {/* Input tools removed - keeping only essential functionality */}
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500 keyboard-hint">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <i className="fas fa-keyboard text-gray-400"></i>
                <span>Press</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs shadow-sm">Enter</kbd>
                <span>to send</span>
              </div>
              <div className="md:hidden flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                <i className="fas fa-keyboard text-gray-400 text-xs"></i>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded font-mono text-xs">Enter</kbd>
              </div>
            </div>
          </div>
          
          {/* ChatGPT-Style Input Container */}
          <div className="relative">
            <div className="flex items-end space-x-3 input-container">
              {/* Input Field - ChatGPT Style */}
              <div className="flex-1 relative group">
                {/* Main Input Container */}
                <div className="relative bg-white rounded-2xl border border-gray-300 group-focus-within:border-gray-400 transition-all duration-300 shadow-sm group-focus-within:shadow-md">
                  <div className="relative flex items-center">
                    {/* Textarea - ChatGPT Style with Responsive Placeholder */}
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={getResponsivePlaceholder(uiText.placeholder)}
                      className="w-full px-4 py-3 pr-12 border-0 rounded-2xl focus:ring-0 focus:outline-none resize-none transition-all duration-300 bg-transparent text-gray-800 placeholder-gray-500 text-sm leading-relaxed min-h-[44px] max-h-[200px] overflow-hidden"
                      rows="1"
                      disabled={isLoading}
                      maxLength={2000}
                      style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    />
                    
                    {/* Language Indicator */}
                    {currentLanguage !== 'english' && (
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                        <i className="fas fa-globe text-xs"></i>
                        <span className="capitalize text-xs">{currentLanguage}</span>
                      </div>
                    )}
                    
                    {/* Right Side Elements */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      {/* Character Counter */}
                      {inputValue.length > 0 && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            inputValue.length > 1800 ? 'bg-red-500' : 
                            inputValue.length > 1500 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}></div>
                          <span className={`text-xs font-semibold ${
                            inputValue.length > 1800 ? 'text-red-600' : 
                            inputValue.length > 1500 ? 'text-yellow-600' : 'text-emerald-600'
                          }`}>
                            {inputValue.length}/2000
                          </span>
                        </div>
                      )}
                      
                      {/* Loading Indicator */}
                      {isLoading && (
                        <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ChatGPT-Style Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue?.trim() || isLoading}
                className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  inputValue?.trim() && !isLoading
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={isLoading ? "Sending..." : "Send Message"}
              >
                <div className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  ) : (
                    <i className="fas fa-paper-plane text-sm group-hover:scale-110 transition-transform duration-200"></i>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {/* ChatGPT-Style Footer */}
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <i className="fas fa-shield-alt text-emerald-500"></i>
                <span>Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-brain text-blue-500"></i>
                <span>AI-Powered</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-book-quran text-purple-500"></i>
                <span>Islamic Scholar</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-star text-amber-400"></i>
                <span>v2.0</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;