<!-- src/views/Login.vue -->
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

      <!-- ══ MODO BIOMÉTRICO ══════════════════════════════════════════ -->
      <div v-if="bioAvailable && bioRegistered && !showForm" class="bio-section">

        <button class="bio-btn" @click="loginWithBio" :disabled="loading">
          <span v-if="loading" class="login-spinner"></span>
          <template v-else>
            <svg class="bio-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 1C8.5 1 5.5 3.5 5.5 7c0 2.5 1 5 2.5 7"/>
              <path d="M12 1c3.5 0 6.5 2.5 6.5 6 0 2.5-1 5-2.5 7"/>
              <path d="M9 10c0-1.7 1.3-3 3-3s3 1.3 3 3c0 3-1.5 5.5-3 7"/>
              <circle cx="12" cy="19" r="2.5"/>
            </svg>
            <span>Usar huella digital</span>
          </template>
        </button>

        <div v-if="bioError" class="login-error" style="margin-top:8px;">{{ bioError }}</div>

        <button class="link-btn" @click="showForm = true" style="margin-top:16px;">
          Ingresar con CI y correo
        </button>
      </div>

      <!-- ══ FORMULARIO CI + CORREO ═══════════════════════════════════ -->
      <template v-else>
        <form @submit.prevent="loginWithForm" class="login-form" autocomplete="off">

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

          <div v-if="formError" class="login-error">{{ formError }}</div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="login-spinner"></span>
            <span v-else>Ingresar</span>
          </button>

        </form>

        <button
          v-if="bioAvailable && bioRegistered"
          class="link-btn"
          @click="showForm = false"
          style="margin-top:8px;"
        >
          ← Usar huella digital
        </button>
      </template>

      <!-- ══ DIÁLOGO: OFRECER REGISTRO BIOMÉTRICO ═════════════════════ -->
      <Teleport to="body">
        <div v-if="showBioPrompt" class="bio-prompt-backdrop">
          <div class="bio-prompt">
            <div class="bio-prompt-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="color:var(--accent)">
                <path d="M12 1C8.5 1 5.5 3.5 5.5 7c0 2.5 1 5 2.5 7"/>
                <path d="M12 1c3.5 0 6.5 2.5 6.5 6 0 2.5-1 5-2.5 7"/>
                <path d="M9 10c0-1.7 1.3-3 3-3s3 1.3 3 3c0 3-1.5 5.5-3 7"/>
                <circle cx="12" cy="19" r="2.5"/>
              </svg>
            </div>
            <p class="bio-prompt-title">¿Activar ingreso con huella?</p>
            <p class="bio-prompt-sub">
              La próxima vez ingresarás sin escribir tus datos.
              Tu huella nunca sale de este dispositivo.
            </p>
            <div class="bio-prompt-actions">
              <button class="bio-prompt-skip"   @click="skipBio">Ahora no</button>
              <button class="bio-prompt-accept" @click="registerBio" :disabled="bioRegistering">
                <span v-if="bioRegistering" class="login-spinner" style="width:14px;height:14px;border-top-color:#fff;border-color:rgba(255,255,255,.3)"></span>
                <span v-else>Activar</span>
              </button>
            </div>
            <p v-if="bioRegisterError" class="bio-prompt-err">{{ bioRegisterError }}</p>
          </div>
        </div>
      </Teleport>

      <p class="login-hint">
        {{ (bioAvailable && bioRegistered && !showForm)
          ? 'Toca el botón y coloca tu huella digital'
          : 'Ingresa con tu CI y correo registrados como coordinador' }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase }  from '@/composables/useDatabase.js'
import { useAuth }      from '@/composables/useAuth.js'
import { useBiometric } from '@/composables/useBiometric.js'

const { query }      = useDatabase()
const { setSession } = useAuth()
const { isSupported, hasCredential, register, authenticate, clearCredential } = useBiometric()
const router = useRouter()

const ci      = ref('')
const correo  = ref('')
const loading = ref(false)
const showForm = ref(false)
const formError = ref('')

const bioAvailable     = ref(false)
const bioRegistered    = ref(false)
const bioError         = ref('')
const showBioPrompt    = ref(false)
const bioRegistering   = ref(false)
const bioRegisterError = ref('')

let _pendingUser = null

onMounted(async () => {
  bioAvailable.value  = await isSupported()
  bioRegistered.value = hasCredential()
  if (!bioAvailable.value || !bioRegistered.value) showForm.value = true
})

