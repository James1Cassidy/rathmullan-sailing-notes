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
}    }

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
