<!-- src/views/Notarios.vue - NUEVO -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">📝 Notarios</h1>
        <p class="text-sm opacity-70">Gestión de notarios electorales</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportNotarios" class="btn btn-outline">
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
          placeholder="Buscar por nombre, cédula, recinto..."
          @search="performSearch"
        />
      </div>
      <div class="stats shadow bg-base-100 lg:col-span-2">
        <div class="stat">
          <div class="stat-title">Total</div>
          <div class="stat-value text-lg">{{ filteredNotarios.length }}</div>
          <div class="stat-desc">notarios</div>
        </div>
        <div class="stat">
          <div class="stat-title">Rurales</div>
          <div class="stat-value text-lg text-warning">{{ notariosRurales }}</div>
          <div class="stat-desc">asignados</div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable 
      title="Lista de Notarios"
      :data="filteredNotarios"
      :columns="notariosColumns"
      :loading="loading"
      :page-size="15"
      @export="exportNotarios"
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
const notarios = ref([])
const loading = ref(false)
const searchTerm = ref('')

// Configuración de columnas
const notariosColumns = [
  { key: 'nombre', title: 'Nombre', type: 'text' },
  { key: 'cedula', title: 'Cédula', type: 'text' },
  { key: 'expedido', title: 'Expedido', type: 'text' },
  { key: 'telefono', title: 'Teléfono', type: 'phone' },
  { key: 'correo', title: 'Correo', type: 'text' },
  { key: 'tipo_notario', title: 'Tipo', type: 'badge' },
  { key: 'recinto', title: 'Recinto', type: 'text' },
  { key: 'municipio', title: 'Municipio', type: 'text' },
  { key: 'departamento', title: 'Departamento', type: 'text' }
]

// Computed
const filteredNotarios = computed(() => {
  if (!searchTerm.value) return notarios.value

  const term = searchTerm.value.toLowerCase()
  return notarios.value.filter(notario => 
    notario.nombre?.toLowerCase().includes(term) ||
    notario.cedula?.includes(term) ||
    notario.recinto?.toLowerCase().includes(term) ||
    notario.municipio?.toLowerCase().includes(term)
  )
})

const notariosRurales = computed(() => {
  return notarios.value.filter(n => n.tipo_notario === 'rural').length
})

// Métodos
const loadNotarios = async () => {
  loading.value = true
  try {
    notarios.value = query(queries.getAllNotarios())
  } catch (error) {
    console.error('Error cargando notarios:', error)
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
}

const refreshData = () => {
  loadNotarios()
}

const exportNotarios = (data = null) => {
  const dataToExport = data || filteredNotarios.value
  const headers = notariosColumns.map(col => col.title).join(',')
  const rows = dataToExport.map(row => 
    notariosColumns.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `notarios_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadNotarios()
})
</script>