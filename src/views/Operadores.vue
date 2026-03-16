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

onMounted(() => {
  all.value = query(queries.getAllOperadores())
})

const filtered = computed(() => {
  let data = all.value
  if (tipo.value) data = data.filter(o => o.tipo_operador === tipo.value)
  if (!q.value)   return data
  const t = q.value.toLowerCase()
  return data.filter(o =>
    o.nombre?.toLowerCase().includes(t) ||
    o.cedula?.includes(t) ||
    o.grupo?.toLowerCase().includes(t) ||
    o.recinto?.toLowerCase().includes(t) ||
    o.coordinador?.toLowerCase().includes(t) ||
    o.municipio?.toLowerCase().includes(t)
  )
})

function open(op) {
  selected.value = op
  actas.value = op.id
    ? query(`SELECT a.id, a.codigo FROM acta a WHERE a.persona_id = ? ORDER BY a.codigo`, [op.id])
    : []
}

function shareSelected() {
  const texto = formatOperador(selected.value, actas.value)
  share(texto, selected.value.nombre)
}
</script>