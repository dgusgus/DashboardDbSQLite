// vite.config.js - CONFIGURADO PARA RED LOCAL
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // ⭐ CONFIGURACIÓN PARA RED LOCAL
  server: {
    host: true, // ← Esto permite conexiones desde otros dispositivos
    port: 5173, // Puerto por defecto (puedes cambiarlo)
    strictPort: false, // Si el puerto está ocupado, usa otro
    
    // Configuración CORS para evitar problemas
    cors: true,
    
    // Opcional: Abrir navegador automáticamente
    open: false,
    
    // Configuración para servir archivos WASM
    fs: {
      allow: ['..', './node_modules/sql.js']
    },
    
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },

  // Configuración para sql.js
  optimizeDeps: {
    exclude: ['sql.js'],
    include: []
  },

  // Configuración de build
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'sql.js': ['sql.js']
        }
      }
    },
    assetsInlineLimit: 0,
    copyPublicDir: true
  },

  define: {
    global: 'globalThis',
  },

  publicDir: 'public',
  assetsInclude: ['**/*.wasm']
})