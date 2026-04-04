// src/composables/useAuth.js
import { ref, computed } from 'vue'

const SESSION_KEY = 'coord-session'
const _session    = ref(null)

try {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (raw) _session.value = JSON.parse(raw)
} catch { _session.value = null }

export function useAuth() {
  const isAuthenticated = computed(() => _session.value !== null)
  const user            = computed(() => _session.value)
  const userName        = computed(() => _session.value?.nombre ?? '')
  const userGrupo       = computed(() => _session.value?.grupo  ?? '')

  function setSession(data) {
    _session.value = data
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch {}
  }

  function logout() {
    _session.value = null
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
  }

  function checkSession() {
    if (!_session.value) return false
    // Expiración: 8 horas
    if (Date.now() - (_session.value.loginAt ?? 0) > 8 * 60 * 60 * 1000) {
      logout(); return false
    }
    return true
  }

  return { isAuthenticated, user, userName, userGrupo, setSession, logout, checkSession }
}