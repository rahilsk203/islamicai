import { useState, useEffect } from 'react';
import { getAllChatSessions, deleteChatSession, searchChatHistory } from '../utils/api';
import { getRelativeTime } from '../utils/timestamp';

const ChatMemory = ({ onLoadChat, currentSessionId }) => {
  const [allChats, setAllChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'messages'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allChats, searchQuery, sortBy, filterBy]);

  const loadChats = () => {
    const chats = getAllChatSessions();
    setAllChats(chats);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allChats];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchChatHistory(searchQuery);
    }

    // Apply date filter
    const now = new Date();
    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(chat => {
          const chatDate = new Date(chat.lastUpdated);
          return chatDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(chat => new Date(chat.lastUpdated) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(chat => new Date(chat.lastUpdated) >= monthAgo);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'messages':
        filtered.sort((a, b) => b.messageCount - a.messageCount);
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        break;
    }

    setFilteredChats(filtered);
  };

  const handleDeleteChat = (chatId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      deleteChatSession(chatId);
      loadChats(); // Reload the chats
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    return getRelativeTime(dateString);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search your conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Latest First</option>
            <option value="title">By Title</option>
            <option value="messages">Most Active</option>
          </select>

          {/* Filter By Time */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredChats.length} conversations</span>
          {searchQuery && (
            <span>searching for "{searchQuery}"</span>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onLoadChat(chat.id)}
              className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                currentSessionId === chat.id
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  currentSessionId === chat.id
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-gray-500 group-hover:to-gray-600'
                }`}>
                  <i className="fas fa-comment text-white text-sm"></i>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm truncate mb-1 ${
                    currentSessionId === chat.id ? 'text-blue-800' : 'text-gray-800 group-hover:text-gray-900'
                  }`}>
                    {chat.title}
                  </div>
                  
                  <div className="text-xs text-gray-500 truncate mb-2">
                    {chat.preview}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-clock"></i>
                        <span>{getTimeAgo(chat.lastUpdated)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <i className="fas fa-comments"></i>
                        <span>{chat.messageCount}</span>
                      </span>
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
                </div>
              </div>

              {/* Current Session Indicator */}
              {currentSessionId === chat.id && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-blue-500 rounded-r"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <i className={`fas ${searchQuery ? 'fa-search' : 'fa-comments'} text-gray-400 text-2xl`}></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No matches found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Start a new conversation to see your chat history here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMemory;