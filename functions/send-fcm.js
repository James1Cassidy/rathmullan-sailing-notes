export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.FCM_SERVER_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing FCM_SERVER_KEY' }), { status: 500 });
  }
  try {
    const body = await request.json();
    const { title, body: msgBody, tokens = [], url = '/instructors.html' } = body;
    if (!tokens.length) {
      return new Response(JSON.stringify({ error: 'No tokens supplied' }), { status: 400 });
    }

    // Send individual messages to each token for better delivery
    const results = [];
    for (const token of tokens) {
      // Use notification + data payload for reliable background delivery
      const payload = {
        to: token,
        priority: 'high',
        content_available: true,
        time_to_live: 86400,
        notification: {
          title: title || 'Sailing School',
          body: msgBody || 'New notification',
          icon: '/images/logo.png',
          badge: '/images/logo.png',
          click_action: url,
          sound: 'default',
          tag: 'urgent-announcement'
        },
        data: {
          type: 'urgent-announcement',
          title: title || 'Sailing School',
          body: msgBody || '',
          url: url
        }
      };

      try {
        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=' + apiKey
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        results.push({ token: token.substring(0, 20) + '...', result: json });
      } catch (e) {
        results.push({ token: token.substring(0, 20) + '...', error: e.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
