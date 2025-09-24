# IslamicAI Cloudflare Worker with Google Gemini Integration

This project is a Cloudflare Worker that integrates with the Google Gemini API to provide AI-powered responses.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your Google Gemini API key in `wrangler.toml`:
   ```toml
   [vars]
   GEMINI_API_KEY = "your_actual_api_key_here"
   ```

## Development

To run locally:
```bash
npm run dev
```

## Deployment

To deploy to Cloudflare:
```bash
npm run deploy
```

## Usage

Send a POST request to your worker endpoint with a JSON body:
```json
{
  "input": "Your question here"
}
```

The worker will stream the response from the Google Gemini API.