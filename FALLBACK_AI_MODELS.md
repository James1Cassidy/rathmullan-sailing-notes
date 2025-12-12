# Fallback AI Models Configuration

## Overview
When Gemini API hits rate limits (429 errors) or server errors (5xx), the application automatically falls back to alternative models to maintain functionality.

## Models Used

### Text Generation (`/api/gemini/generate`)
**Primary Model:**
- `gemini-2.5-flash-preview-09-2025`

**Fallback Models (in order):**
1. `gamma-3-1b`
2. `gamma-3-2b`
3. `gamma-3-4b`

Used for:
- AI-generated sailing drills
- Terminology definitions
- Wind condition analysis

### Text-to-Speech (`/api/gemini/tts`)
**Primary Model:**
- `gemini-2.5-flash-preview-tts`

**Fallback Models (in order):**
1. `gamma-3-2b`
2. `gamma-3-4b`

Used for:
- Audio pronunciation of sailing terms

## How It Works

1. **Rate Limit Detection:** If a request receives a 429 (Too Many Requests) status, the system tries the next model.
2. **Server Error Handling:** If a 5xx server error occurs, the next model is attempted.
3. **Sequential Retry:** Models are tried in the configured order until one succeeds.
4. **Fallback Exhaustion:** If all models fail, a 503 Service Unavailable response is returned with error details.
5. **Client-Side Fallback:** If all API models fail, the client automatically uses hardcoded fallback drill suggestions.

## Environment Setup

Ensure your Cloudflare environment variables include:
```
GEMINI_API_KEY=your-google-ai-studio-api-key
FIREBASE_DATABASE_URL=your-firebase-db-url
```

Both Gemini and fallback models use the same API key configured in `GEMINI_API_KEY`.

## Monitoring

Check server logs for messages like:
- `[Generate] Model gamma-3-2b rate limited, trying next...`
- `[TTS] Using model: gamma-3-1b`

These indicate when fallbacks are triggered.

## Configuration Changes

To add or change fallback models, edit:
- `functions/api/gemini/generate.js` → `FALLBACK_MODELS` constant
- `functions/api/gemini/tts.js` → `TTS_FALLBACK_MODELS` constant

Then redeploy:
```bash
npm run deploy
```
