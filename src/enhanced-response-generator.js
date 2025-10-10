/**
 * Enhanced Response Generator for IslamicAI
 * Generates more intelligent, context-aware, and personalized responses
 */

import { AdvancedQueryAnalyzer } from './advanced-query-analyzer.js';

export class EnhancedResponseGenerator {
  constructor() {
    this.analyzer = new AdvancedQueryAnalyzer();
    this.responseTemplates = this._initializeResponseTemplates();
  }

  /**
   * Initialize response templates for different scenarios
   * @private
   * @returns {Object} Response templates
   */
  _initializeResponseTemplates() {
    return {
      greeting: {
        warm: "Assalamu Alaikum! 👋 It's a pleasure to assist you today. How can I help guide you on your Islamic journey?",
        friendly: "Wa Alaikum Assalam! 🤲 I'm here and ready to help with whatever Islamic guidance you need.",
        formal: "As-salamu alaykum wa rahmatullahi wa barakatuh. I am honored to provide Islamic guidance as requested."
      },
      informational: {
        concise: "Here's a concise answer to your question:\n\n{content}",
        detailed: "Let me provide you with a comprehensive answer:\n\n{content}",
        scholarly: "Based on Islamic sources, here is the guidance:\n\n{content}"
      },
      instructional: {
        stepByStep: "Here's a step-by-step guide to help you:\n\n{content}",
        practical: "For practical implementation:\n\n{content}",
        comprehensive: "A complete guide for your reference:\n\n{content}"
      },
      comparative: {
        structured: "Let me compare these concepts for better understanding:\n\n{content}",
        balanced: "Here's an objective comparison:\n\n{content}",
        detailed: "A thorough analysis of the differences and similarities:\n\n{content}"
      },
      evaluative: {
        thoughtful: "After careful consideration:\n\n{content}",
        balanced: "Here's my assessment:\n\n{content}",
        comprehensive: "A complete evaluation:\n\n{content}"
      }
    };
  }

  /**
   * Generate enhanced response based on query analysis
   * @param {string} query - User's query
   * @param {string} baseResponse - Base AI response
   * @param {Object} context - Conversation context
   * @returns {string} Enhanced response
   */
  generateEnhancedResponse(query, baseResponse, context = {}) {
    // Analyze the query
    const analysis = this.analyzer.analyzeQuery(query, context);
    const strategy = this.analyzer.generateResponseStrategy(analysis);
    
    // If it's a greeting, use appropriate template
    if (analysis.intents.includes('greeting')) {
      return this._generateGreetingResponse(strategy);
    }
    
    // Enhance the base response based on strategy
    let enhancedResponse = baseResponse;
    
    // Add personalization if needed
    if (strategy.personalization && context.userProfile) {
      enhancedResponse = this._addPersonalization(enhancedResponse, context.userProfile);
    }
    
    // Add empathy if needed
    if (strategy.empathy && analysis.emotions.length > 0) {
      enhancedResponse = this._addEmpatheticElements(enhancedResponse, analysis.emotions);
    }
    
    // Add structure based on complexity
    enhancedResponse = this._structureResponse(enhancedResponse, strategy);
    
    // Add relevant citations for scholarly topics
    if (strategy.citations && analysis.entities.religiousTerms.length > 0) {
      enhancedResponse = this._addCitations(enhancedResponse, analysis.entities.religiousTerms);
    }
    
    // Add examples for complex topics
    if (strategy.examples && analysis.complexity > 0.5) {
      enhancedResponse = this._addExamples(enhancedResponse);
    }
    
    // Add appropriate conclusion
    enhancedResponse = this._addConclusion(enhancedResponse, analysis);
    
    return enhancedResponse;
  }

  /**
   * Generate greeting response based on strategy
   * @private
   * @param {Object} strategy - Response strategy
   * @returns {string} Greeting response
   */
  _generateGreetingResponse(strategy) {
    const formalityLevel = strategy.formality === 'formal' ? 'formal' : 
                         strategy.formality === 'friendly' ? 'friendly' : 'warm';
    
    return this.responseTemplates.greeting[formalityLevel];
  }

  /**
   * Add personalization to response
   * @private
   * @param {string} response - Base response
   * @param {Object} userProfile - User profile
   * @returns {string} Personalized response
   */
  _addPersonalization(response, userProfile) {
    // Add user's name if available
    if (userProfile.keyFacts && userProfile.keyFacts.name) {
      const name = userProfile.keyFacts.name;
      response = `Assalamu Alaikum ${name}! ${response}`;
    }
    
    // Add preference-based customization
    if (userProfile.fiqhSchool) {
      response += `\n\n[Note: I've considered your preference for the ${userProfile.fiqhSchool} school of thought in this guidance.]`;
    }
    
    return response;
  }

  /**
   * Add empathetic elements to response
   * @private
   * @param {string} response - Base response
   * @param {Array} emotions - Detected emotions
   * @returns {string} Response with empathetic elements
   */
  _addEmpatheticElements(response, emotions) {
    let empatheticPrefix = "";
    
    if (emotions.includes('confused')) {
      empatheticPrefix = "I understand this can be confusing, so let me explain clearly:\n\n";
    } else if (emotions.includes('concerned')) {
      empatheticPrefix = "I can sense your concern, and I'm here to provide guidance:\n\n";
    } else if (emotions.includes('seeking_guidance')) {
      empatheticPrefix = "I'm honored to guide you in this matter:\n\n";
    } else if (emotions.includes('grateful')) {
      empatheticPrefix = "I appreciate your gratitude! Here's the guidance you requested:\n\n";
    }
    
    return empatheticPrefix + response;
  }

