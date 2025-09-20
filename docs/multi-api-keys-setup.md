# Multi-API Keys Setup for IslamicAI Backend

This document explains how to configure multiple Gemini API keys for better reliability and load balancing.

## Environment Variables

### Single API Key (Current)
```bash
GEMINI_API_KEY=your_single_api_key_here
```

### Multiple API Keys (Recommended)
```bash
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

## Features

### 🔄 Load Balancing
- **Round-robin distribution**: Requests are distributed evenly across available keys
- **Automatic failover**: If one key fails, automatically switches to the next
- **Smart retry logic**: Exponential backoff with rate limit handling

### 📊 Monitoring
- **Real-time statistics**: Track success/failure rates for each key
- **Health check endpoint**: Monitor API key status via `/health`
- **Automatic recovery**: Failed keys are retried periodically

### 🛡️ Error Handling
- **Rate limit handling**: Automatic retry with proper delays
- **Network error recovery**: Handles temporary network issues
- **Graceful degradation**: Falls back to available keys

## Setup Instructions

### 1. Get Multiple API Keys
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create multiple projects or use different accounts
3. Generate API keys for each project
4. Note down all the keys

### 2. Configure Environment Variables

#### For Cloudflare Workers (Production)
```bash
# In your Cloudflare Workers dashboard
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

#### For Local Development
```bash
# In your .env file or wrangler.toml
GEMINI_API_KEYS=key1,key2,key3,key4,key5
```

### 3. Deploy and Test
```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Test the health endpoint
curl https://your-worker.your-subdomain.workers.dev/health
```

## Health Check Endpoint

### GET /health
Returns the status of all API keys:

```json
{
  "status": "healthy",
  "apiKeys": {
    "total": 5,
    "available": 4,
    "stats": {
      "AIzaSyC123...": {
        "successes": 150,
        "failures": 2,
        "successRate": "98.68%",
        "isActive": true,
        "lastUsed": "2024-01-20T10:30:00.000Z"
      },
      "AIzaSyD456...": {
        "successes": 120,
        "failures": 5,
        "successRate": "96.00%",
        "isActive": true,
        "lastUsed": "2024-01-20T10:25:00.000Z"
      }
    }
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Best Practices

### 🔑 API Key Management
- **Use different projects**: Create separate Google AI Studio projects for each key
- **Monitor usage**: Keep track of quota usage for each key
- **Rotate keys**: Regularly rotate keys for security
- **Backup keys**: Store keys securely with proper access controls

### 📈 Performance Optimization
- **Start with 3-5 keys**: Good balance between reliability and management
- **Monitor health endpoint**: Set up alerts for key failures
- **Regular testing**: Test all keys periodically
- **Load distribution**: Keys are used in round-robin fashion

### 🛠️ Troubleshooting
- **Check health endpoint**: Monitor key status regularly
- **Review logs**: Check Cloudflare Workers logs for key failures
- **Test individual keys**: Verify each key works independently
- **Reset failed keys**: Use the reset function to retry failed keys

## Code Examples

### Using Multiple Keys in Code
```javascript
// The system automatically handles multiple keys
const geminiAPI = new GeminiAPI([
  'key1',
  'key2', 
  'key3'
]);

// Get statistics
const stats = geminiAPI.getKeyStats();
console.log('API Key Stats:', stats);

// Reset failed keys
geminiAPI.resetFailedKeys();
```

### Environment Variable Examples
```bash
# Single key (fallback)
GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz

# Multiple keys (recommended)
GEMINI_API_KEYS=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz,AIzaSyD2345678901bcdefghijklmnopqrstuvwxyz,AIzaSyE3456789012cdefghijklmnopqrstuvwxyz
```

## Benefits

### 🚀 Improved Reliability
- **99.9% uptime**: Multiple keys ensure service availability
- **Automatic failover**: No manual intervention needed
- **Rate limit protection**: Distributes load across keys

### 📊 Better Performance
- **Load balancing**: Even distribution of requests
- **Reduced latency**: Faster response times
- **Higher throughput**: More concurrent requests possible

### 🛡️ Enhanced Security
- **Key rotation**: Easy to rotate individual keys
- **Isolated failures**: One compromised key doesn't affect others
- **Audit trail**: Track usage per key

## Monitoring and Alerts

### Key Metrics to Monitor
- **Success rate per key**: Should be >95%
- **Available keys**: Should always have at least 2
- **Response times**: Should be consistent across keys
- **Error rates**: Should be minimal

### Recommended Alerts
- **Key failure rate >10%**: Investigate specific key issues
- **Available keys <2**: Add more keys or investigate
- **All keys failed**: Critical issue requiring immediate attention
- **Rate limit errors**: May need more keys or better distribution

This multi-API key system ensures your IslamicAI backend is highly reliable and can handle high traffic loads efficiently! 🎉
