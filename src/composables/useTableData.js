// src/composables/useTableData.js - Composable genérico para gestión de tablas
import { ref, computed, watch } from 'vue'

/**
 * Composable reutilizable para manejo de tablas con:
 * - Búsqueda
 * - Filtros
 * - Paginación
 * - Ordenamiento
 * - Exportación
 */
export function useTableData(options = {}) {
  const {
    pageSize = 15,
    searchFields = [],
    sortable = true,
    exportable = true
  } = options

  // Estado
  const searchTerm = ref('')
  const currentPage = ref(1)
  const currentPageSize = ref(pageSize)
  const sortColumn = ref('')
  const sortDirection = ref('asc')
  const filters = ref({})
  const selectedItems = ref([])

  /**
   * Aplicar búsqueda sobre datos
   */
  const applySearch = (data, searchFields) => {
    if (!searchTerm.value || !data) return data

    const term = searchTerm.value.toLowerCase()
    
    return data.filter(item => {
      // Buscar en campos específicos si se proporcionan
      if (searchFields.length > 0) {
        return searchFields.some(field => {
          const value = item[field]
          return value && value.toString().toLowerCase().includes(term)
        })
      }
      
      // Buscar en todos los campos
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(term)
      )
    })
  }

  /**
   * Aplicar filtros sobre datos
   */
  const applyFilters = (data) => {
    if (!data || Object.keys(filters.value).length === 0) return data

    return data.filter(item => {
      return Object.entries(filters.value).every(([key, value]) => {
        if (!value || value === '') return true
        return item[key] === value
      })
    })
  }

  /**
   * Aplicar ordenamiento
   */
  const applySort = (data) => {
    if (!sortColumn.value || !data) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn.value] || ''
      const bVal = b[sortColumn.value] || ''
      
      const comparison = aVal.toString().localeCompare(bVal.toString(), 'es', {
        numeric: true,
        sensitivity: 'base'
      })
      
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Procesar datos completos (búsqueda + filtros + ordenamiento)
   */
  const processData = (rawData) => {
    if (!rawData) return []
    
    let processed = rawData
    processed = applySearch(processed, searchFields)
    processed = applyFilters(processed)
    processed = applySort(processed)
    
    return processed
  }

  /**
   * Obtener datos paginados
   */
  const getPaginatedData = (processedData) => {
    const start = (currentPage.value - 1) * currentPageSize.value
    const end = start + currentPageSize.value
    return processedData.slice(start, end)
  }

  /**
   * Computed para paginación
   */
  const totalPages = computed(() => processedData => 
    Math.ceil(processedData.length / currentPageSize.value)
  )

  const startRecord = computed(() => processedData => {
    if (!processedData || processedData.length === 0) return 0
    return (currentPage.value - 1) * currentPageSize.value + 1
  })

  const endRecord = computed(() => processedData => {
    if (!processedData) return 0
    const end = currentPage.value * currentPageSize.value
    return end > processedData.length ? processedData.length : end
  })

  /**
   * Métodos de navegación
   */
  const goToPage = (page) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  const nextPage = (maxPages) => {
    if (currentPage.value < maxPages) currentPage.value++
  }

  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
  }

  const firstPage = () => {
    currentPage.value = 1
  }

  const lastPage = (maxPages) => {
    currentPage.value = maxPages
  }

  /**
   * Ordenamiento
   */
  const toggleSort = (column) => {
    if (!sortable) return

    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
  }

  /**
   * Filtros
   */
  const setFilter = (key, value) => {
    filters.value[key] = value
    currentPage.value = 1 // Resetear a primera página
  }

  const clearFilter = (key) => {
    delete filters.value[key]
    currentPage.value = 1
  }

  const clearAllFilters = () => {
    filters.value = {}
    searchTerm.value = ''
    currentPage.value = 1
  }

  const hasActiveFilters = computed(() => 
    Object.values(filters.value).some(v => v !== '') || searchTerm.value !== ''
  )

  /**
   * Selección de items
   */
  const toggleSelection = (item) => {
    const index = selectedItems.value.findIndex(i => i.id === item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    } else {
      selectedItems.value.push(item)
    }
  }

  const selectAll = (items) => {
    selectedItems.value = [...items]
  }

  const clearSelection = () => {
    selectedItems.value = []
  }

  const isSelected = (item) => {
    return selectedItems.value.some(i => i.id === item.id)
  }

  /**
   * Exportación
   */
  const exportToCSV = (data, columns, filename = 'export') => {
    if (!exportable || !data || data.length === 0) {
      throw new Error('No hay datos para exportar')
    }

    // Preparar headers
    const headers = columns.map(col => 
      typeof col === 'string' ? col : col.title || col.key
    ).join(',')

    // Preparar filas
    const rows = data.map(row => {
      return columns.map(col => {
        const key = typeof col === 'string' ? col : col.key
        const value = row[key] || ''
        
        // Escapar comillas y valores con comas
        const stringValue = value.toString()
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    })

    // Crear CSV
    const csvContent = [headers, ...rows].join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data, filename = 'export') => {
    if (!exportable || !data || data.length === 0) {
      throw new Error('No hay datos para exportar')
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Resetear a página 1 cuando cambian búsqueda/filtros
   */
  watch([searchTerm, currentPageSize, filters], () => {
    currentPage.value = 1
  }, { deep: true })

  return {
    // Estado
    searchTerm,
    currentPage,
    currentPageSize,
    sortColumn,
    sortDirection,
    filters,
    selectedItems,
    
    // Computed
    hasActiveFilters,
    totalPages,
    startRecord,
    endRecord,
    
    // Métodos de procesamiento
    processData,
    getPaginatedData,
    
    // Métodos de navegación
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    
    // Métodos de ordenamiento
    toggleSort,
    
    // Métodos de filtros
    setFilter,
    clearFilter,
    clearAllFilters,
    
    // Métodos de selección
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    
    // Métodos de exportación
    exportToCSV,
    exportToJSON
  }
}