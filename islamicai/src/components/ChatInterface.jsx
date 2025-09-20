import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { detectLanguage, getLanguageUIText } from '../utils/languageDetection.js';

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('english');
  const [uiText, setUiText] = useState(getLanguageUIText('english'));
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
    
    // Auto-detect language and update UI
    if (value.trim().length > 0) {
      const languageDetection = detectLanguage(value);
      if (languageDetection.confidence > 60) {
        setDetectedLanguage(languageDetection.language);
        setUiText(getLanguageUIText(languageDetection.language));
        console.log('Language detected:', languageDetection.language, 'Confidence:', languageDetection.confidence);
      }
    }
    
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
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_60%,rgba(147,51,234,0.1)_0%,transparent_50%)]"></div>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 relative z-10">
        <div className="max-w-3xl mx-auto">
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
            <div className="mt-4 sm:mt-6 px-2 sm:px-0">
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

      {/* Enhanced Islamic-Themed Input Area */}
      <div className="relative bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200 p-2 sm:p-4 shadow-lg chat-input-mobile islamic-pattern-overlay">
        {/* Decorative Islamic Pattern */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60"></div>
        
        <div className="max-w-4xl mx-auto">
          {/* Input Tools with Islamic Theme */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 input-tools">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                className="group p-2 sm:p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-300 hover:scale-110"
                title="Attach File"
              >
                <i className="fas fa-paperclip text-xs sm:text-sm group-hover:rotate-12 transition-transform"></i>
              </button>
              <button 
                className="group p-2 sm:p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
                title="Voice Input"
              >
                <i className="fas fa-microphone text-xs sm:text-sm group-hover:scale-110 transition-transform"></i>
              </button>
              <button 
                className="group p-2 sm:p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 hover:scale-110"
                title="Image Upload"
              >
                <i className="fas fa-image text-xs sm:text-sm group-hover:scale-110 transition-transform"></i>
              </button>
              <button 
                className="group p-2 sm:p-3 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300 hover:scale-110"
                title="Islamic Calendar"
              >
                <i className="fas fa-calendar-alt text-xs sm:text-sm group-hover:scale-110 transition-transform"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500 keyboard-hint">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <i className="fas fa-keyboard text-gray-400"></i>
                <span>Press</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs shadow-sm">Enter</kbd>
                <span>to send</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Input Container */}
          <div className="relative">
            <div className="flex items-end space-x-2 sm:space-x-4 input-container">
              {/* Input Field with Islamic Design */}
              <div className="flex-1 relative group">
                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-500"></div>
                
                {/* Main Input Container */}
                <div className="relative bg-white rounded-3xl border-2 border-gray-200 group-focus-within:border-emerald-400 transition-all duration-300 shadow-lg group-focus-within:shadow-2xl">
                  <div className="relative flex items-center">
                    {/* Islamic Icon */}
                    <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 opacity-40 group-focus-within:opacity-70 transition-all duration-300">
                      <i className="fas fa-mosque text-sm sm:text-lg"></i>
                    </div>
                    
                    {/* Textarea */}
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={uiText.placeholder}
                      className="w-full px-10 sm:px-12 py-3 sm:py-4 pr-20 sm:pr-24 border-0 rounded-3xl focus:ring-0 focus:outline-none resize-none transition-all duration-300 bg-transparent text-gray-800 placeholder-gray-400 text-sm sm:text-base leading-relaxed min-h-[48px] sm:min-h-[56px] max-h-[200px]"
                      rows="1"
                      disabled={isLoading}
                      maxLength={2000}
                      style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    />
                    
               {/* Language Indicator */}
               {detectedLanguage !== 'english' && (
                 <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                   <i className="fas fa-globe text-xs"></i>
                   <span className="capitalize">{detectedLanguage}</span>
                 </div>
               )}
               
               {/* Right Side Elements */}
               <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
                      {/* Character Counter */}
                      {inputValue.length > 0 && (
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
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
                        <div className="flex items-center space-x-1 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom Border Animation */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-b-3xl transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
              
              {/* Enhanced Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue?.trim() || isLoading}
                className={`group relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 send-button-enhanced ${
                  inputValue?.trim() && !isLoading
                    ? 'bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={isLoading ? "Sending..." : "Send Message"}
              >
                {/* Button Glow Effect */}
                {inputValue?.trim() && !isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-purple-500 rounded-2xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                )}
                
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
                </div>
                
                <div className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  ) : (
                    <i className="fas fa-paper-plane text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200"></i>
                  )}
                </div>
              </button>
            </div>
          </div>
          
          {/* Enhanced Footer with Islamic Elements */}
          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100 footer-info">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <span className="hidden sm:flex items-center space-x-2 text-xs text-gray-500 hover:text-emerald-600 transition-colors">
                <i className="fas fa-shield-alt text-emerald-500"></i>
                <span>Secure & Private</span>
              </span>
              <span className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                <i className="fas fa-brain text-blue-500"></i>
                <span className="hidden sm:inline">AI-Powered</span>
                <span className="sm:hidden">AI</span>
              </span>
              <span className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                <i className="fas fa-book-quran text-purple-500"></i>
                <span className="hidden sm:inline">Islamic Scholar</span>
                <span className="sm:hidden">Scholar</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
              <i className="fas fa-star text-amber-400"></i>
              <span className="font-medium hidden sm:inline">IslamicAI v2.0</span>
              <span className="font-medium sm:hidden">v2.0</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
              <span className="hidden sm:inline">Bismillah</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;