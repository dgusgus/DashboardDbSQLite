<!-- src/App.vue — Sistema de temas + navegación inferior -->
<template>
  <div id="app" class="app-shell">

    <!-- ── LOADING ──────────────────────────── -->
    <div v-if="!ready" class="splash">
      <div v-if="isLoading" class="splash-inner">
        <!-- Logo / ícono -->
        <div class="splash-icon">
          <div class="splash-icon-lines">
            <div class="sil sil-1"></div>
            <div class="sil sil-2"></div>
            <div class="sil sil-3"></div>
          </div>
        </div>
        <!-- Nombre -->
        <div class="splash-brand">
          <span class="splash-name">Dgus</span>
          <span class="splash-sub-brand">Consultas Electorales</span>
        </div>
        <!-- Tres puntos animados -->
        <div class="splash-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
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
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="app-badge">{{ totalRecords.toLocaleString() }} reg.</span>

          <!-- Botón selector de tema -->
          <button class="theme-toggle-btn" @click="themeMenuOpen = !themeMenuOpen" :title="currentTheme.label">
            <span style="font-size:14px;line-height:1;">{{ currentTheme.emoji }}</span>
          </button>
        </div>

        <!-- Menú de temas -->
        <Teleport to="body">
          <div v-if="themeMenuOpen" class="theme-backdrop" @click="themeMenuOpen = false">
            <div class="theme-menu" @click.stop>
              <div class="theme-menu-title">Tema de color</div>
              <div class="theme-grid">
                <button
                  v-for="t in themes"
                  :key="t.id"
                  class="theme-option"
                  :class="{ active: activeTheme === t.id }"
                  @click="applyTheme(t.id)"
                >
                  <div class="theme-preview" :style="{
                    background: t.bg,
                    borderColor: activeTheme === t.id ? t.accent : 'transparent'
                  }">
                    <div class="tp-bar" :style="{ background: t.surface }">
                      <div class="tp-dot" :style="{ background: t.accent }"></div>
                    </div>
                    <div class="tp-line" :style="{ background: t.surface }"></div>
                    <div class="tp-line short" :style="{ background: t.surface }"></div>
                  </div>
                  <span class="theme-name" :style="{ color: activeTheme === t.id ? t.accent : 'var(--text2)' }">
                    {{ t.emoji }} {{ t.label }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Teleport>
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
import { ref, computed, onMounted } from 'vue'
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

// ── Temas ──────────────────────────────────────────────────────────────
const themes = [
  {
    id: 'dark',
    label: 'Oscuro',
    emoji: '🌙',
    bg:       '#0f1117',
    surface:  '#1a1d27',
    surface2: '#22263a',
    border:   'rgba(255,255,255,0.07)',
    accent:   '#4f8ef7',
    accent2:  '#38d9a9',
    warn:     '#f6ad55',
    danger:   '#fc6b6b',
    text:     '#e8eaf0',
    text2:    '#8b90a7',
    text3:    '#555c7a',
  },
  {
    id: 'light',
    label: 'Claro',
    emoji: '☀️',
    bg:       '#f5f7ff',
    surface:  '#ffffff',
    surface2: '#eef1fb',
    border:   'rgba(0,0,0,0.08)',
    accent:   '#3b75e8',
    accent2:  '#0f9d7a',
    warn:     '#c47f00',
    danger:   '#d43a3a',
    text:     '#1a1d27',
    text2:    '#4a4e6a',
    text3:    '#9194a8',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    emoji: '🌌',
    bg:       '#0a0e1a',
    surface:  '#111828',
    surface2: '#1a2236',
    border:   'rgba(100,181,246,0.1)',
    accent:   '#64b5f6',
    accent2:  '#4dd0e1',
    warn:     '#ffb74d',
    danger:   '#ef5350',
    text:     '#ccd6f6',
    text2:    '#7ea3cc',
    text3:    '#3d5a7a',
  },
  {
    id: 'forest',
    label: 'Forest',
    emoji: '🌿',
    bg:       '#0a1a0e',
    surface:  '#112216',
    surface2: '#1a3320',
    border:   'rgba(56,217,169,0.12)',
    accent:   '#38d9a9',
    accent2:  '#69f0ae',
    warn:     '#ffd54f',
    danger:   '#ff6e6e',
    text:     '#d4f5dc',
    text2:    '#7ac49a',
    text3:    '#3a6a4a',
  },
  {
    id: 'rose',
    label: 'Rose',
    emoji: '🌸',
    bg:       '#140a10',
    surface:  '#1f1018',
    surface2: '#2e1622',
    border:   'rgba(244,143,177,0.12)',
    accent:   '#f48fb1',
    accent2:  '#f06292',
    warn:     '#ffcc02',
    danger:   '#ff5252',
    text:     '#fce4ec',
    text2:    '#c48098',
    text3:    '#7a4060',
  },
]

const STORAGE_KEY = 'app-theme'
const activeTheme = ref('dark')
const themeMenuOpen = ref(false)

const currentTheme = computed(() => themes.find(t => t.id === activeTheme.value) ?? themes[0])

function applyTheme(id) {
  activeTheme.value = id
  themeMenuOpen.value = false
  localStorage.setItem(STORAGE_KEY, id)

  const t = themes.find(th => th.id === id)
  if (!t) return

  const root = document.documentElement
  root.setAttribute('data-theme', id)

  // Actualizar variables CSS en :root
  const vars = {
    '--bg':       t.bg,
    '--surface':  t.surface,
    '--surface2': t.surface2,
    '--border':   t.border,
    '--accent':   t.accent,
    '--accent2':  t.accent2,
    '--warn':     t.warn,
    '--danger':   t.danger,
    '--text':     t.text,
    '--text2':    t.text2,
    '--text3':    t.text3,
  }
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v)
  }

  // Meta theme-color del navegador / PWA
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', t.bg)
}

