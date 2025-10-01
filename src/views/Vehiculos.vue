<!-- src/views/Vehiculos.vue - COMPLETADO -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">🚗 Vehículos</h1>
        <p class="text-sm opacity-70">Gestión de vehículos y choferes</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportVehiculos" class="btn btn-outline">
          📤 Exportar
        </button>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          🔄 Actualizar
        </button>
      </div>
    </div>

    <!-- Search and Quick Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <SearchBar 
          v-model="searchTerm" 
          placeholder="Buscar por placa, marca, modelo, chofer..."
          @search="performSearch"
        />
      </div>
      <div class="stats shadow bg-base-100">
        <div class="stat">
          <div class="stat-title">Total</div>
          <div class="stat-value text-lg">{{ filteredVehiculos.length }}</div>
          <div class="stat-desc">vehículos</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable 
      title="Lista de Vehículos"
      :data="filteredVehiculos"
      :columns="vehiculosColumns"
      :loading="loading"
      :page-size="15"
      @export="exportVehiculos"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'
import SearchBar from '@/components/SearchBar.vue'
import DataTable from '@/components/DataTable.vue'

const { query } = useDatabase()

// Estado
const vehiculos = ref([])
const loading = ref(false)
const searchTerm = ref('')

// Configuración de columnas
const vehiculosColumns = [
  { key: 'placa', title: 'Placa', type: 'text' },
  { key: 'marca', title: 'Marca', type: 'text' },
  { key: 'modelo', title: 'Modelo', type: 'text' },
  { key: 'anio', title: 'Año', type: 'text' },
  { key: 'estado', title: 'Estado', type: 'badge' },
  { key: 'chofer', title: 'Chofer', type: 'text' },
  { key: 'chofer_cedula', title: 'Cédula Chofer', type: 'text' },
  { key: 'chofer_telefono', title: 'Teléfono Chofer', type: 'phone' },
  { key: 'operadores_asignados', title: 'Operadores', type: 'text' }
]

// Computed
const filteredVehiculos = computed(() => {
  if (!searchTerm.value) return vehiculos.value

  const term = searchTerm.value.toLowerCase()
  return vehiculos.value.filter(vehiculo => 
    vehiculo.placa?.toLowerCase().includes(term) ||
    vehiculo.marca?.toLowerCase().includes(term) ||
    vehiculo.modelo?.toLowerCase().includes(term) ||
    vehiculo.chofer?.toLowerCase().includes(term) ||
    vehiculo.estado?.toLowerCase().includes(term)
  )
})

// Métodos
const loadVehiculos = async () => {
  loading.value = true
  try {
    vehiculos.value = query(queries.getAllVehiculos())
  } catch (error) {
    console.error('Error cargando vehículos:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
}

const refreshData = () => {
  loadVehiculos()
}

const exportVehiculos = (data = null) => {
  const dataToExport = data || filteredVehiculos.value
  
  // Convertir a CSV simple
  const headers = vehiculosColumns.map(col => col.title).join(',')
  const rows = dataToExport.map(row => 
    vehiculosColumns.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  
  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `vehiculos_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadVehiculos()
})
</script>