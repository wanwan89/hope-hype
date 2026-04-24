// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel'; 

// https://astro.build/config
export default defineConfig({
  output: 'server', 

  adapter: vercel({
    // 🔥 FIX: Ubah ke false atau hapus baris ini biar gak error 404
    webAnalytics: { enabled: false }, 
    imagesConfig: { sizes: [320, 480, 640, 750, 828, 1080, 1200] },
  }),

  integrations: [
    react()
  ],

  build: {
    format: 'directory'
  }
});
