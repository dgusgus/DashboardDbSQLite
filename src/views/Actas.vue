<!-- src/views/Actas.vue -->
<template>
  <div>
    <div class="search-bar">
      <div class="search-wrap">
        <input v-model="q" class="search-input" placeholder="Código, operador, recinto…"
          type="search" autocomplete="off" autocorrect="off" spellcheck="false" />
        <button v-if="q" class="search-clear" @click="q = ''">✕</button>
      </div>
    </div>

    <div class="chips">
      <button class="chip" :class="{ active: zona === '' }"       @click="zona = ''">Todas</button>
      <button class="chip" :class="{ active: zona === 'rural' }"  @click="zona = 'rural'">🌾 Rural</button>
      <button class="chip" :class="{ active: zona === 'urbano' }" @click="zona = 'urbano'">🏙️ Urbano</button>
    </div>

    <p class="list-count">{{ filtered.length }} actas</p>

    <div class="card-list">
      <div v-for="a in filtered" :key="a.id" class="person-card" @click="selected = a">
        <div class="p-avatar av-ac">📋</div>
        <div class="p-body">
          <div class="p-name" style="font-family:monospace;font-size:0.92rem">{{ a.codigo }}</div>
          <div class="p-sub">{{ a.operador || '—' }} · {{ a.recinto || '—' }}</div>
          <div class="p-tags">
            <span v-if="a.tipo_zona" class="tag" :class="a.tipo_zona === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ a.tipo_zona }}</span>
            <span v-if="a.municipio" class="tag tag-gray">{{ a.municipio }}</span>
            <span v-if="a.grupo" class="tag tag-gray">{{ a.grupo }}</span>
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
            <span class="sheet-title" style="font-family:monospace">{{ selected.codigo }}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="share-btn" @click="share(formatActa(selected), selected.codigo)" title="Compartir">⬆️</button>
              <button class="sheet-close" @click="selected = null">✕</button>
            </div>
          </div>
          <div class="sheet-body">
            <div class="d-section">
              <div class="d-label">Operador asignado</div>
              <div class="d-row"><span class="d-key">Nombre</span><span class="d-val">{{ selected.operador || '—' }}</span></div>
              <div class="d-row"><span class="d-key">CI</span><span class="d-val">{{ selected.operador_ci || '—' }}</span></div>
              <div class="d-row" v-if="selected.operador_celular">
                <span class="d-key">Teléfono</span>
                <a :href="`tel:${selected.operador_celular}`" class="d-val" style="color:var(--accent2)">{{ selected.operador_celular }}</a>
              </div>
              <div class="d-row"><span class="d-key">Grupo</span><span class="d-val">{{ selected.grupo || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Coordinador</span><span class="d-val">{{ selected.coordinador || '—' }}</span></div>
            </div>
            <div class="d-section">
              <div class="d-label">Ubicación</div>
              <div class="d-row"><span class="d-key">Tipo</span>
                <span class="d-val"><span class="tag" :class="selected.tipo_zona === 'rural' ? 'tag-yellow' : 'tag-blue'">{{ selected.tipo_zona || '—' }}</span></span>
              </div>
              <div class="d-row"><span class="d-key">Recinto</span><span class="d-val">{{ selected.recinto || '—' }}</span></div>
              <div class="d-row" v-if="selected.recinto_direccion"><span class="d-key">Dirección</span><span class="d-val">{{ selected.recinto_direccion }}</span></div>
              <div class="d-row"><span class="d-key">Asiento</span><span class="d-val">{{ selected.asiento_electoral || '—' }}</span></div>
              <div class="d-row"><span class="d-key">Municipio</span><span class="d-val">{{ selected.municipio }}</span></div>
              <div class="d-row"><span class="d-key">Provincia</span><span class="d-val">{{ selected.provincia }}</span></div>
              <div class="d-row"><span class="d-key">Departamento</span><span class="d-val">{{ selected.departamento }}</span></div>
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
const { share, formatActa } = useShare()
const all      = ref([])
const q        = ref('')
const zona     = ref('')
const selected = ref(null)

onMounted(() => { all.value = query(queries.getAllActas()) })

const filtered = computed(() => {
  let data = all.value
  if (zona.value) data = data.filter(a => a.tipo_zona === zona.value)
  if (!q.value)   return data
  const t = q.value.toLowerCase()
  return data.filter(a =>
    a.codigo?.toLowerCase().includes(t) ||
    a.operador?.toLowerCase().includes(t) ||
    a.operador_ci?.includes(t) ||
    a.recinto?.toLowerCase().includes(t) ||
    a.grupo?.toLowerCase().includes(t) ||
    a.municipio?.toLowerCase().includes(t)
  )
})
</script>