import { defineConfig } from 'vite';

import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],

  resolve: {
    alias: {
      $lib: resolve(import.meta.dirname, 'src/lib'),
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
