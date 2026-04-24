// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel'; 

// https://astro.build/config
export default defineConfig({
  // 1. Ubah ke 'server' agar fitur Login & Database (SSR) jalan di Vercel
  output: 'server', 

  // 2. Gunakan adapter Vercel standar (otomatis optimasi performa)
  adapter: vercel({
    webAnalytics: { enabled: true }, // Opsional: Biar lu bisa pantau trafik di Vercel
    imagesConfig: { sizes: [320, 480, 640, 750, 828, 1080, 1200] }, // Optimasi Gambar otomatis
  }),

  integrations: [
    react() // Tetap pake React buat komponen interaktif lu
  ],

  // 3. Tambahan: Biar routing lu makin smooth dan gak 404 pas refresh
  build: {
    format: 'directory'
  }
});
