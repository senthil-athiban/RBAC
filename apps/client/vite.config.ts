
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    https: {
      key: readFileSync('./localhost+1-key.pem'),
      cert: readFileSync('./localhost+1.pem'),
    },
  },
  preview: {
    https: {
      key: readFileSync('./localhost+1-key.pem'),
      cert: readFileSync('./localhost+1.pem'),
    },
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'], // optional: static assets
      manifest: {
        name: 'My Vite PWA App',
        short_name: 'VitePWA',
        description: 'A Progressive Web App built with Vite + React',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'todo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'todo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'todo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      }
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
