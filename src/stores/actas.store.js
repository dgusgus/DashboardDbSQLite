// ============================================
// src/stores/actas.store.js
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queries } from '@/utils/queries.js'
import { useDatabase } from '@/composables/useDatabase.js'
import { useQueryCache } from '@/utils/queryCache.js'

export const useActasStore = defineStore('actas', () => {
  const { query } = useDatabase()
  const cache = useQueryCache()

  const actas = ref([])
  const loading = ref(false)
  const error = ref(null)

  const total = computed(() => actas.value.length)
  
  const recintosUnicos = computed(() => {
    const recintos = new Set(actas.value.map(a => a.recinto).filter(Boolean))
    return recintos.size
  })

  const porRecinto = computed(() => {
    const grupos = {}
    actas.value.forEach(acta => {
      const recinto = acta.recinto || 'Sin recinto'
      if (!grupos[recinto]) grupos[recinto] = []
      grupos[recinto].push(acta)
    })
    return grupos
  })

  const porDepartamento = computed(() => {
    const grupos = {}
    actas.value.forEach(acta => {
      const dept = acta.departamento || 'Sin departamento'
      if (!grupos[dept]) grupos[dept] = []
      grupos[dept].push(acta)
    })
    return grupos
  })

  const fetchActas = async (forceRefresh = false) => {
    const cacheKey = 'all_actas'
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        actas.value = cached
        return
      }
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

  const findByCodigo = (codigo) => {
    return actas.value.find(a => a.codigo === codigo)
  }

  const getEstadisticas = () => {
    const promedioActasPorRecinto = recintosUnicos.value > 0 
      ? (total.value / recintosUnicos.value).toFixed(1) 
      : 0

    return {
      total: total.value,
      recintosUnicos: recintosUnicos.value,
      promedioActasPorRecinto,
      departamentos: Object.keys(porDepartamento.value).length
    }
  }

  return {
    actas,
    loading,
    error,
    total,
    recintosUnicos,
    porRecinto,
    porDepartamento,
    fetchActas,
    findByCodigo,
    getEstadisticas
  }
})