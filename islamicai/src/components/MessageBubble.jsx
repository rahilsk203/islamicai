import { useState, useEffect, useRef } from 'react';
import { formatTimestamp } from '../utils/timestamp';

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
    // Enhanced content formatting with better emoji support and styling
    const formatText = (text) => {
      // Convert markdown-style formatting to HTML
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2 flex items-center"><i class="fas fa-star text-amber-500 mr-2"></i>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3 flex items-center"><i class="fas fa-bookmark text-blue-500 mr-2"></i>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-800 mt-8 mb-4 flex items-center"><i class="fas fa-crown text-purple-500 mr-2"></i>$1</h1>')
        .replace(/^• (.*$)/gim, '<div class="flex items-start space-x-2 my-2"><i class="fas fa-check-circle text-green-500 mt-1 text-sm"></i><span>$1</span></div>')
        .replace(/^- (.*$)/gim, '<div class="flex items-start space-x-2 my-2"><i class="fas fa-minus text-gray-400 mt-1 text-sm"></i><span>$1</span></div>')
        .replace(/^\d+\. (.*$)/gim, '<div class="flex items-start space-x-2 my-2"><i class="fas fa-hashtag text-blue-500 mt-1 text-sm"></i><span>$1</span></div>')
        .replace(/(Assalamu Alaikum|السلام عليكم)/gi, '<span class="text-green-600 font-semibold">$1</span>')
        .replace(/(Allah|الله)/gi, '<span class="text-blue-600 font-semibold">$1</span>')
        .replace(/(Qur'an|Quran|قرآن)/gi, '<span class="text-emerald-600 font-semibold">$1</span>')
        .replace(/(Hadith|حديث)/gi, '<span class="text-purple-600 font-semibold">$1</span>')
        .replace(/(Prophet|نبي|Muhammad|محمد)/gi, '<span class="text-amber-600 font-semibold">$1</span>')
        .replace(/(Insha'Allah|إن شاء الله)/gi, '<span class="text-indigo-600 font-semibold">$1</span>')
        .replace(/(Alhamdulillah|الحمد لله)/gi, '<span class="text-green-600 font-semibold">$1</span>')
        .replace(/(SubhanAllah|سبحان الله)/gi, '<span class="text-cyan-600 font-semibold">$1</span>')
        .replace(/(MashaAllah|ما شاء الله)/gi, '<span class="text-rose-600 font-semibold">$1</span>')
        .replace(/(Ameen|آمين)/gi, '<span class="text-orange-600 font-semibold">$1</span>');
    };

    return content
      .split('\n')
      .map((line, index) => {
        const formattedLine = formatText(line);
        return (
          <div 
            key={index} 
            className="mb-2 last:mb-0"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      });
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
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 px-2 sm:px-0`}>
      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-2xl w-full`}>
        {/* Avatar */}
        <div className={`mx-1 sm:mx-2 flex-shrink-0 ${message.sender === 'user' ? 'ml-1 sm:ml-2 mr-0' : 'mr-1 sm:mr-2 ml-0'}`}>
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
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
            {message.sender === 'ai' ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <i className="fas fa-mosque text-emerald-500 text-xs"></i>
                  <span className="text-xs font-semibold text-emerald-600">IslamicAI</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-star text-amber-400 text-xs"></i>
                  <span className="text-xs text-gray-500">Scholar Assistant</span>
                </div>
              </div>
            ) : (
              <span className="text-xs font-medium text-gray-500">You</span>
            )}
            <span className="text-xs text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <div className="relative">
            {/* Islamic Pattern Overlay for AI messages */}
            {message.sender === 'ai' && (
              <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-br from-emerald-200 via-blue-200 to-purple-200 rounded-2xl"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1)_0%,transparent_50%)] rounded-2xl"></div>
              </div>
            )}
            
            <div 
              className={`relative rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-full break-words ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm shadow-lg'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-bl-sm shadow-lg hover:shadow-xl transition-all duration-300'
              }`}
            >
              <div ref={contentRef} className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
                message.sender === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {isStreaming && (!message.content || message.content === "") ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <i className="fas fa-mosque text-emerald-500 animate-pulse"></i>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        IslamicAI is thinking...
                      </span>
                      <div className="flex space-x-1">
                        <i className="fas fa-star text-amber-400 text-xs animate-pulse"></i>
                        <i className="fas fa-book-quran text-emerald-400 text-xs animate-pulse" style={{animationDelay: '0.3s'}}></i>
                        <i className="fas fa-hands-praying text-blue-400 text-xs animate-pulse" style={{animationDelay: '0.6s'}}></i>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {displayedContent ? formatContent(displayedContent) : formatContent(message.content || '')}
                    {showCursor && <span className="ml-1 animate-pulse text-blue-500">|</span>}
                    
                    {/* Islamic Blessing Footer for AI messages */}
                    {message.sender === 'ai' && !isStreaming && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-heart text-rose-400"></i>
                            <span>May Allah guide us</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="fas fa-star text-amber-400"></i>
                            <span>IslamicAI Scholar</span>
                          </div>
                        </div>
                      </div>
                    )}
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