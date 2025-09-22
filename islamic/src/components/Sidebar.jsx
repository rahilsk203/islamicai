import { useState, useEffect } from 'react';
import { deleteChatSession, searchChatHistory, getChatStatistics } from '../utils/api';
import { getRelativeTime } from '../utils/timestamp';

const Sidebar = ({ isOpen, toggleSidebar, recentChats, startNewChat, loadChatSession, currentSessionId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chatStats, setChatStats] = useState(null);

  // Load chat statistics when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const stats = getChatStatistics();
      setChatStats(stats);
    }
  }, [isOpen, recentChats]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const results = searchChatHistory(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleDeleteChat = (chatId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChatSession(chatId);
      // Refresh the recent chats list
      window.location.reload(); // Simple way to refresh, could be optimized
    }
  };

  const handleChatClick = (chatId) => {
    loadChatSession(chatId);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatDate = (dateString) => {
    return getRelativeTime(dateString);
  };

  const handlePromptClick = (prompt) => {
    // This function should trigger sending the prompt as a message
    // We'll need to add this functionality or connect it to the parent component
    console.log('Prompt clicked:', prompt);
    // Close sidebar on mobile after selecting prompt
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Enhanced Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
        style={{ touchAction: 'none' }}
      ></div>

      {/* Enhanced Mobile-First Sidebar */}
      <aside 
        className={`bg-white/95 backdrop-blur-md shadow-xl border-r border-gray-200/50 w-80 sm:w-72 lg:w-80 flex-shrink-0 transform transition-all duration-300 ease-in-out z-50 will-change-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static fixed inset-y-0 left-0 safe-area-inset-left`}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Mobile Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <i className="fas fa-mosque text-white text-xs sm:text-sm"></i>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">IslamicAI</h2>
                  <p className="text-xs text-gray-500 hidden sm:block">Scholar Assistant</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close sidebar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Enhanced Mobile Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'chats', label: 'Chats', icon: 'fas fa-comments' },
                { id: 'topics', label: 'Topics', icon: 'fas fa-bookmark' },
                { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2.5 rounded-md text-xs font-medium transition-all duration-200 touch-manipulation ${
                    activeSection === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <i className={`${tab.icon} text-xs`}></i>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Mobile Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Recent Chats Section */}
            {activeSection === 'chats' && (
              <div>
                {/* Enhanced Mobile Search Bar */}
                <div className="mb-3 sm:mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search your chats..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all touch-manipulation"
                      style={{ fontSize: '16px' }} // Prevents zoom on iOS
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-manipulation"
                        style={{ minWidth: '24px', minHeight: '24px' }}
                      >
                        <i className="fas fa-times text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat Statistics */}
                {chatStats && !searchQuery && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-blue-700">{chatStats.totalSessions}</div>
                        <div className="text-blue-600">Total Chats</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-700">{chatStats.totalMessages}</div>
                        <div className="text-blue-600">Messages</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <i className="fas fa-history text-blue-500"></i>
                    <span>{searchQuery ? `Search Results (${searchResults.length})` : 'Recent Chats'}</span>
                  </h3>
                  {!searchQuery && (
                    <button 
                      onClick={startNewChat}
                      className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Start New Chat"
                    >
                      <i className="fas fa-plus text-sm"></i>
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {/* Show search results or recent chats */}
                  {(searchQuery ? searchResults : recentChats).length > 0 ? (
                    (searchQuery ? searchResults : recentChats).map(chat => (
                      <div 
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        className={`group p-4 rounded-2xl hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300 border hover:border-gray-200 relative ${
                          currentSessionId === chat.id 
                            ? 'bg-blue-50 border-blue-200 shadow-md' 
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            currentSessionId === chat.id 
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            <i className="fas fa-comment text-white text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm truncate group-hover:text-gray-900 ${
                              currentSessionId === chat.id ? 'text-blue-800' : 'text-gray-800'
                            }`}>
                              {chat.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {chat.preview}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDate(chat.timestamp)}
                              </span>
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-400">
                                {chat.messageCount || 0} messages
                              </span>
                            </div>
                          </div>
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Chat"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                        
                        {/* Current Session Indicator */}
                        {currentSessionId === chat.id && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i className={`fas ${searchQuery ? 'fa-search' : 'fa-comments'} text-gray-400 text-xl`}></i>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {searchQuery ? 'No chats found' : 'No recent chats'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={startNewChat}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start New Chat
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Topics Section */}
            {activeSection === 'topics' && (
              <div className="space-y-6">
                {/* Quick Prompts */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-4">
                    <i className="fas fa-star text-amber-500"></i>
                    <span>Quick Prompts</span>
                  </h3>
                  <div className="space-y-3">
                    {quickPrompts.map((prompt, index) => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.prompt)}
                        className="group w-full text-left p-4 rounded-2xl bg-gray-50/80 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 touch-manipulation"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <i className={`${prompt.icon} text-white text-sm`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                              {prompt.text}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Tap to explore this topic
                            </p>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"></i>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Islamic Topics */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-4">
                    <i className="fas fa-mosque text-green-500"></i>
                    <span>Islamic Topics</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {topicTags.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handlePromptClick(`Tell me about ${topic.name} in Islam`)}
                        className="group p-3 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <i className={`${topic.icon} text-white text-xs`}></i>
                          </div>
                          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {topic.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                {/* Language Selector */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-4">
                    <i className="fas fa-language text-blue-500"></i>
                    <span>Language</span>
                  </h3>
                  <div className="space-y-2">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                          selectedLanguage === lang.code
                            ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-2 border-gray-100 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {selectedLanguage === lang.code && (
                          <i className="fas fa-check text-blue-500 ml-auto"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-4">
                    <i className="fas fa-info-circle text-green-500"></i>
                    <span>About IslamicAI</span>
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        IslamicAI provides authentic Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah.
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Our AI is designed to provide accurate, scholarly responses while adhering to Islamic principles.
                      </p>
                      <div className="flex items-center space-x-4 pt-2">
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <i className="fas fa-shield-alt"></i>
                          <span>Secure</span>
                        </span>
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <i className="fas fa-brain"></i>
                          <span>AI-Powered</span>
                        </span>
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <i className="fas fa-star"></i>
                          <span>v2.0</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

// Quick Prompts Data
const quickPrompts = [
  {
    id: 1,
    text: "Five Pillars of Islam",
    icon: "fas fa-star",
    prompt: "Tell me about the five pillars of Islam",
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: 2,
    text: "Daily Prayers (Salah)",
    icon: "fas fa-pray",
    prompt: "How should I perform the daily prayers?",
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: 3,
    text: "Quranic Verses",
    icon: "fas fa-book-quran",
    prompt: "Share some beautiful verses from the Quran",
    color: "from-purple-500 to-violet-600"
  },
  {
    id: 4,
    text: "Prophet's Teachings",
    icon: "fas fa-heart",
    prompt: "What are some important teachings of Prophet Muhammad?",
    color: "from-rose-500 to-pink-600"
  }
];

// Topic Tags Data
const topicTags = [
  { id: 1, name: "Quran", icon: "fas fa-book-quran", color: "from-emerald-500 to-teal-600" },
  { id: 2, name: "Hadith", icon: "fas fa-scroll", color: "from-blue-500 to-indigo-600" },
  { id: 3, name: "Fiqh", icon: "fas fa-balance-scale", color: "from-purple-500 to-violet-600" },
  { id: 4, name: "Seerah", icon: "fas fa-star", color: "from-amber-500 to-orange-600" },
  { id: 5, name: "Dua", icon: "fas fa-hands-praying", color: "from-rose-500 to-pink-600" },
  { id: 6, name: "Aqeedah", icon: "fas fa-heart", color: "from-cyan-500 to-blue-600" }
];

// Languages Data
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳' }
];

export default Sidebar;