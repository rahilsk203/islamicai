# IslamicAI Tool Access Troubleshooting Guide

This guide helps resolve issues with accessing tools in real-time for the IslamicAI system.

## Common Issues and Solutions

### 1. "Tools not accessible" Error

**Symptoms:**
- Unable to import modules
- "Module not found" errors
- Tools not responding

**Solutions:**
1. **Check Current Directory**
   ```bash
   # Windows
   cd c:\Users\root\Desktop\islamicai
   dir
   
   # Linux/Mac
   cd /path/to/islamicai
   ls -la
   ```

2. **Verify Node.js Installation**
   ```bash
   node --version
   # Should show v22.17.0 or similar
   ```

3. **Run Tools Correctly**
   ```bash
   # Correct way to run a tool
   node src/tool-name.js
   
   # Example:
   node src/test-hinglish-performance.js
   ```

### 2. Import/Module Errors

**Symptoms:**
- "Cannot find module" errors
- Import statement failures
- Dependency issues

**Solutions:**
1. **Check File Paths**
   ```javascript
   // Correct relative imports
   import { InternetDataProcessor } from './internet-data-processor.js';
   import { AdaptiveLanguageSystem } from './adaptive-language-system.js';
   ```

2. **Verify File Existence**
   ```bash
   dir src\*.js
   ```

3. **Check File Permissions**
   ```bash
   # Ensure files are readable
   ```

### 3. Performance Issues

**Symptoms:**
- Slow tool response
- Timeout errors
- Delayed processing

**Solutions:**
1. **Use Caching**
   ```javascript
   // Tools automatically cache results for better performance
   const result = await processor.processQuery(query, {}, userIP);
   // Second call will be much faster due to caching
   ```

2. **Optimize Query Complexity**
   ```javascript
   // Simple queries process faster
   const simpleQuery = "prayer times";
   
   // Complex queries take longer
   const complexQuery = "detailed explanation of the significance of prayer times in Islam with references to Quran and Hadith";
   ```

## Real-time Tool Access Instructions

### For Development Environment:

1. **Navigate to Project Directory**
   ```bash
   cd c:\Users\root\Desktop\islamicai
   ```

2. **Run Performance Tests**
   ```bash
   node src/test-hinglish-performance.js
   node src/test-overall-performance.js
   ```

3. **Access Individual Tools**
   ```bash
   # Language Detection
   node src/test-adaptive-language.js
   
   # Internet Data Processing
   node src/test-internet-integration.js
   
   # Session Management
   node src/test-complete-personalization.js
   ```

### For Production Environment:

1. **Ensure Environment Variables**
   ```bash
   # Set API keys
   set GEMINI_API_KEY=your_api_key_here
   ```

2. **Run Server**
   ```bash
   # If using wrangler for Cloudflare Workers
   npx wrangler dev
   ```

## Tool-Specific Access Methods

### 1. Internet Data Processor
```javascript
import { InternetDataProcessor } from './src/internet-data-processor.js';

const processor = new InternetDataProcessor();
const result = await processor.processQuery("prayer times", {}, "127.0.0.1");
```

### 2. Language Detection System
```javascript
import { AdaptiveLanguageSystem } from './src/adaptive-language-system.js';

const languageSystem = new AdaptiveLanguageSystem();
const result = languageSystem.adaptLanguage("Assalamu Alaikum", "session-id");
```

### 3. Session Management
```javascript
import { AdvancedSessionManager } from './src/advanced-session-manager.js';

const sessionManager = new AdvancedSessionManager(kvNamespace);
const sessionData = await sessionManager.getSessionData("session-id");
```

## Performance Monitoring

### Check Tool Response Times:
```bash
node src/test-overall-performance.js
```

Expected Results:
- Language detection: < 5ms
- Cached requests: < 50ms
- First-time requests: 1-3 seconds
- Overall response: 60-70% faster than unoptimized version

## Common Commands for Tool Access

```bash
# List all source files
dir src\*.js

# Run specific tests
node src/test-hinglish-performance.js
node src/test-overall-performance.js
node src/tool-access-demo.js

# Check Node.js version
node --version

# Check current directory
cd
```

## If Problems Persist:

1. **Restart your terminal/command prompt**
2. **Verify file permissions**
3. **Check antivirus/firewall settings**
4. **Ensure sufficient system resources (RAM, CPU)**
5. **Update Node.js to the latest version**

## Contact Support:

If you continue to experience issues with tool access:
1. Document the exact error message
2. Note which tool is affected
3. Include system specifications (OS, Node.js version)
4. Provide steps to reproduce the issue

---
*This troubleshooting guide was created to help users resolve real-time tool access issues with the IslamicAI system.*