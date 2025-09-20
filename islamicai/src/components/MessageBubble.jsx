import { useState, useEffect, useRef } from 'react';

const MessageBubble = ({ message, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState(message.isStreaming ? '' : message.content);
  const [showCursor, setShowCursor] = useState(message.isStreaming);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isStreaming) {
      // If this is a streaming message with no content yet, show typing indicator
      if (message.content === "" || !message.content) {
        setDisplayedContent("IslamicAI is thinking...");
        setShowCursor(true);
        return;
      }
      
      // If this is a streaming message with content, type it out
      setDisplayedContent('');
      setShowCursor(true);
      
      let i = 0;
      const content = message.content;
      
      const typeWriter = () => {
        if (i < content.length) {
          setDisplayedContent(prev => prev + content.charAt(i));
          i++;
          setTimeout(typeWriter, Math.random() * 30 + 10);
        } else {
          setShowCursor(false);
        }
      };
      
      typeWriter();
    } else {
      setDisplayedContent(message.content || '');
      setShowCursor(false);
    }
  }, [message.content, isStreaming]);

  const formatContent = (content) => {
    return content
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  const isWelcomeMessage = message.sender === 'ai' && 
    (message.content.includes('Assalamu Alaikum') || 
     message.content.includes('IslamicAI, your advanced Islamic Scholar AI assistant'));

  if (isWelcomeMessage) {
    return (
      <div className="flex justify-center animate-fade-in-up">
        <div className="max-w-3xl w-full">
          {/* Modern Welcome Card */}
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
            {/* Gradient Header */}
            <div className="relative p-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              <div className="bg-white rounded-t-3xl p-8">
                {/* Header Section */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                      <i className="fas fa-robot text-white text-2xl"></i>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white animate-pulse flex items-center justify-center">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 text-heading">Assalamu Alaikum! 👋</h3>
                    <p className="text-sm text-gray-500">Your Advanced Islamic Scholar AI Assistant</p>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="space-y-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    I'm IslamicAI, your advanced Islamic Scholar AI assistant. I can help you with:
                  </p>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: "fas fa-book-quran", title: "Qur'an Translations", desc: "Authentic interpretations", color: "from-emerald-500 to-teal-600" },
                      { icon: "fas fa-mosque", title: "Hadith Explanations", desc: "Prophetic traditions", color: "from-blue-500 to-indigo-600" },
                      { icon: "fas fa-balance-scale", title: "Fiqh Guidance", desc: "Islamic jurisprudence", color: "from-purple-500 to-violet-600" },
                      { icon: "fas fa-star", title: "Seerah Insights", desc: "Prophet's biography", color: "from-amber-500 to-orange-600" },
                      { icon: "fas fa-hands-praying", title: "Dua & Guidance", desc: "Spiritual supplications", color: "from-rose-500 to-pink-600" },
                      { icon: "fas fa-heart", title: "Aqeedah", desc: "Islamic beliefs", color: "from-cyan-500 to-blue-600" }
                    ].map((feature, index) => (
                      <div key={index} className="group p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <i className={`${feature.icon} text-white text-sm`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <p className="text-gray-700 text-center">
                      <i className="fas fa-quote-left text-blue-500 mr-2"></i>
                      Ask me anything about Islam, and I'll provide scholarly, accurate responses. 
                      <br className="hidden sm:block" />
                      <span className="font-semibold text-blue-700">May Allah guide our conversation!</span>
                      <i className="fas fa-quote-right text-blue-500 ml-2"></i>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-2xl w-full`}>
        {/* Avatar */}
        <div className={`mx-2 flex-shrink-0 ${message.sender === 'user' ? 'ml-2 mr-0' : 'mr-2 ml-0'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.sender === 'user' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <i className={`text-white text-xs ${message.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'}`}></i>
          </div>
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-gray-500">
              {message.sender === 'user' ? 'You' : 'IslamicAI'}
            </span>
            <span className="text-xs text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="relative">
            <div 
              className={`rounded-2xl px-4 py-3 max-w-full break-words ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
              }`}
            >
              <div ref={contentRef} className={`whitespace-pre-wrap leading-relaxed text-sm ${
                message.sender === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {isStreaming && (!message.content || message.content === "") ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">IslamicAI is thinking...</span>
                  </div>
                ) : (
                  <>
                    {displayedContent ? formatContent(displayedContent) : formatContent(message.content || '')}
                    {showCursor && <span className="ml-1 animate-pulse text-blue-500">|</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;