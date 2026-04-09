// src/composables/usePwaInstall.js
// Captura el evento beforeinstallprompt y lo guarda para mostrarlo
// en el momento correcto (después del login, no durante la redirección).

import { ref, readonly } from 'vue'

// Singleton — el evento solo se dispara una vez por sesión
const _deferredPrompt = ref(null)
const _canInstall     = ref(false)
const _isInstalled    = ref(false)

// Capturar el evento lo antes posible (antes de que Vue monte)
if (typeof window !== 'undefined') {
  // Ya instalada como PWA standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    _isInstalled.value = true
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir el mini-infobar automático de Chrome
    e.preventDefault()
    _deferredPrompt.value = e
    _canInstall.value     = true
    console.log('📲 PWA: prompt de instalación disponible')
  })

  window.addEventListener('appinstalled', () => {
    _deferredPrompt.value = null
    _canInstall.value     = false
    _isInstalled.value    = true
    console.log('✅ PWA: app instalada')
  })
}

export function usePwaInstall() {

  /**
   * Muestra el diálogo nativo de instalación.
   * Devuelve 'accepted' | 'dismissed' | 'unavailable'
   */
  async function promptInstall() {
    if (!_deferredPrompt.value) return 'unavailable'

    try {
      _deferredPrompt.value.prompt()
      const { outcome } = await _deferredPrompt.value.userChoice
      console.log(`📲 PWA: usuario eligió "${outcome}"`)

      if (outcome === 'accepted') {
        _deferredPrompt.value = null
        _canInstall.value     = false
      }

      return outcome
    } catch (err) {
      console.warn('Error mostrando prompt de instalación:', err)
      return 'unavailable'
    }
  }

  return {
    canInstall:  readonly(_canInstall),
    isInstalled: readonly(_isInstalled),
    promptInstall,
  }
}