// Cloudflare Worker example to proxy tidesnear.me JSON
// Deploy by adding this to your Worker and binding no special vars required.
// This helps avoid client-side CORS issues.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== '/rathmullan-tides') {
      return new Response('Not found', { status: 404 });
    }
    const upstream = 'https://tidesnear.me/api/v2/stations/tide/3459?language=en-GB';
    try {
      const resp = await fetch(upstream, {
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      });
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: 'Upstream ' + resp.status }), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
      }
      const data = await resp.text(); // pass through raw
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=600'
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
};
