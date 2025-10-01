// src/composables/useSearch.js - Composable para búsquedas
import { ref, computed } from 'vue'
import { useDatabase } from './useDatabase.js'
import { queries } from '@/utils/queries.js'

export function useSearch() {
  const { query } = useDatabase()
  
  const searchTerm = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const searchHistory = ref([])

  // Búsqueda global
  const globalSearch = async (term) => {
    if (!term || term.length < 2) {
      searchResults.value = []
      return []
    }

    isSearching.value = true
    try {
      // Buscar en operadores
      const operadores = query(queries.searchOperadores(term))
      
      // Formatear resultados
      const results = operadores.map(op => ({
        id: op.id,
        type: 'operador',
        title: op.nombre,
        subtitle: `${op.cedula} - ${op.grupo}`,
        description: `${op.recinto} | ${op.coordinador}`,
        data: op
      }))

      searchResults.value = results
      
      // Agregar a historial si no está vacío
      if (results.length > 0 && !searchHistory.value.includes(term)) {
        searchHistory.value.unshift(term)
        if (searchHistory.value.length > 10) {
          searchHistory.value = searchHistory.value.slice(0, 10)
        }
      }

      return results
    } catch (error) {
      console.error('Error exportando JSON:', error)
      alert('Error al exportar los datos')
    }
  }

  // Exportar estadísticas resumidas
  const exportSummary = (stats, filename = 'resumen') => {
    const summaryData = Object.entries(stats).map(([key, value]) => ({
      tabla: key.replace('_', ' ').toUpperCase(),
      cantidad: value,
      porcentaje: stats.total ? ((value / stats.total) * 100).toFixed(1) : 0
    }))

    const columns = [
      { key: 'tabla', title: 'Tabla' },
      { key: 'cantidad', title: 'Cantidad' },
      { key: 'porcentaje', title: 'Porcentaje' }
    ]

    exportToCSV(summaryData, columns, filename)
  }

  return {
    // Estado
    isExporting,
    
    // Métodos
    exportToCSV,
    exportToJSON,
    exportSummary
  }
}
