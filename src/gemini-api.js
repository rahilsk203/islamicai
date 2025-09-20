import { IslamicPrompt } from './islamic-prompt.js';

export class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.islamicPrompt = new IslamicPrompt();
  }

  async generateResponse(messages, sessionId, userInput = '', contextualPrompt = '') {
    try {
      // Validate input for security
      const validation = this.islamicPrompt.validateInput(userInput);
      if (!validation.isValid) {
        return validation.response;
      }

      // Classify query type
      const queryType = this.islamicPrompt.classifyQuery(userInput);
      
      // Get Islamic system prompt
      const islamicSystemPrompt = this.islamicPrompt.getSystemPrompt();
      
      // Combine with contextual prompt if provided
      const enhancedPrompt = contextualPrompt ? 
        `${contextualPrompt}\n\n${islamicSystemPrompt}` : 
        islamicSystemPrompt;
      
      // Create a single message with enhanced prompt + user input
      const combinedPrompt = `${enhancedPrompt}\n\nUser Message: ${userInput}`;
      
      const requestBody = {
        contents: [
          {
            parts: [{ text: combinedPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API Response:', JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback response for IslamicAI
      return `Assalamu Alaikum! I apologize, but I'm experiencing technical difficulties with the AI service. Please try again in a moment. 

In the meantime, I can tell you that IslamicAI is designed to provide authentic Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah. May Allah guide us in our conversations. 🤲

Please try your question again shortly.`;
    }
  }
}
