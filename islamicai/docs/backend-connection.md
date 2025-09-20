# Connecting the Frontend to the Backend

This document explains how to connect the IslamicAI React frontend to the Cloudflare Worker backend.

## Prerequisites

1. The Cloudflare Worker backend must be running
2. The backend should be accessible at `http://127.0.0.1:8787` (local development) or your deployed URL

## Backend Setup

1. Navigate to the root IslamicAI directory (not the `islamicai` frontend directory)
2. Run the backend using Wrangler:
   ```bash
   npm run dev
   ```
   This will start the Cloudflare Worker locally on port 8787

## Frontend Configuration

The frontend is already configured to connect to the backend. The connection settings are in:
- `src/utils/api.js` - Contains the API utility functions
- `API_BASE_URL` is set to `http://127.0.0.1:8787` for local development

## How the Connection Works

1. When a user sends a message, the frontend:
   - Generates a session ID
   - Sends the message and session ID to the backend via POST request
   - Receives the AI response from the backend
   - Displays the response in the chat interface

2. The backend processes the request using:
   - Gemini API for AI responses
   - Advanced session management for context
   - Intelligent memory system for conversation history

## Testing the Connection

1. Start the backend:
   ```bash
   # In the root islamicai directory (not islamicai/islamicai)
   npm run dev
   ```

2. Start the frontend:
   ```bash
   # In the islamicai/islamicai directory
   npm run dev
   ```

3. Open your browser to the frontend URL (typically http://localhost:5173)
4. Send a message and verify you get a response from the backend

## Troubleshooting

### Common Issues

1. **CORS Errors**: 
   - Make sure the backend is running and accessible
   - Check that the frontend is using the correct API URL

2. **Connection Refused**:
   - Ensure the backend is running on port 8787
   - Check that no firewall is blocking the connection

3. **Session Issues**:
   - Each conversation uses a unique session ID
   - Starting a new chat creates a new session

### Backend Response Format

The backend returns responses in this format:
```json
{
  "session_id": "session_abc123_1234567890",
  "reply": "This is the AI response",
  "history_summary": "Summary of conversation history",
  "user_profile": {},
  "memory_count": 5
}
```

## Production Deployment

For production deployment:
1. Update `API_BASE_URL` in `src/utils/api.js` to your deployed backend URL
2. Ensure CORS settings allow requests from your frontend domain
3. Configure any necessary environment variables

## API Utility Functions

The `src/utils/api.js` file provides these functions:
- `sendMessage(sessionId, message)` - Send a message to the backend
- `createNewSession()` - Generate a new session ID
- `getRecentChats()` - Retrieve recent chats from localStorage
- `saveChat(sessionId, title, preview)` - Save a chat to localStorage