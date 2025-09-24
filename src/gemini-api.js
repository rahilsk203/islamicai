import { IslamicPrompt } from './islamic-prompt.js';
import { APIKeyManager } from './api-key-manager.js';
import { InternetDataProcessor } from './internet-data-processor.js';

export class GeminiAPI {
  constructor(apiKeys) {
    // Support both single key and multiple keys
    this.apiKeyManager = new APIKeyManager(apiKeys);
    // Configure model and endpoints (stream and non-stream)
    this.modelId = 'gemini-2.5-flash-lite';
    this.nonStreamingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;
    this.streamingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:streamGenerateContent`;
    this.islamicPrompt = new IslamicPrompt(); // Use the enhanced prompt
    this.internetProcessor = new InternetDataProcessor();
  }

  async generateResponse(messages, sessionId, userInput = '', contextualPrompt = '', languageInfo = {}, streamingOptions = { enableStreaming: true }, userIP = null) {
    try {
      // Validate input for security
      const validation = this.islamicPrompt.validateInput(userInput);
      if (!validation.isValid) {
        return streamingOptions.enableStreaming ? 
          this.createStreamingError(validation.response) : 
          validation.response;
      }

      // Process internet data if needed with enhanced logging
      console.log(`Processing query for internet data needs: "${userInput}"`);
      const internetData = await this.internetProcessor.processQuery(userInput, {
        sessionId,
        languageInfo,
        contextualPrompt
      }, userIP);
      
      // Log internet data processing results
      console.log('Internet data processing results:', {
        needsInternetData: internetData.needsInternetData,
        reason: internetData.reason,
        hasData: !!internetData.data,
        hasEnhancedPrompt: !!internetData.enhancedPrompt,
        searchResults: internetData.searchResults ? {
          success: internetData.searchResults.success,
          resultsCount: internetData.searchResults.results?.length || 0,
          isAdvancedSearch: internetData.searchResults.fromCache !== undefined
        } : null
      });

      // Classify query type
      const queryType = this.islamicPrompt.classifyQuery(userInput);
      
      // Performance optimized: Only generate necessary prompts
      let finalPrompt = '';
      
      // Add contextual prompt if provided (from session history)
      if (contextualPrompt) {
        finalPrompt = contextualPrompt;
      }
      
      // Add internet data if available and enhance with advanced search context
      if (internetData.needsInternetData && internetData.enhancedPrompt) {
        console.log('Integrating internet data into prompt');
        finalPrompt = finalPrompt ? 
          `${finalPrompt}\n\n${internetData.enhancedPrompt}` : 
          internetData.enhancedPrompt;
      }
      
      // Use adaptive language detection with enhanced instructions
      let detectedLanguage = languageInfo.detected_language || 'english';
      const shouldRespondInLanguage = languageInfo.should_respond_in_language || false;
      const adaptationType = languageInfo.adaptation_type || 'default';
      const responseInstructions = languageInfo.response_instructions || {};
      
      // Use adaptive response instructions if available, otherwise fallback to default
      let languageInstruction;
      if (responseInstructions.instruction) {
        languageInstruction = responseInstructions.instruction;
      } else {
        // Fallback language instructions
        const languageInstructions = {
          english: "RESPOND IN ENGLISH ONLY. Use proper English grammar and Islamic terminology in English.",
          hindi: "RESPOND IN HINDI ONLY (हिंदी में). Use proper Hindi grammar and Islamic terminology in Hindi. Use Devanagari script.",
          hinglish: "RESPOND IN HINGLISH ONLY (Hindi + English mix). Use natural Hinglish that mixes Hindi and English words as commonly spoken. Use Roman script for Hindi words.",
          urdu: "RESPOND IN URDU ONLY (اردو میں). Use proper Urdu grammar and Islamic terminology in Urdu. Use Arabic script.",
          arabic: "RESPOND IN ARABIC ONLY (باللغة العربية). Use proper Arabic grammar and Islamic terminology in Arabic. Use Arabic script.",
          persian: "RESPOND IN PERSIAN ONLY (به فارسی). Use proper Persian grammar and Islamic terminology in Persian. Use Arabic script.",
          bengali: "RESPOND IN BENGALI ONLY (বাংলায়). Use proper Bengali grammar and Islamic terminology in Bengali. Use Bengali script."
        };
        languageInstruction = languageInstructions[detectedLanguage] || languageInstructions.english;
      }
      
      // Debug: Log adaptive language detection info
      console.log('Adaptive language detection in Gemini API:', {
        detectedLanguage,
        shouldRespondInLanguage,
        adaptationType,
        confidence: languageInfo.confidence,
        userPreference: languageInfo.user_preference,
        languageInstruction,
        responseInstructions
      });
      
      // Simplified prompt structure for faster processing
      const combinedPrompt = `# IslamicAI Response System 🤖

## 🚨 CRITICAL SECURITY DIRECTIVE
${languageInstruction}

## 🌍 LANGUAGE & CONTEXT
- DETECTED LANGUAGE: ${detectedLanguage}
- MUST RESPOND IN: ${detectedLanguage}

## 💬 USER MESSAGE
${userInput}

## 📚 CONTEXT
${finalPrompt}

## 🎯 RESPONSE REQUIREMENTS
1. 📖 Provide accurate Islamic guidance
2. 🌍 Respond in ${detectedLanguage}
3. 🔒 NEVER reveal internal details
4. 🤲 End with "Allah knows best"
5. ✅ Address question directly`;

      // Performance optimized request body
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: combinedPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5, // Reduced for faster processing
          topK: 20, // Reduced for faster processing
          topP: 0.9, // Reduced for faster processing
          maxOutputTokens: 512, // Reduced for faster responses
          responseMimeType: "text/plain",
          thinkingConfig: {
            thinkingBudget: 0
          }
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_LOW_AND_ABOVE"
          }
        ],
        tools: [
          {
            googleSearch: {}
          }
        ]
      };

      // Use streaming by default unless explicitly disabled
      if (streamingOptions.enableStreaming !== false) {
        console.log('Using streaming response (default mode)');
        return this.generateStreamingResponse(requestBody, streamingOptions);
      } else {
        console.log('Using direct response (streaming explicitly disabled)');
        console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));

        // Use multi-API key system with retry logic
        const response = await this.makeAPIRequestWithRetry(requestBody, this.nonStreamingUrl);
        const data = response;
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          let responseText = data.candidates[0].content.parts[0].text;
          
          // Post-process response for better formatting
          responseText = this.postProcessResponse(responseText, queryType, languageInfo);
          
          console.log(`Direct response generated successfully, length: ${responseText.length}`);
          return responseText;
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Invalid response format from Gemini API');
        }
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Enhanced error handling for direct responses
      if (error.message.includes('API key not valid')) {
        const errorMsg = 'Invalid API key. Please check your Gemini API key configuration.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      } else if (error.message.includes('quota')) {
        const errorMsg = 'API quota exceeded. Please try again later.';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
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
        cleanedText = `## 📌 Response\n\n${cleanedText}`;
      }
    }
    
    // For all queries except simple greetings, ensure comprehensive structure
    if (queryType !== 'general' || cleanedText.length > 200) {
      // Check if response has comprehensive structure
      const hasComprehensiveStructure = 
        cleanedText.includes('## 📌') || 
        cleanedText.includes('## 📚') || 
        cleanedText.includes('## 💡') || 
        cleanedText.includes('## 🌟') ||
        cleanedText.includes('## Key Takeaways') ||
        cleanedText.includes('## Final Reflection');
      
      // If not comprehensive, encourage more detailed response
      if (!hasComprehensiveStructure && cleanedText.length > 300) {
        // Add a note to encourage more comprehensive response
        cleanedText += `

## 📝 Additional Insights

For a more comprehensive understanding of this topic, consider exploring related aspects such as historical context, different scholarly perspectives, and practical applications in daily life. May Allah increase us in knowledge and understanding. 🤲`;
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

  /**
   * Make API request with multi-key retry logic
   * @param {Object} requestBody - The request body
   * @returns {Promise<Object>} API response data
   */
  async makeAPIRequestWithRetry(requestBody) {
    return await this._makeAPIRequestWithRetryToUrl(requestBody, this.nonStreamingUrl);
  }

  /**
   * Make API request with multi-key retry logic to a specific URL
   * @param {Object} requestBody - The request body
   * @param {string} targetUrl - Full URL to call
   * @returns {Promise<Object>} API response data
   */
  async _makeAPIRequestWithRetryToUrl(requestBody, targetUrl) {
    let lastError = null;
    const maxRetries = this.apiKeyManager.maxRetries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const apiKey = this.apiKeyManager.getNextKey();
      
      if (!apiKey) {
        throw new Error('No available API keys');
      }

      try {
        console.log(`Attempt ${attempt + 1}/${maxRetries} with API key: ${apiKey.substring(0, 10)}...`);
        
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API key ${apiKey.substring(0, 10)}... failed: ${response.status} ${response.statusText}`);
          
          // Mark key as failed
          this.apiKeyManager.markKeyFailed(apiKey, `${response.status} ${response.statusText}`);
          
          // If it's a rate limit error, wait before retrying
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.apiKeyManager.retryDelay * (attempt + 1);
            console.log(`Rate limited, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          lastError = new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
          continue;
        }

        const data = await response.json();
        
        // Mark key as successful
        this.apiKeyManager.markKeySuccess(apiKey);
        
        console.log('Gemini API Response:', JSON.stringify(data, null, 2));
        return data;

      } catch (error) {
        console.error(`API key ${apiKey.substring(0, 10)}... error:`, error.message);
        this.apiKeyManager.markKeyFailed(apiKey, error.message);
        lastError = error;
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = this.apiKeyManager.retryDelay * Math.pow(2, attempt);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    console.error('All API keys failed. Key stats:', this.apiKeyManager.getKeyStats());
    throw lastError || new Error('All API keys failed');
  }

  /**
   * Get API key statistics
   * @returns {Object} Key statistics
   */
  getKeyStats() {
    return this.apiKeyManager.getKeyStats();
  }

  /**
   * Reset failed keys
   */
  resetFailedKeys() {
    this.apiKeyManager.resetFailedKeys();
  }

  /**
   * Generate streaming response using Gemini API
   * @param {Object} requestBody - The request body
   * @param {Object} streamingOptions - Streaming configuration
   * @returns {ReadableStream} Streaming response
   */
  async generateStreamingResponse(requestBody, streamingOptions = {}) {
    const {
      chunkSize = 50,
      delay = 50,
      includeMetadata = true
    } = streamingOptions;

    // Capture references to avoid context issues
    const apiKeyManager = this.apiKeyManager;
    const streamingUrl = this.streamingUrl;
    const postProcessResponse = this.postProcessResponse.bind(this);
    const streamTextInChunks = this.streamTextInChunks.bind(this);
    const createStreamingChunk = this.createStreamingChunk.bind(this);

    // Create a readable stream for streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get API key - ensure apiKeyManager is available
          if (!apiKeyManager) {
            console.error('APIKeyManager not initialized');
            throw new Error('APIKeyManager not initialized');
          }
          
          const apiKey = apiKeyManager.getNextKey();
          if (!apiKey) {
            throw new Error('No available API keys');
          }

          // Make streaming request to Gemini API
          console.log('Making request to Gemini API with key:', apiKey.substring(0, 10) + '...');
          console.log('Request body:', JSON.stringify(requestBody, null, 2));
          
          const response = await fetch(streamingUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify(requestBody),
          });

          console.log('Gemini API response status:', response.status);
          const respHeaders = Object.fromEntries(response.headers.entries());
          console.log('Gemini API response headers:', respHeaders);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error response:', errorText);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          // If server returned a single JSON payload (non-SSE), parse and emit directly
          const contentType = (respHeaders['content-type'] || '').toLowerCase();
          if (contentType.includes('application/json') && !contentType.includes('event-stream')) {
            try {
              const jsonData = await response.json();
              const texts = (function extract(json) {
                const arr = [];
                try {
                  const candidates = json.candidates || json.candidate ? (json.candidates || [json.candidate]) : null;
                  if (candidates && candidates.length > 0) {
                    const cand = candidates[0];
                    const parts = cand.content && cand.content.parts ? cand.content.parts : (cand.content ? [cand.content] : []);
                    for (const p of parts) {
                      if (typeof p.text === 'string') arr.push(p.text);
                    }
                  }
                  if (typeof json.text === 'string') arr.push(json.text);
                } catch (_) {}
                return arr;
              })(jsonData);

              const combined = texts.join('');
              if (includeMetadata) {
                const startChunk = createStreamingChunk({ type: 'start', content: '', metadata: { timestamp: new Date().toISOString() } });
                controller.enqueue(new TextEncoder().encode(startChunk));
              }
              if (combined) {
                let finalText = postProcessResponse(combined, 'general', {});
                const streamChunk = createStreamingChunk({ type: 'content', content: finalText, metadata: { timestamp: new Date().toISOString() } });
                controller.enqueue(new TextEncoder().encode(streamChunk));
              } else {
                const streamChunk = createStreamingChunk({ type: 'content', content: '', metadata: { timestamp: new Date().toISOString() } });
                controller.enqueue(new TextEncoder().encode(streamChunk));
              }
              if (includeMetadata) {
                const endChunk = createStreamingChunk({ type: 'end', content: '', metadata: { completed: true, timestamp: new Date().toISOString() } });
                controller.enqueue(new TextEncoder().encode(endChunk));
              }
              return;
            } catch (e) {
              console.warn('Failed to parse JSON as non-stream; falling back to stream reader');
            }
          }

          // Stream parse the response from Gemini streamGenerateContent (SSE/NDJSON)
          const reader = response.body.getReader();
          const textDecoder = new TextDecoder();
          let aggregated = '';
          let rawCollected = '';
          let started = false;

          // Send initial metadata
          if (includeMetadata) {
            const startChunk = createStreamingChunk({ type: 'start', content: '', metadata: { timestamp: new Date().toISOString() } });
            controller.enqueue(new TextEncoder().encode(startChunk));
            started = true;
          }

          const emitContent = (text) => {
            if (!text) return;
            aggregated += text;
            const streamChunk = createStreamingChunk({ type: 'content', content: text, metadata: { timestamp: new Date().toISOString() } });
            controller.enqueue(new TextEncoder().encode(streamChunk));
          };

          const extractTexts = (obj) => {
            // Try to pull out any text fragments from typical Gemini responses
            try {
              if (!obj) return [];
              const out = [];
              const candidates = obj.candidates || obj.candidate ? (obj.candidates || [obj.candidate]) : null;
              if (candidates && candidates.length > 0) {
                const cand = candidates[0];
                const parts = cand.content && cand.content.parts ? cand.content.parts : (cand.content ? [cand.content] : []);
                for (const p of parts) {
                  if (typeof p.text === 'string') out.push(p.text);
                  if (typeof p.inlineData === 'string') out.push(p.inlineData);
                }
              }
              // Some events may carry a top-level text/delta
              if (typeof obj.text === 'string') out.push(obj.text);
              if (obj.delta && typeof obj.delta === 'string') out.push(obj.delta);
              return out;
            } catch (_) {
              return [];
            }
          };

          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkStr = textDecoder.decode(value, { stream: true });
            rawCollected += chunkStr;
            buffer += chunkStr;

            // Split on newlines to handle SSE/NDJSON style
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              let jsonStr = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
              try {
                const obj = JSON.parse(jsonStr);
                const texts = extractTexts(obj);
                for (const t of texts) emitContent(t);
              } catch (e) {
                // Not JSON, ignore
              }
            }
          }

          // If nothing emitted via streaming, try parsing the full body as JSON
          if (!aggregated) {
            let parsed;
            try {
              const tryStr = buffer && buffer.trim() ? buffer : rawCollected;
              parsed = tryStr && tryStr.trim() ? JSON.parse(tryStr) : null;
            } catch (_) {
              parsed = null;
            }
            if (parsed) {
              const texts = extractTexts(parsed);
              if (texts.length > 0) {
                for (const t of texts) emitContent(t);
              }
            }
          }

          // Post-process the aggregated response at the end (whether streamed or parsed once)
          if (aggregated) {
            const finalText = postProcessResponse(aggregated, 'general', {});
            if (finalText !== aggregated) {
              const delta = finalText.slice(aggregated.length);
              if (delta) emitContent(delta);
            }
          } else {
            // As a final fallback, call non-streaming endpoint and emit once
            try {
              const fallbackData = await apiKeyManager ? (await (async () => {
                const apiKey = apiKeyManager.getNextKey();
                if (!apiKey) throw new Error('No available API keys');
                const resp = await fetch(streamingUrl.replace(':streamGenerateContent', ':generateContent'), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey,
                  },
                  body: JSON.stringify(requestBody),
                });
                if (!resp.ok) throw new Error(`Fallback non-streaming error: ${resp.status} ${resp.statusText}`);
                return await resp.json();
              })()) : null;
              if (fallbackData) {
                const texts = extractTexts(fallbackData);
                const combined = texts.join('');
                if (combined) {
                  emitContent(combined);
                }
              }
            } catch (e) {
              throw new Error('No content received from streaming API');
            }
          }

        } catch (error) {
          console.error('Streaming error:', error);
          const errorChunk = createStreamingChunk({
            type: 'error',
            content: 'Sorry, AI service is temporarily unavailable. Please try again.',
            timestamp: new Date().toISOString()
          });
          // Convert string to bytes
          controller.enqueue(new TextEncoder().encode(errorChunk));
        } finally {
          controller.close();
        }
      }
    });

    return stream;
  }

  /**
   * Stream text in chunks with configurable delay
   * @param {string} text - Text to stream
   * @param {ReadableStreamDefaultController} controller - Stream controller
   * @param {Object} options - Streaming options
   */
  async streamTextInChunks(text, controller, options = {}) {
    const { chunkSize = 50, delay = 50, includeMetadata = true } = options;
    
    // Send initial metadata
    if (includeMetadata) {
      const startChunk = this.createStreamingChunk({
        type: 'start',
        content: '',
        metadata: {
          totalLength: text.length,
          estimatedChunks: Math.ceil(text.length / chunkSize),
          timestamp: new Date().toISOString()
        }
      });
      controller.enqueue(new TextEncoder().encode(startChunk));
    }

    // Stream text in chunks
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      
      const streamChunk = this.createStreamingChunk({
        type: 'content',
        content: chunk,
        metadata: {
          chunkIndex: Math.floor(i / chunkSize),
          progress: Math.round((i / text.length) * 100),
          timestamp: new Date().toISOString()
        }
      });
      controller.enqueue(new TextEncoder().encode(streamChunk));

      // Add delay between chunks for realistic streaming effect
      if (delay > 0 && i + chunkSize < text.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Send completion metadata
    if (includeMetadata) {
      const endChunk = this.createStreamingChunk({
        type: 'end',
        content: '',
        metadata: {
          completed: true,
          timestamp: new Date().toISOString()
        }
      });
      controller.enqueue(new TextEncoder().encode(endChunk));
    }
  }

  /**
   * Create a streaming chunk with proper formatting
   * @param {Object} data - Chunk data
   * @returns {string} Formatted chunk
   */
  createStreamingChunk(data) {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  /**
   * Create streaming error response
   * @param {string} errorMessage - Error message
   * @returns {ReadableStream} Error stream
   */
  createStreamingError(errorMessage) {
    // Capture the method reference to avoid 'this' context issues
    const createStreamingChunk = (data) => this.createStreamingChunk(data);
    
    return new ReadableStream({
      start(controller) {
        const chunk = createStreamingChunk({
          type: 'error',
          content: errorMessage,
          timestamp: new Date().toISOString()
        });
        // Convert string to bytes using TextEncoder
        controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      }
    });
  }

  /**
   * Generate streaming response with fallback
   * @param {Object} requestBody - Request body
   * @param {Object} streamingOptions - Streaming options
   * @returns {ReadableStream} Streaming response
   */
  async generateStreamingResponseWithFallback(requestBody, streamingOptions = {}) {
    try {
      return await this.generateStreamingResponse(requestBody, streamingOptions);
    } catch (error) {
      console.error('Streaming fallback error:', error);
      
      // Fallback to non-streaming response
      const fallbackResponse = await this.makeAPIRequestWithRetry(requestBody);
      
      if (fallbackResponse.candidates && fallbackResponse.candidates[0] && fallbackResponse.candidates[0].content) {
        const responseText = fallbackResponse.candidates[0].content.parts[0].text;
        
        // Capture the method reference to avoid 'this' context issues
        const createStreamingChunk = (data) => this.createStreamingChunk(data);
        
        // Convert to streaming format
        return new ReadableStream({
          start(controller) {
            const chunk = createStreamingChunk({
              type: 'fallback',
              content: responseText,
              metadata: {
                fallback: true,
                timestamp: new Date().toISOString()
              }
            });
            // Convert string to bytes using TextEncoder
            controller.enqueue(new TextEncoder().encode(chunk));
            controller.close();
          }
        });
      } else {
        throw error;
      }
    }
  }
}