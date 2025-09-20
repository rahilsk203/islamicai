// Advanced Language Detection Utility for IslamicAI

/**
 * Detect the primary language of the input text
 * @param {string} text - The text to analyze
 * @returns {Object} Language detection result with confidence score
 */
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') {
    return { language: 'en', confidence: 0, script: 'latin' };
  }

  const cleanText = text.trim();
  
  // Language detection patterns with confidence scoring
  const patterns = {
    // Arabic script detection
    arabic: {
      pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
      weight: 3,
      script: 'arabic'
    },
    
    // Urdu/Hindi (Arabic script with some Latin)
    urdu: {
      pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
      weight: 2.5,
      script: 'arabic',
      additionalPattern: /[\u0627-\u064A\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BE\u06C1\u06D2]/g
    },
    
    // Hindi (Devanagari script)
    hindi: {
      pattern: /[\u0900-\u097F]/g,
      weight: 3,
      script: 'devanagari'
    },
    
    // English (Latin script)
    english: {
      pattern: /[a-zA-Z]/g,
      weight: 1,
      script: 'latin'
    },
    
    // Hinglish (Mixed Hindi-English)
    hinglish: {
      pattern: /[\u0900-\u097F]+[a-zA-Z]+|[a-zA-Z]+[\u0900-\u097F]+/g,
      weight: 2.5,
      script: 'mixed'
    },
    
    // Bengali
    bengali: {
      pattern: /[\u0980-\u09FF]/g,
      weight: 3,
      script: 'bengali'
    },
    
    // Turkish
    turkish: {
      pattern: /[çğıöşüÇĞIİÖŞÜ]/g,
      weight: 2,
      script: 'latin'
    },
    
    // Persian/Farsi
    persian: {
      pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
      weight: 2.8,
      script: 'arabic'
    }
  };

  // Calculate scores for each language
  const scores = {};
  const totalChars = cleanText.length;
  
  for (const [lang, config] of Object.entries(patterns)) {
    const matches = cleanText.match(config.pattern) || [];
    const score = (matches.length * config.weight) / totalChars;
    
    scores[lang] = {
      score,
      matches: matches.length,
      script: config.script
    };
  }

  // Find the language with highest score
  const detectedLang = Object.keys(scores).reduce((a, b) => 
    scores[a].score > scores[b].score ? a : b
  );

  const confidence = Math.min(scores[detectedLang].score * 100, 100);
  const script = scores[detectedLang].script;

  // Special handling for mixed languages
  if (detectedLang === 'hinglish' || (scores.english.score > 0.3 && scores.hindi.score > 0.3)) {
    return {
      language: 'hinglish',
      confidence: Math.max(confidence, 70),
      script: 'mixed',
      detectedLanguages: ['hindi', 'english']
    };
  }

  // Special handling for Arabic script languages
  if (script === 'arabic') {
    // Check for Urdu-specific characters
    if (scores.urdu.additionalPattern && cleanText.match(scores.urdu.additionalPattern)) {
      return {
        language: 'urdu',
        confidence: Math.max(confidence, 80),
        script: 'arabic'
      };
    }
    
    // Check for Persian-specific patterns
    const persianWords = ['است', 'که', 'در', 'از', 'با', 'برای', 'این', 'آن'];
    const persianMatches = persianWords.filter(word => cleanText.includes(word)).length;
    
    if (persianMatches > 0) {
      return {
        language: 'persian',
        confidence: Math.max(confidence, 75),
        script: 'arabic'
      };
    }
    
    // Default to Arabic
    return {
      language: 'arabic',
      confidence: Math.max(confidence, 70),
      script: 'arabic'
    };
  }

  return {
    language: detectedLang,
    confidence: Math.max(confidence, 60),
    script,
    scores
  };
};

/**
 * Get language-specific response templates
 * @param {string} language - The detected language
 * @returns {Object} Language-specific templates
 */
