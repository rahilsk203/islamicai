// Advanced Language Detection System for IslamicAI Backend
// Supports Hinglish, mixed languages, and context-aware detection

export class AdvancedLanguageDetection {
  constructor() {
    this.languagePatterns = {
      // Hindi (Devanagari script)
      hindi: {
        pattern: /[\u0900-\u097F]/g,
        weight: 3.0,
        script: 'devanagari',
        keywords: ['है', 'हैं', 'का', 'के', 'की', 'में', 'से', 'को', 'पर', 'अल्लाह', 'इस्लाम', 'कुरान', 'हदीस', 'नमाज़', 'रोज़ा', 'ज़कात', 'हज', 'मस्जिद', 'इमाम', 'मौलाना', 'मौलवी'],
        commonWords: ['और', 'या', 'लेकिन', 'क्योंकि', 'जब', 'तब', 'यह', 'वह', 'हम', 'आप', 'वे', 'मैं', 'तुम', 'उसने', 'हमने', 'आपने']
      },
      
      // Urdu (Arabic script with Urdu-specific characters)
      urdu: {
        pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
        weight: 2.8,
        script: 'arabic',
        urduSpecific: /[\u0627-\u064A\u067E\u0686\u0688\u0691\u0698\u06A9\u06AF\u06BE\u06C1\u06D2]/g,
        keywords: ['ہے', 'ہیں', 'کا', 'کے', 'کی', 'میں', 'سے', 'کو', 'پر', 'اللہ', 'اسلام', 'قرآن', 'حدیث', 'نماز', 'روزہ', 'زکات', 'حج', 'مسجد', 'امام', 'مولانا', 'مولوی'],
        commonWords: ['اور', 'یا', 'لیکن', 'کیونکہ', 'جب', 'تب', 'یہ', 'وہ', 'ہم', 'آپ', 'وے', 'میں', 'تم', 'اس نے', 'ہم نے', 'آپ نے']
      },
      
      // Arabic
      arabic: {
        pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
        weight: 2.5,
        script: 'arabic',
        keywords: ['الله', 'الإسلام', 'القرآن', 'الحديث', 'الصلاة', 'الصوم', 'الزكاة', 'الحج', 'المسجد', 'الإمام', 'المولى', 'الفقيه'],
        commonWords: ['و', 'أو', 'لكن', 'لأن', 'عندما', 'ثم', 'هذا', 'ذلك', 'نحن', 'أنت', 'هم', 'أنا', 'أنت', 'هو', 'هي']
      },
      
      // Persian/Farsi
      persian: {
        pattern: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
        weight: 2.3,
        script: 'arabic',
        persianWords: ['است', 'هستند', 'را', 'از', 'در', 'به', 'برای', 'این', 'آن', 'ما', 'شما', 'آنها', 'من', 'تو', 'او'],
        keywords: ['خدا', 'اسلام', 'قرآن', 'حدیث', 'نماز', 'روزه', 'زکات', 'حج', 'مسجد', 'امام', 'مولوی', 'فقیه']
      },
      
      // English
      english: {
        pattern: /[a-zA-Z]/g,
        weight: 1.0,
        script: 'latin',
        keywords: ['islam', 'quran', 'hadith', 'prayer', 'fasting', 'zakat', 'hajj', 'mosque', 'imam', 'allah', 'muhammad', 'prophet', 'islamic', 'muslim'],
        commonWords: ['and', 'or', 'but', 'because', 'when', 'then', 'this', 'that', 'we', 'you', 'they', 'i', 'me', 'my', 'our', 'your', 'their']
      },
      
      // Bengali
      bengali: {
        pattern: /[\u0980-\u09FF]/g,
        weight: 3.0,
        script: 'bengali',
        keywords: ['ইসলাম', 'কুরআন', 'হাদিস', 'নামাজ', 'রোজা', 'জাকাত', 'হজ', 'মসজিদ', 'ইমাম', 'আল্লাহ', 'মুহাম্মদ'],
        commonWords: ['এবং', 'বা', 'কিন্তু', 'কারণ', 'যখন', 'তখন', 'এই', 'সেই', 'আমরা', 'তুমি', 'তারা', 'আমি', 'তোমার', 'আমার']
      },
      
      // Turkish
      turkish: {
        pattern: /[çğıöşüÇĞIİÖŞÜ]/g,
        weight: 2.0,
        script: 'latin',
        keywords: ['islam', 'kuran', 'hadis', 'namaz', 'oruç', 'zekat', 'hac', 'cami', 'imam', 'allah', 'muhammed'],
        commonWords: ['ve', 'veya', 'ama', 'çünkü', 'ne zaman', 'sonra', 'bu', 'şu', 'biz', 'sen', 'onlar', 'ben', 'senin', 'bizim']
      }
    };
    
    // Hinglish detection patterns
    this.hinglishPatterns = {
      // Mixed Hindi-English patterns
      mixedWords: /[\u0900-\u097F]+[a-zA-Z]+|[a-zA-Z]+[\u0900-\u097F]+/g,
      // Common Hinglish phrases
      phrases: [
        /main\s+[a-zA-Z]+\s+kar\s+raha\s+hun/gi,
        /aap\s+[a-zA-Z]+\s+kar\s+sakte\s+hain/gi,
        /ye\s+[a-zA-Z]+\s+ka\s+[a-zA-Z]+\s+hai/gi,
        /[a-zA-Z]+\s+ke\s+liye/gi,
        /[a-zA-Z]+\s+mein/gi,
        /[a-zA-Z]+\s+se/gi,
        /[a-zA-Z]+\s+ko/gi,
        /[a-zA-Z]+\s+par/gi,
        // Common conversational Hinglish patterns
        /kasa\s+hai\s+tuu/gi,
        /tuu\s+kon\s+hai/gi,
        /tuu\s+kaya\s+kar\s+saktaa\s+hai/gi,
        /kaya\s+kar\s+saktaa\s+hai/gi,
        /kasa\s+hai/gi,
        /kon\s+hai/gi,
        /kaya\s+hai/gi,
        /tuu\s+[a-zA-Z]+\s+hai/gi,
        /[a-zA-Z]+\s+hai\s+tuu/gi,
        /tuu\s+[a-zA-Z]+\s+kar\s+saktaa/gi,
        /[a-zA-Z]+\s+kar\s+saktaa\s+hai/gi
      ],
      // Common Hinglish words
      words: [
        'main', 'aap', 'ye', 'wo', 'ham', 'tum', 'usne', 'hamne', 'aapne',
        'kar', 'raha', 'hun', 'hain', 'hai', 'tha', 'the', 'thi', 'thi',
        'ke', 'ki', 'ka', 'mein', 'se', 'ko', 'par', 'liye', 'aur', 'ya',
        'lekin', 'kyunki', 'jab', 'tab', 'agar', 'to', 'phir', 'abhi',
        // Additional common Hinglish words
        'tuu', 'kasa', 'kon', 'kaya', 'saktaa', 'sakte', 'sakti', 'sakta',
        'hoon', 'ho', 'hoi', 'hoa', 'hoiye', 'hoja', 'hojao', 'hojaye',
        'kya', 'kyun', 'kahan', 'kab', 'kaise', 'kitna', 'kitni', 'kitne'
      ]
    };
  }

