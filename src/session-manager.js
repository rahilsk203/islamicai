export class SessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 20;
  }

  async getSessionHistory(sessionId) {
    try {
      const historyData = await this.kv.get(`session:${sessionId}`);
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  async saveSessionHistory(sessionId, history) {
    try {
      // Keep only last 20 messages
      const trimmedHistory = history.slice(-this.maxHistoryLength);
      
      await this.kv.put(`session:${sessionId}`, JSON.stringify(trimmedHistory), {
        expirationTtl: 86400 * 7 // 7 days
      });
    } catch (error) {
      console.error('Error saving session history:', error);
    }
  }

  prepareContext(sessionHistory) {
    // Get last 5 messages for context
    const recentMessages = sessionHistory.slice(-5);
    
    // Create basic system prompt (Islamic prompt will be added by GeminiAPI)
    const systemPrompt = {
      role: 'system',
      content: `[SYSTEM] You are IslamicAI, an advanced Islamic Scholar AI assistant. Provide authentic Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah. Respond in the user's preferred language (English, Hindi, Bengali, or Hinglish). Maintain scholarly accuracy while being conversational and helpful.`
    };

    // Format messages for Gemini API
    const formattedMessages = [];
    
    recentMessages.forEach(msg => {
      formattedMessages.push({
        parts: [{ text: `[${msg.role.toUpperCase()}] ${msg.content}` }]
      });
    });

    return formattedMessages;
  }

  getHistorySummary(sessionHistory) {
    if (sessionHistory.length <= 5) {
      return null;
    }

    // Simple summary of older messages
    const olderMessages = sessionHistory.slice(0, -5);
    const topics = olderMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.substring(0, 50))
      .slice(0, 3);

    return `Previous topics: ${topics.join(', ')}...`;
  }

  async clearSessionHistory(sessionId) {
    try {
      await this.kv.delete(`session:${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error clearing session history:', error);
      return false;
    }
  }
}