export const getLanguageTemplates = (language) => {
  const templates = {
    english: {
      greeting: "Assalamu Alaikum!",
      thinking: "IslamicAI is researching...",
      blessing: "May Allah guide us",
      scholar: "IslamicAI Scholar",
      error: "I apologize, but I'm having trouble understanding your question. Could you please rephrase it?",
      islamicScope: "I'm here to provide Islamic guidance based on Qur'an, Hadith, Tafseer, Fiqh, and Seerah."
    },
    
    hindi: {
      greeting: "अस्सलामु अलैकुम!",
      thinking: "IslamicAI शोध कर रहा है...",
      blessing: "अल्लाह हमारा मार्गदर्शन करे",
      scholar: "IslamicAI विद्वान",
      error: "मुझे माफ़ करना, मैं आपके प्रश्न को समझने में कठिनाई महसूस कर रहा हूँ। क्या आप कृपया इसे दोबारा कह सकते हैं?",
      islamicScope: "मैं कुरान, हदीस, तफ़सीर, फ़िक़्ह और सीरा पर आधारित इस्लामी मार्गदर्शन देने के लिए हूँ।"
    },
    
    hinglish: {
      greeting: "Assalamu Alaikum!",
      thinking: "IslamicAI research kar raha hai...",
      blessing: "Allah humara margdarshan kare",
      scholar: "IslamicAI Scholar",
      error: "Mujhe maaf karna, main aapke question ko samajhne mein kathinayi mahsoos kar raha hun. Kya aap kripya ise dobara keh sakte hain?",
      islamicScope: "Main Quran, Hadith, Tafseer, Fiqh aur Seerah par aadharit Islamic margdarshan dene ke liye hun."
    },
    
    urdu: {
      greeting: "السلام علیکم!",
      thinking: "IslamicAI تحقیق کر رہا ہے...",
      blessing: "اللہ ہماری رہنمائی کرے",
      scholar: "IslamicAI عالم",
      error: "مجھے معاف کریں، مجھے آپ کے سوال کو سمجھنے میں دشواری ہو رہی ہے۔ کیا آپ برائے کرم اسے دوبارہ کہہ سکتے ہیں؟",
      islamicScope: "میں قرآن، حدیث، تفسیر، فقہ اور سیرت پر مبنی اسلامی رہنمائی دینے کے لیے ہوں۔"
    },
    
    arabic: {
      greeting: "السلام عليكم!",
      thinking: "IslamicAI يبحث...",
      blessing: "هدانا الله",
      scholar: "IslamicAI عالم",
      error: "أعتذر، لكنني أواجه صعوبة في فهم سؤالك. هل يمكنك إعادة صياغته من فضلك؟",
      islamicScope: "أنا هنا لتقديم التوجيه الإسلامي المستند إلى القرآن والحديث والتفسير والفقه والسيرة."
    },
    
    persian: {
      greeting: "سلام علیکم!",
      thinking: "IslamicAI در حال تحقیق است...",
      blessing: "خداوند ما را هدایت کند",
      scholar: "IslamicAI عالم",
      error: "عذرخواهی می‌کنم، در درک سوال شما مشکل دارم. لطفاً دوباره بفرمایید؟",
      islamicScope: "من اینجا هستم تا راهنمایی اسلامی بر اساس قرآن، حدیث، تفسیر، فقه و سیره ارائه دهم."
    }
  };

  return templates[language] || templates.english;
};

/**
 * Enhance message with language detection and appropriate response
 * @param {string} message - The user message
 * @returns {Object} Enhanced message with language info
 */
export const enhanceMessageWithLanguage = (message) => {
  const detection = detectLanguage(message);
  const templates = getLanguageTemplates(detection.language);
  
  return {
    originalMessage: message,
    detectedLanguage: detection.language,
    confidence: detection.confidence,
    script: detection.script,
    templates,
    shouldRespondInLanguage: detection.confidence > 50
  };
};

/**
 * Get language-specific UI text
 * @param {string} language - The detected language
 * @returns {Object} UI text in the detected language
 */
export const getLanguageUIText = (language) => {
  const uiTexts = {
    english: {
      placeholder: "Ask about Qur'an, Hadith, Fiqh, Seerah, or any Islamic topic...",
      sendButton: "Send",
      newChat: "New Chat",
      recentChats: "Recent Chats",
      quickPrompts: "Quick Prompts"
    },
    
    hindi: {
      placeholder: "कुरान, हदीस, फ़िक़्ह, सीरा या किसी भी इस्लामी विषय के बारे में पूछें...",
      sendButton: "भेजें",
      newChat: "नई चैट",
      recentChats: "हाल की चैट्स",
      quickPrompts: "त्वरित प्रश्न"
    },
    
    hinglish: {
      placeholder: "Quran, Hadith, Fiqh, Seerah ya koi bhi Islamic topic ke bare mein pucho...",
      sendButton: "Bhejo",
      newChat: "Nayi Chat",
      recentChats: "Hali Chats",
      quickPrompts: "Quick Prompts"
    },
    
    urdu: {
      placeholder: "قرآن، حدیث، فقہ، سیرت یا کسی بھی اسلامی موضوع کے بارے میں پوچھیں...",
      sendButton: "بھیجیں",
      newChat: "نئی چیٹ",
      recentChats: "حالی چیٹس",
      quickPrompts: "فوری سوالات"
    },
    
    arabic: {
      placeholder: "اسأل عن القرآن والحديث والفقه والسيرة أو أي موضوع إسلامي...",
      sendButton: "إرسال",
      newChat: "محادثة جديدة",
      recentChats: "المحادثات الأخيرة",
      quickPrompts: "الأسئلة السريعة"
    }
  };

  return uiTexts[language] || uiTexts.english;
};