  /**
   * Advanced language detection with context awareness
   * @param {string} text - Input text to analyze
   * @param {Object} context - Additional context (previous messages, user profile)
   * @returns {Object} Detailed language detection result
   */
  detectLanguage(text, context = {}) {
    if (!text || typeof text !== 'string') {
      return this.getDefaultResult();
    }

    const cleanText = text.trim();
    const totalChars = cleanText.length;
    
    if (totalChars === 0) {
      return this.getDefaultResult();
    }

    // Calculate scores for each language
    const scores = {};
    const detectedScripts = new Set();
    
    for (const [lang, config] of Object.entries(this.languagePatterns)) {
      const result = this.calculateLanguageScore(cleanText, config, totalChars);
      scores[lang] = result;
      if (result.score > 0) {
        detectedScripts.add(config.script);
      }
    }

    // Special Hinglish detection
    const hinglishScore = this.detectHinglish(cleanText, totalChars);
    if (hinglishScore.score > 0.2) {
      scores.hinglish = hinglishScore;
    }

    // Find the language with highest score
    const detectedLang = Object.keys(scores).reduce((a, b) => 
      scores[a].score > scores[b].score ? a : b
    );

    const confidence = Math.min(scores[detectedLang].score * 100, 100);
    const script = scores[detectedLang].script;

    // Context-aware adjustments
    const adjustedResult = this.applyContextAdjustments({
      language: detectedLang,
      confidence,
      script,
      scores,
      detectedScripts: Array.from(detectedScripts)
    }, context);

    // Enhanced result with additional metadata
    return {
      ...adjustedResult,
      isMixedLanguage: detectedScripts.size > 1,
      hasMultipleScripts: detectedScripts.size > 1,
      detectedScripts: Array.from(detectedScripts),
      analysis: {
        totalChars,
        charDistribution: this.getCharDistribution(cleanText),
        keywordMatches: this.getKeywordMatches(cleanText),
        confidenceBreakdown: scores
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate language score for a specific language configuration
   */
  calculateLanguageScore(text, config, totalChars) {
    let score = 0;
    let matches = 0;
    let keywordMatches = 0;

    // Character pattern matching
    const charMatches = text.match(config.pattern) || [];
    matches += charMatches.length;
    score += (charMatches.length * config.weight) / totalChars;

    // Keyword matching (higher weight)
    if (config.keywords) {
      const keywordMatches = config.keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += (keywordMatches * config.weight * 2) / totalChars;
    }

    // Common words matching
    if (config.commonWords) {
      const commonWordMatches = config.commonWords.filter(word => 
        text.toLowerCase().includes(word.toLowerCase())
      ).length;
      score += (commonWordMatches * config.weight * 0.5) / totalChars;
    }

    // Special handling for Urdu vs Arabic
    if (config.urduSpecific) {
      const urduMatches = text.match(config.urduSpecific) || [];
      score += (urduMatches.length * 0.5) / totalChars;
    }

    // Special handling for Persian
    if (config.persianWords) {
      const persianMatches = config.persianWords.filter(word => 
        text.includes(word)
      ).length;
      score += (persianMatches * config.weight * 1.5) / totalChars;
    }

    return {
      score: Math.min(score, 1),
      matches,
      keywordMatches,
      script: config.script
    };
  }

  /**
   * Detect Hinglish (Hindi + English mix)
   */
  detectHinglish(text, totalChars) {
    let score = 0;
    let matches = 0;

    // Check for mixed word patterns
    const mixedMatches = text.match(this.hinglishPatterns.mixedWords) || [];
    score += (mixedMatches.length * 2) / totalChars;
    matches += mixedMatches.length;

    // Check for Hinglish phrases
    for (const phrase of this.hinglishPatterns.phrases) {
      const phraseMatches = text.match(phrase) || [];
      score += (phraseMatches.length * 2.0) / totalChars;
      matches += phraseMatches.length;
    }

    // Check for common Hinglish words
    const hinglishWordMatches = this.hinglishPatterns.words.filter(word => 
      text.toLowerCase().includes(word.toLowerCase())
    ).length;
    score += (hinglishWordMatches * 1.2) / totalChars;

    // Check for Roman script Hindi words
    const romanHindiPattern = /\b(main|aap|ye|wo|ham|tum|kar|raha|hun|hain|hai|tha|the|thi|ke|ki|ka|mein|se|ko|par|liye|aur|ya|lekin|kyunki|jab|tab|agar|to|phir|abhi|tuu|kasa|kon|kaya|saktaa|sakte|sakti|sakta|hoon|ho|hoi|hoa|hoiye|hoja|hojao|hojaye|kya|kyun|kahan|kab|kaise|kitna|kitni|kitne)\b/gi;
    const romanMatches = text.match(romanHindiPattern) || [];
    score += (romanMatches.length * 0.8) / totalChars;

    return {
      score: Math.min(score, 1),
      matches,
      script: 'mixed',
      type: 'hinglish'
    };
  }

  /**
   * Apply context-aware adjustments to detection result
   */
  applyContextAdjustments(result, context) {
    // If user has been consistently using a language, boost confidence
    if (context.previousLanguage && context.previousLanguage === result.language) {
      result.confidence = Math.min(result.confidence + 10, 100);
    }

    // If user profile indicates preferred language, adjust
    if (context.userProfile?.preferredLanguage) {
      if (context.userProfile.preferredLanguage === result.language) {
        result.confidence = Math.min(result.confidence + 15, 100);
      }
    }

    // If multiple scripts detected, it might be mixed language
    if (result.isMixedLanguage && result.language !== 'hinglish') {
      // Check if it's actually Hinglish
      const hinglishScore = this.detectHinglish(context.currentText || '', 100);
      if (hinglishScore.score > 0.2) {
        result.language = 'hinglish';
        result.confidence = Math.min(result.confidence + 5, 100);
      }
    }

    return result;
  }

  /**
   * Get character distribution analysis
   */
  getCharDistribution(text) {
    const distribution = {};
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code >= 0x0900 && code <= 0x097F) {
        distribution.devanagari = (distribution.devanagari || 0) + 1;
      } else if (code >= 0x0600 && code <= 0x06FF) {
        distribution.arabic = (distribution.arabic || 0) + 1;
      } else if (code >= 0x0041 && code <= 0x007A) {
        distribution.latin = (distribution.latin || 0) + 1;
      } else if (code >= 0x0980 && code <= 0x09FF) {
        distribution.bengali = (distribution.bengali || 0) + 1;
      }
    }
    return distribution;
  }

  /**
   * Get keyword matches for analysis
   */
  getKeywordMatches(text) {
    const matches = {};
    for (const [lang, config] of Object.entries(this.languagePatterns)) {
      if (config.keywords) {
        matches[lang] = config.keywords.filter(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase())
        );
      }
    }
    return matches;
  }

