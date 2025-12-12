// Cloudflare Pages Function: /api/gemini/tts
// Proxy for Gemini TTS API with fallback to alternative models

// Fallback models to use if Gemini TTS hits rate limits
// Available models: gamma-3-1b, gamma-3-2b, gamma-3-12b, gamma-3-27b
const TTS_FALLBACK_MODELS = [
  'gamma-3-2b',
  'gamma-3-12b'
];

async function callTTSAPI(model, text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const payload = {
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
    model: model,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  return response;
}

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { text = '' } = body;

    const GEMINI_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured with GEMINI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try primary TTS model first, then fallback models
    const modelsToTry = ['gemini-2.5-flash-preview-tts', ...TTS_FALLBACK_MODELS];
    let lastError = null;
    let response = null;

    for (const tryModel of modelsToTry) {
      try {
        response = await callTTSAPI(tryModel, text, GEMINI_KEY);

        // If successful or client error (not rate limit), use this response
        if (response.ok || response.status === 400 || response.status === 403) {
          console.log(`[TTS] Using model: ${tryModel}`);
          break;
        }

        // If rate limited (429), try next model
        if (response.status === 429) {
          console.warn(`[TTS] Model ${tryModel} rate limited, trying next...`);
          lastError = `Model ${tryModel} rate limited`;
          continue;
        }

        // Other server errors, try next
        if (response.status >= 500) {
          console.warn(`[TTS] Model ${tryModel} server error ${response.status}, trying next...`);
          lastError = `Model ${tryModel} server error`;
          continue;
        }
      } catch (e) {
        console.warn(`[TTS] Model ${tryModel} failed:`, e.message);
        lastError = e.message;
        continue;
      }
    }

    if (!response) {
      return new Response(JSON.stringify({ error: 'All TTS models exhausted', details: lastError }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const textBody = await response.text();

    if (!response.ok) {
      console.error('[Gemini TTS Proxy] Error', response.status, textBody);
      return new Response(textBody, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(textBody);
    const part = data?.candidates?.[0]?.content?.parts?.[0];
    const inline = part?.inlineData;

    if (!inline?.data || !inline?.mimeType) {
      return new Response(JSON.stringify({ error: 'No audio data in response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      data: inline.data,
      mimeType: inline.mimeType
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[Gemini TTS Proxy] Exception', err);
    return new Response(JSON.stringify({
      error: 'Proxy error',
      details: String(err?.message || err)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
