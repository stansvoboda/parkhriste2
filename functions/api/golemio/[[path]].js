// Cloudflare Pages Function – proxy pro Golemio API (kvůli CORS a skrytí API klíče)
// /api/golemio/v2/gardens → https://api.golemio.cz/v2/gardens
export async function onRequestGet({ request, env }) {
  const apiKey = env.GOLEMIO_KEY;

  if (!apiKey) {
    return Response.json({ error: 'API klíč není nastaven' }, { status: 500 });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/golemio/, '');
  const golemioUrl = `https://api.golemio.cz${path}${url.search}`;

  try {
    const response = await fetch(golemioUrl, {
      headers: { 'X-Access-Token': apiKey },
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    if (!response.ok) {
      return Response.json(
        { error: `Golemio API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
