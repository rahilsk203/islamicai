import { useState, useEffect, useRef } from 'react';
import { formatTimestamp } from '../utils/timestamp';

const MessageBubble = ({ message, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isStreaming && message.sender === 'ai') {
      // For streaming AI messages, show content as it comes
      setDisplayedContent(message.content || '');
      setShowCursor(true);
    } else if (message.isStreaming === false && message.sender === 'ai') {
      // For completed AI messages, show full content without cursor
      setDisplayedContent(message.content || '');
      setShowCursor(false);
    } else {
      // For user messages or non-streaming messages, show content directly
      setDisplayedContent(message.content || '');
      setShowCursor(false);
    }
  }, [message.content, isStreaming, message.isStreaming, message.sender]);

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
    (message.content.includes('Assalamu Alaikum') && 
     message.content.includes('IslamicAI, your Islamic Scholar AI assistant'));

  if (isWelcomeMessage) {
    return (
      <div className="flex justify-start mb-3 sm:mb-4 px-1 sm:px-2">
        <div className="flex flex-row max-w-full w-full">
          {/* Avatar - Mobile Optimized */}
          <div className="mx-1 sm:mx-2 flex-shrink-0 mr-2 sm:mr-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
              <i className="text-white text-xs fas fa-robot"></i>
            </div>
          </div>
          
          {/* Simple Welcome Message - Mobile Enhanced */}
          <div className="flex flex-col items-start flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-semibold text-emerald-600">IslamicAI</span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            
            <div className="relative w-full">
              <div className="relative rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-full break-words bg-white border border-gray-200 rounded-bl-sm shadow-sm">
                <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-gray-800">
                  {formatContent(message.content)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-1 sm:px-2`}>
      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[90%] sm:max-w-[85%] lg:max-w-2xl w-full`}>
        {/* Avatar - Mobile Optimized */}
        <div className={`mx-1 sm:mx-2 flex-shrink-0 ${message.sender === 'user' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}>
          <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
            message.sender === 'user' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <i className={`text-white text-xs ${message.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'}`}></i>
          </div>
        </div>
        
        {/* Message Content - Enhanced Mobile Layout */}
        <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className="flex items-center space-x-2 mb-1">
            {message.sender === 'ai' ? (
              <span className="text-xs font-semibold text-emerald-600">IslamicAI</span>
            ) : (
              <span className="text-xs font-medium text-gray-500">You</span>
            )}
            <span className="text-xs text-gray-400 hidden sm:inline">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <div className="relative w-full">
            <div 
              className={`relative rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 max-w-full break-words transition-all duration-200 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm shadow-md hover:shadow-lg'
                  : 'bg-white/95 border border-gray-200 rounded-bl-sm shadow-md hover:shadow-lg backdrop-blur-sm'
              }`}
            >
              <div ref={contentRef} className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
                message.sender === 'user' ? 'text-white' : 'text-gray-800'
              }`}>
                {isStreaming && message.sender === 'ai' && (!message.content || message.content === "") ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                ) : (
                  <>
                    {formatContent(displayedContent)}
                    {showCursor && message.sender === 'ai' && (
                      <span className="ml-1 animate-pulse text-emerald-500 font-bold">▌</span>
                    )}
                    
                    {/* Simple completion indicator for AI messages - Mobile Hidden */}
                    {message.sender === 'ai' && !isStreaming && !message.isStreaming && displayedContent && (
                      <div className="mt-2 text-xs text-gray-400 text-right hidden sm:block">
                        ✓
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