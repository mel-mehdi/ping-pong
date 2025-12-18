import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  publicDir: '../public',
  base: '/',
  server: {
    port: Number(process.env.PORT) || 8000,
    host: '0.0.0.0',
    open: false,
    strictPort: false,
    hmr: false,
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
