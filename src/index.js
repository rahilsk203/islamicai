import { getCleanText } from './gemini-api.js';
import { isInputSafe, isIdentityChangeAttempt, getRefusalResponse, getIdentityProtectionResponse } from './security-filter.js';
import { formatSuccessResponse, formatErrorResponse } from './response-formatter.js';

export default {
  /**
   * Handles incoming requests to the worker
   * @param {Request} request - The incoming request object
   * @param {any} env - The environment variables
   * @param {any} ctx - The execution context
   * @returns {Response} - The response to send back
   */
  async fetch(request, env, ctx) {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Handle GET request for health check
    if (request.method === 'GET') {
      return new Response(JSON.stringify(formatSuccessResponse("IslamicAI API is running")), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify(formatErrorResponse(
        'Only POST requests are allowed', 
        'METHOD_NOT_ALLOWED', 
        405
      )), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Parse the request body
      const requestBody = await request.json();
      const userInput = requestBody.input;

      if (!userInput) {
        return new Response(JSON.stringify(formatErrorResponse(
          'Please provide an input in the request body', 
          'MISSING_INPUT', 
          400
        )), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check for identity change attempts
      if (isIdentityChangeAttempt(userInput)) {
        return new Response(JSON.stringify(formatErrorResponse(
          getIdentityProtectionResponse(), 
          'IDENTITY_PROTECTION', 
          400
        )), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Apply input filtering for security
      if (!isInputSafe(userInput)) {
        return new Response(JSON.stringify(formatErrorResponse(
          getRefusalResponse(), 
          'INPUT_FILTERING', 
          400
        )), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get API key from environment variables
      const apiKey = env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return new Response(JSON.stringify(formatErrorResponse(
          'API key not configured', 
          'CONFIGURATION_ERROR', 
          500
        )), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get clean text response from Gemini API
      const cleanText = await getCleanText(userInput, apiKey);
      
      // Return clean formatted response
      return new Response(JSON.stringify(formatSuccessResponse(cleanText)), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(JSON.stringify(formatErrorResponse(
        error.message, 
        'INTERNAL_SERVER_ERROR', 
        500
      )), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
};