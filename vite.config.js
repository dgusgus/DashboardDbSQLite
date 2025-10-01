/* import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),vue()],
}) */
// vite.config.js - Configuración corregida para pnpm y sql.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(),tailwindcss()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Configuración específica para sql.js con pnpm
  optimizeDeps: {
    exclude: ['sql.js'],
    include: []
  },

  server: {
    fs: {
      allow: ['..', './node_modules/sql.js']
    },
    // Configuración para servir archivos WASM
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },

  // Configuración de build para PWA
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'sql.js': ['sql.js']
        }
      }
    },
    // Copiar archivos WASM al build
    assetsInlineLimit: 0,
    copyPublicDir: true
  },

  // Configurar MIME types para archivos WASM
  define: {
    global: 'globalThis',
  },

  // Plugin para copiar archivos WASM
  publicDir: 'public',
  
  // Asegurar que los archivos .wasm se sirvan correctamente
  assetsInclude: ['**/*.wasm']
})