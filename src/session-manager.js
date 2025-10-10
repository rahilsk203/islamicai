export class SessionManager {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
    this.maxHistoryLength = 20;

    // DSA: add small in-memory LRU cache to cut KV roundtrips
    this.historyCache = new Map(); // sessionId -> { history, ts }
    this.cacheTTLms = 5 * 60 * 1000; // 5 minutes
    this.cacheCapacity = 2000;
  }

  async getSessionHistory(sessionId) {
    try {
      const now = Date.now();
      if (this.historyCache.has(sessionId)) {
        const entry = this.historyCache.get(sessionId);
        if (now - entry.ts < this.cacheTTLms) {
          return entry.history;
        } else {
          this.historyCache.delete(sessionId);
        }
      }

      const raw = await this.kv.get(`session:${sessionId}`);
      const history = raw ? JSON.parse(this._decompress(raw)) : [];
      this._putHistoryCache(sessionId, history);
      return history;
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  async saveSessionHistory(sessionId, history) {
    try {
      // Keep only last 20 messages
      const trimmedHistory = history.slice(-this.maxHistoryLength);
      
      await this.kv.put(`session:${sessionId}`, this._compress(JSON.stringify(trimmedHistory)), {
        expirationTtl: 86400 * 7 // 7 days
      });
      this._putHistoryCache(sessionId, trimmedHistory);
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
      // Check if message has content before accessing it
      if (msg.content) {
        formattedMessages.push({
          parts: [{ text: `[${msg.role.toUpperCase()}] ${msg.content}` }]
        });
      }
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
      .filter(msg => msg.role === 'user' && msg.content)
      .map(msg => msg.content.substring(0, 50))
      .slice(0, 3);

    return `Previous topics: ${topics.join(', ')}...`;
  }

  async clearSessionHistory(sessionId) {
    try {
      await this.kv.delete(`session:${sessionId}`);
      this.historyCache.delete(sessionId);
      return true;
    } catch (error) {
      console.error('Error clearing session history:', error);
      return false;
    }
  }
}

// DSA helpers: simple compression, decompression, and LRU-put
SessionManager.prototype._compress = function(data) {
  // Lightweight symbol shortening to reduce KV size
  return data
    .replace(/"role":"user"/g, '"r":"u"')
    .replace(/"role":"assistant"/g, '"r":"a"')
    .replace(/"content":/g, '"c":')
    .replace(/"timestamp":/g, '"t":')
    .replace(/"session_id":/g, '"s":');
};

SessionManager.prototype._decompress = function(data) {
  return data
    .replace(/"r":"u"/g, '"role":"user"')
    .replace(/"r":"a"/g, '"role":"assistant"')
    .replace(/"c":/g, '"content":')
    .replace(/"t":/g, '"timestamp":')
    .replace(/"s":/g, '"session_id":');
};

SessionManager.prototype._putHistoryCache = function(sessionId, history) {
  this.historyCache.set(sessionId, { history, ts: Date.now() });
  if (this.historyCache.size > this.cacheCapacity) {
    const oldest = this.historyCache.keys().next().value;
    if (oldest) this.historyCache.delete(oldest);
  }
};
