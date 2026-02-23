import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

const SSL_CERT_DIR = resolve(__dirname, '../nginx/ssl');

function loadHttpsConfig() {
  try {
    return {
      key: fs.readFileSync(resolve(SSL_CERT_DIR, 'nginx.key')),
      cert: fs.readFileSync(resolve(SSL_CERT_DIR, 'nginx.crt')),
    };
  } catch (err) {
    console.warn('⚠️ SSL certs not found at', SSL_CERT_DIR, '— falling back to https:true. Browsers will warn for self-signed certs.', err);
    return true;
  }
}

// HMR runtime overrides (read at module initialization)
// Set VITE_HMR_HOST=auto to let the client use the current page hostname (good for IP access)
// Set VITE_HMR_PROTOCOL to 'wss' or 'ws' if you need to override
// Set VITE_SKIP_HTTPS=true to run the dev server without TLS (useful for IP access or devices with untrusted certs)
const vHmrHost = (typeof process.env.VITE_HMR_HOST !== 'undefined' && process.env.VITE_HMR_HOST !== '') ? process.env.VITE_HMR_HOST : undefined;
const hmrHost = vHmrHost === 'auto' ? undefined : vHmrHost;
const skipHttps = process.env.VITE_SKIP_HTTPS === 'true' || process.env.VITE_SKIP_HTTPS === '1';
const defaultHmrProtocol = skipHttps ? (process.env.VITE_HMR_PROTOCOL || 'ws') : (process.env.VITE_HMR_PROTOCOL || 'wss');
const defaultHmrClientPort = process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : (skipHttps ? (process.env.PORT ? Number(process.env.PORT) : 5173) : 443);

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: Number(process.env.PORT) || 5173,
    host: '0.0.0.0',
    https: skipHttps ? false : loadHttpsConfig(),
    open: false,
    strictPort: false,
    watch: {
      usePolling: true,
    },
    hmr: {
      protocol: defaultHmrProtocol,
      host: (typeof process.env.VITE_HMR_HOST !== 'undefined' && process.env.VITE_HMR_HOST !== '') ? (process.env.VITE_HMR_HOST === 'auto' ? undefined : process.env.VITE_HMR_HOST) : undefined,
      clientPort: defaultHmrClientPort,
      path: '/@vite/client',
      // Add timeout and overlay options
      timeout: 30000,
      overlay: false,
    },
    // Reduce client-side work and noise in dev tooling
    // Set lower log level to avoid excessive message handling
    logLevel: 'warn',
    // Dev proxy: forward important backend requests to the backend container
    proxy: {
      '/api': {
        // Point to the backend service inside Docker network so the dev server
        // running in the frontend container can reach the API directly.
        // Force Host header to 'localhost' so Django's ALLOWED_HOSTS check passes.
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        // Keep the original Host header (so backend's ALLOWED_HOSTS will accept it)
        changeOrigin: false,
        secure: false,
        // Add the development public API key header on proxied requests so
        // browser clients don't need special runtime plumbing.
        headers: {
          'X-API-Key': process.env.VITE_PUBLIC_API_KEY || ''
        },
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },

      // Proxy authentication, user, admin and media endpoints to backend in dev
      '/auth': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
        headers: {
          'Host': 'localhost'
        }
      },
      '/users': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
        headers: {
          'Host': 'localhost'
        }
      },

      // Proxy top-level user management endpoints (friendships, profiles, notifications, achievements)
      '/friendships': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
        headers: {
          'Host': 'localhost'
        }
      },

      '/profiles': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      '/notifications': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      '/achievements': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      // Proxy chat API endpoints to backend in dev (only specific sub-paths, not /chat itself)
      '/chat/conversations': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/chat/messages': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      '/admin': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/media': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      // Proxy game API endpoints to backend (only specific sub-paths, not /game itself)
      '/game/tournaments': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/game/invitations': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/game/matches': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/game/leaderboard': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },
      '/game/ai': {
        target: process.env.VITE_DEV_BACKEND_TARGET || 'https://backend:8001',
        changeOrigin: false,
        secure: false,
      },

      // Proxy WebSocket connections to backend
      '/ws': {
        target: process.env.VITE_DEV_WS_TARGET || 'wss://backend:8001',
        ws: true,
        changeOrigin: false,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  clearScreen: false,
});