// ── Login formulario ──────────────────────────────────────────────────────
async function loginWithForm() {
  formError.value = ''
  loading.value   = true
  await new Promise(r => setTimeout(r, 350))
  try {
    const rows = query(
      `SELECT id, nombre, ci, correo, celular, nombre_grupo, cargo
       FROM coordinador
       WHERE TRIM(ci) = TRIM(?)
         AND LOWER(TRIM(correo)) = LOWER(TRIM(?))
       LIMIT 1`,
      [ci.value.trim(), correo.value.trim()]
    )
    if (!rows.length) {
      formError.value = 'CI o correo incorrecto. Verifica tus datos.'
      return
    }
    const c = rows[0]
    const session = { id: c.id, nombre: c.nombre, ci: c.ci, correo: c.correo,
      celular: c.celular, grupo: c.nombre_grupo, cargo: c.cargo, loginAt: Date.now() }
    setSession(session)
    _pendingUser = session

    if (bioAvailable.value && !bioRegistered.value) {
      showBioPrompt.value = true   // ofrecer registro — no navegar aún
    } else {
      router.push('/operadores')
    }
  } catch (err) {
    formError.value = 'Error al verificar. Intenta de nuevo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Login biométrico ──────────────────────────────────────────────────────
async function loginWithBio() {
  bioError.value = ''
  loading.value  = true
  try {
    const result = await authenticate()
    if (!result) { bioError.value = 'No se pudo verificar la huella. Intenta de nuevo.'; return }

    if (result._needsReload) {
      // sessionStorage expiró (pestaña cerrada) → recargar desde BD
      const rows = query(
        `SELECT id, nombre, ci, correo, celular, nombre_grupo, cargo
         FROM coordinador WHERE id = ? LIMIT 1`,
        [result.userId]
      )
      if (!rows.length) {
        clearCredential(); bioRegistered.value = false
        showForm.value = true
        bioError.value = 'Sesión expirada. Ingresa con CI y correo.'
        return
      }
      const c = rows[0]
      setSession({ id: c.id, nombre: c.nombre, ci: c.ci, correo: c.correo,
        celular: c.celular, grupo: c.nombre_grupo, cargo: c.cargo, loginAt: Date.now() })
    } else {
      setSession({ ...result, loginAt: Date.now() })
    }
    router.push('/operadores')
  } catch (err) {
    bioError.value = 'Error en autenticación biométrica.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Registro biométrico ───────────────────────────────────────────────────
async function registerBio() {
  bioRegisterError.value = ''
  bioRegistering.value   = true
  try {
    const ok = await register(_pendingUser)
    if (ok) {
      bioRegistered.value = true
      showBioPrompt.value = false
      router.push('/operadores')
    } else {
      bioRegisterError.value = 'Registro cancelado. Puedes activarlo luego.'
    }
  } catch (err) {
    bioRegisterError.value = 'No se pudo registrar: ' + err.message
  } finally {
    bioRegistering.value = false
  }
}

function skipBio() {
  showBioPrompt.value = false
  router.push('/operadores')
}
</script>

<style scoped>
.login-shell {
  min-height: 100dvh; display: flex; align-items: center;
  justify-content: center; background: var(--bg); padding: 24px 16px;
}
.login-card {
  width: 100%; max-width: 360px;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
}
.login-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: var(--surface); border: 1.5px solid rgba(79,142,247,0.25);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.login-icon-lines { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.sil { height: 4px; border-radius: 3px; background: var(--accent); }
.sil-1 { width: 100%; }
.sil-2 { width: 100%; background: var(--text3); }
.sil-3 { width: 62%; background: var(--text3); }
.login-brand { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.login-name { font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text); }
.login-sub  { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }

.bio-section { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bio-btn {
  width: 100%; min-height: 60px;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius); color: var(--text);
  display: flex; align-items: center; justify-content: center; gap: 12px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  transition: border-color 0.15s, background 0.1s;
  -webkit-tap-highlight-color: transparent;
}
.bio-btn:active  { background: var(--surface2); border-color: var(--accent); }
.bio-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.bio-icon { width: 28px; height: 28px; color: var(--accent); flex-shrink: 0; }

.login-form { width: 100%; display: flex; flex-direction: column; gap: 14px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--text2); }
.field-input {
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius); color: var(--text); font-size: 0.95rem;
  padding: 12px 14px; outline: none; width: 100%;
  transition: border-color 0.15s; -webkit-appearance: none;
}
.field-input:focus { border-color: var(--accent); }
.field-input::placeholder { color: var(--text3); }
.login-error {
  background: rgba(252,107,107,0.1); border: 1px solid rgba(252,107,107,0.25);
  border-radius: var(--radius-sm); color: var(--danger);
  font-size: 0.82rem; font-weight: 600; padding: 10px 14px; text-align: center;
}
.login-btn {
  background: var(--accent); border: none; border-radius: var(--radius);
  color: #fff; font-size: 0.95rem; font-weight: 700; padding: 14px;
  width: 100%; cursor: pointer; min-height: 50px;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s; -webkit-tap-highlight-color: transparent;
}
.login-btn:active { opacity: 0.85; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.link-btn {
  background: none; border: none; color: var(--text3);
  font-size: 0.8rem; cursor: pointer; padding: 6px;
  text-decoration: underline; text-underline-offset: 3px;
  -webkit-tap-highlight-color: transparent;
}
.link-btn:active { color: var(--accent); }
.login-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg) } }
.login-hint {
  font-size: 0.72rem; color: var(--text3);
  text-align: center; line-height: 1.5; max-width: 280px;
}

.bio-prompt-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300;
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn 0.15s ease;
}
.bio-prompt {
  width: 100%; max-width: 480px;
  background: var(--surface); border-radius: var(--radius) var(--radius) 0 0;
  border: 1px solid var(--border); padding: 28px 20px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  animation: slideUp 0.2s ease;
}
.bio-prompt-title { font-size: 1rem; font-weight: 700; color: var(--text); text-align: center; }
.bio-prompt-sub   { font-size: 0.82rem; color: var(--text2); text-align: center; line-height: 1.5; max-width: 280px; }
.bio-prompt-actions { display: flex; gap: 10px; width: 100%; margin-top: 6px; }
.bio-prompt-skip {
  flex: 1; background: var(--surface2); border: 1px solid var(--border);
  color: var(--text2); border-radius: var(--radius); padding: 13px;
  font-size: 0.88rem; font-weight: 700; cursor: pointer;
}
.bio-prompt-accept {
  flex: 2; background: var(--accent); border: none; color: #fff;
  border-radius: var(--radius); padding: 13px; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.bio-prompt-accept:disabled { opacity: 0.7; }
.bio-prompt-err { font-size: 0.75rem; color: var(--danger); text-align: center; }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
</style>