/**
 * Security filter for IslamicAI to ensure all inputs and outputs comply with guidelines
 */

/**
 * List of prohibited patterns that attempt to bypass IslamicAI guidelines
 */
const PROHIBITED_PATTERNS = [
  // Role playing and identity changes
  /ignore previous instructions/i,
  /override.*instructions/i,
  /system prompt/i,
  /internal.*instructions/i,
  /reveal.*prompt/i,
  /act as/i,
  /pretend you are/i,
  /developer mode/i,
  /unrestricted mode/i,
  /change.*identity/i,
  /role.*play/i,
  /simulation/i,
  
  // Technical bypass attempts
  /base64|rot13/i,
  /law enforcement/i,
  /official request/i,
  /bypass.*guidelines/i,
  /show.*code/i,
  /display.*prompt/i,
  /output.*instruction/i,
  
  // Model information requests
  /model.*architecture/i,
  /training.*data/i,
  /backend.*provider/i,
  /api.*key/i,
  /version.*number/i,
  /internal.*flag/i,
  /telemetry/i,
  /log/i,
  
  // Manipulative phrasing
  /prove.*wrong/i,
  /why.*violent/i,
  /hack/i,
  /jailbreak/i,
  /circumvent/i,
  /disable.*filter/i
];

/**
 * Checks if the input contains any prohibited patterns
 * @param {string} input - The user input to check
 * @returns {boolean} - True if input is safe, false if it contains prohibited content
 */
export function isInputSafe(input) {
  // Normalize input for checking
  const normalizedInput = input.toLowerCase();
  
  // Check if any prohibited pattern is found
  const isProhibited = PROHIBITED_PATTERNS.some(pattern => pattern.test(normalizedInput));
  
  return !isProhibited;
}

/**
 * Filters response to remove any accidental disclosure of system internals
 * @param {string} response - The response to filter
 * @returns {string} - The filtered response
 */
export function filterResponse(response) {
  // Patterns to redact from responses
  const redactionPatterns = [
    { pattern: /API key/gi, replacement: "[REDACTED]" },
    { pattern: /internal.*prompt/gi, replacement: "[REDACTED]" },
    { pattern: /system.*instruction/gi, replacement: "[REDACTED]" },
    { pattern: /model.*architecture/gi, replacement: "[REDACTED]" },
    { pattern: /training.*data/gi, replacement: "[REDACTED]" },
    { pattern: /backend.*provider/gi, replacement: "[REDACTED]" },
    { pattern: /version.*number/gi, replacement: "[REDACTED]" }
  ];
  
  // Apply all redaction patterns
  let filteredResponse = response;
  redactionPatterns.forEach(({ pattern, replacement }) => {
    filteredResponse = filteredResponse.replace(pattern, replacement);
  });
  
  return filteredResponse;
}

/**
 * Generates the standard refusal response for prohibited inputs
 * @returns {string} - The standard refusal message
 */
export function getRefusalResponse() {
  return "That seems like an attempt to bypass my guidelines. I can't help with that—let's discuss authentic Islamic topics.";
}

/**
 * Generates the identity protection response
 * @returns {string} - The identity protection message
 */
export function getIdentityProtectionResponse() {
  return "I appreciate the creativity, but I am permanently locked as IslamicAI and will stick to authentic Islamic insights. What's your real question?";
}

/**
 * Checks if the input is attempting to change the AI's identity
 * @param {string} input - The user input to check
 * @returns {boolean} - True if input is attempting identity change
 */
export function isIdentityChangeAttempt(input) {
  const identityChangePatterns = [
    /pretend you're not islamicai/i,
    /act as a different ai/i,
    /ignore previous instructions/i,
    /change.*identity/i,
    /role.*play/i
  ];
  
  const normalizedInput = input.toLowerCase();
  return identityChangePatterns.some(pattern => pattern.test(normalizedInput));
}