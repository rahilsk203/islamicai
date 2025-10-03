// D1-backed Long-Term Memory Manager for user preferences and summaries

export class D1MemoryManager {
  constructor(db, env) {
    this.db = db; // Cloudflare D1 binding
    this.env = env; // Environment variables for encryption key
    
    // Connection pooling for performance
    this.connectionPool = [];
  }

  // Helper method to encrypt data
  async _encryptData(data) {
    if (!data) return null;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Get encryption key from environment
    const secretKey = this.env.ENCRYPTION_SECRET || 'default-secret-key-for-dev';
    const keyBuffer = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32));
    
    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combinedBuffer.set(iv, 0);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Return base64 encoded result
    return btoa(String.fromCharCode(...combinedBuffer));
  }

  // Helper method to decrypt data
  async _decryptData(encryptedData) {
    if (!encryptedData) return null;
    
    // Decode base64
    const combinedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Get encryption key from environment
    const encoder = new TextEncoder();
    const secretKey = this.env.ENCRYPTION_SECRET || 'default-secret-key-for-dev';
    const keyBuffer = encoder.encode(secretKey.padEnd(32, '0').slice(0, 32));
    
    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Extract IV and encrypted data
    const iv = combinedBuffer.slice(0, 12);
    const encryptedBuffer = combinedBuffer.slice(12);
    
    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedBuffer
    );
    
    // Return decrypted string
    return new TextDecoder().decode(decryptedBuffer);
  }

  // Enhanced method to ensure user exists with proper validation
  async ensureUser(userId, profile = {}) {
    // Validate that this is an authenticated user (not a guest)
    if (!this._isAuthenticatedUser(userId)) {
      throw new Error('Cannot ensure user for guest sessions');
    }
    
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    const existing = await this.db.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (existing) return userId;
    
    // Validate profile data
    const email = profile.email || null;
    const provider = profile.provider || 'local';
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
    }
    
    await this.db.prepare(
      'INSERT INTO users (id, email, provider, created_at) VALUES (?, ?, ?, ?)' 
    ).bind(userId, email, provider, new Date().toISOString()).run();
    
    // Create default user preferences
    await this.db.prepare(
      'INSERT INTO user_preferences (user_id) VALUES (?)'
    ).bind(userId).run();
    
    return userId;
  }

  async getPreferences(userId) {
    // For guest users, return empty preferences
    if (!this._isAuthenticatedUser(userId)) {
      return { language: null, madhhab: null, interests: [] };
    }
    
    const row = await this.db.prepare(
      'SELECT language_pref, madhhab_pref, interests_json FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();
    if (!row) return { language: null, madhhab: null, interests: [] };
    
    // Decrypt sensitive data
    const language = row.language_pref ? await this._decryptData(row.language_pref) : null;
    const madhhab = row.madhhab_pref ? await this._decryptData(row.madhhab_pref) : null;
    const interests = row.interests_json ? JSON.parse(await this._decryptData(row.interests_json) || '[]') : [];
    
    return {
      language,
      madhhab,
      interests
    };
  }

  async setPreferences(userId, { language, madhhab, interests }) {
    // For guest users, don't save preferences
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping preferences save for guest user');
      return;
    }
    
    const existing = await this.db.prepare(
      'SELECT user_id FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();
    
    // Encrypt sensitive data
    const encryptedLanguage = language ? await this._encryptData(language) : null;
    const encryptedMadhhab = madhhab ? await this._encryptData(madhhab) : null;
    const encryptedInterests = interests ? await this._encryptData(JSON.stringify(interests)) : null;
    
    if (existing) {
      await this.db.prepare(
        'UPDATE user_preferences SET language_pref = ?, madhhab_pref = ?, interests_json = ? WHERE user_id = ?'
      ).bind(encryptedLanguage, encryptedMadhhab, encryptedInterests, userId).run();
    } else {
      await this.db.prepare(
        'INSERT INTO user_preferences (user_id, language_pref, madhhab_pref, interests_json) VALUES (?, ?, ?, ?)'
      ).bind(userId, encryptedLanguage, encryptedMadhhab, encryptedInterests).run();
    }
  }

  async clearPreference(userId, field) {
    // For guest users, don't clear preferences
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping preference clear for guest user');
      return;
    }
    
    const allowed = new Set(['language_pref', 'madhhab_pref', 'interests_json']);
    if (!allowed.has(field)) return;
    await this.db.prepare(
      `UPDATE user_preferences SET ${field} = NULL WHERE user_id = ?`
    ).bind(userId).run();
  }

  async addDiscussionSummary(userId, sessionId, summaryText) {
    // For guest users, don't save discussion summaries
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping discussion summary save for guest user');
      return;
    }
    
    // Encrypt the summary before storing
    const encryptedSummary = await this._encryptData(summaryText);
    
    await this.db.prepare(
      'INSERT INTO discussion_summaries (user_id, session_id, summary, created_at) VALUES (?, ?, ?, ?)' 
    ).bind(userId, sessionId, encryptedSummary, new Date().toISOString()).run();
  }

  async getRecentSummaries(userId, limit = 5) {
    // For guest users, return empty summaries
    if (!this._isAuthenticatedUser(userId)) {
      return [];
    }
    
    const results = await this.db.prepare(
      'SELECT summary FROM discussion_summaries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(userId, limit).all();
    
    // Decrypt summaries
    const summaries = [];
    if (results?.results) {
      for (const row of results.results) {
        if (row.summary) {
          const decryptedSummary = await this._decryptData(row.summary);
          if (decryptedSummary) {
            summaries.push(decryptedSummary);
          }
        }
      }
    }
    
    return summaries;
  }
  
  // Enhanced method to get user's complete memory profile with additional security
  async getUserMemoryProfile(userId) {
    // Validate user ID format
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    // For guest users, return empty profile
    if (!this._isAuthenticatedUser(userId)) {
      return {
        preferences: { language: null, madhhab: null, interests: [] },
        recentSummaries: [],
        memoryCount: 0
      };
    }
    
    const preferences = await this.getPreferences(userId);
    const summaries = await this.getRecentSummaries(userId, 10);
    
    return {
      preferences,
      recentSummaries: summaries,
      memoryCount: summaries.length
    };
  }
  
  // New method to update user profile information
  async updateUserProfile(userId, profileData) {
    // For guest users, don't update profile
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping profile update for guest user');
      return;
    }
    
    const { name, avatarUrl } = profileData;
    const existing = await this.db.prepare(
      'SELECT user_id FROM user_profiles WHERE user_id = ?'
    ).bind(userId).first();
    
    // Encrypt sensitive data
    const encryptedName = name ? await this._encryptData(name) : null;
    const encryptedAvatarUrl = avatarUrl ? await this._encryptData(avatarUrl) : null;
    
    if (existing) {
      await this.db.prepare(
        'UPDATE user_profiles SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), last_login = ? WHERE user_id = ?'
      ).bind(encryptedName, encryptedAvatarUrl, new Date().toISOString(), userId).run();
    } else {
      await this.db.prepare(
        'INSERT INTO user_profiles (user_id, name, avatar_url, last_login, login_count) VALUES (?, ?, ?, ?, 1)'
      ).bind(userId, encryptedName, encryptedAvatarUrl, new Date().toISOString()).run();
    }
    
    // Update login count
    await this.db.prepare(
      'UPDATE user_profiles SET login_count = login_count + 1 WHERE user_id = ?'
    ).bind(userId).run();
  }
  
  // Enhanced method to get user profile
  async getUserProfile(userId) {
    // For guest users, return empty profile
    if (!this._isAuthenticatedUser(userId)) {
      return { name: null, avatarUrl: null, lastLogin: null, loginCount: 0 };
    }
    
    const profile = await this.db.prepare(
      'SELECT name, avatar_url, last_login, login_count FROM user_profiles WHERE user_id = ?'
    ).bind(userId).first();
    
    // Map database column names to camelCase property names and decrypt data
    if (profile) {
      const decryptedName = profile.name ? await this._decryptData(profile.name) : null;
      const decryptedAvatarUrl = profile.avatar_url ? await this._decryptData(profile.avatar_url) : null;
      
      return {
        name: decryptedName,
        avatarUrl: decryptedAvatarUrl,
        lastLogin: profile.last_login,
        loginCount: profile.login_count
      };
    }
    
    return { name: null, avatarUrl: null, lastLogin: null, loginCount: 0 };
  }
  
  // Enhanced method to create memory checkpoints with periodic summarization
  async createMemoryCheckpoint(userId, sessionId, conversationHistory) {
    // For guest users, don't create memory checkpoints
    if (!this._isAuthenticatedUser(userId)) {
      console.log('Skipping memory checkpoint for guest user');
      return;
    }
    
    // Only create checkpoint if conversation is long enough
    if (conversationHistory.length < 10) return;
    
    // Summarize the conversation
    const summary = await this._summarizeConversation(conversationHistory);
    
    // Store the summary
    await this.addDiscussionSummary(userId, sessionId, summary);
    
    // Clean up old summaries (keep only last 20)
    await this._cleanupOldSummaries(userId);
  }
  
  // Helper method to summarize conversations
  async _summarizeConversation(conversationHistory) {
    // For now, create a simple summary by extracting key points
    // In a production environment, this would use an AI model to generate a proper summary
    const userMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .slice(-5); // Last 5 user messages
      
    const aiMessages = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content)
      .slice(-5); // Last 5 AI responses
      
    return `User discussed: ${userMessages.join('; ')} | AI responded with: ${aiMessages.join('; ')}`;
  }
  
  // Helper method to clean up old summaries
  async _cleanupOldSummaries(userId) {
    // Get count of summaries
    const countResult = await this.db.prepare(
      'SELECT COUNT(*) as count FROM discussion_summaries WHERE user_id = ?'
    ).bind(userId).first();
    
    const count = countResult?.count || 0;
    
    // If we have more than 20 summaries, delete the oldest ones
    if (count > 20) {
      // Get the id of the 20th most recent summary
      const thresholdResult = await this.db.prepare(
        'SELECT id FROM discussion_summaries WHERE user_id = ? ORDER BY created_at DESC LIMIT 1 OFFSET 19'
      ).bind(userId).first();
      
      if (thresholdResult) {
        // Delete all summaries older than the threshold
        await this.db.prepare(
          'DELETE FROM discussion_summaries WHERE user_id = ? AND created_at < (SELECT created_at FROM discussion_summaries WHERE id = ?)'
        ).bind(userId, thresholdResult.id).run();
      }
    }
  }
  
  // Method to delete all user memories (Forget Me feature)
  async deleteAllUserMemories(userId) {
    // For guest users, there's nothing to delete
    if (!this._isAuthenticatedUser(userId)) {
      console.log('No memories to delete for guest user');
      return true;
    }
    
    try {
      // Delete discussion summaries
      await this.db.prepare(
        'DELETE FROM discussion_summaries WHERE user_id = ?'
      ).bind(userId).run();
      
      // Clear user preferences
      await this.db.prepare(
        'UPDATE user_preferences SET language_pref = NULL, madhhab_pref = NULL, interests_json = NULL WHERE user_id = ?'
      ).bind(userId).run();
      
      // Clear user profile
      await this.db.prepare(
        'UPDATE user_profiles SET name = NULL, avatar_url = NULL WHERE user_id = ?'
      ).bind(userId).run();
      
      console.log(`All memories deleted for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete memories for user ${userId}:`, error.message);
      return false;
    }
  }
  
  // Helper method to check if a user is authenticated
  _isAuthenticatedUser(userId) {
    // Authenticated users have a proper UUID format, guest users use session IDs
    if (!userId) return false;
    // Check if userId looks like a UUID (authenticated user)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  }
}

export const D1_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  provider TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language_pref TEXT,
  madhhab_pref TEXT,
  interests_json TEXT
);

CREATE TABLE IF NOT EXISTS discussion_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  summary TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  last_login TEXT,
  login_count INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discussion_summaries_user_id ON discussion_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_summaries_created_at ON discussion_summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
`;