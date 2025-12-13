// Cloudflare Pages Function: /api/gemini/generate
// Proxy for local Ollama text generation API
// Ollama should be running at http://localhost:11434

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'mistral'; // Change to 'llama2', 'neural-chat', etc. as needed

async function callOllamaAPI(model, systemPrompt, userQuery) {
  const prompt = systemPrompt ? `${systemPrompt}\n\n${userQuery}` : userQuery;

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
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

    const response = await callOllamaAPI(model, systemPrompt, userQuery);

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
