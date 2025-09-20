// API utility functions for connecting to the IslamicAI backend

 const API_BASE_URL = 'https://islamicai.sohal70760.workers.dev'; // Default local development URL
// const API_BASE_URL = 'http://127.0.0.1:8787'; // Default local development URL
/**
 * Send a message to the IslamicAI backend (backend handles language detection)
 * @param {string} sessionId - The session ID for this conversation
 * @param {string} message - The user's message
 * @returns {Promise<Object>} The response from the backend
 */
export const sendMessage = async (sessionId, message) => {
  try {
    // Backend handles all language detection now
    const requestBody = {
      message: message
    };
    
    console.log('Sending message to backend:', { sessionId, message });
    
    const response = await fetch(`${API_BASE_URL}?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return data;
  } catch (error) {
    console.error('Error sending message to backend:', error);
    throw error;
  }
};

/**
 * Start a new chat session
 * @returns {string} A new session ID
 */
export const createNewSession = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

/**
 * Memory Management System for Frontend Chat History
 */

/**
 * Normalize timestamp to ensure it's a valid Date object
 * @param {Date|string|number} timestamp - Timestamp to normalize
 * @returns {Date} Normalized Date object
 */
const normalizeTimestamp = (timestamp) => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

/**
 * Get all stored chat sessions from localStorage
 * @returns {Array} Array of chat session objects
 */
export const getAllChatSessions = () => {
  try {
    const sessions = localStorage.getItem('islamicAI_chatSessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

/**
 * Get a specific chat session by ID
 * @param {string} sessionId - The session ID to retrieve
 * @returns {Object|null} The chat session object or null if not found
 */
export const getChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    const session = sessions.find(session => session.id === sessionId);
    
    if (session) {
      // Normalize message timestamps to Date objects for consistency
      const normalizedSession = {
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }))
      };
      return normalizedSession;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

/**
 * Save or update a complete chat session
 * @param {string} sessionId - The session ID
 * @param {Array} messages - Array of all messages in the session
 * @param {string} title - Auto-generated title from first user message
 */
export const saveChatSession = (sessionId, messages, title = null) => {
  try {
    const sessions = getAllChatSessions();
    
    // Auto-generate title from first user message if not provided
    const autoTitle = title || generateChatTitle(messages);
    
    // Ensure timestamps are ISO strings for consistent storage
    const normalizedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
    }));
    
    // Find existing session or create new one
    const existingIndex = sessions.findIndex(session => session.id === sessionId);
    
    const sessionData = {
      id: sessionId,
      title: autoTitle,
      messages: normalizedMessages,
      lastUpdated: new Date().toISOString(),
      messageCount: normalizedMessages.length,
      preview: generatePreview(normalizedMessages)
    };
    
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = sessionData;
    } else {
      // Add new session to beginning
      sessions.unshift(sessionData);
    }
    
    // Keep only last 50 sessions to prevent storage overflow
    if (sessions.length > 50) {
      sessions.splice(50);
    }
    
    localStorage.setItem('islamicAI_chatSessions', JSON.stringify(sessions));
    
    return sessionData;
  } catch (error) {
    console.error('Error saving chat session:', error);
    return null;
  }
};

/**
 * Delete a chat session
 * @param {string} sessionId - The session ID to delete
 */
export const deleteChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem('islamicAI_chatSessions', JSON.stringify(filteredSessions));
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
};

/**
 * Generate a title from the first user message
 * @param {Array} messages - Array of messages
 * @returns {string} Generated title
 */
const generateChatTitle = (messages) => {
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  if (firstUserMessage) {
    let title = firstUserMessage.content.trim();
    // Take first 30 characters and clean up
    title = title.substring(0, 30);
    // If it ends mid-word, try to end at last complete word
    if (title.length === 30) {
      const lastSpace = title.lastIndexOf(' ');
      if (lastSpace > 15) {
        title = title.substring(0, lastSpace);
      }
      title += '...';
    }
    return title;
  }
  return 'New Chat';
};

/**
 * Generate a preview from the conversation
 * @param {Array} messages - Array of messages
 * @returns {string} Generated preview
 */
const generatePreview = (messages) => {
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  if (firstUserMessage) {
    let preview = firstUserMessage.content.trim();
    return preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
  }
  return 'No messages yet';
};

/**
 * Get recent chats (for backward compatibility)
 * @returns {Array} Array of recent chat objects
 */
export const getRecentChats = () => {
  const sessions = getAllChatSessions();
  return sessions.slice(0, 10).map(session => ({
    id: session.id,
    title: session.title,
    preview: session.preview,
    timestamp: session.lastUpdated,
    messageCount: session.messageCount
  }));
};

/**
 * Save a chat (for backward compatibility)
 * @param {string} sessionId - The session ID
 * @param {string} title - The chat title
 * @param {string} preview - A preview of the chat
 */
export const saveChat = (sessionId, title, preview) => {
  // This is now handled by saveChatSession, keeping for compatibility
  console.log('saveChat called - using new saveChatSession system');
};

/**
 * Search through chat history
 * @param {string} query - Search query
 * @returns {Array} Array of matching chat sessions
 */
export const searchChatHistory = (query) => {
  try {
    const sessions = getAllChatSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in messages
      return session.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      );
    });
  } catch (error) {
    console.error('Error searching chat history:', error);
    return [];
  }
};

/**
 * Get chat statistics
 * @returns {Object} Statistics about chat usage
 */
export const getChatStatistics = () => {
  try {
    const sessions = getAllChatSessions();
    
    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, session) => sum + session.messageCount, 0),
      oldestChat: sessions.length > 0 ? sessions[sessions.length - 1].lastUpdated : null,
      newestChat: sessions.length > 0 ? sessions[0].lastUpdated : null,
      averageMessagesPerSession: sessions.length > 0 ? 
        Math.round(sessions.reduce((sum, session) => sum + session.messageCount, 0) / sessions.length) : 0
    };
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    return {
      totalSessions: 0,
      totalMessages: 0,
      oldestChat: null,
      newestChat: null,
      averageMessagesPerSession: 0
    };
  }
};

/**
 * Get UI text based on language (simplified for backend-driven detection)
 * @param {string} language - The language code
 * @returns {Object} UI text object for the language
 */
export const getLanguageUIText = (language) => {
  const uiTexts = {
    english: {
      placeholder: 'Ask about Qur\'an, Hadith, Fiqh, Seerah, or any Islamic topic...',
      sendButton: 'Send',
      newChat: 'New Chat',
      recentChats: 'Recent Chats',
      settings: 'Settings',
      loading: 'IslamicAI is thinking...',
      error: 'Sorry, there was an error. Please try again.',
      welcome: 'Welcome to IslamicAI! How can I help you today?'
    },
    hindi: {
      placeholder: 'कुरान, हदीस, फ़िक़्ह, सीरा या किसी भी इस्लामी विषय के बारे में पूछें...',
      sendButton: 'भेजें',
      newChat: 'नई चैट',
      recentChats: 'हाल की चैट्स',
      settings: 'सेटिंग्स',
      loading: 'इस्लामिकएआई सोच रहा है...',
      error: 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।',
      welcome: 'इस्लामिकएआई में आपका स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूं?'
    },
    urdu: {
      placeholder: 'قرآن، حدیث، فقہ، سیرت یا کسی بھی اسلامی موضوع کے بارے میں پوچھیں...',
      sendButton: 'بھیجیں',
      newChat: 'نیا چیٹ',
      recentChats: 'حالیہ چیٹس',
      settings: 'سیٹنگز',
      loading: 'اسلامک اے آئی سوچ رہا ہے...',
      error: 'معذرت، کوئی خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔',
      welcome: 'اسلامک اے آئی میں خوش آمدید! آج میں آپ کی کیسے مدد کر سکتا ہوں؟'
    },
    arabic: {
      placeholder: 'اسأل عن القرآن والحديث والفقه والسيرة أو أي موضوع إسلامي...',
      sendButton: 'إرسال',
      newChat: 'محادثة جديدة',
      recentChats: 'المحادثات الأخيرة',
      settings: 'الإعدادات',
      loading: 'الذكاء الاصطناعي الإسلامي يفكر...',
      error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      welcome: 'مرحباً بك في الذكاء الاصطناعي الإسلامي! كيف يمكنني مساعدتك اليوم؟'
    },
    hinglish: {
      placeholder: 'Qur\'an, Hadith, Fiqh, Seerah ya koi bhi Islamic topic ke baare mein pucho...',
      sendButton: 'Bhejo',
      newChat: 'Nayi Chat',
      recentChats: 'Recent Chats',
      settings: 'Settings',
      loading: 'IslamicAI soch raha hai...',
      error: 'Sorry, koi error aaya. Phir se try karo.',
      welcome: 'IslamicAI mein aapka swagat hai! Aaj main aapki kaise madad kar sakta hun?'
    }
  };

  return uiTexts[language] || uiTexts.english;
};