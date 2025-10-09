export class CommandHandler {
  constructor() {
    this.commands = {
      '/clear': this.handleClearCommand.bind(this),
      '/help': this.handleHelpCommand.bind(this),
      '/lang': this.handleLangCommand.bind(this),
      '/profile': this.handleProfileCommand.bind(this),
      '/memory': this.handleMemoryCommand.bind(this),
    };
  }

  async handleCommand(message, sessionId, sessionManager) {
    const [command, ...args] = message.split(' ');
    
    if (this.commands[command]) {
      return await this.commands[command](args, sessionId, sessionManager);
    } else {
      return {
        session_id: sessionId,
        reply: `Unknown command: ${command}. Type /help for available commands.`,
        history_summary: null
      };
    }
  }

  async handleClearCommand(args, sessionId, sessionManager) {
    const success = await sessionManager.clearSessionHistory(sessionId);
    
    return {
      session_id: sessionId,
      reply: success ? "Session history and memories cleared successfully! Starting fresh. 🤲" : "Failed to clear session history.",
      history_summary: null,
      memory_count: 0
    };
  }

  async handleHelpCommand(args, sessionId, sessionManager) {
    const helpText = `🕌 IslamicAI Commands:

/clear - Clear session history and memories
/help - Show this help message
/lang <language> - Change response language (en, hi, bn, hinglish)
/profile - Show your user profile and preferences
/memory - Show memory statistics

Example: /lang hi (for Hindi responses)
Example: /profile (to see your preferences)

IslamicAI remembers your preferences, important information, and conversation context to provide more personalized and intelligent responses! 🤲`;

    return {
      session_id: sessionId,
      reply: helpText,
      history_summary: null
    };
  }

  async handleLangCommand(args, sessionId, sessionManager) {
    if (args.length === 0) {
      return {
        session_id: sessionId,
        reply: "Please specify a language. Usage: /lang <language>\nSupported: en, hi, bn, hinglish",
        history_summary: null
      };
    }

    const language = args[0].toLowerCase();
    const supportedLanguages = ['en', 'hi', 'bn', 'hinglish'];
    
    if (!supportedLanguages.includes(language)) {
      return {
        session_id: sessionId,
        reply: `Unsupported language: ${language}\nSupported languages: ${supportedLanguages.join(', ')}`,
        history_summary: null
      };
    }
    // Update session data using existing session APIs
    const sessionData = await sessionManager.getSessionData(sessionId);
    const languageMap = {
      'en': 'english',
      'hi': 'hindi',
      'bn': 'bengali',
      'hinglish': 'hinglish'
    };

    // Ensure userProfile exists and set preferred language
    sessionData.userProfile = sessionData.userProfile || {};
    sessionData.userProfile.preferredLanguage = languageMap[language] || 'english';

    // Append a system note to history for transparency
    sessionData.history = sessionData.history || [];
    sessionData.history.push({
      role: 'system',
      content: `[SYSTEM] User set language preference to: ${sessionData.userProfile.preferredLanguage}. Respond in this language unless specifically asked otherwise. Maintain IslamicAI identity while adapting to the language.`,
      timestamp: new Date().toISOString(),
      session_id: sessionId
    });

    await sessionManager.saveSessionData(sessionId, sessionData);

    const languageNames = {
      'en': 'English',
      'hi': 'Hindi (हिंदी)',
      'bn': 'Bengali (বাংলা)',
      'hinglish': 'Hinglish'
    };

    const responses = {
      'en': `Language changed to ${languageNames[language]}. I'll respond in this language from now on. May Allah guide us in our conversations.`,
      'hi': `भाषा ${languageNames[language]} में बदल गई। अब मैं इसी भाषा में जवाब दूंगा। अल्लाह हमारी बातचीत में हमारी मार्गदर्शन करे।`,
      'bn': `ভাষা ${languageNames[language]} এ পরিবর্তন হয়েছে। এখন আমি এই ভাষায় উত্তর দেব। আল্লাহ আমাদের কথোপকথনে আমাদের পথনির্দেশ করুন।`,
      'hinglish': `Language ${languageNames[language]} mein change ho gaya. Ab main isi language mein respond karunga. Allah humari baat mein guide kare.`
    };

    return {
      session_id: sessionId,
      reply: responses[language] || responses['en'],
      history_summary: null
    };
  }

  async handleProfileCommand(args, sessionId, sessionManager) {
    try {
      const sessionData = await sessionManager.getSessionData(sessionId);
      const profile = sessionData.userProfile;
      
      let profileText = `🕌 Your IslamicAI Profile:\n\n`;
      
      if (profile.preferredLanguage) {
        profileText += `📝 Language: ${profile.preferredLanguage}\n`;
      }
      
      if (profile.fiqhSchool) {
        profileText += `⚖️ Fiqh School: ${profile.fiqhSchool}\n`;
      }
      
      if (profile.responseStyle) {
        profileText += `💬 Response Style: ${profile.responseStyle}\n`;
      }
      
      if (profile.currentEmotionalState) {
        profileText += `😊 Current Mood: ${profile.currentEmotionalState}\n`;
      }
      
      if (profile.keyFacts && Object.keys(profile.keyFacts).length > 0) {
        profileText += `\n📋 Important Information:\n`;
        Object.entries(profile.keyFacts).forEach(([key, value]) => {
          profileText += `• ${key}: ${value}\n`;
        });
      }
      
      if (profile.learningPatterns) {
        profileText += `\n🧠 Learning Patterns:\n`;
        if (profile.learningPatterns.questionTypes && profile.learningPatterns.questionTypes.length > 0) {
          profileText += `• Question Types: ${profile.learningPatterns.questionTypes.join(', ')}\n`;
        }
        if (profile.learningPatterns.responseLength) {
          profileText += `• Preferred Response Length: ${profile.learningPatterns.responseLength}\n`;
        }
      }
      
      profileText += `\n💾 Total Memories: ${sessionData.memories.length}\n`;
      profileText += `📚 Conversation History: ${sessionData.history.length} messages\n\n`;
      profileText += `IslamicAI uses this information to provide more personalized and relevant responses! 🤲`;
      
      return {
        session_id: sessionId,
        reply: profileText,
        history_summary: null
      };
    } catch (error) {
      return {
        session_id: sessionId,
        reply: "Sorry, I couldn't retrieve your profile information. Please try again.",
        history_summary: null
      };
    }
  }

  async handleMemoryCommand(args, sessionId, sessionManager) {
    try {
      const sessionData = await sessionManager.getSessionData(sessionId);
      const memories = sessionData.memories;
      
      let memoryText = `🧠 IslamicAI Memory Statistics:\n\n`;
      memoryText += `📊 Total Memories: ${memories.length}\n`;
      
      // Group memories by type
      const memoryTypes = {};
      memories.forEach(memory => {
        if (!memoryTypes[memory.type]) {
          memoryTypes[memory.type] = 0;
        }
        memoryTypes[memory.type]++;
      });
      
      memoryText += `\n📋 Memory Breakdown:\n`;
      Object.entries(memoryTypes).forEach(([type, count]) => {
        memoryText += `• ${type}: ${count} memories\n`;
      });
      
      // Show most accessed memories
      const topMemories = memories
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 3);
      
      if (topMemories.length > 0) {
        memoryText += `\n⭐ Most Accessed Memories:\n`;
        topMemories.forEach((memory, index) => {
          memoryText += `${index + 1}. ${memory.content.substring(0, 50)}... (${memory.accessCount} times)\n`;
        });
      }
      
      memoryText += `\n💡 IslamicAI uses these memories to provide more personalized and context-aware responses! 🤲`;
      
      return {
        session_id: sessionId,
        reply: memoryText,
        history_summary: null
      };
    } catch (error) {
      return {
        session_id: sessionId,
        reply: "Sorry, I couldn't retrieve memory statistics. Please try again.",
        history_summary: null
      };
    }
  }
}
