// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/DashboardDbSQLite/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,db,mp3}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /\.db$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'database-cache',
              expiration: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: { cacheName: 'wasm-cache' }
          }
        ]
      },

      manifest: {
        name: 'Sistema de Consultas Electoral',
        short_name: 'Consultas',
        description: 'Consulta operadores, notarios y recintos electorales',
        theme_color: '#0f1117',
        background_color: '#0f1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/DashboardDbSQLite/',
        scope: '/DashboardDbSQLite/',
        icons: [
          // ✅ CORREGIDO: rutas relativas (sin "/" al inicio)
          // Vite las resuelve contra base automáticamente
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },

  server: {
    host: true,
    port: 5173,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },

  optimizeDeps: { exclude: ['sql.js'] },

  build: {
    rollupOptions: {
      output: { manualChunks: { 'sql.js': ['sql.js'] } }
    },
    assetsInlineLimit: 0
  },

  define: { global: 'globalThis' },
  publicDir: 'public',
  assetsInclude: ['**/*.wasm']
})