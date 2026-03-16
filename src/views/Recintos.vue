<!-- src/views/Recintos.vue -->
<template>
  <div>
    <div class="search-bar">
      <div class="search-wrap">
        <input v-model="q" class="search-input" placeholder="Nombre, municipio, provincia…"
          type="search" autocomplete="off" autocorrect="off" spellcheck="false" />
        <button v-if="q" class="search-clear" @click="q = ''">✕</button>
      </div>
    </div>

    <div class="chips">
      <button class="chip" :class="{ active: tipo === '' }"       @click="tipo = ''">Todos</button>
      <button class="chip" :class="{ active: tipo === 'rural' }"  @click="tipo = 'rural'">🌾 Rural</button>
      <button class="chip" :class="{ active: tipo === 'urbano' }" @click="tipo = 'urbano'">🏙️ Urbano</button>
      <button class="chip" :class="{ active: sinOp }" @click="sinOp = !sinOp">⚠️ Sin operador</button>
    </div>

    <p class="list-count">{{ filtered.length }} recintos</p>

    <div class="card-list">
      <div v-for="r in filtered" :key="r.id" class="person-card" @click="selected = r">
        <div class="p-avatar av-re">🏫</div>
        <div class="p-body">
          <div class="p-name">{{ r.nombre }}</div>
          <div class="p-sub">{{ r.municipio }} · {{ r.departamento }}</div>
          <div class="p-tags">
            <span class="tag" :class="r.tipo === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ r.tipo }}</span>
            <span class="tag" :class="r.operadores_asignados > 0 ? 'tag-green' : 'tag-red'">
              {{ r.operadores_asignados }} op.
            </span>
            <span v-if="r.actas_registradas > 0" class="tag tag-gray">{{ r.actas_registradas }} actas</span>
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
              <button class="share-btn" @click="share(formatRecinto(selected), selected.nombre)" title="Compartir">⬆️</button>
              <button class="sheet-close" @click="selected = null">✕</button>
            </div>
          </div>
          <div class="sheet-body">
            <div class="d-section">
              <div class="d-label">Información</div>
              <div class="d-row"><span class="d-key">Tipo</span>
                <span class="d-val"><span class="tag" :class="selected.tipo === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ selected.tipo }}</span></span>
              </div>
              <div class="d-row" v-if="selected.direccion"><span class="d-key">Dirección</span><span class="d-val">{{ selected.direccion }}</span></div>
              <div class="d-row"><span class="d-key">Asiento</span><span class="d-val">{{ selected.asiento_electoral || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Municipio</span><span class="d-val">{{ selected.municipio }}</span></div>
              <div class="d-row"><span class="d-key">Provincia</span><span class="d-val">{{ selected.provincia }}</span></div>
              <div class="d-row"><span class="d-key">Departamento</span><span class="d-val">{{ selected.departamento }}</span></div>
            </div>
            <div class="d-section">
              <div class="d-label">Cobertura</div>
              <div class="d-row">
                <span class="d-key">Operadores</span>
                <span class="d-val"><span class="tag" :class="selected.operadores_asignados > 0 ? 'tag-green' : 'tag-red'">{{ selected.operadores_asignados }}</span></span>
              </div>
              <div class="d-row">
                <span class="d-key">Notarios</span>
                <span class="d-val"><span class="tag" :class="selected.notarios_asignados > 0 ? 'tag-green' : 'tag-red'">{{ selected.notarios_asignados }}</span></span>
              </div>
              <div class="d-row"><span class="d-key">Actas</span><span class="d-val">{{ selected.actas_registradas }}</span></div>
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
const { share, formatRecinto } = useShare()
const all      = ref([])
const q        = ref('')
const tipo     = ref('')
const sinOp    = ref(false)
const selected = ref(null)

onMounted(() => { all.value = query(queries.getAllRecintos()) })

const filtered = computed(() => {
  let data = all.value
  if (tipo.value) data = data.filter(r => r.tipo === tipo.value)
  if (sinOp.value) data = data.filter(r => r.operadores_asignados === 0)
  if (!q.value)   return data
  const t = q.value.toLowerCase()
  return data.filter(r =>
    r.nombre?.toLowerCase().includes(t) ||
    r.municipio?.toLowerCase().includes(t) ||
    r.provincia?.toLowerCase().includes(t) ||
    r.departamento?.toLowerCase().includes(t) ||
    r.asiento_electoral?.toLowerCase().includes(t)
  )
})
</script>