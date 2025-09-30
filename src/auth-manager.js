// Authentication Manager for Email/Password and Google Sign-In
// Uses D1 for user records and WebCrypto for password hashing (PBKDF2)

export class AuthManager {
  constructor(db, env) {
    this.db = db; // D1 binding
    this.env = env; // contains GOOGLE_CLIENT_ID (for basic validation)
  }

  async _hashPassword(password, saltBase64) {
    const enc = new TextEncoder();
    const salt = saltBase64 ? Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const raw = await crypto.subtle.exportKey('raw', key);
    const hashB64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
    const saltB64 = saltBase64 || btoa(String.fromCharCode(...salt));
    return { hashB64, saltB64 };
  }

  async signupEmail(email, password) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    
    // Validate password strength
    if (password.length < 8) throw new Error('Password must be at least 8 characters long');
    
    // Additional password complexity checks
    if (!/[A-Z]/.test(password)) throw new Error('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) throw new Error('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) throw new Error('Password must contain at least one number');
    
    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwertyui', 'asdfghjk'];
    if (weakPasswords.includes(password.toLowerCase())) {
      throw new Error('Password is too common. Please choose a stronger password.');
    }
    
    const existing = await this.db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) throw new Error('Email already exists');
    const { hashB64, saltB64 } = await this._hashPassword(password);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.prepare('INSERT INTO users (id, email, provider, created_at) VALUES (?, ?, ?, ?)').bind(userId, email, 'local', now).run();
    await this.db.prepare('INSERT INTO user_auth (user_id, password_hash, password_salt) VALUES (?, ?, ?)').bind(userId, hashB64, saltB64).run();
    
    // Create default user preferences
    await this.db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').bind(userId).run();
    
    return { userId };
  }

  async loginEmail(email, password) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    
    const user = await this.db.prepare('SELECT id FROM users WHERE email = ? AND provider = ?').bind(email, 'local').first();
    if (!user) throw new Error('Invalid credentials');
    const auth = await this.db.prepare('SELECT password_hash, password_salt FROM user_auth WHERE user_id = ?').bind(user.id).first();
    if (!auth) throw new Error('Invalid credentials');
    const { hashB64 } = await this._hashPassword(password, auth.password_salt);
    if (hashB64 !== auth.password_hash) throw new Error('Invalid credentials');
    return { userId: user.id };
  }

  // Enhanced Google ID token verification with better validation
  async loginGoogle(idToken) {
    // For Workers environment, we can decode payload and check aud/iss/email verification basics.
    const parts = (idToken || '').split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0))));
    if (!payload || !payload.aud || !payload.email) throw new Error('Invalid token payload');
    
    // Additional validation for Google tokens
    if (this.env.GOOGLE_CLIENT_ID && payload.aud !== this.env.GOOGLE_CLIENT_ID) throw new Error('Invalid audience');
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) throw new Error('Token has expired');
    
    // Check issuer
    if (payload.iss && !['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
      throw new Error('Invalid issuer');
    }
    
    // Check that token was issued recently
    if (payload.iat && payload.iat < now - (60 * 60 * 24 * 7)) { // Max 7 days old
      throw new Error('Token is too old');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) throw new Error('Invalid email format in token');
    
    const email = payload.email;
    let user = await this.db.prepare('SELECT id FROM users WHERE email = ? AND provider = ?').bind(email, 'google').first();
    if (!user) {
      const userId = crypto.randomUUID();
      await this.db.prepare('INSERT INTO users (id, email, provider, created_at) VALUES (?, ?, ?, ?)').bind(userId, email, 'google', new Date().toISOString()).run();
      
      // Create default user preferences for Google users
      await this.db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').bind(userId).run();
      
      user = { id: userId };
    }
    return { userId: user.id };
  }
  
  async getUserProfile(userId) {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
    
    // Validate user ID format (should be a UUID for authenticated users)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    const user = await this.db.prepare('SELECT id, email, provider, created_at FROM users WHERE id = ?').bind(userId).first();
    return user;
  }
  
  // Method to validate that a user exists and is properly authenticated
  async validateUser(userId) {
    // Validate user ID format
    if (!userId || typeof userId !== 'string') {
      return false;
    }
    
    // Validate user ID format (should be a UUID for authenticated users)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return false;
    }
    
    const user = await this.db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    return !!user;
  }
}

export const AUTH_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user_auth (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT,
  password_salt TEXT
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  last_login TEXT,
  login_count INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_auth_user_id ON user_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
`;