// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

// ── Inicializar captura del prompt de instalación PWA ──────────────────
// Debe importarse ANTES de montar la app para que el listener
// de 'beforeinstallprompt' quede registrado a tiempo.
import '@/composables/usePwaInstall.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, instance, info) => {
  console.error('🚨 Error global:', err)
  console.error('🔍 Info:', info)
}

console.log('🚀 Iniciando aplicación...')
app.mount('#app')