  /**
   * Get default detection result
   */
  getDefaultResult() {
    return {
      language: 'english',
      confidence: 0,
      script: 'latin',
      isMixedLanguage: false,
      hasMultipleScripts: false,
      detectedScripts: ['latin'],
      analysis: {
        totalChars: 0,
        charDistribution: {},
        keywordMatches: {},
        confidenceBreakdown: {}
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get language-specific response templates
   */
  getLanguageTemplates(language) {
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
      },
      
      bengali: {
        greeting: "আসসালামু আলাইকুম!",
        thinking: "IslamicAI গবেষণা করছে...",
        blessing: "আল্লাহ আমাদের পথনির্দেশ করুন",
        scholar: "IslamicAI পণ্ডিত",
        error: "আমি দুঃখিত, আমি আপনার প্রশ্ন বুঝতে সমস্যা অনুভব করছি। আপনি কি দয়া করে এটি আবার বলতে পারেন?",
        islamicScope: "আমি এখানে কুরআন, হাদিস, তাফসির, ফিকহ এবং সিরাহ ভিত্তিক ইসলামী নির্দেশনা দেওয়ার জন্য আছি।"
      },
      
      turkish: {
        greeting: "Selamün Aleyküm!",
        thinking: "IslamicAI araştırıyor...",
        blessing: "Allah bizi doğru yola yöneltsin",
        scholar: "IslamicAI Alim",
        error: "Özür dilerim, sorunuzu anlamakta zorluk çekiyorum. Lütfen tekrar söyler misiniz?",
        islamicScope: "Kur'an, Hadis, Tefsir, Fıkıh ve Siyer temelinde İslami rehberlik sunmak için buradayım."
      }
    };

    return templates[language] || templates.english;
  }
}
