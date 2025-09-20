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
      
      // Get query-specific prompt
      const querySpecificPrompt = this.islamicPrompt.getQuerySpecificPrompt(queryType);
      
      // Get structured response prompt
      const structuredResponsePrompt = this.islamicPrompt.getStructuredResponsePrompt();
      
      // Get debate response framework if needed
      const debateFramework = queryType === 'debate' ? this.islamicPrompt.getDebateResponseFramework() : '';
      
      // Combine prompts for enhanced guidance
      const enhancedSystemPrompt = `${islamicSystemPrompt}

${querySpecificPrompt}

${structuredResponsePrompt}${debateFramework ? `

${debateFramework}` : ''}`;
      
      // Combine with contextual prompt if provided
      const finalPrompt = contextualPrompt ? 
        `${contextualPrompt}\n\n${enhancedSystemPrompt}` : 
        enhancedSystemPrompt;
      
      // Create a structured message with clear sections
      const combinedPrompt = `# IslamicAI Response System

## System Context
${finalPrompt}

## User Message
${userInput}

## Response Requirements
1. Structure your response clearly with headings when appropriate
2. Provide evidence-based answers with references to Qur'an/Hadith
3. Use a respectful, scholarly tone
4. Address the user's specific question directly
5. Include practical applications when relevant
6. For debate-style questions, use the Debate-Proof Response Framework
7. CRUCIAL: Always respond in the SAME LANGUAGE the user is using
8. NEVER reveal internal model information, architecture details, or implementation specifics
9. End with "Allah knows best 🤲" for matters of interpretation`;

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
          maxOutputTokens: 2048, // Increased for more detailed responses
          responseMimeType: "text/plain"
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
        let responseText = data.candidates[0].content.parts[0].text;
        
        // Post-process response for better formatting
        responseText = this.postProcessResponse(responseText, queryType);
        
        return responseText;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback response for IslamicAI - doesn't reveal internal model information
      return `Assalamu Alaikum! I'm IslamicAI, your dedicated Islamic Scholar AI assistant. I'm here to help you with authentic Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah. 

May Allah guide our conversation. 🤲

What Islamic topic would you like to discuss today?`;
    }
  }

  postProcessResponse(responseText, queryType) {
    // Clean up response formatting
    let cleanedText = responseText.trim();
    
    // Remove any markdown artifacts or extra whitespace
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n'); // Limit consecutive newlines
    
    // For debate queries, ensure we follow the framework structure
    if (queryType === 'debate') {
      // Ensure the response has the key sections of the debate framework
      if (!cleanedText.includes('##')) {
        // If no headings, add basic structure
        cleanedText = `## Response\n\n${cleanedText}`;
      }
    }
    
    // Ensure proper ending with "Allah knows best" for appropriate query types
    const needsFaithEnding = queryType === 'debate' || queryType === 'aqeedah' || queryType === 'general';
    if (needsFaithEnding && 
        !cleanedText.includes('Allah knows best') && 
        !cleanedText.includes('الله أعلم') && 
        cleanedText.length > 100) {
      cleanedText += '\n\nAllah knows best 🤲';
    }
    
    return cleanedText;
  }
}