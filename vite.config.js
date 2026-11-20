import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  base: '/',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../.site-build',
    assetsDir: 'assets/gogo-home',
    emptyOutDir: true,
    sourcemap: false,
    cssMinify: true,
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom'] } } }
  }
});
