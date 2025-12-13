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

async function callOllamaAPI(endpoint, model, systemPrompt, userQuery, timeoutMs = 30000) {
  const prompt = systemPrompt ? `${systemPrompt}\n\n${userQuery}` : userQuery;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    console.log(`[Ollama] Calling endpoint: ${endpoint} (timeout: ${timeoutMs}ms)`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return response;
  } catch (e) {
    console.error('[Ollama] Connection error:', e.message);
    const reason = e.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : e.message;
    throw new Error(`Ollama unavailable: ${reason}`);
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
    console.log(`[Ollama] OLLAMA_BASE_URL from env: ${env?.OLLAMA_BASE_URL || '(not set, using default)'}`);

    const endpoint = resolveOllamaEndpoint(env);
    const response = await callOllamaAPI(endpoint, model, systemPrompt, userQuery);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Ollama] Error:', response.status, errorText, 'endpoint:', endpoint);
      return new Response(JSON.stringify({
        error: 'Ollama error',
        status: response.status,
        details: errorText,
        endpoint
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const text = data?.response || '';

    return new Response(JSON.stringify({ text, raw: data, endpoint }), {
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
