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
    const payload = {
      registration_ids: tokens,
      notification: {
        title: title || 'Notification',
        body: msgBody || '',
        click_action: url,
        icon: '/images/logo.png'
      },
      data: { url }
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
