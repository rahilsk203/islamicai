/**
 * Test script for ContextIntegrator to verify DSA-based intelligent context integration
 */
import { ContextIntegrator } from './context-integrator.js';

async function testContextIntegration() {
  console.log('Testing DSA-based intelligent context integration...\n');
  
  const contextIntegrator = new ContextIntegrator();
  
  // Test Case 1: Current message with no contextual connection
  console.log('Test Case 1: Current message with no contextual connection');
  const currentMessage1 = 'What is the meaning of Surah Al-Fatiha?';
  const pastContext1 = [
    { content: 'Yesterday we discussed the importance of prayer in Islam.', type: 'message' },
    { content: 'Can you explain the concept of Zakat?', type: 'message' }
  ];
  
  const analysis1 = contextIntegrator.analyzeContextualConnections(currentMessage1, pastContext1);
  const integration1 = contextIntegrator.integrateContext(currentMessage1, pastContext1, analysis1);
  
  console.log(`Current message weight: ${(integration1.weightedContext.currentMessage.weight * 100).toFixed(1)}%`);
  console.log(`Past context weight: ${(integration1.weightedContext.overallWeights.pastContext * 100).toFixed(1)}%`);
  console.log(`Integration strategy: ${integration1.integrationStrategy}`);
  console.log(`Has direct reference: ${analysis1.hasDirectReference}`);
  console.log(`Connection score: ${analysis1.connectionScore.toFixed(2)}`);
  console.log('---\n');
  
  // Test Case 2: Current message with direct reference to past context
  console.log('Test Case 2: Current message with direct reference to past context');
  const currentMessage2 = 'You mentioned the importance of prayer earlier. Can you elaborate on the proper way to perform Wudu?';
  const pastContext2 = [
    { content: 'Prayer is one of the five pillars of Islam and should be performed five times a day.', type: 'message' },
    { content: 'The Quran is the holy book of Islam, revealed to Prophet Muhammad (PBUH).', type: 'message' }
  ];
  
  const analysis2 = contextIntegrator.analyzeContextualConnections(currentMessage2, pastContext2);
  const integration2 = contextIntegrator.integrateContext(currentMessage2, pastContext2, analysis2);
  
  console.log(`Current message weight: ${(integration2.weightedContext.currentMessage.weight * 100).toFixed(1)}%`);
  console.log(`Past context weight: ${(integration2.weightedContext.overallWeights.pastContext * 100).toFixed(1)}%`);
  console.log(`Integration strategy: ${integration2.integrationStrategy}`);
  console.log(`Has direct reference: ${analysis2.hasDirectReference}`);
  console.log(`Connection score: ${analysis2.connectionScore.toFixed(2)}`);
  console.log('---\n');
  
  // Test Case 3: Current message with semantic similarity to past context
  console.log('Test Case 3: Current message with semantic similarity to past context');
  const currentMessage3 = 'How should one fast during Ramadan?';
  const pastContext3 = [
    { content: 'Fasting in Islam is called Sawm and is one of the five pillars.', type: 'message' },
    { content: 'Charity (Zakat) is obligatory for those who can afford it.', type: 'message' }
  ];
  
  const analysis3 = contextIntegrator.analyzeContextualConnections(currentMessage3, pastContext3);
  const integration3 = contextIntegrator.integrateContext(currentMessage3, pastContext3, analysis3);
  
  console.log(`Current message weight: ${(integration3.weightedContext.currentMessage.weight * 100).toFixed(1)}%`);
  console.log(`Past context weight: ${(integration3.weightedContext.overallWeights.pastContext * 100).toFixed(1)}%`);
  console.log(`Integration strategy: ${integration3.integrationStrategy}`);
  console.log(`Has direct reference: ${analysis3.hasDirectReference}`);
  console.log(`Semantic similarity: ${analysis3.semanticSimilarity.toFixed(2)}`);
  console.log(`Connection score: ${analysis3.connectionScore.toFixed(2)}`);
  console.log('---\n');
  
  // Test Case 4: Urgent question that should prioritize current message
  console.log('Test Case 4: Urgent question that should prioritize current message');
  const currentMessage4 = 'I need help understanding this Hadith immediately!';
  const pastContext4 = [
    { content: 'We discussed the life of Prophet Muhammad (PBUH) last week.', type: 'message' },
    { content: 'The pillars of Islam are Shahada, Salah, Zakat, Sawm, and Hajj.', type: 'message' }
  ];
  
  const analysis4 = contextIntegrator.analyzeContextualConnections(currentMessage4, pastContext4);
  const integration4 = contextIntegrator.integrateContext(currentMessage4, pastContext4, analysis4);
  
  console.log(`Current message weight: ${(integration4.weightedContext.currentMessage.weight * 100).toFixed(1)}%`);
  console.log(`Past context weight: ${(integration4.weightedContext.overallWeights.pastContext * 100).toFixed(1)}%`);
  console.log(`Integration strategy: ${integration4.integrationStrategy}`);
  console.log(`Urgency level: ${analysis4.urgencyLevel.toFixed(2)}`);
  console.log('---\n');
  
  // Performance metrics
  console.log('Performance Metrics:');
  const metrics = contextIntegrator.getPerformanceMetrics();
  console.log(`Analyses performed: ${metrics.analysesPerformed}`);
  console.log(`Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`Bloom filter size: ${metrics.bloomFilterSize}`);
  
  console.log('\nTest completed successfully!');
}

// Run the test
testContextIntegration().catch(console.error);