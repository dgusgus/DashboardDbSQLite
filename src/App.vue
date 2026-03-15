<!-- src/App.vue — Mobile-first, navegación inferior -->
<template>
  <div id="app" class="app-shell">

    <!-- ── LOADING ──────────────────────────── -->
    <div v-if="!ready" class="splash">
      <div v-if="isLoading" class="splash-inner">
        <div class="splash-logo">📋</div>
        <div class="splash-spinner"></div>
        <p class="splash-text">Cargando datos…</p>
      </div>
      <div v-else-if="error" class="splash-error">
        <div class="splash-logo">⚠️</div>
        <p class="splash-title">Error al cargar</p>
        <p class="splash-sub">{{ error }}</p>
        <button @click="initialize" class="retry-btn">Reintentar</button>
      </div>
    </div>

    <!-- ── APP ─────────────────────────────── -->
    <template v-else>
      <header class="app-header">
        <span class="app-title">{{ currentTitle }}</span>
        <span class="app-badge">{{ totalRecords.toLocaleString() }} reg.</span>
      </header>

      <main class="app-main">
        <transition name="page" mode="out-in">
          <router-view :key="$route.path" />
        </transition>
      </main>

      <nav class="bottom-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: $route.path === item.to }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase.js'

const { isLoading, error, ready, initialize, totalRecords } = useDatabase()
const route = useRoute()

const navItems = [
  { to: '/operadores', icon: '👷', label: 'Operadores' },
  { to: '/notarios',   icon: '📝', label: 'Notarios'   },
  { to: '/recintos',   icon: '🏫', label: 'Recintos'   },
  { to: '/actas',      icon: '📋', label: 'Actas'       },
]

const titleMap = {
  '/operadores': 'Operadores Electorales',
  '/notarios':   'Notarios',
  '/recintos':   'Recintos',
  '/actas':      'Actas',
}
const currentTitle = computed(() => titleMap[route.path] ?? 'Consultas')

onMounted(() => initialize())
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #0f1117;
  --surface:  #1a1d27;
  --surface2: #22263a;
  --border:   rgba(255,255,255,0.07);
  --accent:   #4f8ef7;
  --accent2:  #38d9a9;
  --warn:     #f6ad55;
  --danger:   #fc6b6b;
  --text:     #e8eaf0;
  --text2:    #8b90a7;
  --text3:    #555c7a;
  --radius:   14px;
  --radius-sm:8px;
  --header-h: 52px;
  --nav-h:    64px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}

.app-shell {
  display: flex; flex-direction: column;
  height: 100dvh;
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.app-header {
  height: var(--header-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  position: sticky; top: 0; z-index: 40;
  flex-shrink: 0;
}
.app-title { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em; }
.app-badge {
  font-size: 0.7rem; color: var(--text3);
  background: var(--surface2); padding: 3px 9px;
  border-radius: 20px; border: 1px solid var(--border);
}

/* Main */
.app-main {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Bottom nav */
.bottom-nav {
  height: var(--nav-h);
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex; align-items: center;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
.nav-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 3px;
  text-decoration: none; color: var(--text3);
  transition: color 0.15s; padding: 6px 0;
  -webkit-tap-highlight-color: transparent;
}
.nav-item.active { color: var(--accent); }
.nav-icon { font-size: 1.3rem; line-height: 1; }
.nav-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }

/* Splash */
.splash { height: 100dvh; display: flex; align-items: center; justify-content: center; }
.splash-inner, .splash-error {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 32px; text-align: center;
}
.splash-logo { font-size: 2.8rem; }
.splash-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--surface2); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.splash-text { color: var(--text2); font-size: 0.88rem; }
.splash-title { font-weight: 700; font-size: 1rem; }
.splash-sub { color: var(--text2); font-size: 0.8rem; max-width: 260px; }
.retry-btn {
  margin-top: 8px; background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius-sm);
  padding: 10px 24px; font-size: 0.88rem; font-weight: 600; cursor: pointer;
}

/* Page transitions */
.page-enter-active, .page-leave-active { transition: opacity 0.12s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }

