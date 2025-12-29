import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: Number(process.env.PORT) || 8000,
    host: '0.0.0.0',
    open: false,
    strictPort: false,
    hmr: false,
    allowedHosts: ['frontend', 'react', 'localhost'],
	watch: {
		usePolling: true,
	},
    // Dev proxy: forward /api requests to the backend container on localhost:8001
    proxy: {
      '/api': {
        // Point to the backend service inside Docker network so the dev server
        // running in the frontend container can reach the API directly.
        // Force Host header to 'localhost' so Django's ALLOWED_HOSTS check passes.
        target: 'http://backend:8001',
        // Keep the original Host header (so backend's ALLOWED_HOSTS will accept it)
        changeOrigin: false,
        secure: false,
        // Add the development public API key header on proxied requests so
        // browser clients don't need special runtime plumbing.
        headers: {
          'X-API-Key': process.env.VITE_PUBLIC_API_KEY || ''
        },
        rewrite: (path) => path.replace(/^\/api/, '/api')
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
});
