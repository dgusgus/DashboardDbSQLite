<!-- src/views/Mesas.vue - NUEVO -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">🗳️ Mesas Electorales</h1>
        <p class="text-sm opacity-70">Control de mesas, operadores y notarios asignados</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportMesas" class="btn btn-outline">
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
          placeholder="Buscar por número de mesa, recinto, operador..."
          @search="performSearch"
        />
      </div>
      <div class="stats shadow bg-base-100 lg:col-span-2">
        <div class="stat">
          <div class="stat-title">Total Mesas</div>
          <div class="stat-value text-lg">{{ filteredMesas.length }}</div>
          <div class="stat-desc">registradas</div>
        </div>
        <div class="stat">
          <div class="stat-title">Con Actas</div>
          <div class="stat-value text-lg text-success">{{ mesasConActas }}</div>
          <div class="stat-desc">{{ porcentajeConActas }}%</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable 
      title="Lista de Mesas"
      :data="filteredMesas"
      :columns="mesasColumns"
      :loading="loading"
      :page-size="15"
      @export="exportMesas"
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
const mesas = ref([])
const loading = ref(false)
const searchTerm = ref('')

// Configuración de columnas
const mesasColumns = [
  { key: 'numero', title: 'Nº Mesa', type: 'text' },
  { key: 'recinto', title: 'Recinto', type: 'text' },
  { key: 'operador', title: 'Operador', type: 'text' },
  { key: 'notario', title: 'Notario', type: 'text' },
  { key: 'asiento_electoral', title: 'Asiento Electoral', type: 'text' },
  { key: 'actas_registradas', title: 'Actas', type: 'text' }
]

// Computed
const filteredMesas = computed(() => {
  if (!searchTerm.value) return mesas.value

  const term = searchTerm.value.toLowerCase()
  return mesas.value.filter(mesa => 
    mesa.numero?.toString().includes(term) ||
    mesa.recinto?.toLowerCase().includes(term) ||
    mesa.operador?.toLowerCase().includes(term) ||
    mesa.notario?.toLowerCase().includes(term)
  )
})

const mesasConActas = computed(() => {
  return mesas.value.filter(m => m.actas_registradas > 0).length
})

const porcentajeConActas = computed(() => {
  if (mesas.value.length === 0) return 0
  return Math.round((mesasConActas.value / mesas.value.length) * 100)
})

// Métodos
const loadMesas = async () => {
  loading.value = true
  try {
    mesas.value = query(queries.getAllMesas())
  } catch (error) {
    console.error('Error cargando mesas:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
}

const refreshData = () => {
  loadMesas()
}

const exportMesas = (data = null) => {
  const dataToExport = data || filteredMesas.value
  const headers = mesasColumns.map(col => col.title).join(',')
  const rows = dataToExport.map(row => 
    mesasColumns.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `mesas_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadMesas()
})
</script>