/* ── Shared styles usados en todas las vistas ── */
.search-bar {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg);
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--border);
}
.search-wrap { position: relative; }
.search-input {
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  color: var(--text); font-size: 0.95rem;
  padding: 11px 38px 11px 14px;
  outline: none; transition: border-color 0.15s;
  -webkit-appearance: none;
}
.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--text3); }
.search-clear {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--text3);
  font-size: 1rem; cursor: pointer; padding: 4px;
  -webkit-tap-highlight-color: transparent;
}

.chips {
  display: flex; gap: 7px; overflow-x: auto;
  padding: 8px 12px 2px; scrollbar-width: none;
}
.chips::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 20px; color: var(--text2);
  font-size: 0.72rem; font-weight: 700; padding: 5px 12px;
  cursor: pointer; transition: all 0.12s;
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}
.chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.list-count {
  padding: 8px 14px 3px;
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text3);
}

.card-list { padding: 6px 10px 80px; display: flex; flex-direction: column; gap: 7px; }

/* Cards */
.person-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 13px;
  cursor: pointer; transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
  display: flex; align-items: flex-start; gap: 11px;
}
.person-card:active { background: var(--surface2); }
.p-avatar {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.05rem; flex-shrink: 0;
}
.av-op { background: rgba(79,142,247,0.15); }
.av-no { background: rgba(56,217,169,0.15); }
.av-re { background: rgba(246,173,85,0.15); }
.av-ac { background: rgba(252,107,107,0.12); }

.p-body { flex: 1; min-width: 0; }
.p-name {
  font-weight: 700; font-size: 0.9rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.p-sub {
  font-size: 0.76rem; color: var(--text2); margin-top: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.p-tags { display: flex; gap: 5px; margin-top: 6px; flex-wrap: wrap; }
.tag {
  font-size: 0.66rem; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
}
.tag-blue   { background: rgba(79,142,247,0.15); color: #7eb3ff; }
.tag-green  { background: rgba(56,217,169,0.15); color: #38d9a9; }
.tag-yellow { background: rgba(246,173,85,0.15); color: #f6ad55; }
.tag-red    { background: rgba(252,107,107,0.15); color: #fc6b6b; }
.tag-gray   { background: rgba(255,255,255,0.06); color: var(--text2); }
.p-arrow { color: var(--text3); font-size: 0.9rem; align-self: center; flex-shrink: 0; }

.empty {
  text-align: center; padding: 60px 24px; color: var(--text2);
}
.empty-icon { font-size: 2.2rem; opacity: 0.35; margin-bottom: 10px; }
.empty-text { font-size: 0.88rem; }

/* Bottom sheet */
.sheet-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); z-index: 100;
  display: flex; align-items: flex-end;
  animation: fadeIn 0.15s ease;
}
.sheet {
  width: 100%; max-height: 88dvh;
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden; display: flex; flex-direction: column;
  animation: slideUp 0.2s ease;
}
.sheet-handle {
  width: 36px; height: 4px; background: var(--border);
  border-radius: 2px; margin: 10px auto 4px; flex-shrink: 0;
}
.sheet-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.sheet-title { font-weight: 700; font-size: 0.97rem; }
.sheet-close {
  background: var(--surface2); border: none; color: var(--text2);
  width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
}
.sheet-body { overflow-y: auto; flex: 1; padding: 14px 16px 24px; }

.d-section { margin-bottom: 18px; }
.d-label {
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--text3); margin-bottom: 8px;
}
.d-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 8px 0; border-bottom: 1px solid var(--border); gap: 10px;
}
.d-row:last-child { border-bottom: none; }
.d-key { font-size: 0.8rem; color: var(--text2); flex-shrink: 0; }
.d-val { font-size: 0.83rem; font-weight: 600; text-align: right; word-break: break-word; }

.call-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: rgba(56,217,169,0.12); border: 1.5px solid rgba(56,217,169,0.25);
  color: var(--accent2); border-radius: var(--radius);
  padding: 13px; font-size: 0.9rem; font-weight: 700;
  text-decoration: none; margin-top: 4px; width: 100%;
  -webkit-tap-highlight-color: transparent;
}

.acta-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.acta-pill {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 8px; padding: 5px 10px;
  font-size: 0.75rem; font-family: monospace; color: var(--text);
}

@keyframes spin    { to { transform: rotate(360deg) } }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
</style>