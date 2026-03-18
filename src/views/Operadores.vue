<!-- src/views/Operadores.vue -->
<template>
  <div>
    <!-- Búsqueda -->
    <div class="search-bar">
      <div class="search-wrap">
        <input
          v-model="q"
          class="search-input"
          placeholder="Nombre, CI, grupo, recinto…"
          type="search"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        <button v-if="q" class="search-clear" @click="q = ''">✕</button>
      </div>
    </div>

    <!-- Chips tipo -->
    <div class="chips">
      <button class="chip" :class="{ active: tipo === '' }"       @click="tipo = ''">Todos</button>
      <button class="chip" :class="{ active: tipo === 'rural' }"  @click="tipo = 'rural'">🌾 Rural</button>
      <button class="chip" :class="{ active: tipo === 'urbano' }" @click="tipo = 'urbano'">🏙️ Urbano</button>
    </div>

    <!-- Conteo -->
    <p class="list-count">{{ filtered.length }} operadores</p>

    <!-- Lista -->
    <div class="card-list">
      <div
        v-for="op in filtered"
        :key="op.id"
        class="person-card"
        @click="open(op)"
      >
        <div class="p-avatar av-op">👷</div>
        <div class="p-body">
          <div class="p-name">{{ op.nombre }}</div>
          <div class="p-sub">CI {{ op.cedula }} · {{ op.grupo || 'Sin grupo' }}</div>
          <div class="p-tags">
            <span class="tag" :class="op.tipo_operador === 'rural' ? 'tag-yellow' : 'tag-blue'">
              {{ op.tipo_operador }}
            </span>
            <span v-if="op.recinto" class="tag tag-gray">{{ op.recinto }}</span>
            <span v-if="op.municipio" class="tag tag-gray">{{ op.municipio }}</span>
            <span v-if="op.actas_asignadas > 0" class="tag tag-green">{{ op.actas_asignadas }} actas</span>
          </div>
        </div>
        <span class="p-arrow">›</span>
      </div>

      <div v-if="filtered.length === 0" class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Sin resultados</div>
      </div>
    </div>

    <!-- Bottom sheet detalle -->
    <Teleport to="body">
      <div v-if="selected" class="sheet-backdrop" @click.self="selected = null">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">{{ selected.nombre }}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="share-btn" @click="shareSelected" title="Compartir">⬆️</button>
              <button class="sheet-close" @click="selected = null">✕</button>
            </div>
          </div>
          <div class="sheet-body">

            <!-- Llamar -->
            <a
              v-if="selected.telefono"
              :href="`tel:${selected.telefono}`"
              class="call-btn"
            >
              📞 Llamar · {{ selected.telefono }}
            </a>

            <!-- Datos personales -->
            <div class="d-section" style="margin-top:14px">
              <div class="d-label">Datos personales</div>
              <div class="d-row"><span class="d-key">CI</span><span class="d-val">{{ selected.cedula }} {{ selected.expedido }}</span></div>
              <div class="d-row"><span class="d-key">Cargo</span><span class="d-val">{{ selected.cargo || '—' }}</span></div>
              <div class="d-row" v-if="selected.correo"><span class="d-key">Correo</span><span class="d-val">{{ selected.correo }}</span></div>
              <div class="d-row"><span class="d-key">Tipo</span>
                <span class="d-val">
                  <span class="tag" :class="selected.tipo_operador === 'rural' ? 'tag-yellow' : 'tag-blue'">
                    {{ selected.tipo_operador }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Organización -->
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

            <!-- Ubicación -->
            <div class="d-section">
              <div class="d-label">Ubicación</div>
              <div class="d-row"><span class="d-key">Recinto</span><span class="d-val">{{ selected.recinto || '—' }}</span></div>
              <div class="d-row" v-if="selected.recinto_direccion"><span class="d-key">Dirección</span><span class="d-val">{{ selected.recinto_direccion }}</span></div>
              <div class="d-row"><span class="d-key">Asiento</span><span class="d-val">{{ selected.asiento_electoral || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Municipio</span><span class="d-val">{{ selected.municipio }}</span></div>
              <div class="d-row"><span class="d-key">Provincia</span><span class="d-val">{{ selected.provincia }}</span></div>
              <div class="d-row"><span class="d-key">Departamento</span><span class="d-val">{{ selected.departamento }}</span></div>
            </div>

            <!-- Notario del mismo recinto -->
            <div class="d-section" v-if="notarios.length > 0">
              <div class="d-label">Notario(s) en este recinto ({{ notarios.length }})</div>
              <div v-for="n in notarios" :key="n.id" style="padding: 6px 0; border-bottom: 1px solid var(--border);">
                <div class="d-row" style="border:none;padding:2px 0"><span class="d-key">Nombre</span><span class="d-val">{{ n.nombre }}</span></div>
                <div class="d-row" style="border:none;padding:2px 0"><span class="d-key">CI</span><span class="d-val">{{ n.ci }} {{ n.expedido }}</span></div>
                <div class="d-row" style="border:none;padding:2px 0" v-if="n.celular">
                  <span class="d-key">Teléfono</span>
                  <a :href="`tel:${n.celular}`" class="d-val" style="color:var(--accent2)">{{ n.celular }}</a>
                </div>
                <div class="d-row" style="border:none;padding:2px 0" v-if="n.cargo">
                  <span class="d-key">Cargo</span><span class="d-val">{{ n.cargo }}</span>
                </div>
              </div>
            </div>
            <div class="d-section" v-else>
              <div class="d-label">Notario en recinto</div>
              <p style="font-size:0.82rem;color:var(--text3);padding:6px 0">Sin notario asignado a este recinto</p>
            </div>

            <!-- Actas -->
            <div class="d-section" v-if="actas.length > 0">
              <div class="d-label">Actas asignadas a este operador ({{ actas.length }})</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { useShare } from '@/composables/useShare.js'
import { queries } from '@/utils/queries.js'

const { query } = useDatabase()
const { share, formatOperador } = useShare()

const all      = ref([])
const q        = ref('')
const tipo     = ref('')
const selected = ref(null)
const actas    = ref([])
const notarios = ref([])

onMounted(() => {
  all.value = query(queries.getAllOperadores())
})

// ── Búsqueda mejorada ──────────────────────────────────────────────────
// Para grupos numéricos ("grupo 1", "1", etc.) usamos coincidencia de token
// completo: "1" no debe coincidir con "10" ni "14".
function matchToken(value, term) {
  if (!value) return false
  const v = value.toString().toLowerCase()
  const t = term.toLowerCase()
  // El término debe estar delimitado por inicio/fin de cadena o espacio/guión
  const regex = new RegExp(
    `(?:^|[\\s\\-_])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s\\-_])`
  )
  return regex.test(v)
}

const filtered = computed(() => {
  let data = all.value
  if (tipo.value) data = data.filter(o => o.tipo_operador === tipo.value)
  if (!q.value)   return data
  const t = q.value.toLowerCase()
  return data.filter(o =>
    // Nombre y CI: búsqueda libre (subcadena normal)
    o.nombre?.toLowerCase().includes(t) ||
    o.cedula?.includes(t) ||
    // Grupo: token completo — "1" no coincide con "10" ni "14"
    matchToken(o.grupo, t) ||
    // El resto: subcadena normal
    o.recinto?.toLowerCase().includes(t) ||
    o.coordinador?.toLowerCase().includes(t) ||
    o.municipio?.toLowerCase().includes(t)
  )
})

function open(op) {
  selected.value = op

  // Actas del operador
  actas.value = op.id
    ? query(`SELECT a.id, a.codigo FROM acta a WHERE a.persona_id = ? ORDER BY a.codigo`, [op.id])
    : []

  // Notario(s) del mismo recinto
  notarios.value = op.recinto_id
    ? query(
        `SELECT p.id, p.nombre, p.ci, p.expedido, p.celular, p.cargo
         FROM persona p
         WHERE p.tipo = 'notario' AND p.recinto_id = ?
         ORDER BY p.nombre`,
        [op.recinto_id]
      )
    : []
}

function shareSelected() {
  const texto = formatOperador(selected.value, actas.value, notarios.value)
  share(texto, selected.value.nombre)
}
</script>