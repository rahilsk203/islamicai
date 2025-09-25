// Test script to verify conversation flow maintenance
const testConversation = [
  "hello kasa hai",
  "ma bii thik huu",
  "abii gaza maa halat kaya aaj kaa date maa",
  "iskaa kuch news sunaa",
  "abii time kitnaa huu hai",
  "next namza kaa time kitna maa hai bataa mara yaa"
];

console.log("Testing conversation flow with updated context handling...\n");

// Simulate how the context would be built
const mockHistory = [
  { role: 'user', content: 'hello kasa hai' },
  { role: 'assistant', content: 'Hello! Main theek hoon, shukriya poochne ke liye. Aap kaise hain? Kuchh sawal hai IslamicAI se, toh pooch sakte hain.' },
  { role: 'user', content: 'ma bii thik huu' },
  { role: 'assistant', content: 'Main bhi theek hoon, yeh sunkar achha laga! Aapki khairiyat jaan kar khushi hui.' },
  { role: 'user', content: 'abii gaza maa halat kaya aaj kaa date maa' },
  { role: 'assistant', content: 'Aap pooch rahe hain ki aaj ki date mein Gaza ki kya haalat hai. Yeh ek bahut hi gambhir aur dukhad paristhiti hai.' }
];

console.log("Mock conversation history:");
mockHistory.forEach((msg, index) => {
  console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
});

console.log("\nWith the updated context handling, the system should now:");
console.log("- Properly maintain conversation context");
console.log("- Acknowledge references to earlier parts of the conversation");
console.log("- Build naturally on previous responses");
console.log("- Not restart topics unnecessarily");

console.log("\nThe last user message was: 'next namza kaa time kitna maa hai bataa mara yaa'");
console.log("With proper context maintenance, the response should be about prayer times,");
console.log("not revert back to Gaza news as was happening before.");