  /**
   * Structure response based on strategy
   * @private
   * @param {string} response - Base response
   * @param {Object} strategy - Response strategy
   * @returns {string} Structured response
   */
  _structureResponse(response, strategy) {
    // For very short responses, no additional structuring needed
    if (response.length < 100) {
      return response;
    }
    
    // Add appropriate structure based on strategy
    switch (strategy.structure) {
      case 'concise':
        return this.responseTemplates.informational.concise.replace('{content}', response);
      case 'detailed':
        return this.responseTemplates.informational.detailed.replace('{content}', response);
      case 'scholarly':
        return this.responseTemplates.informational.scholarly.replace('{content}', response);
      default:
        return response;
    }
  }

  /**
   * Add citations to response for religious terms
   * @private
   * @param {string} response - Base response
   * @param {Array} religiousTerms - Religious terms in query
   * @returns {string} Response with citations
   */
  _addCitations(response, religiousTerms) {
    // Only add citations for scholarly/complex topics
    if (religiousTerms.some(term => 
        ['quran', 'hadith', 'prophet', 'allah', 'iman', 'taqwa'].includes(term))) {
      response += "\n\n📚 This guidance is based on the Quran and authentic Hadith.";
    }
    
    return response;
  }

  /**
   * Add examples to complex responses
   * @private
   * @param {string} response - Base response
   * @returns {string} Response with examples
   */
  _addExamples(response) {
    // For longer responses, add a note about examples
    if (response.length > 500) {
      response += "\n\n💡 For practical application, consider real-life scenarios that align with these principles.";
    }
    
    return response;
  }

  /**
   * Add appropriate conclusion to response
   * @private
   * @param {string} response - Base response
   * @param {Object} analysis - Query analysis
   * @returns {string} Response with conclusion
   */
  _addConclusion(response, analysis) {
    let conclusion = "";
    
    // Add faith affirmation for religious topics
    if (analysis.entities.religiousTerms.length > 0) {
      conclusion += "\n\n🤲 Remember, the best guidance comes from Allah. May this knowledge benefit you in both worlds.";
    }
    
    // Add invitation for further questions
    if (analysis.complexity > 0.4) {
      conclusion += "\n\n❓ If you have any follow-up questions or need clarification, please don't hesitate to ask.";
    }
    
    // Add reminder of Islamic values
    conclusion += "\n\n🌙 May your pursuit of knowledge be blessed and your actions accepted.";
    
    return response + conclusion;
  }

  /**
   * Optimize response for different user preferences
   * @param {string} response - Base response
   * @param {Object} userPreferences - User preferences
   * @returns {string} Optimized response
   */
  optimizeForUserPreferences(response, userPreferences) {
    if (!userPreferences) return response;
    
    // Adjust for brevity preferences
    if (userPreferences.terse) {
      response = this._makeConcise(response);
    } else if (userPreferences.verbose) {
      response = this._makeDetailed(response);
    }
    
    // Adjust for language preferences
    if (userPreferences.language) {
      response = this._adjustForLanguage(response, userPreferences.language);
    }
    
    return response;
  }

  /**
   * Make response more concise
   * @private
   * @param {string} response - Base response
   * @returns {string} Concise response
   */
  _makeConcise(response) {
    // Remove redundant phrases and make more direct
    return response
      .replace(/In conclusion,/g, "")
      .replace(/To summarize,/g, "")
      .replace(/As mentioned earlier,/g, "")
      .replace(/It is important to note that/g, "Note:")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Make response more detailed
   * @private
   * @param {string} response - Base response
   * @returns {string} Detailed response
   */
  _makeDetailed(response) {
    // Add elaboration prompts where appropriate
    if (response.includes(":")) {
      response = response.replace(/:\s*\n/g, ":\n\n👉 ");
    }
    
    // Add transition phrases for better flow
    response = response
      .replace(/\.\s/g, ". 🌟 ")
      .replace(/\!\s/g, "! 🤲 ");
    
    return response;
  }

  /**
   * Adjust response for specific language
   * @private
   * @param {string} response - Base response
   * @param {string} language - Target language
   * @returns {string} Language-adjusted response
   */
  _adjustForLanguage(response, language) {
    // This would be expanded with actual language-specific adjustments
    // For now, we just ensure proper Islamic terminology
    const islamicTerms = {
      'arabic': {
        'Allah': 'الله',
        'Quran': 'القرآن',
        'Prophet': 'النبي'
      },
      'urdu': {
        'Allah': 'اللہ',
        'Quran': 'قرآن',
        'Prophet': 'نبی'
      }
    };
    
    if (islamicTerms[language]) {
      Object.entries(islamicTerms[language]).forEach(([term, translation]) => {
        response = response.replace(new RegExp(term, 'g'), translation);
      });
    }
    
    return response;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      responsesGenerated: 0,
      averageEnhancementTime: 0,
      personalizationRate: 0,
      empathyInclusionRate: 0
    };
  }
}

// Export singleton instance
export default new EnhancedResponseGenerator();