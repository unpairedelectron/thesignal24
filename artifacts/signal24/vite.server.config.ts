/**
 * Builds the production page server (server/index.ts) into dist/server/index.mjs.
 * It bundles the shared modules from src/lib with the same aliases and env as the
 * app build, so page titles, URLs and structured data are computed by the same code.
 */
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  root: path.resolve(import.meta.dirname),
  // Static files are served from the app build (dist/public), not copied here.
  publicDir: false,
  ssr: {
    // One self-contained file: the deployment runs it with plain `node`.
    noExternal: true,
    target: 'node',
  },
  build: {
    ssr: path.resolve(import.meta.dirname, 'server/index.ts'),
    outDir: path.resolve(import.meta.dirname, 'dist/server'),
    emptyOutDir: true,
    target: 'node20',
    sourcemap: true,
    rollupOptions: {
      output: { entryFileNames: 'index.mjs', format: 'es' },
    },
  },
});
