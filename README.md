# IslamicAI Cloudflare Worker with Google Gemini Integration

This project is a Cloudflare Worker that integrates with the Google Gemini API to provide AI-powered Islamic guidance with user authentication and personalized memory.

## Features

- AI-powered Islamic guidance based on Quran, Hadith, and authentic scholarship
- User authentication (Email/Password and Google Sign-In)
- Personalized memory system (short-term and long-term)
- User preference management (language, madhhab, interests)
- Context-aware responses with memory recall
- Privacy-focused design with secure authentication

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Google Gemini API key in `wrangler.toml`:
   ```toml
   [vars]
   GEMINI_API_KEY = "your_actual_api_key_here"
   ```

3. Configure D1 database and KV namespaces in `wrangler.toml`

## Development

To run locally:
```bash
npm run dev
```

## Deployment

To deploy to Cloudflare:
```bash
npm run deploy
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Sign up with email and password
- `POST /auth/login` - Login with email and password
- `POST /auth/google` - Login with Google ID token

### User Preferences
- `POST /prefs/update` - Update user preferences (language, madhhab, interests)
- `POST /prefs/clear` - Clear specific preference field
- `POST /profile/update` - Update user profile information

### Memory Management
- `GET /memory/profile` - Get user's complete memory profile
- `POST /memory/clear` - Clear all user memories and preferences

### Chat
- `POST /api/chat` - Get AI response (direct)
- `POST /api/stream` - Get AI response (streaming)
- `POST /` - Get AI response (streaming by default)

## Usage

### Authentication Flow

1. Sign up or login to get an authentication token:
   ```bash
   curl -X POST https://your-worker.your-account.workers.dev/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "securepassword"}'
   ```

2. Use the token in the Authorization header for authenticated requests:
   ```bash
   curl -X POST https://your-worker.your-account.workers.dev/prefs/update \
     -H "Authorization: Bearer USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"language": "hindi", "madhhab": "Hanafi", "interests": ["Fiqh", "Tafsir"]}'
   ```

### Chat with Memory

Send a POST request to the chat endpoint with a JSON body:
```json
{
  "message": "Namaz chhutt jaye to kya karna chahiye?",
  "session_id": "unique-session-id"
}
```

Authenticated users will receive personalized responses based on their preferences and memory.