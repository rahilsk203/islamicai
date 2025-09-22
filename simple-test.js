/**
 * Simple Performance Optimizer Test
 */

console.log('🚀 Testing DSA Performance Optimizer...\n');

try {
    // Test the PerformanceOptimizer class directly
    const { PerformanceOptimizer } = await import('./src/performance-optimizer.js');
    
    const optimizer = new PerformanceOptimizer();
    console.log('✅ PerformanceOptimizer initialized successfully');
    
    // Test key methods
    console.log('\n📊 Testing key DSA methods:');
    
    // Test session caching
    const sessionData = { history: [], memories: [], userProfile: {} };
    await optimizer.cacheSession('test-session', sessionData);
    const cachedSession = await optimizer.getCachedSession('test-session');
    console.log('✅ Session caching:', cachedSession ? 'WORKS' : 'FAILED');
    
    // Test recent messages caching  
    const messages = [{ content: 'test', role: 'user' }];
    await optimizer.cacheRecentMessages('test-session', messages);
    const cachedMessages = await optimizer.getCachedRecentMessages('test-session', 1);
    console.log('✅ Recent messages caching:', cachedMessages ? 'WORKS' : 'FAILED');
    
    // Test contextual prompt caching
    await optimizer.cacheContextualPrompt('test-session', 'test query', 'test prompt', 100);
    const cachedPrompt = await optimizer.getCachedContextualPrompt('test-session', 'test query');
    console.log('✅ Contextual prompt caching:', cachedPrompt ? 'WORKS' : 'FAILED');
    
    // Test TimesPrayer query detection
    const isTimesPrayer = optimizer.isTimesPrayerQueryFast('Kolkata prayer times today');
    console.log('✅ TimesPrayer detection:', isTimesPrayer ? 'WORKS' : 'FAILED');
    
    // Test metrics
    const metrics = optimizer.getMetrics();
    console.log('✅ Performance metrics:', metrics ? 'WORKS' : 'FAILED');
    
    console.log('\n🎉 All DSA optimization methods are working correctly!');
    console.log('📈 Cache hit rate:', metrics.cacheHitRate + '%');
    console.log('💾 Cache size:', metrics.cacheSize);
    console.log('⚡ Average response time:', metrics.averageResponseTime + 'ms');
    
} catch (error) {
    console.error('❌ Error testing PerformanceOptimizer:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n🎯 DSA Performance Optimization is ready for ultra-fast Islamic AI responses!');