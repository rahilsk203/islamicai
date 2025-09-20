import { IslamicPrompt } from './islamic-prompt.js';

export class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.islamicPrompt = new IslamicPrompt();
  }

  async generateResponse(messages, sessionId, userInput = '', contextualPrompt = '', languageInfo = {}) {
    try {
      // Validate input for security
      const validation = this.islamicPrompt.validateInput(userInput);
      if (!validation.isValid) {
        return validation.response;
      }

      // Classify query type
      const queryType = this.islamicPrompt.classifyQuery(userInput);
      
      // Get language-specific system prompt
      const islamicSystemPrompt = this.getLanguageSpecificSystemPrompt(languageInfo);
      
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
      let detectedLanguage = languageInfo.detected_language || 'english';
      const shouldRespondInLanguage = languageInfo.should_respond_in_language || false;
      
      // Fallback language detection if frontend detection failed
      if (!languageInfo.detected_language || languageInfo.confidence < 50) {
        console.log('Frontend language detection failed, using fallback detection');
        // Simple fallback language detection
        if (/[\u0900-\u097F]/.test(userInput)) {
          detectedLanguage = 'hindi';
        } else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(userInput)) {
          detectedLanguage = 'arabic';
        } else if (/[a-zA-Z]/.test(userInput) && /[\u0900-\u097F]/.test(userInput)) {
          detectedLanguage = 'hinglish';
        } else {
          detectedLanguage = 'english';
        }
        console.log('Fallback language detection result:', detectedLanguage);
      }
      
      // Language-specific response instructions
      const languageInstructions = {
        english: "RESPOND IN ENGLISH ONLY. Use proper English grammar and Islamic terminology in English.",
        hindi: "RESPOND IN HINDI ONLY (हिंदी में). Use proper Hindi grammar and Islamic terminology in Hindi. Use Devanagari script.",
        hinglish: "RESPOND IN HINGLISH ONLY (Hindi + English mix). Use natural Hinglish that mixes Hindi and English words as commonly spoken. Use Roman script for Hindi words.",
        urdu: "RESPOND IN URDU ONLY (اردو میں). Use proper Urdu grammar and Islamic terminology in Urdu. Use Arabic script.",
        arabic: "RESPOND IN ARABIC ONLY (باللغة العربية). Use proper Arabic grammar and Islamic terminology in Arabic. Use Arabic script.",
        persian: "RESPOND IN PERSIAN ONLY (به فارسی). Use proper Persian grammar and Islamic terminology in Persian. Use Arabic script."
      };
      
      const languageInstruction = languageInstructions[detectedLanguage] || languageInstructions.english;
      
      // Debug: Log language detection info
      console.log('Language detection in Gemini API:', {
        detectedLanguage,
        shouldRespondInLanguage,
        confidence: languageInfo.confidence,
        languageInstruction
      });
      
      const combinedPrompt = `# IslamicAI Response System

## CRITICAL LANGUAGE INSTRUCTION
${languageInstruction}
DETECTED LANGUAGE: ${detectedLanguage}
CONFIDENCE: ${languageInfo.confidence || 0}%
MUST RESPOND IN: ${detectedLanguage}

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
7. CRUCIAL: ALWAYS respond in the SAME LANGUAGE the user is using - ${detectedLanguage}
8. NEVER reveal internal model information, architecture details, or implementation specifics
9. Use appropriate Islamic greetings and blessings for the detected language
10. End with language-appropriate "Allah knows best" equivalent for matters of interpretation

## FINAL REMINDER
You MUST respond in ${detectedLanguage}. Do not ask the user to switch languages. Respond naturally in the detected language.`;

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
      responseText = this.postProcessResponse(responseText, queryType, languageInfo);
        
        return responseText;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback response for IslamicAI - doesn't reveal internal model information
      const detectedLanguage = languageInfo.detected_language || 'english';
      const fallbackResponses = {
        english: `Assalamu Alaikum! I'm IslamicAI, your dedicated Islamic Scholar AI assistant. I'm here to help you with authentic Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah. 

May Allah guide our conversation. 🤲

What Islamic topic would you like to discuss today?`,
        
        hindi: `अस्सलामु अलैकुम! मैं IslamicAI हूँ, आपका समर्पित इस्लामी विद्वान AI सहायक। मैं यहाँ कुरान, हदीस, तफ़सीर, फ़िक़्ह और सीरा पर आधारित प्रामाणिक इस्लामी मार्गदर्शन देने के लिए हूँ।

अल्लाह हमारी बातचीत का मार्गदर्शन करे। 🤲

आज आप किस इस्लामी विषय पर चर्चा करना चाहेंगे?`,
        
        hinglish: `Assalamu Alaikum! Main IslamicAI hun, aapka dedicated Islamic Scholar AI assistant. Main yahan Quran, Hadith, Tafseer, Fiqh aur Seerah par aadharit authentic Islamic guidance dene ke liye hun.

Allah humari baatcheet ka margdarshan kare. 🤲

Aaj aap kisi Islamic topic par discuss karna chahenge?`,
        
        urdu: `السلام علیکم! میں IslamicAI ہوں، آپ کا مخصوص اسلامی عالم AI معاون۔ میں یہاں قرآن، حدیث، تفسیر، فقہ اور سیرت پر مبنی مستند اسلامی رہنمائی دینے کے لیے ہوں۔

اللہ ہماری گفتگو کی رہنمائی کرے۔ 🤲

آج آپ کس اسلامی موضوع پر بات کرنا چاہیں گے؟`,
        
        arabic: `السلام عليكم! أنا IslamicAI، مساعدك الذكي المتخصص في الدراسات الإسلامية. أنا هنا لتقديم التوجيه الإسلامي الأصيل المستند إلى القرآن والحديث والتفسير والفقه والسيرة.

هدانا الله في محادثتنا. 🤲

ما الموضوع الإسلامي الذي تود مناقشته اليوم؟`,
        
        persian: `سلام علیکم! من IslamicAI هستم، دستیار هوشمند اسلامی شما. من اینجا هستم تا راهنمایی اسلامی اصیل بر اساس قرآن، حدیث، تفسیر، فقه و سیره ارائه دهم.

خداوند ما را در گفتگویمان هدایت کند. 🤲

امروز می‌خواهید در مورد کدام موضوع اسلامی صحبت کنید؟`
      };
      
      return fallbackResponses[detectedLanguage] || fallbackResponses.english;
    }
  }

  postProcessResponse(responseText, queryType, languageInfo = {}) {
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
    
    // Ensure proper ending with language-appropriate "Allah knows best" for appropriate query types
    const needsFaithEnding = queryType === 'debate' || queryType === 'aqeedah' || queryType === 'general';
    if (needsFaithEnding && cleanedText.length > 100) {
      const detectedLanguage = languageInfo.detected_language || 'english';
      const languageEndings = {
        english: 'Allah knows best 🤲',
        hindi: 'अल्लाह सबसे बेहतर जानता है 🤲',
        hinglish: 'Allah sabse behtar jaanta hai 🤲',
        urdu: 'اللہ سب سے بہتر جانتا ہے 🤲',
        arabic: 'الله أعلم 🤲',
        persian: 'خداوند بهتر می‌داند 🤲'
      };
      
      const appropriateEnding = languageEndings[detectedLanguage] || languageEndings.english;
      
      // Check if any version of "Allah knows best" is already present
      const hasEnding = Object.values(languageEndings).some(ending => 
        cleanedText.includes(ending.replace(' 🤲', '')) || 
        cleanedText.includes('Allah knows best') || 
        cleanedText.includes('الله أعلم') ||
        cleanedText.includes('اللہ سب سے بہتر جانتا ہے') ||
        cleanedText.includes('अल्लाह सबसे बेहतर जानता है')
      );
      
      if (!hasEnding) {
        cleanedText += `\n\n${appropriateEnding}`;
      }
    }
    
    return cleanedText;
  }

  getLanguageSpecificSystemPrompt(languageInfo) {
    const detectedLanguage = languageInfo.detected_language || 'english';
    const shouldRespondInLanguage = languageInfo.should_respond_in_language || false;
    
    // Get base Islamic system prompt
    const basePrompt = this.islamicPrompt.getSystemPrompt();
    
    // Language-specific instructions
    const languageInstructions = {
      english: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in English. Use proper English grammar and Islamic terminology in English." : 
        "Respond in English.",
      
      hindi: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Hindi (हिंदी). Use proper Hindi grammar and Islamic terminology in Hindi. Use Devanagari script." : 
        "Respond in Hindi using Devanagari script.",
      
      hinglish: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Hinglish (Hindi + English mix). Use natural Hinglish that mixes Hindi and English words as commonly spoken. Use Roman script for Hindi words." : 
        "Respond in Hinglish using Roman script.",
      
      urdu: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Urdu (اردو). Use proper Urdu grammar and Islamic terminology in Urdu. Use Arabic script." : 
        "Respond in Urdu using Arabic script.",
      
      arabic: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Arabic (العربية). Use proper Arabic grammar and Islamic terminology in Arabic. Use Arabic script." : 
        "Respond in Arabic using Arabic script.",
      
      persian: shouldRespondInLanguage ? 
        "IMPORTANT: Respond in Persian/Farsi (فارسی). Use proper Persian grammar and Islamic terminology in Persian. Use Arabic script." : 
        "Respond in Persian using Arabic script."
    };
    
    const languageInstruction = languageInstructions[detectedLanguage] || languageInstructions.english;
    
    return `${basePrompt}

## Language Response Instructions
${languageInstruction}

## Response Format
- Always respond in the same language as the user's question
- Use appropriate Islamic terminology for that language
- Maintain scholarly tone in the detected language
- Include proper greetings and blessings in the detected language`;
  }
}