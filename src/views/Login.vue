<!-- src/views/Login.vue -->
<!-- Autentica contra tabla 'coordinador' (ci + correo) en la BD SQLite local -->
<template>
  <div class="login-shell">
    <div class="login-card">

      <div class="login-icon">
        <div class="login-icon-lines">
          <div class="sil sil-1"></div>
          <div class="sil sil-2"></div>
          <div class="sil sil-3"></div>
        </div>
      </div>

      <div class="login-brand">
        <span class="login-name">Dgus</span>
        <span class="login-sub">Consultas Electorales</span>
      </div>

      <form @submit.prevent="login" class="login-form" autocomplete="off">

        <div class="field-group">
          <label class="field-label">Correo electrónico</label>
          <input
          v-model="correo"
          class="field-input"
          type="email"
          placeholder="coordinador@ejemplo.com"
          autocomplete="off"
          required
          />
        </div>
        <div class="field-group">
          <label class="field-label">Carnet de identidad</label>
          <input
            v-model="ci"
            class="field-input"
            type="text"
            placeholder="Ej: 12345678"
            inputmode="numeric"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            required
          />
        </div>
        
        <div v-if="errorMsg" class="login-error">
          {{ errorMsg }}
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>Ingresar</span>
        </button>

      </form>

      <p class="login-hint">
        Ingresa con tu CI y correo registrados como coordinador
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase.js'
import { useAuth } from '@/composables/useAuth.js'

const { query } = useDatabase()
const { setSession } = useAuth()
const router = useRouter()

const ci       = ref('')
const correo   = ref('')
const errorMsg = ref('')
const loading  = ref(false)

async function login() {
  errorMsg.value = ''
  loading.value  = true

  // Pequeño delay para que el spinner sea visible (UX)
  await new Promise(r => setTimeout(r, 400))

  try {
    // Busca el coordinador en la BD local por ci + correo
    // ci y correo se normalizan: trim + toLowerCase para correo
    const rows = query(
      `SELECT id, nombre, ci, correo, celular, nombre_grupo, cargo
       FROM coordinador
       WHERE TRIM(ci) = TRIM(?)
         AND LOWER(TRIM(correo)) = LOWER(TRIM(?))
       LIMIT 1`,
      [ci.value.trim(), correo.value.trim()]
    )

    if (rows.length === 0) {
      errorMsg.value = 'CI o correo incorrecto. Verifica tus datos.'
      return
    }

    const coord = rows[0]

    // Guarda la sesión en sessionStorage (muere al cerrar la pestaña)
    setSession({
      id:          coord.id,
      nombre:      coord.nombre,
      ci:          coord.ci,
      correo:      coord.correo,
      celular:     coord.celular,
      grupo:       coord.nombre_grupo,
      cargo:       coord.cargo,
      loginAt:     Date.now(),
    })

    router.push('/operadores')

  } catch (err) {
    errorMsg.value = 'Error al verificar credenciales. Intenta de nuevo.'
    console.error('Error login:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px 16px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* Ícono igual al splash */
.login-icon {
  width: 72px; height: 72px;
  border-radius: 20px;
  background: var(--surface);
  border: 1.5px solid rgba(79,142,247,0.25);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.login-icon-lines { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.sil { height: 4px; border-radius: 3px; background: var(--accent); }
.sil-1 { width: 100%; }
.sil-2 { width: 100%; background: var(--text3); }
.sil-3 { width: 62%;  background: var(--text3); }

.login-brand {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-align: center;
}
.login-name  { font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text); }
.login-sub   { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }

/* Formulario */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group  { display: flex; flex-direction: column; gap: 6px; }
.field-label  { font-size: 0.75rem; font-weight: 700; color: var(--text2); letter-spacing: 0.03em; }
.field-input {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 0.95rem;
  padding: 12px 14px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  -webkit-appearance: none;
}
.field-input:focus  { border-color: var(--accent); }
.field-input::placeholder { color: var(--text3); }

/* Error */
.login-error {
  background: rgba(252,107,107,0.1);
  border: 1px solid rgba(252,107,107,0.25);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 10px 14px;
  text-align: center;
}

/* Botón */
.login-btn {
  background: var(--accent);
  border: none;
  border-radius: var(--radius);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 14px;
  width: 100%;
  cursor: pointer;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  -webkit-tap-highlight-color: transparent;
}
.login-btn:active   { opacity: 0.85; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.login-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg) } }

.login-hint {
  font-size: 0.72rem;
  color: var(--text3);
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
}
</style>