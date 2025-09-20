import { useState } from 'react';

const Sidebar = ({ isOpen, toggleSidebar, recentChats, startNewChat }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeSection, setActiveSection] = useState('chats');

  const quickPrompts = [
    { 
      id: 1, 
      text: "Five Pillars of Islam", 
      prompt: "What are the five pillars of Islam?",
      icon: "fas fa-star",
      color: "from-emerald-500 to-teal-600"
    },
    { 
      id: 2, 
      text: "Concept of Tawheed", 
      prompt: "Explain the concept of Tawheed",
      icon: "fas fa-lightbulb",
      color: "from-amber-500 to-orange-600"
    },
    { 
      id: 3, 
      text: "Life of Prophet Muhammad (PBUH)", 
      prompt: "Tell me about the life of Prophet Muhammad (PBUH)",
      icon: "fas fa-user-friends",
      color: "from-blue-500 to-indigo-600"
    },
    { 
      id: 4, 
      text: "Quran on Patience", 
      prompt: "What does the Quran say about patience?",
      icon: "fas fa-heart",
      color: "from-rose-500 to-pink-600"
    },
    { 
      id: 5, 
      text: "How to perform Wudu", 
      prompt: "How to perform Wudu (ablution)?",
      icon: "fas fa-hands-wash",
      color: "from-cyan-500 to-blue-600"
    }
  ];

  const topicTags = [
    { id: 1, name: "Qur'an", topic: "quran", icon: "fas fa-book-quran", color: "from-emerald-500 to-teal-600" },
    { id: 2, name: "Hadith", topic: "hadith", icon: "fas fa-mosque", color: "from-blue-500 to-indigo-600" },
    { id: 3, name: "Fiqh", topic: "fiqh", icon: "fas fa-balance-scale", color: "from-purple-500 to-violet-600" },
    { id: 4, name: "Seerah", topic: "seerah", icon: "fas fa-star", color: "from-amber-500 to-orange-600" },
    { id: 5, name: "Dua", topic: "dua", icon: "fas fa-hands-praying", color: "from-rose-500 to-pink-600" },
    { id: 6, name: "Aqeedah", topic: "aqeedah", icon: "fas fa-heart", color: "from-cyan-500 to-blue-600" },
    { id: 7, name: "Zakat", topic: "zakat", icon: "fas fa-coins", color: "from-green-500 to-emerald-600" },
    { id: 8, name: "Hajj", topic: "hajj", icon: "fas fa-kaaba", color: "from-yellow-500 to-orange-600" }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu (اردو)', flag: '🇵🇰' },
    { code: 'hinglish', name: 'Hinglish', flag: '🌐' }
  ];

  const handlePromptClick = (prompt) => {
    // In a real app, this would send the prompt to the chat
    console.log("Prompt clicked:", prompt);
    toggleSidebar();
  };

  return (
    <>
      {/* Enhanced Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Modern Sidebar */}
      <aside 
        className={`bg-white shadow-lg border-r border-gray-200 w-72 flex-shrink-0 transform transition-all duration-300 ease-in-out z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static absolute inset-y-0 left-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <i className="fas fa-mosque text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">IslamicAI</h2>
                  <p className="text-xs text-gray-500">Scholar Assistant</p>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'chats', label: 'Chats', icon: 'fas fa-comments' },
                { id: 'topics', label: 'Topics', icon: 'fas fa-bookmark' },
                { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    activeSection === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <i className={`${tab.icon} text-xs`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Recent Chats Section */}
            {activeSection === 'chats' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <i className="fas fa-history text-blue-500"></i>
                    <span>Recent Chats</span>
                  </h3>
                  <button 
                    onClick={startNewChat}
                    className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <i className="fas fa-plus text-sm"></i>
                  </button>
                </div>
                <div className="space-y-3">
                  {recentChats.length > 0 ? (
                    recentChats.map(chat => (
                      <div 
                        key={chat.id}
                        className="group p-4 rounded-2xl hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300 border border-gray-100 hover:border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-comment text-white text-xs"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-800 truncate group-hover:text-gray-900">
                              {chat.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {chat.preview}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {new Date(chat.timestamp).toLocaleDateString()}
                              </span>
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <span className="text-xs text-gray-400">2 min read</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-comments text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-gray-500 text-sm">No recent chats</p>
                      <p className="text-gray-400 text-xs mt-1">Start a new conversation</p>
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
                        className="group w-full text-left p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-0.5"
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
                              Click to explore this topic
                            </p>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
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

export default Sidebar;