export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.FCM_SERVER_KEY; // Set in Cloudflare Pages environment variables
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing FCM_SERVER_KEY' }), { status: 500 });
  }
  try {
    const body = await request.json();
    const { title, body: msgBody, tokens = [], url = '/instructors.html' } = body;
    if (!tokens.length) {
      return new Response(JSON.stringify({ error: 'No tokens supplied' }), { status: 400 });
    }
    // Use data-only payload for background delivery (app closed)
    // Service worker will handle showing the notification
    const payload = {
      registration_ids: tokens,
      data: {
        type: 'urgent-announcement',
        title: title || 'Notification',
        body: msgBody || '',
        url: url,
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        requireInteraction: 'true'
      }
    };
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=' + apiKey
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return new Response(JSON.stringify({ ok: true, fcm: json }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
