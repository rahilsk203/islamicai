import { IslamicPrompt } from './islamic-prompt.js';

console.log('Testing IslamicPrompt import...');

try {
  const prompt = new IslamicPrompt();
  console.log('IslamicPrompt instantiated successfully!');
  console.log('Class structure is correct.');
} catch (error) {
  console.error('Error instantiating IslamicPrompt:', error.message);
}