<!-- src/views/Operadores.vue - Vista de operadores -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">👷 Operadores</h1>
        <p class="text-sm opacity-70">Gestión de operadores electorales</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportOperadores" class="btn btn-outline">
          📤 Exportar
        </button>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          🔄 Actualizar
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <SearchBar 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, cédula, grupo, recinto..."
          @search="performSearch"
        />
      </div>
      <div class="stats shadow bg-base-100">
        <div class="stat">
          <div class="stat-title">Total</div>
          <div class="stat-value text-lg">{{ filteredOperadores.length }}</div>
          <div class="stat-desc">operadores</div>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <FilterPanel 
      :show-type-filter="true"
      :show-status-filter="true"
      @filter="applyFilters"
    />

    <!-- Data Table -->
    <DataTable 
      title="Lista de Operadores"
      :data="filteredOperadores"
      :columns="operadoresColumns"
      :loading="loading"
      :page-size="15"
      @export="exportOperadores"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'

const { query } = useDatabase()

// Estado
const operadores = ref([])
const loading = ref(false)
const searchTerm = ref('')
const activeFilters = ref({})

// Configuración de columnas
const operadoresColumns = [
  { key: 'nombre', title: 'Nombre', type: 'text' },
  { key: 'cedula', title: 'Cédula', type: 'text' },
  { key: 'telefono', title: 'Teléfono', type: 'phone' },
  { key: 'tipo_operador', title: 'Tipo', type: 'badge' },
  { key: 'grupo', title: 'Grupo', type: 'text' },
  { key: 'recinto', title: 'Recinto', type: 'text' },
  { key: 'vehiculo_placa', title: 'Vehículo', type: 'text' },
  { key: 'coordinador', title: 'Coordinador', type: 'text' },
  { key: 'estado', title: 'Estado', type: 'badge' }
]

// Computed
const filteredOperadores = computed(() => {
  let filtered = operadores.value

  // Filtro por búsqueda
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(op => 
      op.nombre?.toLowerCase().includes(term) ||
      op.cedula?.includes(term) ||
      op.grupo?.toLowerCase().includes(term) ||
      op.recinto?.toLowerCase().includes(term) ||
      op.vehiculo_placa?.toLowerCase().includes(term)
    )
  }

  // Aplicar otros filtros
  if (activeFilters.value.tipo) {
    filtered = filtered.filter(op => op.tipo_operador === activeFilters.value.tipo)
  }

  if (activeFilters.value.estado) {
    filtered = filtered.filter(op => op.estado === activeFilters.value.estado)
  }

  return filtered
})

// Métodos
const loadOperadores = async () => {
  loading.value = true
  try {
    operadores.value = query(queries.getAllOperadores())
  } catch (error) {
    console.error('Error cargando operadores:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
}

const applyFilters = (filters) => {
  activeFilters.value = filters
}

const refreshData = () => {
  loadOperadores()
}

const exportOperadores = (data = null) => {
  const dataToExport = data || filteredOperadores.value
  
  // Convertir a CSV simple
  const headers = operadoresColumns.map(col => col.title).join(',')
  const rows = dataToExport.map(row => 
    operadoresColumns.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  
  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `operadores_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadOperadores()
})
</script>