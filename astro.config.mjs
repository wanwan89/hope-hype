// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // 1. Import adapternya

// https://astro.build/config
export default defineConfig({
  output: 'server', // 2. WAJIB: Ubah dari static ke server
  adapter: vercel(), // 3. Pasang adapternya di sini
  integrations: [react()]
});
