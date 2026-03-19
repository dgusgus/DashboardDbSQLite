<!-- src/views/Operadores.vue -->
<template>
  <div>

    <!-- ── BARRA DE BÚSQUEDA ── -->
    <div class="search-bar">
      <div class="search-wrap">
        <input
          v-model="rawQ"
          class="search-input"
          placeholder="Nombre, CI, grupo, recinto…"
          type="search"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <button v-if="rawQ" class="search-clear" @click="rawQ = ''">✕</button>
      </div>
    </div>

    <!-- ── CHIPS TIPO ── -->
    <div class="chips">
      <button class="chip" :class="{ active: tipo === '' }"       @click="tipo = ''">Todos</button>
      <button class="chip" :class="{ active: tipo === 'rural' }"  @click="tipo = 'rural'">🌾 Rural</button>
      <button class="chip" :class="{ active: tipo === 'urbano' }" @click="tipo = 'urbano'">🏙️ Urbano</button>
    </div>

    <!-- ── CONTEO + BOTÓN CARRITO ── -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 3px;">
      <p style="font-size:0.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text3);margin:0;">
        {{ filtered.length }} operadores
      </p>
      <button v-if="total > 0" class="carrito-fab" @click="carritoOpen = true">
        🛒 <span class="carrito-count">{{ total }}</span>
      </button>
    </div>

    <!-- ── LISTA ── -->
    <div class="card-list">
      <div
        v-for="op in filtered"
        :key="op.id"
        class="person-card"
        :class="{ 'card-selected': estaEnCarrito(op.id) }"
        @click="open(op)"
      >
        <div class="p-avatar av-op">👷</div>
        <div class="p-body">
          <div class="p-name">{{ op.nombre }}</div>
          <div class="p-sub">CI {{ op.cedula }} · {{ op.grupo || 'Sin grupo' }}</div>
          <div class="p-tags">
            <span class="tag" :class="op.tipo_operador === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ op.tipo_operador }}</span>
            <span v-if="op.recinto"   class="tag tag-gray">{{ op.recinto }}</span>
            <span v-if="op.municipio" class="tag tag-gray">{{ op.municipio }}</span>
            <span v-if="op.actas_asignadas > 0" class="tag tag-green">{{ op.actas_asignadas }} actas</span>
          </div>
        </div>
        <!-- Botón + / ✓ del carrito -->
        <button
          class="chk-btn"
          :class="{ 'chk-on': estaEnCarrito(op.id) }"
          @click.stop="toggleConActas(op)"
          :title="estaEnCarrito(op.id) ? 'Quitar del carrito' : 'Agregar al carrito'"
        >{{ estaEnCarrito(op.id) ? '✓' : '+' }}</button>
      </div>

      <div v-if="filtered.length === 0" class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Sin resultados</div>
      </div>
    </div>

    <!-- ══ SHEET — DETALLE OPERADOR ══ -->
    <Teleport to="body">
      <div v-if="selected" class="sheet-backdrop" @click.self="selected = null">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">{{ selected.nombre }}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <button
                class="chk-btn-lg"
                :class="{ 'chk-on': estaEnCarrito(selected.id) }"
                @click="toggleConActas(selected)"
              >{{ estaEnCarrito(selected.id) ? '✓ En carrito' : '+ Carrito' }}</button>
              <button class="share-btn" @click="shareSelected" title="Compartir">⬆️</button>
              <button class="sheet-close" @click="selected = null">✕</button>
            </div>
          </div>
          <div class="sheet-body">

            <a v-if="selected.telefono" :href="`tel:${selected.telefono}`" class="call-btn">
              📞 Llamar · {{ selected.telefono }}
            </a>

            <div class="d-section" style="margin-top:14px">
              <div class="d-label">Datos personales</div>
              <div class="d-row"><span class="d-key">CI</span><span class="d-val">{{ selected.cedula }} {{ selected.expedido }}</span></div>
              <div class="d-row"><span class="d-key">Cargo</span><span class="d-val">{{ selected.cargo || '—' }}</span></div>
              <div class="d-row" v-if="selected.correo"><span class="d-key">Correo</span><span class="d-val">{{ selected.correo }}</span></div>
              <div class="d-row">
                <span class="d-key">Tipo</span>
                <span class="d-val"><span class="tag" :class="selected.tipo_operador==='rural'?'tag-yellow':'tag-blue'">{{ selected.tipo_operador }}</span></span>
              </div>
            </div>

            <div class="d-section">
              <div class="d-label">Organización</div>
              <div class="d-row"><span class="d-key">Grupo</span><span class="d-val">{{ selected.grupo || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Coordinador</span><span class="d-val">{{ selected.coordinador || '—' }}</span></div>
              <div class="d-row" v-if="selected.coordinador_telefono">
                <span class="d-key">Tel. coordinador</span>
                <a :href="`tel:${selected.coordinador_telefono}`" class="d-val" style="color:var(--accent2)">{{ selected.coordinador_telefono }}</a>
              </div>
              <div class="d-row"><span class="d-key">Jefe</span><span class="d-val">{{ selected.jefe || '—' }}</span></div>
            </div>

            <div class="d-section">
              <div class="d-label">Ubicación</div>
              <div class="d-row"><span class="d-key">Recinto</span><span class="d-val">{{ selected.recinto || '—' }}</span></div>
              <div class="d-row" v-if="selected.recinto_direccion"><span class="d-key">Dirección</span><span class="d-val">{{ selected.recinto_direccion }}</span></div>
              <div class="d-row"><span class="d-key">Asiento</span><span class="d-val">{{ selected.asiento_electoral || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Municipio</span><span class="d-val">{{ selected.municipio }}</span></div>
              <div class="d-row"><span class="d-key">Provincia</span><span class="d-val">{{ selected.provincia }}</span></div>
              <div class="d-row"><span class="d-key">Departamento</span><span class="d-val">{{ selected.departamento }}</span></div>
            </div>

            <div class="d-section" v-if="notarios.length > 0">
              <div class="d-label">Notario(s) en este recinto ({{ notarios.length }})</div>
              <div v-for="n in notarios" :key="n.id" style="padding:6px 0;border-bottom:1px solid var(--border);">
                <div class="d-row" style="border:none;padding:2px 0"><span class="d-key">Nombre</span><span class="d-val">{{ n.nombre }}</span></div>
                <div class="d-row" style="border:none;padding:2px 0"><span class="d-key">CI</span><span class="d-val">{{ n.ci }} {{ n.expedido }}</span></div>
                <div class="d-row" style="border:none;padding:2px 0" v-if="n.celular">
                  <span class="d-key">Teléfono</span>
                  <a :href="`tel:${n.celular}`" class="d-val" style="color:var(--accent2)">{{ n.celular }}</a>
                </div>
              </div>
            </div>

            <div class="d-section" v-if="actas.length > 0">
              <div class="d-label">Actas asignadas ({{ actas.length }})</div>
              <div class="acta-grid">
                <span v-for="a in actas" :key="a.id" class="acta-pill">{{ a.codigo }}</span>
              </div>
            </div>
            <div class="d-section" v-else>
              <div class="d-label">Actas</div>
              <p style="font-size:0.82rem;color:var(--text3);padding:6px 0">Sin actas asignadas</p>
            </div>

          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ SHEET — CARRITO ══ -->
    <Teleport to="body">
      <div v-if="carritoOpen" class="sheet-backdrop" @click.self="carritoOpen = false">
        <div class="sheet" style="max-height:92dvh;">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">🛒 Selección — {{ total }} operador{{ total !== 1 ? 'es' : '' }}</span>
            <button class="sheet-close" @click="carritoOpen = false">✕</button>
          </div>

          <div class="sheet-body" style="padding-bottom:76px;">
            <div v-for="op in items" :key="op.id" class="carrito-item">
              <div class="carrito-item-head">
                <span class="carrito-item-nombre">👷 {{ op.nombre }}</span>
                <button class="carrito-item-del" @click="quitar(op.id)">✕</button>
              </div>
              <div class="carrito-item-grid">
                <div class="cig-row"><span class="cig-k">Asiento</span><span class="cig-v">{{ op.asiento_electoral || '—' }}</span></div>
                <div class="cig-row"><span class="cig-k">Recinto</span><span class="cig-v">{{ op.recinto || '—' }}</span></div>
                <div class="cig-row">
                  <span class="cig-k">Celular</span>
                  <span class="cig-v">
                    <a v-if="op.telefono" :href="`tel:${op.telefono}`" style="color:var(--accent2)">{{ op.telefono }}</a>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="cig-row"><span class="cig-k">Grupo</span><span class="cig-v">{{ op.grupo || '—' }}</span></div>
                <div class="cig-row"><span class="cig-k">Coordinador</span><span class="cig-v">{{ op.coordinador || '—' }}</span></div>
                <div class="cig-row" v-if="op.coordinador_telefono">
                  <span class="cig-k">Tel. coord.</span>
                  <span class="cig-v">
                    <a :href="`tel:${op.coordinador_telefono}`" style="color:var(--accent2)">{{ op.coordinador_telefono }}</a>
                  </span>
                </div>
                <div class="cig-row" v-if="op.actas_carrito?.length > 0">
                  <span class="cig-k">Actas ({{ op.actas_carrito.length }})</span>
                  <span class="cig-v" style="font-family:monospace;font-size:0.7rem;line-height:1.5;">
                    {{ op.actas_carrito.map(a => a.codigo).join('  ·  ') }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="items.length === 0" class="empty">
              <div class="empty-icon">🛒</div>
              <div class="empty-text">El carrito está vacío</div>
            </div>
          </div>

          <div class="carrito-footer" v-if="items.length > 0">
            <button class="carrito-btn-clear" @click="limpiarCarrito">🗑 Limpiar</button>
            <button class="carrito-btn-share" @click="compartirCarrito">⬆️ Compartir todo</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useDatabase } from '@/composables/useDatabase.js'
import { useShare } from '@/composables/useShare.js'
import { useCarrito } from '@/composables/useCarrito.js'
import { queries } from '@/utils/queries.js'

const { query } = useDatabase()
const { share, formatOperador } = useShare()
const { items, total, estaEnCarrito, toggleCarrito, quitar, limpiar, compartirCarrito } = useCarrito()

const all         = ref([])
const rawQ        = ref('')
const q           = ref('')
const tipo        = ref('')
const selected    = ref(null)
const actas       = ref([])
const notarios    = ref([])
const carritoOpen = ref(false)

onMounted(() => { all.value = query(queries.getAllOperadores()) })

const applyDebounce = useDebounceFn((val) => { q.value = val }, 250)
watch(rawQ, applyDebounce)

function matchToken(value, term) {
  if (!value) return false
  const v = value.toString().toLowerCase()
  const t = term.toLowerCase()
  return new RegExp(`(?:^|[\\s\\-_])${t.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}(?=$|[\\s\\-_])`).test(v)
}

// Detecta si el término parece un código de acta (solo dígitos, mín. 2 chars)
function pareceActa(term) {
  return /^\d[\d\-]*$/.test(term.trim()) && term.trim().length >= 2
}

// SQL directo a la tabla acta — devuelve Set de persona_id que coinciden
function buscarPorActa(term) {
  try {
    const rows = query(
      `SELECT DISTINCT p.id
       FROM acta a
       JOIN persona p ON a.persona_id = p.id
       WHERE a.codigo LIKE ?
       LIMIT 100`,
      [`%${term.trim()}%`]
    )
    return new Set(rows.map(r => r.id))
  } catch {
    return new Set()
  }
}

const filtered = computed(() => {
  let data = all.value
  if (tipo.value) data = data.filter(o => o.tipo_operador === tipo.value)
  if (!q.value) return data

  const t    = q.value.trim()
  const tLow = t.toLowerCase()

  // Si parece número de acta: SQL + filtro normal, sin duplicados
  if (pareceActa(t)) {
    const idsActa = buscarPorActa(t)
    return data.filter(o =>
      idsActa.has(o.id) ||
      o.nombre?.toLowerCase().includes(tLow) ||
      o.cedula?.includes(t) ||
      matchToken(o.grupo, t) ||
      o.recinto?.toLowerCase().includes(tLow) ||
      o.coordinador?.toLowerCase().includes(tLow) ||
      o.municipio?.toLowerCase().includes(tLow)
    )
  }

  // Búsqueda normal de texto
  return data.filter(o =>
    o.nombre?.toLowerCase().includes(tLow) ||
    o.cedula?.includes(t) ||
    matchToken(o.grupo, t) ||
    o.recinto?.toLowerCase().includes(tLow) ||
    o.coordinador?.toLowerCase().includes(tLow) ||
    o.municipio?.toLowerCase().includes(tLow)
  )
})

function open(op) {
  selected.value = op
  actas.value = op.id
    ? query(`SELECT a.id, a.codigo FROM acta a WHERE a.persona_id = ? ORDER BY a.codigo`, [op.id])
    : []
  notarios.value = op.recinto_id
    ? query(`SELECT p.id, p.nombre, p.ci, p.expedido, p.celular FROM persona p WHERE p.tipo='notario' AND p.recinto_id=? ORDER BY p.nombre`, [op.recinto_id])
    : []
}

function toggleConActas(op) {
  if (estaEnCarrito(op.id)) { toggleCarrito(op); return }
  const actasOp = op.id
    ? query(`SELECT a.id, a.codigo FROM acta a WHERE a.persona_id = ? ORDER BY a.codigo`, [op.id])
    : []
  toggleCarrito(op, actasOp)
}

function limpiarCarrito() { limpiar(); carritoOpen.value = false }

function shareSelected() {
  share(formatOperador(selected.value, actas.value, notarios.value), selected.value.nombre)
}
</script>

<style scoped>
.card-selected { border-color: var(--accent) !important; background: rgba(79,142,247,0.05) !important; }

.chk-btn {
  width:28px; height:28px; border-radius:50%;
  border:2px solid var(--text3); background:none; color:var(--text3);
  font-size:0.9rem; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0; align-self:center;
  transition:all 0.15s; -webkit-tap-highlight-color:transparent;
}
.chk-btn.chk-on { background:var(--accent); border-color:var(--accent); color:#fff; }

.carrito-fab {
  display:flex; align-items:center; gap:5px;
  background:var(--accent); color:#fff; border:none; border-radius:20px;
  padding:4px 12px; font-size:0.78rem; font-weight:700;
  cursor:pointer; -webkit-tap-highlight-color:transparent; transition:opacity 0.15s;
}
.carrito-fab:active { opacity:0.8; }
.carrito-count { background:rgba(255,255,255,0.3); border-radius:10px; padding:0 6px; font-size:0.7rem; }

.chk-btn-lg {
  display:flex; align-items:center; gap:4px;
  background:none; border:1.5px solid var(--text3); color:var(--text3);
  border-radius:14px; padding:4px 11px;
  font-size:0.72rem; font-weight:700; cursor:pointer;
  transition:all 0.15s; -webkit-tap-highlight-color:transparent; white-space:nowrap;
}
.chk-btn-lg.chk-on { background:rgba(79,142,247,0.12); border-color:var(--accent); color:var(--accent); }

.carrito-item {
  background:var(--surface2); border:1px solid var(--border);
  border-radius:var(--radius); padding:11px 13px; margin-bottom:8px;
}
.carrito-item-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.carrito-item-nombre { font-size:0.88rem; font-weight:700; color:var(--text); }
.carrito-item-del { background:none; border:none; color:var(--text3); font-size:0.85rem; cursor:pointer; padding:2px 4px; -webkit-tap-highlight-color:transparent; }
.carrito-item-grid { display:flex; flex-direction:column; gap:4px; }
.cig-row { display:flex; justify-content:space-between; gap:10px; }
.cig-k { font-size:0.72rem; color:var(--text3); flex-shrink:0; }
.cig-v { font-size:0.75rem; color:var(--text2); font-weight:600; text-align:right; word-break:break-word; }

.carrito-footer {
  position:absolute; bottom:0; left:0; right:0;
  padding:12px 16px; background:var(--surface); border-top:1px solid var(--border);
  display:flex; gap:8px;
}
.carrito-btn-clear {
  background:var(--surface2); border:1px solid var(--border); color:var(--text2);
  border-radius:var(--radius-sm); padding:11px 16px;
  font-size:0.85rem; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent;
}
.carrito-btn-share {
  flex:1; background:var(--accent); border:none; color:#fff;
  border-radius:var(--radius-sm); padding:11px;
  font-size:0.88rem; font-weight:700; cursor:pointer; -webkit-tap-highlight-color:transparent;
}
.carrito-btn-share:active { opacity:0.85; }
</style>