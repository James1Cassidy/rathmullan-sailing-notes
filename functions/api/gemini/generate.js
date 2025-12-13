// Cloudflare Pages Function: /api/gemini/generate
// Proxy for Ollama text generation API
// Configure endpoint via env: OLLAMA_BASE_URL (e.g., http://PUBLIC_IP:11434)

const OLLAMA_MODEL = 'tinyllama'; // Default to tinyllama to fit current VM size

function resolveOllamaEndpoint(env) {
  const base = (env && env.OLLAMA_BASE_URL) ||
               (typeof process !== 'undefined' && process.env && process.env.OLLAMA_BASE_URL) ||
               'http://localhost:11434';
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}/api/generate`;
}

async function callOllamaAPI(endpoint, model, systemPrompt, userQuery) {
  const prompt = systemPrompt ? `${systemPrompt}\n\n${userQuery}` : userQuery;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      }),
    });

    return response;
  } catch (e) {
    console.error('[Ollama] Connection error:', e.message);
    throw new Error(`Ollama unavailable: ${e.message}`);
  }
}

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { systemPrompt = '', userQuery = '', model = OLLAMA_MODEL } = body;

    if (!userQuery) {
      return new Response(JSON.stringify({ error: 'userQuery is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[Ollama] Generating with model: ${model}`);

    const endpoint = resolveOllamaEndpoint(env);
    const response = await callOllamaAPI(endpoint, model, systemPrompt, userQuery);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Ollama] Error:', response.status, errorText);
      return new Response(JSON.stringify({
        error: 'Ollama error',
        status: response.status,
        details: errorText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const text = data?.response || '';

    return new Response(JSON.stringify({ text, raw: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[Ollama Proxy] Exception:', err);
    return new Response(JSON.stringify({
      error: 'Proxy error - ensure Ollama is running on localhost:11434',
      details: String(err?.message || err)
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
