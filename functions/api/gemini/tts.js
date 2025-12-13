// Cloudflare Pages Function: /api/gemini/tts
// Proxy for TTS - uses browser native Web Speech API as fallback
// (Ollama does not support TTS natively)
// For production TTS, consider: ElevenLabs, Voiceover, or Web Speech API

export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { text = '' } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Since Ollama doesn't support TTS, return a message indicating
    // client should use Web Speech API or skip TTS for now
    return new Response(JSON.stringify({
      error: 'TTS not available with Ollama backend',
      message: 'Use browser Web Speech API instead or integrate ElevenLabs for TTS',
      text: text
    }), {
      status: 501,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('[TTS Proxy] Exception:', err);
    return new Response(JSON.stringify({
      error: 'Proxy error',
      details: String(err?.message || err)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
