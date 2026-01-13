// Helper to build WebSocket URLs that work in HTTPS environments and when a backend origin
// (e.g., `VITE_BACKEND_ORIGIN` or `VITE_WS_ORIGIN`) is provided. This makes it easy to
// switch between connecting through the current host (default) or directly to a backend
// host (useful when your websocket service is exposed on a different host like `wcc`).

export function buildWsUrl(path) {
  // path should start with a leading slash (e.g. "/ws/chat/123/")
  const envOrigin = (typeof window !== 'undefined' && import.meta.env) ? (import.meta.env.VITE_WS_ORIGIN || import.meta.env.VITE_BACKEND_ORIGIN || '') : '';

  if (envOrigin && envOrigin.length > 0) {
    // Normalize env origin to a WS(S) URL and trim trailing slash
    let origin = envOrigin.replace(/\/$/, '');

    // If origin starts with http(s)://, convert to ws(s)://
    origin = origin.replace(/^https?:\/\//i, (m) => (m.toLowerCase().startsWith('https') ? 'wss://' : 'ws://'));

    // If origin doesn't include a scheme (e.g., "backend:8001"), assume secure wss
    if (!/^[a-z]+:\/\//i.test(origin)) {
      origin = `wss://${origin}`;
    }

    return `${origin}${path}`;
  }

  // Otherwise derive from current location and use secure WebSocket (always WSS).
  // We intentionally DO NOT fall back to plain `ws:` — all connections should use wss.
  const protocol = 'wss:';
  const host = (typeof window !== 'undefined' && window.location) ? window.location.host : '';
  return `${protocol}//${host}${path}`;
}

// Controlled WebSocket logging helper. Enable by setting VITE_DEBUG_WS=1 (only in DEV).
export function wsLog(...args) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV && (import.meta.env.VITE_DEBUG_WS === '1' || import.meta.env.VITE_DEBUG === '1')) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  } catch (e) {
    // ignore in environments that don't support import.meta
  }
}
