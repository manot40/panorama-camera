import { defineConfig } from 'vite';

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],

  server: {
    host: '0.0.0.0',
    https: {
      key: readFileSync('D:\\WebService\\cert\\crt\\localhost.key'),
      cert: readFileSync('D:\\WebService\\cert\\crt\\localhost.crt'),
    },
  },

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
          console.log(id);
          const separate = separateChunks.find((m) => id.includes(m));
          if (separate) return separate;
        },
      },
    },
  },
});

const separateChunks = ['three.module', 'three.core'];
