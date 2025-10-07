// ============================================
// src/stores/notarios.store.js - ACTUALIZADO
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { queries } from '@/utils/queries.js'
import { useDatabase } from '@/composables/useDatabase.js'
import { useQueryCache } from '@/utils/queryCache.js'

export const useNotariosStore = defineStore('notarios', () => {
  const { query } = useDatabase()
  const cache = useQueryCache()

  const notarios = ref([])
  const loading = ref(false)
  const error = ref(null)

  const total = computed(() => notarios.value.length)
  
  // Tipo inferido desde distrito del recinto
  const rurales = computed(() => 
    notarios.value.filter(n => n.tipo_notario === 'rural')
  )
  
  const urbanos = computed(() => 
    notarios.value.filter(n => n.tipo_notario === 'urbano')
  )

  const fetchNotarios = async (forceRefresh = false) => {
    const cacheKey = 'all_notarios'
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey)
      if (cached) {
        notarios.value = cached
        return
      }
    }

    loading.value = true
    error.value = null
    
    try {
      const data = query(queries.getAllNotarios())
      notarios.value = data
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
    porcentajeRurales: total.value > 0 ? (rurales.value.length / total.value * 100).toFixed(1) : 0,
    porcentajeUrbanos: total.value > 0 ? (urbanos.value.length / total.value * 100).toFixed(1) : 0
  })

  return {
    notarios,
    loading,
    error,
    total,
    rurales,
    urbanos,
    fetchNotarios,
    getEstadisticas
  }
})