// src/composables/useAuth.js
// Maneja la sesión del coordinador autenticado.
// Usa sessionStorage → la sesión muere al cerrar la pestaña (comportamiento correcto
// para un sistema de consultas compartido o en móvil).

import { ref, computed } from 'vue'

const SESSION_KEY = 'coord-session'

// Estado global reactivo (singleton entre componentes)
const _session = ref(null)

// Inicializar desde sessionStorage al cargar el módulo
try {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (raw) _session.value = JSON.parse(raw)
} catch {
  _session.value = null
}

export function useAuth() {

  // ── Computed ──────────────────────────────────────────────────────
  const isAuthenticated = computed(() => _session.value !== null)
  const user            = computed(() => _session.value)
  const userName        = computed(() => _session.value?.nombre ?? '')
  const userGrupo       = computed(() => _session.value?.grupo  ?? '')

  // ── Métodos ───────────────────────────────────────────────────────

  /** Guarda la sesión en memoria y en sessionStorage */
  function setSession(data) {
    _session.value = data
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('No se pudo persistir la sesión:', e)
    }
  }

  /** Cierra la sesión y limpia el storage */
  function logout() {
    _session.value = null
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {}
  }

  /** Verifica si la sesión sigue válida (opcional: añadir expiración) */
  function checkSession() {
    if (!_session.value) return false
    // Expiración opcional: 8 horas
    const EIGHT_HOURS = 8 * 60 * 60 * 1000
    if (Date.now() - (_session.value.loginAt ?? 0) > EIGHT_HOURS) {
      logout()
      return false
    }
    return true
  }

  return {
    isAuthenticated,
    user,
    userName,
    userGrupo,
    setSession,
    logout,
    checkSession,
  }
}