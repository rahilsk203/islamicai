// API utility functions for connecting to the IslamicAI backend

const API_BASE_URL = 'http://127.0.0.1:8787'; // Default local development URL

/**
 * Send a message to the IslamicAI backend
 * @param {string} sessionId - The session ID for this conversation
 * @param {string} message - The user's message
 * @returns {Promise<Object>} The response from the backend
 */
export const sendMessage = async (sessionId, message) => {
  try {
    console.log('Sending message to backend:', { sessionId, message });
    
    const response = await fetch(`${API_BASE_URL}?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
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
 * Get recent chats from localStorage
 * @returns {Array} Array of recent chat objects
 */
export const getRecentChats = () => {
  try {
    const recentChats = localStorage.getItem('islamicAI_recentChats');
    return recentChats ? JSON.parse(recentChats) : [];
  } catch (error) {
    console.error('Error getting recent chats:', error);
    return [];
  }
};

/**
 * Save a chat to localStorage
 * @param {string} sessionId - The session ID
 * @param {string} title - The chat title
 * @param {string} preview - A preview of the chat
 */
export const saveChat = (sessionId, title, preview) => {
  try {
    const recentChats = getRecentChats();
    
    // Create a chat summary
    const chatSummary = {
      id: sessionId,
      title: title.substring(0, 30) + (title.length > 30 ? '...' : ''),
      preview: preview ? preview.substring(0, 50) + (preview.length > 50 ? '...' : '') : '',
      timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    recentChats.unshift(chatSummary);
    
    // Keep only last 10 chats
    if (recentChats.length > 10) {
      recentChats.pop();
    }
    
    localStorage.setItem('islamicAI_recentChats', JSON.stringify(recentChats));
  } catch (error) {
    console.error('Error saving chat:', error);
  }
};