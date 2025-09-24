import { InternetDataProcessor } from './internet-data-processor.js';
import { GeminiAPI } from './gemini-api.js';
import { AdvancedSessionManager } from './advanced-session-manager.js';
import { AdaptiveLanguageSystem } from './adaptive-language-system.js';

// Test performance optimizations
async function testPerformanceOptimizations() {
  console.log('Testing performance optimizations...');
  
  // Test 1: Internet Data Processor optimizations
  const internetProcessor = new InternetDataProcessor();
  console.log('Internet Data Processor settings:');
  console.log('- Max search results:', internetProcessor.processingRules.maxSearchResults);
  console.log('- Search timeout:', internetProcessor.processingRules.searchTimeout);
  console.log('- Cache TTL:', internetProcessor.processingRules.cacheTTL);
  console.log('- Al Jazeera news integration:', internetProcessor.processingRules.includeAlJazeeraNews);
  
  // Test 2: Language detection speed
  const languageSystem = new AdaptiveLanguageSystem();
  const startTime = Date.now();
  const languageResult = languageSystem.adaptLanguage('Assalamu Alaikum! Kaise ho aap?', 'test-session-1');
  const endTime = Date.now();
  console.log('\\nLanguage detection time:', endTime - startTime, 'ms');
  console.log('Detected language:', languageResult.detectedLanguage);
  console.log('Confidence:', languageResult.confidence);
  
  // Test 3: Session management optimizations
  const sessionManager = new AdvancedSessionManager({
    get: async () => null,
    put: async () => {},
    delete: async () => {}
  });
  console.log('\\nSession manager settings:');
  console.log('- Max history length:', sessionManager.maxHistoryLength);
  console.log('- Max memory items:', sessionManager.maxMemoryItems);
  console.log('- Cache capacity:', sessionManager.cacheCapacity);
  
  // Test 4: Web search optimizations
  const searchResult = await internetProcessor.webSearch.search('current prayer times', {
    maxResults: 3,
    timeout: 2000
  });
  console.log('\\nWeb search completed with', searchResult.results?.length || 0, 'results');
  
  console.log('\\n✅ Performance optimizations test completed!');
}

// Run the test
testPerformanceOptimizations().catch(console.error);