// import { tanstackRouter } from '@tanstack/router-plugin/vite';

// tanstackRouter({
//   target: 'react',
//   autoCodeSplitting: true,
// }),
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import path from 'path';
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
