import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
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
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'html/index.html'),
        login: resolve(__dirname, 'html/login.html'),
        register: resolve(__dirname, 'html/register.html'),
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        useDefineForClassFields: true,
      },
    },
  },
});
