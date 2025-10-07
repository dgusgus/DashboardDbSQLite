// ============================================
// src/stores/recintos.store.js - ACTUALIZADO
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queries } from '@/utils/queries.js'
import { useDatabase } from '@/composables/useDatabase.js'
import { useQueryCache } from '@/utils/queryCache.js'

export const useRecintosStore = defineStore('recintos', () => {
  const { query } = useDatabase()
  const cache = useQueryCache()

  const recintos = ref([])
  const loading = ref(false)
  const error = ref(null)

  const total = computed(() => recintos.value.length)
  
  // Tipo basado en distrito
  const rurales = computed(() => 
    recintos.value.filter(r => r.tipo === 'rural')
  )
  
  const urbanos = computed(() => 
    recintos.value.filter(r => r.tipo === 'urbano')
  )
  
  const conOperadores = computed(() => 
    recintos.value.filter(r => r.operadores_asignados > 0)
  )
  
  const conNotarios = computed(() => 
    recintos.value.filter(r => r.notarios_asignados > 0)
  )
  
  const conActas = computed(() => 
    recintos.value.filter(r => r.actas_registradas > 0)
  )

  const fetchRecintos = async (forceRefresh = false) => {
    const cacheKey = 'all_recintos'
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        recintos.value = cached
        return
      }
    }

    loading.value = true
    error.value = null
    
    try {
      const data = query(queries.getAllRecintos())
      recintos.value = data
      cache.set(cacheKey, data, 5 * 60 * 1000)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getEstadisticas = () => ({
    total: total.value,
    rurales: rurales.value.length,
    urbanos: urbanos.value.length,
    conOperadores: conOperadores.value.length,
    conNotarios: conNotarios.value.length,
    conActas: conActas.value.length,
    porcentajeConOperadores: total.value > 0 ? (conOperadores.value.length / total.value * 100).toFixed(1) : 0,
    porcentajeConNotarios: total.value > 0 ? (conNotarios.value.length / total.value * 100).toFixed(1) : 0,
    porcentajeConActas: total.value > 0 ? (conActas.value.length / total.value * 100).toFixed(1) : 0
  })

  return {
    recintos,
    loading,
    error,
    total,
    rurales,
    urbanos,
    conOperadores,
    conNotarios,
    conActas,
    fetchRecintos,
    getEstadisticas
  }
})
