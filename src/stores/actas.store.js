// src/stores/actas.store.js
// ✅ BD v2: acta.persona_id → persona → recinto (sin acta.recinto_id directo)

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queries } from '@/utils/queries.js'
import { useDatabase } from '@/composables/useDatabase.js'
import { useQueryCache } from '@/utils/queryCache.js'

export const useActasStore = defineStore('actas', () => {
  const { query } = useDatabase()
  const cache = useQueryCache()

  const actas   = ref([])
  const loading = ref(false)
  const error   = ref(null)

  const total = computed(() => actas.value.length)

  // Recintos únicos que tienen al menos 1 acta
  const recintosUnicos = computed(() => {
    const set = new Set(actas.value.map(a => a.recinto).filter(Boolean))
    return set.size
  })

  const porOperador = computed(() => {
    const grupos = {}
    actas.value.forEach(a => {
      const op = a.operador || 'Sin operador'
      if (!grupos[op]) grupos[op] = []
      grupos[op].push(a)
    })
    return grupos
  })

  const porDepartamento = computed(() => {
    const grupos = {}
    actas.value.forEach(a => {
      const dept = a.departamento || 'Sin departamento'
      if (!grupos[dept]) grupos[dept] = []
      grupos[dept].push(a)
    })
    return grupos
  })

  const fetchActas = async (forceRefresh = false) => {
    const cacheKey = 'all_actas'
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) { actas.value = cached; return }
    }
    loading.value = true
    error.value = null
    try {
      const data = query(queries.getAllActas())
      actas.value = data
      cache.set(cacheKey, data, 5 * 60 * 1000)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const findByCodigo  = (codigo) => actas.value.find(a => a.codigo === codigo)
  const findByOperadorCi = (ci) => actas.value.filter(a => a.operador_ci === ci)

  const getEstadisticas = () => ({
    total: total.value,
    recintosUnicos: recintosUnicos.value,
    promedioActasPorRecinto: recintosUnicos.value > 0
      ? (total.value / recintosUnicos.value).toFixed(1)
      : 0,
    departamentos: Object.keys(porDepartamento.value).length,
    operadores: Object.keys(porOperador.value).length,
  })

  return {
    actas, loading, error, total, recintosUnicos,
    porOperador, porDepartamento,
    fetchActas, findByCodigo, findByOperadorCi, getEstadisticas
  }
})