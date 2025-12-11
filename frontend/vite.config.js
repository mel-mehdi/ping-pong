import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  base: '/',
  server: {
    port: 8000,
    open: false,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      clientPort: 443,
    },
	watch: {
		usePolling: true,
	},
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
});