onMounted(() => {
  initialize()
  const saved = localStorage.getItem(STORAGE_KEY) ?? 'dark'
  applyTheme(saved)
})
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
  transition: background 0.25s ease, color 0.25s ease;
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
  transition: background 0.25s ease, border-color 0.25s ease;
}
.app-title { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em; }
.app-badge {
  font-size: 0.7rem; color: var(--text3);
  background: var(--surface2); padding: 3px 9px;
  border-radius: 20px; border: 1px solid var(--border);
  transition: background 0.25s ease;
}

/* Botón selector de tema */
.theme-toggle-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--surface2);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.theme-toggle-btn:active { transform: scale(0.9); }

/* Backdrop y menú de temas */
.theme-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn 0.15s ease;
}
.theme-menu {
  width: 100%; max-width: 600px;
  background: var(--surface);
  border-radius: var(--radius) var(--radius) 0 0;
  border: 1px solid var(--border);
  padding: 20px 16px 32px;
  animation: slideUp 0.2s ease;
}
.theme-menu-title {
  font-size: 0.8rem; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text3); margin-bottom: 16px;
}
.theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.theme-option {
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  background: none; border: none; cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.theme-preview {
  width: 100%; aspect-ratio: 3/4;
  border-radius: 10px;
  border: 2.5px solid transparent;
  padding: 6px;
  display: flex; flex-direction: column; gap: 4px;
  transition: border-color 0.15s, transform 0.15s;
  overflow: hidden;
}
.theme-option.active .theme-preview,
.theme-option:active .theme-preview { transform: scale(0.95); }
.tp-bar {
  height: 10px; border-radius: 4px;
  display: flex; align-items: center; padding: 0 4px;
}
.tp-dot { width: 5px; height: 5px; border-radius: 50%; }
.tp-line { height: 6px; border-radius: 3px; margin-top: 2px; }
.tp-line.short { width: 60%; }
.theme-name {
  font-size: 0.65rem; font-weight: 700;
  text-align: center; white-space: nowrap;
  transition: color 0.15s;
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
  transition: background 0.25s ease;
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
.splash { height: 100dvh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
.splash-inner {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 32px; text-align: center;
  animation: splashFadeIn 0.5s ease both;
}
.splash-error {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 32px; text-align: center;
}

/* Ícono con líneas */
.splash-icon {
  width: 80px; height: 80px; border-radius: 22px;
  background: var(--surface);
  border: 1.5px solid rgba(79,142,247,0.25);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 7px; padding: 18px;
  animation: splashIconPulse 2.5s ease-in-out infinite;
}
.splash-icon-lines { display: flex; flex-direction: column; gap: 7px; width: 100%; }
.sil {
  height: 4px; border-radius: 3px; background: var(--accent);
  animation: splashBarIn 0.6s ease both;
}
.sil-1 { width: 100%; animation-delay: 0.1s; }
.sil-2 { width: 100%; background: var(--text3); animation-delay: 0.25s; }
.sil-3 { width: 62%;  background: var(--text3); animation-delay: 0.4s; }

/* Nombre */
.splash-brand { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.splash-name {
  font-size: 1.5rem; font-weight: 900; color: var(--text);
  letter-spacing: -0.02em;
  animation: splashSlideUp 0.5s ease 0.3s both;
}
.splash-sub-brand {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent);
  animation: splashSlideUp 0.5s ease 0.45s both;
}

/* Tres puntos */
.splash-dots { display: flex; gap: 6px; margin-top: 4px; }
.dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  animation: splashDotPulse 1.1s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.18s; }
.dot:nth-child(3) { animation-delay: 0.36s; }

/* Error */
.splash-logo { font-size: 2.8rem; }
.splash-title { font-weight: 700; font-size: 1rem; color: var(--text); }
.splash-sub { color: var(--text2); font-size: 0.8rem; max-width: 260px; }
.retry-btn {
  margin-top: 8px; background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius-sm);
  padding: 10px 24px; font-size: 0.88rem; font-weight: 600; cursor: pointer;
}

/* Keyframes del splash */
@keyframes splashFadeIn   { from { opacity:0; transform:scale(0.94) } to { opacity:1; transform:scale(1) } }
@keyframes splashSlideUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
@keyframes splashBarIn    { from { opacity:0; transform:scaleX(0); transform-origin:left } to { opacity:1; transform:scaleX(1) } }
@keyframes splashIconPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(79,142,247,0)} 50%{box-shadow:0 0 0 8px rgba(79,142,247,0.1)} }
@keyframes splashDotPulse { 0%,100%{opacity:0.25;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }

/* Page transitions */
.page-enter-active, .page-leave-active { transition: opacity 0.12s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }

/* ── Shared styles usados en todas las vistas ── */
.search-bar {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg);
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--border);
  transition: background 0.25s ease;
}
.search-wrap { position: relative; }
.search-input {
  width: 100%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  color: var(--text); font-size: 0.95rem;
  padding: 11px 38px 11px 14px;
  outline: none; transition: border-color 0.15s, background 0.25s ease;
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

.share-btn {
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--accent); width: 30px; height: 30px;
  border-radius: 50%; cursor: pointer; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.12s;
}
.share-btn:active { background: var(--accent); color: #fff; }

@keyframes spin    { to { transform: rotate(360deg) } }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
</style>