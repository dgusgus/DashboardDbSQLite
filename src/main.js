// src/main.js - VERSIÓN SIMPLIFICADA
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Manejo global de errores
app.config.errorHandler = (err, instance, info) => {
  console.error('🚨 Error global:', err)
  console.error('🔍 Info:', info)
}

// Montar la aplicación directamente
console.log('🚀 Iniciando aplicación...')
app.mount('#app')