// ============================================
// src/stores/operadores.store.js - ACTUALIZADO
// ============================================
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

  // Getters - tipo inferido desde distrito
  const total = computed(() => operadores.value.length)
  
  const rurales = computed(() => 
    operadores.value.filter(op => op.tipo_operador === 'rural')
  )
  
  const urbanos = computed(() => 
    operadores.value.filter(op => op.tipo_operador === 'urbano')
  )

  const porDepartamento = computed(() => {
    const grupos = {}
    operadores.value.forEach(op => {
      const dept = op.departamento || 'Sin departamento'
      if (!grupos[dept]) grupos[dept] = []
      grupos[dept].push(op)
    })
    return grupos
  })

  const porRecinto = computed(() => {
    const grupos = {}
    operadores.value.forEach(op => {
      const recinto = op.recinto || 'Sin recinto'
      if (!grupos[recinto]) grupos[recinto] = []
      grupos[recinto].push(op)
    })
    return grupos
  })

  const fetchOperadores = async (forceRefresh = false) => {
    const cacheKey = 'all_operadores'
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        operadores.value = cached
        return
      }
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
      op.recinto?.toLowerCase().includes(term) ||
      op.municipio?.toLowerCase().includes(term)
    )
  }

  const filterOperadores = (filters) => {
    let filtered = operadores.value

    if (filters.tipo) {
      filtered = filtered.filter(op => op.tipo_operador === filters.tipo)
    }
    if (filters.departamento) {
      filtered = filtered.filter(op => op.departamento === filters.departamento)
    }
    if (filters.provincia) {
      filtered = filtered.filter(op => op.provincia === filters.provincia)
    }
    if (filters.municipio) {
      filtered = filtered.filter(op => op.municipio === filters.municipio)
    }
    if (filters.recinto) {
      filtered = filtered.filter(op => op.recinto === filters.recinto)
    }

    return filtered
  }

  const findById = (id) => {
    return operadores.value.find(op => op.id === id)
  }

  const getEstadisticas = () => {
    return {
      total: total.value,
      rurales: rurales.value.length,
      urbanos: urbanos.value.length,
      porcentajeRurales: total.value > 0 ? (rurales.value.length / total.value * 100).toFixed(1) : 0,
      porcentajeUrbanos: total.value > 0 ? (urbanos.value.length / total.value * 100).toFixed(1) : 0,
      departamentos: Object.keys(porDepartamento.value).length,
      recintos: Object.keys(porRecinto.value).length
    }
  }

  const clearCache = () => {
    cache.clear('all_operadores')
  }

  return {
    operadores,
    loading,
    error,
    lastUpdate,
    total,
    rurales,
    urbanos,
    porDepartamento,
    porRecinto,
    fetchOperadores,
    searchOperadores,
    filterOperadores,
    findById,
    getEstadisticas,
    clearCache
  }
})
