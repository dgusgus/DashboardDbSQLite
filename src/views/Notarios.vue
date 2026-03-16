<!-- src/views/Notarios.vue -->
<template>
  <div>
    <div class="search-bar">
      <div class="search-wrap">
        <input v-model="q" class="search-input" placeholder="Nombre, CI, recinto…"
          type="search" autocomplete="off" autocorrect="off" spellcheck="false" />
        <button v-if="q" class="search-clear" @click="q = ''">✕</button>
      </div>
    </div>

    <div class="chips">
      <button class="chip" :class="{ active: tipo === '' }"       @click="tipo = ''">Todos</button>
      <button class="chip" :class="{ active: tipo === 'rural' }"  @click="tipo = 'rural'">🌾 Rural</button>
      <button class="chip" :class="{ active: tipo === 'urbano' }" @click="tipo = 'urbano'">🏙️ Urbano</button>
    </div>

    <p class="list-count">{{ filtered.length }} notarios</p>

    <div class="card-list">
      <div v-for="n in filtered" :key="n.id" class="person-card" @click="selected = n">
        <div class="p-avatar av-no">📝</div>
        <div class="p-body">
          <div class="p-name">{{ n.nombre }}</div>
          <div class="p-sub">CI {{ n.cedula }} · {{ n.recinto || '—' }}</div>
          <div class="p-tags">
            <span class="tag" :class="n.tipo_notario === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ n.tipo_notario }}</span>
            <span v-if="n.municipio" class="tag tag-gray">{{ n.municipio }}</span>
          </div>
        </div>
        <span class="p-arrow">›</span>
      </div>
      <div v-if="filtered.length === 0" class="empty">
        <div class="empty-icon">🔍</div>
        <div class="empty-text">Sin resultados</div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selected" class="sheet-backdrop" @click.self="selected = null">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">{{ selected.nombre }}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="share-btn" @click="share(formatNotario(selected), selected.nombre)" title="Compartir">⬆️</button>
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
              <div class="d-row"><span class="d-key">Tipo</span>
                <span class="d-val"><span class="tag" :class="selected.tipo_notario === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ selected.tipo_notario }}</span></span>
              </div>
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
            <div class="d-section">
              <div class="d-label">Actividad</div>
              <div class="d-row"><span class="d-key">Actas en recinto</span><span class="d-val">{{ selected.actas_en_recinto ?? '—' }}</span></div>
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
const { share, formatNotario } = useShare()
const all      = ref([])
const q        = ref('')
const tipo     = ref('')
const selected = ref(null)

onMounted(() => { all.value = query(queries.getAllNotarios()) })

const filtered = computed(() => {
  let data = all.value
  if (tipo.value) data = data.filter(n => n.tipo_notario === tipo.value)
  if (!q.value)   return data
  const t = q.value.toLowerCase()
  return data.filter(n =>
    n.nombre?.toLowerCase().includes(t) ||
    n.cedula?.includes(t) ||
    n.recinto?.toLowerCase().includes(t) ||
    n.municipio?.toLowerCase().includes(t)
  )
})
</script>