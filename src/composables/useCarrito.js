// src/composables/useCarrito.js
// Estado global del carrito de operadores
// Persiste en localStorage — sobrevive al cerrar la app

import { ref, computed } from 'vue'

const STORAGE_KEY = 'carrito-operadores'

// Estado global (fuera del composable para que sea singleton)
const items = ref([])

// Cargar desde localStorage al iniciar
try {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) items.value = JSON.parse(saved)
} catch { items.value = [] }

function guardar() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value)) } catch {}
}

export function useCarrito() {

  const total = computed(() => items.value.length)

  const estaEnCarrito = (id) => items.value.some(op => op.id === id)

  function toggleCarrito(op, actas = []) {
    const idx = items.value.findIndex(o => o.id === op.id)
    if (idx > -1) {
      items.value.splice(idx, 1)
    } else {
      items.value.push({ ...op, actas_carrito: actas })
    }
    guardar()
  }

  function agregar(op, actas = []) {
    if (!estaEnCarrito(op.id)) {
      items.value.push({ ...op, actas_carrito: actas })
      guardar()
    }
  }

  function quitar(id) {
    const idx = items.value.findIndex(o => o.id === id)
    if (idx > -1) { items.value.splice(idx, 1); guardar() }
  }

  function limpiar() {
    items.value = []
    guardar()
  }

  // Genera el texto condensado para compartir
// Helpers (ponlos arriba del composable o dentro si prefieres)
function nombreCorto(nombre = '') {
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) {
    return `${partes[0]} ${partes[partes.length - 1]}`
  }
  return nombre
}

function nombreCoord(nombre = '') {
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) {
    return `${partes[0]} ${partes[partes.length - 2]}`
  }
  return nombre
}

function tipoCorto(tipo) {
  return tipo === 'rural' ? 'M' : 'U'
}

// 🔥 TU FUNCIÓN MODIFICADA
function formatCarrito() {
  if (items.value.length === 0) return ''

  const bloques = items.value.map(op => {

const lineas = [
  `👷 *${nombreCorto(op.nombre).toUpperCase()}* (${op.grupo ? op.grupo.replace('Grupo ', 'G') : '—'}-${tipoCorto(op.tipo_operador)})`,
  `📍 ${op.recinto || '—'}`,
  `📞 ${op.telefono || '—'}`,
  `> ${nombreCoord(op.coordinador || '—')} | ${op.coordinador_telefono || '—'}`
]

    return lineas.join('\n')
  })

  return [
    `🗳️ *OPERADORES (${items.value.length})*`,
    '',
    bloques.join('\n\n') // 👈 separa cada operador con espacio
  ].join('\n')
}

  async function compartirCarrito() {
    const texto = formatCarrito()
    if (!texto) return

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Operadores seleccionados', text: texto })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    // Fallback clipboard
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(texto); toastOk(); return } catch {}
    }

    const ta = document.createElement('textarea')
    ta.value = texto
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.focus(); ta.select()
    try { document.execCommand('copy'); toastOk() } catch { toastError() }
    document.body.removeChild(ta)
  }

  function toastOk() {
    toast('✓ Copiado al portapapeles', '#38d9a9')
  }
  function toastError() {
    toast('No se pudo copiar', '#fc6b6b')
  }
  function toast(msg, color) {
    const el = document.createElement('div')
    el.textContent = msg
    el.style.cssText = `
      position:fixed;bottom:88px;left:50%;transform:translateX(-50%);
      background:${color};color:#0f1117;
      font-size:.82rem;font-weight:700;padding:8px 18px;
      border-radius:20px;z-index:9999;white-space:nowrap;
      box-shadow:0 4px 16px rgba(0,0,0,.3);
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2200)
  }

  return {
    items,
    total,
    estaEnCarrito,
    toggleCarrito,
    agregar,
    quitar,
    limpiar,
    compartirCarrito,
    formatCarrito,
  }
}