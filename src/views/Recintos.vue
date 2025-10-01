<!-- src/views/Recintos.vue - Vista de recintos -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">🏫 Recintos</h1>
        <p class="text-sm opacity-70">Ubicaciones de trabajo y asignaciones</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportRecintos" class="btn btn-outline">
          📤 Exportar
        </button>
        <button @click="refreshData" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          🔄 Actualizar
        </button>
      </div>
    </div>

    <!-- Search and Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div class="lg:col-span-2">
        <SearchBar 
          v-model="searchTerm" 
          placeholder="Buscar por nombre, dirección, municipio..."
          @search="performSearch"
        />
      </div>
      <div class="stats shadow bg-base-100 lg:col-span-2">
        <div class="stat">
          <div class="stat-title">Total</div>
          <div class="stat-value text-lg">{{ filteredRecintos.length }}</div>
          <div class="stat-desc">recintos</div>
        </div>
        <div class="stat">
          <div class="stat-title">Rurales</div>
          <div class="stat-value text-lg text-warning">{{ recintosRurales }}</div>
          <div class="stat-desc">ubicaciones</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable 
      title="Lista de Recintos"
      :data="filteredRecintos"
      :columns="recintosColumns"
      :loading="loading"
      :page-size="15"
      @export="exportRecintos"
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
const recintos = ref([])
const loading = ref(false)
const searchTerm = ref('')

// Configuración de columnas
const recintosColumns = [
  { key: 'nombre', title: 'Nombre', type: 'text' },
  { key: 'direccion', title: 'Dirección', type: 'text' },
  { key: 'tipo', title: 'Tipo', type: 'badge' },
  { key: 'municipio', title: 'Municipio', type: 'text' },
  { key: 'provincia', title: 'Provincia', type: 'text' },
  { key: 'departamento', title: 'Departamento', type: 'text' },
  { key: 'operadores_asignados', title: 'Operadores', type: 'text' },
  { key: 'asiento_electoral', title: 'Asiento Electoral', type: 'text' }
]

// Computed
const filteredRecintos = computed(() => {
  if (!searchTerm.value) return recintos.value

  const term = searchTerm.value.toLowerCase()
  return recintos.value.filter(recinto => 
    recinto.nombre?.toLowerCase().includes(term) ||
    recinto.direccion?.toLowerCase().includes(term) ||
    recinto.municipio?.toLowerCase().includes(term) ||
    recinto.provincia?.toLowerCase().includes(term) ||
    recinto.departamento?.toLowerCase().includes(term)
  )
})

const recintosRurales = computed(() => {
  return recintos.value.filter(r => r.tipo === 'rural').length
})

// Métodos
const loadRecintos = async () => {
  loading.value = true
  try {
    recintos.value = query(queries.getAllRecintos())
  } catch (error) {
    console.error('Error cargando recintos:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
}

const refreshData = () => {
  loadRecintos()
}

const exportRecintos = (data = null) => {
  const dataToExport = data || filteredRecintos.value
  const headers = recintosColumns.map(col => col.title).join(',')
  const rows = dataToExport.map(row => 
    recintosColumns.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `recintos_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadRecintos()
})
</script>