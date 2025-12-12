// Cloudflare Pages Function: /api/gemini/generate
// Proxy for Gemini text generation API with fallback to alternative models

// Fallback models to use if Gemini hits rate limits
// Available models: gamma-3-1b, gamma-3-2b, gamma-3-12b, gamma-3-27b
const FALLBACK_MODELS = [
  'gamma-3-1b',
  'gamma-3-2b',
  'gamma-3-12b'
];

async function callGeminiAPI(model, systemPrompt, userQuery, isSearchGrounded, apiKey) {
  const isGemini = model.startsWith('gemini');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const payload = isGemini
    ? {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        ...(isSearchGrounded && { tools: [{ google_search: {} }] })
      }
    : {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userQuery}` }] }]
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
    const { systemPrompt = '', userQuery = '', model = 'gemini-2.5-flash-preview-09-2025', isSearchGrounded = false } = body;

    const GEMINI_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: 'Server not configured with GEMINI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!userQuery) {
      return new Response(JSON.stringify({ error: 'userQuery is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try primary model first, then fallback models
    const modelsToTry = [model, ...FALLBACK_MODELS];
    let lastError = null;
    let response = null;

    for (const tryModel of modelsToTry) {
      try {
        response = await callGeminiAPI(tryModel, systemPrompt, userQuery, isSearchGrounded, GEMINI_KEY);

        // If successful or client error (not rate limit), use this response
        if (response.ok || response.status === 400 || response.status === 403) {
          console.log(`[Generate] Using model: ${tryModel}`);
          break;
        }

        // If rate limited (429), try next model
        if (response.status === 429) {
          console.warn(`[Generate] Model ${tryModel} rate limited, trying next...`);
          lastError = `Model ${tryModel} rate limited`;
          continue;
        }

        // Other server errors, try next
        if (response.status >= 500) {
          console.warn(`[Generate] Model ${tryModel} server error ${response.status}, trying next...`);
          lastError = `Model ${tryModel} server error`;
          continue;
        }
      } catch (e) {
        console.warn(`[Generate] Model ${tryModel} failed:`, e.message);
        lastError = e.message;
        continue;
      }
    }

    if (!response) {
      return new Response(JSON.stringify({ error: 'All models exhausted', details: lastError }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const textBody = await response.text();

    if (!response.ok) {
      console.error('[Gemini Proxy] Error', response.status, textBody);
      return new Response(textBody, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(textBody);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ text, raw: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[Gemini Proxy] Exception', err);
    return new Response(JSON.stringify({
      error: 'Proxy error',
      details: String(err?.message || err)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
