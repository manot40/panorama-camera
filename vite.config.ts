import { defineConfig } from 'vite';

import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const keyPath = resolve(import.meta.dirname, 'cert.key');
const certPath = resolve(import.meta.dirname, 'cert.crt');

const host = '0.0.0.0';
const isSSL = existsSync(keyPath) && existsSync(certPath);

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],

  server: isSSL ? { host, https: { key: readFileSync(keyPath), cert: readFileSync(certPath) } } : undefined,

  resolve: {
    alias: {
      $ui: resolve(import.meta.dirname, 'src/components/ui'),
      $lib: resolve(import.meta.dirname, 'src/lib'),
      $utils: resolve(import.meta.dirname, 'src/utils'),
      $stores: resolve(import.meta.dirname, 'src/stores'),
      $components: resolve(import.meta.dirname, 'src/components'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const separate = separateChunks.find((m) => id.includes(m));
          if (separate) return separate;
        },
      },
    },
  },
});

const separateChunks = ['three.module', 'three.core'];
