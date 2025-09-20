import { useState, useEffect, useCallback } from 'react';
import { 
  getAllChatSessions, 
  saveChatSession, 
  getChatSession, 
  deleteChatSession,
  getRecentChats 
} from '../utils/api';

/**
 * Custom hook for managing chat memory and persistence
 */
export const useChatMemory = () => {
  const [recentChats, setRecentChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial chat data
  useEffect(() => {
    loadRecentChats();
  }, []);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'islamicAI_chatSessions') {
        loadRecentChats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadRecentChats = useCallback(() => {
    try {
      const chats = getRecentChats();
      setRecentChats(chats);
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  }, []);

  const saveChat = useCallback(async (sessionId, messages, title = null) => {
    try {
      setIsLoading(true);
      const savedSession = saveChatSession(sessionId, messages, title);
      if (savedSession) {
        loadRecentChats(); // Refresh the list
        return savedSession;
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [loadRecentChats]);

  const loadChat = useCallback((sessionId) => {
    try {
      const session = getChatSession(sessionId);
      return session;
    } catch (error) {
      console.error('Error loading chat:', error);
      return null;
    }
  }, []);

  const deleteChat = useCallback((sessionId) => {
    try {
      const success = deleteChatSession(sessionId);
      if (success) {
        loadRecentChats(); // Refresh the list
      }
      return success;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }, [loadRecentChats]);

  const getAllChats = useCallback(() => {
    try {
      return getAllChatSessions();
    } catch (error) {
      console.error('Error getting all chats:', error);
      return [];
    }
  }, []);

  return {
    recentChats,
    isLoading,
    saveChat,
    loadChat,
    deleteChat,
    getAllChats,
    refreshChats: loadRecentChats
  };
};

/**
 * Custom hook for auto-saving chat sessions
 */
export const useAutoSave = (sessionId, messages, saveCallback, delay = 3000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (messages.length <= 1) return; // Don't save initial/empty chats
    
    // Only save if there are user messages (meaningful conversation)
    const hasUserMessages = messages.some(msg => msg.sender === 'user');
    if (!hasUserMessages) return;

    setIsSaving(true);
    const timeoutId = setTimeout(async () => {
      try {
        await saveCallback(sessionId, messages);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [sessionId, messages, saveCallback, delay]);

  return { isSaving, lastSaved };
};

/**
 * Custom hook for session management
 */
export const useSessionManager = () => {
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('New Chat');

  const createNewSession = useCallback(() => {
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    setCurrentSessionId(newSessionId);
    setSessionTitle('New Chat');
    return newSessionId;
  }, []);

  const switchToSession = useCallback((sessionId, title = 'Chat') => {
    setCurrentSessionId(sessionId);
    setSessionTitle(title);
  }, []);

  useEffect(() => {
    if (!currentSessionId) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession]);

  return {
    currentSessionId,
    sessionTitle,
    setSessionTitle,
    createNewSession,
    switchToSession
  };
};

export default useChatMemory;