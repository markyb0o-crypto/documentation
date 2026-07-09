import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isSingleFile = process.env.VITE_SINGLEFILE === '1';

export default defineConfig({
  plugins: [react(), ...(isSingleFile ? [viteSingleFile()] : [])],
  base: process.env.VITE_BASE || './',
  build: isSingleFile
    ? {
        cssCodeSplit: false,
        assetsInlineLimit: 100000000,
      }
    : undefined,
});
