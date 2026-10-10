// Golemio API voláme přes vlastní proxy (/api/golemio):
// - produkce: Cloudflare Pages Function (functions/api/golemio/[[path]].js)
// - vývoj: Vite dev server proxy (vite.config.js)
// API klíč tak nikdy nekončí v prohlížeči.
export const fetchGolemioData = async (endpoint) => {
  try {
    const res = await fetch(`/api/golemio${endpoint}`);

    console.log(`[fetch] ${endpoint} →`, res.status);

    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      throw new Error(res.statusText);
    }

    const data = await res.json();
    console.log(`[data] ${endpoint} →`, data);

    return data;
  } catch (e) {
    console.error(`Chyba při fetch z ${endpoint}:`, e);
    return null;
  }
};
