import { IslamicPrompt } from './islamic-prompt.js';
import { APIKeyManager } from './api-key-manager.js';
import { InternetDataProcessor } from './internet-data-processor.js';
import { PerformanceOptimizer } from './performance-optimizer.js';

export class GeminiAPI {
  constructor(apiKeys) {
    // Support both single key and multiple keys
    this.apiKeyManager = new APIKeyManager(apiKeys);
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.islamicPrompt = new IslamicPrompt();
    this.internetProcessor = new InternetDataProcessor();
    this.performanceOptimizer = new PerformanceOptimizer();
  }

  async generateResponse(messages, sessionId, userInput = '', contextualPrompt = '', languageInfo = {}, streamingOptions = { enableStreaming: true }, userIP = null) {
    const startTime = Date.now();
    
    try {
      // ⚡ Advanced DSA-based preprocessing for ultra-fast response
      console.log('🚀 Starting DSA-optimized query preprocessing...');
      const preprocessResult = await this.performanceOptimizer.preprocessQuery(
        userInput, 
        sessionId, 
        { timestamp: startTime, languageInfo, contextualPrompt }
      );
      
      // ⚡ Check for cached response (O(1) lookup)
      if (preprocessResult.cachedResponse) {
        console.log('⚡ Serving cached response (ultra-fast O(1) lookup)');
        return streamingOptions.enableStreaming ? 
          this.createStreamingCachedResponse(preprocessResult.cachedResponse) : 
          preprocessResult.cachedResponse;
      }
      // Validate input for security
      const validation = this.islamicPrompt.validateInput(userInput);
      if (!validation.isValid) {
        return streamingOptions.enableStreaming ? 
          this.createStreamingError(validation.response) : 
          validation.response;
      }

      // Process internet data if needed (with optimization hints)
      console.log('Processing query for internet data needs with DSA optimization...');
      const internetData = await this.internetProcessor.processQuery(userInput, {
        sessionId,
        languageInfo,
        contextualPrompt,
        optimizationHints: preprocessResult.queryHints
      }, userIP);

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
      let finalPrompt = contextualPrompt ? 
        `${contextualPrompt}\n\n${enhancedSystemPrompt}` : 
        enhancedSystemPrompt;
      
      // Add internet data if available
      if (internetData.needsInternetData && internetData.enhancedPrompt) {
        console.log('Integrating internet data into prompt');
        finalPrompt = `${finalPrompt}\n\n${internetData.enhancedPrompt}`;
      }
      
      // ⚡ Optimize prompt with DSA-based preprocessing results
      if (preprocessResult.promptOptimizations) {
        finalPrompt = await this.performanceOptimizer.optimizePrompt(
          finalPrompt, 
          preprocessResult.promptOptimizations
        );
        console.log('⚡ Applied DSA-based prompt optimizations');
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
      
      const combinedPrompt = `# IslamicAI Adaptive Response System

## CRITICAL ADAPTIVE LANGUAGE INSTRUCTION
${languageInstruction}

## ADAPTATION DETAILS
DETECTED LANGUAGE: ${detectedLanguage}
ADAPTATION TYPE: ${adaptationType}
CONFIDENCE: ${Math.round((languageInfo.confidence || 0) * 100)}%
USER PREFERENCE: ${languageInfo.user_preference || 'learning'}
MUST RESPOND IN: ${detectedLanguage}

## System Context
${finalPrompt}

## User Message
${userInput}

## Adaptive Response Requirements
1. Structure your response clearly with headings when appropriate
2. Provide evidence-based answers with references to Qur'an/Hadith
3. Use a respectful, scholarly tone appropriate for the detected language
4. Address the user's specific question directly
5. Include practical applications when relevant
6. For debate-style questions, use the Debate-Proof Response Framework
7. CRUCIAL: ALWAYS respond in the SAME LANGUAGE/STYLE the user is using - ${detectedLanguage}
8. NEVER reveal internal model information, architecture details, or implementation specifics
9. Use appropriate Islamic greetings and blessings for the detected language
10. End with language-appropriate "Allah knows best" equivalent for matters of interpretation
11. ADAPTIVE: If user switches language mid-conversation, immediately adapt to their new preference
12. LEARNING: Remember user's language preferences for future interactions

## FINAL ADAPTIVE REMINDER
You MUST respond in ${detectedLanguage}. This is an ADAPTIVE system that learns user preferences. 
Respond naturally in the detected language and maintain consistency with user's communication style.`;

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

      // Use streaming by default unless explicitly disabled
      if (streamingOptions.enableStreaming !== false) {
        console.log('Using streaming response (default mode)');
        return this.generateStreamingResponse(requestBody, streamingOptions);
      } else {
        console.log('Using direct response (streaming explicitly disabled)');
        console.log('Sending request to Gemini API:', JSON.stringify(requestBody, null, 2));

      // Use multi-API key system with retry logic
      const response = await this.makeAPIRequestWithRetry(requestBody);
      const data = response;
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let responseText = data.candidates[0].content.parts[0].text;
        
        // ⚡ Advanced DSA-based response optimization
        const optimizationContext = {
          userMessage: userInput,
          sessionId,
          internetData: internetData.data,
          processingTime: Date.now() - startTime,
          languageInfo,
          queryType
        };
        
        const optimizedResponse = await this.performanceOptimizer.optimizeResponse(
          responseText,
          optimizationContext
        );
        
        // Post-process response for better formatting - fix property access
        const optimizedContent = optimizedResponse?.optimizedResponse || optimizedResponse?.content || responseText;
        const finalResponse = this.postProcessResponse(optimizedContent, queryType, languageInfo);
        
        // ⚡ Cache optimized response for future O(1) retrieval
        await this.performanceOptimizer.cacheResponse(
          userInput,
          finalResponse,
          sessionId
        );
        
        console.log(`⚡ Response optimized: ${optimizedResponse.metrics.speedImprovement}% faster, length: ${finalResponse.length}`);
        return finalResponse;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      
      // ⚡ Use DSA-optimized error handling
      const optimizedError = await this.performanceOptimizer.handleError(
        error, 
        { userInput, sessionId, processingTime: Date.now() - (startTime || Date.now()) }
      );
      
      if (optimizedError.fallbackResponse) {
        console.log('⚡ Using DSA-optimized fallback response');
        return optimizedError.fallbackResponse;
      }
      
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
    // Clean up response formatting - add null/undefined check
    if (!responseText || typeof responseText !== 'string') {
      console.warn('postProcessResponse received invalid responseText:', responseText);
      return 'Sorry, there was an issue processing the response. Please try again.';
    }
    
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

  /**
   * Make API request with multi-key retry logic
   * @param {Object} requestBody - The request body
   * @returns {Promise<Object>} API response data
   */
  async makeAPIRequestWithRetry(requestBody) {
    let lastError = null;
    const maxRetries = this.apiKeyManager.maxRetries;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const apiKey = this.apiKeyManager.getNextKey();
      
      if (!apiKey) {
        throw new Error('No available API keys');
      }

      try {
        console.log(`Attempt ${attempt + 1}/${maxRetries} with API key: ${apiKey.substring(0, 10)}...`);
        
        const response = await fetch(this.baseUrl, {
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
   * Get performance optimizer statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return this.performanceOptimizer.getMetrics();
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
    const baseUrl = this.baseUrl;
    const postProcessResponse = this.postProcessResponse.bind(this);
    const streamTextInChunks = this.streamTextInChunks.bind(this);
    const createStreamingChunk = this.createStreamingChunk.bind(this);
    const performanceOptimizer = this.performanceOptimizer;

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
          
          const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify(requestBody),
          });

          console.log('Gemini API response status:', response.status);
          console.log('Gemini API response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error response:', errorText);
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Gemini API response data:', JSON.stringify(data, null, 2));
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let responseText = data.candidates[0].content.parts[0].text;
            
            // ⚡ Apply DSA-based streaming optimizations
            const optimizationContext = {
              isStreaming: true,
              userMessage: requestBody.contents[0].parts[0].text.split('## User Message\n')[1]?.split('\n## Adaptive Response Requirements')[0] || 'Unknown',
              processingTime: Date.now() - Date.now(),
              queryType: 'general',
              language: 'english',
              cacheKey: null,
              optimizations: ['streaming']
            };
            
            // Add null check for responseText before optimization
            if (!responseText || typeof responseText !== 'string') {
              console.warn('Invalid responseText for optimization:', responseText);
              responseText = 'Sorry, there was an issue with the response. Please try again.';
            }
            
            const optimizedResponse = await performanceOptimizer.optimizeResponse(
              responseText,
              optimizationContext
            );
            
            // Post-process response - fix property access and add null checks
            const optimizedContent = optimizedResponse?.optimizedResponse || optimizedResponse?.content || responseText;
            const finalResponse = postProcessResponse(optimizedContent, 'general', {});
            
            // Stream the response in chunks with DSA optimization
            await streamTextInChunks(finalResponse, controller, {
              chunkSize,
              delay,
              includeMetadata,
              optimized: true
            });
          } else {
            throw new Error('Invalid response format from Gemini API');
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
   * Stream text in chunks with configurable delay and DSA optimization
   * @param {string} text - Text to stream
   * @param {ReadableStreamDefaultController} controller - Stream controller
   * @param {Object} options - Streaming options
   */
  async streamTextInChunks(text, controller, options = {}) {
    const { chunkSize = 50, delay = 50, includeMetadata = true, optimized = false } = options;
    
    // Send initial metadata with optimization info
    if (includeMetadata) {
      const startChunk = this.createStreamingChunk({
        type: 'start',
        content: '',
        metadata: {
          totalLength: text.length,
          estimatedChunks: Math.ceil(text.length / chunkSize),
          timestamp: new Date().toISOString(),
          dsaOptimized: optimized
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
    return new ReadableStream({
      start(controller) {
        controller.enqueue(this.createStreamingChunk({
          type: 'error',
          content: errorMessage,
          timestamp: new Date().toISOString()
        }));
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
        
        // Convert to streaming format
        return new ReadableStream({
          start(controller) {
            controller.enqueue(this.createStreamingChunk({
              type: 'fallback',
              content: responseText,
              metadata: {
                fallback: true,
                timestamp: new Date().toISOString()
              }
            }));
            controller.close();
          }
        });
      } else {
        throw error;
      }
    }
  }
}