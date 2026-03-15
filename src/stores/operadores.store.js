// src/stores/operadores.store.js
// ✅ Actualizado para BD v2: persona WHERE tipo='operador', sin tabla grupo separada

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queries } from '@/utils/queries.js'
import { useDatabase } from '@/composables/useDatabase.js'
import { useQueryCache } from '@/utils/queryCache.js'

export const useOperadoresStore = defineStore('operadores', () => {
  const { query } = useDatabase()
  const cache = useQueryCache()

  const operadores = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)

  const total = computed(() => operadores.value.length)

  // tipo_operador viene de la query (inferido desde provincia.es_urbano)
  const rurales = computed(() => operadores.value.filter(op => op.tipo_operador === 'rural'))
  const urbanos = computed(() => operadores.value.filter(op => op.tipo_operador === 'urbano'))

  const porDepartamento = computed(() => {
    const grupos = {}
    operadores.value.forEach(op => {
      const dept = op.departamento || 'Sin departamento'
      if (!grupos[dept]) grupos[dept] = []
      grupos[dept].push(op)
    })
    return grupos
  })

  const porCoordinador = computed(() => {
    const grupos = {}
    operadores.value.forEach(op => {
      const coord = op.coordinador || 'Sin coordinador'
      if (!grupos[coord]) grupos[coord] = []
      grupos[coord].push(op)
    })
    return grupos
  })

  const porGrupo = computed(() => {
    const grupos = {}
    operadores.value.forEach(op => {
      const grupo = op.grupo || 'Sin grupo'
      if (!grupos[grupo]) grupos[grupo] = []
      grupos[grupo].push(op)
    })
    return grupos
  })

  const fetchOperadores = async (forceRefresh = false) => {
    const cacheKey = 'all_operadores'
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) { operadores.value = cached; return }
    }
    loading.value = true
    error.value = null
    try {
      const data = query(queries.getAllOperadores())
      operadores.value = data
      lastUpdate.value = new Date()
      cache.set(cacheKey, data, 5 * 60 * 1000)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchOperadores = (searchTerm) => {
    if (!searchTerm) return operadores.value
    const term = searchTerm.toLowerCase()
    return operadores.value.filter(op =>
      op.nombre?.toLowerCase().includes(term) ||
      op.cedula?.includes(term) ||
      op.grupo?.toLowerCase().includes(term) ||
      op.coordinador?.toLowerCase().includes(term) ||
      op.recinto?.toLowerCase().includes(term) ||
      op.municipio?.toLowerCase().includes(term)
    )
  }

  const filterOperadores = (filters) => {
    let filtered = operadores.value
    if (filters.tipo)              filtered = filtered.filter(op => op.tipo_operador === filters.tipo)
    if (filters.departamento)      filtered = filtered.filter(op => op.departamento === filters.departamento)
    if (filters.provincia)         filtered = filtered.filter(op => op.provincia === filters.provincia)
    if (filters.municipio)         filtered = filtered.filter(op => op.municipio === filters.municipio)
    if (filters.asiento_electoral) filtered = filtered.filter(op => op.asiento_electoral === filters.asiento_electoral)
    if (filters.recinto)           filtered = filtered.filter(op => op.recinto === filters.recinto)
    if (filters.coordinador)       filtered = filtered.filter(op => op.coordinador === filters.coordinador)
    if (filters.grupo)             filtered = filtered.filter(op => op.grupo === filters.grupo)
    return filtered
  }

  const findById = (id) => operadores.value.find(op => op.id === id)

  const getEstadisticas = () => ({
    total: total.value,
    rurales: rurales.value.length,
    urbanos: urbanos.value.length,
    porcentajeRurales: total.value > 0 ? (rurales.value.length / total.value * 100).toFixed(1) : 0,
    porcentajeUrbanos: total.value > 0 ? (urbanos.value.length / total.value * 100).toFixed(1) : 0,
    departamentos: Object.keys(porDepartamento.value).length,
    coordinadores: Object.keys(porCoordinador.value).length,
    grupos: Object.keys(porGrupo.value).length,
  })

  const clearCache = () => cache.clear('all_operadores')

  return {
    operadores, loading, error, lastUpdate,
    total, rurales, urbanos, porDepartamento, porCoordinador, porGrupo,
    fetchOperadores, searchOperadores, filterOperadores, findById,
    getEstadisticas, clearCache
  }
})