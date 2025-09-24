/**
 * Response formatter for IslamicAI to ensure clean, structured responses
 */

/**
 * Formats a successful response
 * @param {string} answer - The main answer text
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - Formatted response object
 */
export function formatSuccessResponse(answer, metadata = {}) {
  return {
    success: true,
    data: {
      answer: answer,
      ...metadata
    }
  };
}

/**
 * Formats an error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} status - HTTP status code
 * @returns {Object} - Formatted error response object
 */
export function formatErrorResponse(message, code = 'UNKNOWN_ERROR', status = 500) {
  return {
    success: false,
    error: {
      code: code,
      message: message,
      status: status
    }
  };
}

/**
 * Formats a streaming response
 * @param {ReadableStream} stream - The response stream
 * @returns {Object} - Formatted streaming response
 */
export function formatStreamResponse(stream) {
  return {
    success: true,
    streaming: true,
    stream: stream
  };
}

/**
 * Extracts clean text from Gemini API response
 * @param {string} rawResponse - Raw response from Gemini API
 * @returns {string} - Cleaned response text
 */
export function extractCleanText(rawResponse) {
  // Remove any markdown formatting
  let cleanText = rawResponse
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold markdown
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')   // Remove italic markdown
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')   // Remove code markdown
    .replace(/~~([^~]+)~~/g, '$1')           // Remove strikethrough
    .replace(/#+\s(.+)/g, '$1')              // Remove headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')      // Remove links but keep text
    .trim();
  
  // Remove any residual prompt instructions or system messages
  const systemMessageIndicators = [
    'Locked System Instructions',
    'Core Identity',
    'Safety & Filtering',
    'End of Locked System Instructions'
  ];
  
  systemMessageIndicators.forEach(indicator => {
    const index = cleanText.indexOf(indicator);
    if (index !== -1) {
      cleanText = cleanText.substring(0, index).trim();
    }
  });
  
  return cleanText;
}