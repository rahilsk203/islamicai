# Troubleshooting IslamicAI Connection Issues

This document helps you troubleshoot common issues with the IslamicAI frontend-backend connection.

## Common Issues and Solutions

### 1. Chat Responses Not Showing (White Screen)

**Symptoms**: 
- Messages appear blank or white
- No response from AI
- Loading indicators not working

**Solutions**:
1. Check browser console for JavaScript errors (F12 → Console)
2. Verify backend is running on `http://127.0.0.1:8787`
3. Check network tab for failed API requests
4. Ensure CORS is properly configured

### 2. Send Button Not Working

**Symptoms**:
- Send button appears disabled
- Clicking send does nothing
- No new messages appear

**Solutions**:
1. Check if input field has text
2. Verify `isLoading` state is properly managed
3. Check for JavaScript errors in console
4. Ensure API functions are properly imported

### 3. Connection Refused Errors

**Symptoms**:
- "Failed to fetch" errors
- "Connection refused" messages
- Network errors in console

**Solutions**:
1. Start the backend service:
   ```bash
   # In the root islamicai directory (not islamicai/islamicai)
   npm run dev
   ```
2. Verify the backend is running on port 8787
3. Check firewall settings
4. Ensure no other service is using port 8787

## Debugging Steps

### 1. Check Backend Status
```bash
# Test if backend is accessible
curl -X POST http://127.0.0.1:8787?session_id=test \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### 2. Check Frontend Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### 3. Test API Connection
Use the ConnectionTest component or run:
```bash
npm run test-connection
```

## Configuration Files to Check

1. **API Base URL** (`src/utils/api.js`):
   ```javascript
   const API_BASE_URL = 'http://127.0.0.1:8787';
   ```

2. **Backend Configuration** (`wrangler.toml`):
   ```toml
   main = "src/index.js"
   compatibility_date = "2024-01-15"
   ```

## Browser-Specific Issues

### Chrome
- Clear browser cache and cookies
- Disable extensions temporarily
- Check for mixed content warnings

### Firefox
- Check tracking protection settings
- Verify CORS settings
- Check network settings

### Safari
- Enable Develop menu
- Check cross-origin restrictions
- Verify JavaScript is enabled

## Network Troubleshooting

1. **Check if backend is running**:
   ```bash
   netstat -an | grep 8787
   ```

2. **Test local connection**:
   ```bash
   telnet 127.0.0.1 8787
   ```

3. **Check for firewall issues**:
   - Windows: Check Windows Defender Firewall
   - Mac: Check System Preferences → Security & Privacy
   - Linux: Check iptables or ufw settings

## Development vs Production

### Development Mode
- Backend: `http://127.0.0.1:8787`
- Frontend: `http://localhost:5173`

### Production Mode
- Update `API_BASE_URL` in `src/utils/api.js`
- Ensure proper CORS configuration
- Check environment variables

## Contact Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify all services are running
3. Ensure proper network connectivity
4. Contact the development team with detailed error information