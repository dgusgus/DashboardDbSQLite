<!-- src/views/Actas.vue - Vista de gestión de actas electorales -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">📋 Actas Electorales</h1>
        <p class="text-sm opacity-70">Control y seguimiento de actas por recinto</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportActas" class="btn btn-outline gap-2">
          <span>📤</span>
          Exportar
        </button>
        <button @click="refreshData" class="btn btn-primary gap-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          <span v-else>🔄</span>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-3xl">📋</div>
        <div class="stat-title">Total Actas</div>
        <div class="stat-value text-2xl">{{ filteredActas.length }}</div>
        <div class="stat-desc">registradas en sistema</div>
      </div>
      
      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-3xl">🏫</div>
        <div class="stat-title">Recintos con Actas</div>
        <div class="stat-value text-2xl text-success">{{ recintosConActas }}</div>
        <div class="stat-desc">{{ porcentajeRecintos }}% del total</div>
      </div>

      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-3xl">👷</div>
        <div class="stat-title">Operadores Activos</div>
        <div class="stat-value text-2xl text-info">{{ operadoresActivos }}</div>
        <div class="stat-desc">con actas asignadas</div>
      </div>

      <div class="stat bg-base-100 rounded-lg shadow">
        <div class="stat-figure text-3xl">📝</div>
        <div class="stat-title">Notarios Activos</div>
        <div class="stat-value text-2xl text-warning">{{ notariosActivos }}</div>
        <div class="stat-desc">supervisando actas</div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <SearchBar 
              v-model="searchTerm" 
              placeholder="Buscar por código de acta, recinto, municipio..."
              @search="performSearch"
            />
          </div>
          
          <!-- Filter by Department -->
          <div class="form-control w-full lg:w-64">
            <select 
              v-model="filterDepartamento" 
              class="select select-bordered"
              @change="applyFilters"
            >
              <option value="">📍 Todos los departamentos</option>
              <option v-for="dept in departamentos" :key="dept" :value="dept">
                {{ dept }}
              </option>
            </select>
          </div>

          <!-- Filter by Type -->
          <div class="form-control w-full lg:w-48">
            <select 
              v-model="filterTipo" 
              class="select select-bordered"
              @change="applyFilters"
            >
              <option value="">🏷️ Todos los tipos</option>
              <option value="rural">🌾 Rural</option>
              <option value="urbano">🏙️ Urbano</option>
            </select>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mt-3">
          <div class="text-xs opacity-60">Filtros activos:</div>
          <div v-if="searchTerm" class="badge badge-primary gap-1">
            🔍 "{{ searchTerm }}"
            <button @click="searchTerm = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filterDepartamento" class="badge badge-primary gap-1">
            📍 {{ filterDepartamento }}
            <button @click="filterDepartamento = ''" class="hover:text-error">✕</button>
          </div>
          <div v-if="filterTipo" class="badge badge-primary gap-1">
            {{ filterTipo === 'rural' ? '🌾' : '🏙️' }} {{ filterTipo }}
            <button @click="filterTipo = ''" class="hover:text-error">✕</button>
          </div>
          <button @click="clearFilters" class="btn btn-ghost btn-xs">
            Limpiar todos
          </button>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <DataTable 
      title="Registro de Actas"
      :data="paginatedActas"
      :columns="actasColumns"
      :loading="loading"
      :page-size="20"
      @export="exportActas"
    >
      <template #empty>
        <div class="text-center py-12">
          <div class="text-6xl opacity-20 mb-4">📋</div>
          <h3 class="text-xl font-semibold opacity-70">No se encontraron actas</h3>
          <p class="text-sm opacity-50 mt-2">
            {{ hasActiveFilters ? 'Intenta ajustar los filtros' : 'No hay actas registradas en el sistema' }}
          </p>
        </div>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center">
      <div class="join">
        <button 
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="join-item btn btn-sm"
        >
          ««
        </button>
        <button 
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="join-item btn btn-sm"
        >
          «
        </button>
        <button class="join-item btn btn-sm btn-active">
          Página {{ currentPage }} de {{ totalPages }}
        </button>
        <button 
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="join-item btn btn-sm"
        >
          »
        </button>
        <button 
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="join-item btn btn-sm"
        >
          »»
        </button>
      </div>
    </div>

    <!-- Info Footer -->
    <div class="text-center text-sm opacity-60">
      Mostrando {{ startRecord }} - {{ endRecord }} de {{ filteredActas.length }} actas
      <span v-if="filteredActas.length !== actas.length" class="ml-2">
        (filtrado de {{ actas.length }} totales)
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'
import SearchBar from '@/components/SearchBar.vue'
import DataTable from '@/components/DataTable.vue'

const { query } = useDatabase()

// Estado
const actas = ref([])
const loading = ref(false)
const searchTerm = ref('')
const filterDepartamento = ref('')
const filterTipo = ref('')
const currentPage = ref(1)
const pageSize = 20

// Configuración de columnas
const actasColumns = [
  { key: 'codigo', title: '📋 Código', type: 'text' },
  { key: 'recinto', title: '🏫 Recinto', type: 'text' },
  { key: 'asiento_electoral', title: '🗳️ Asiento Electoral', type: 'text' },
  { key: 'municipio', title: '🏙️ Municipio', type: 'text' },
  { key: 'provincia', title: '🗺️ Provincia', type: 'text' },
  { key: 'departamento', title: '📍 Departamento', type: 'text' },
  { key: 'operadores', title: '👷 Operadores', type: 'text' },
  { key: 'notarios', title: '📝 Notarios', type: 'text' }
]

// Computed
const departamentos = computed(() => {
  const depts = new Set(actas.value.map(a => a.departamento).filter(Boolean))
  return Array.from(depts).sort()
})

const hasActiveFilters = computed(() => {
  return searchTerm.value || filterDepartamento.value || filterTipo.value
})

const filteredActas = computed(() => {
  let data = actas.value

  // Búsqueda por texto
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    data = data.filter(acta => 
      acta.codigo?.toLowerCase().includes(term) ||
      acta.recinto?.toLowerCase().includes(term) ||
      acta.municipio?.toLowerCase().includes(term) ||
      acta.operadores?.toLowerCase().includes(term) ||
      acta.notarios?.toLowerCase().includes(term)
    )
  }

  // Filtro por departamento
  if (filterDepartamento.value) {
    data = data.filter(acta => acta.departamento === filterDepartamento.value)
  }

  // Filtro por tipo (rural/urbano) - basado en distrito del recinto
  // Como no tenemos el campo tipo directamente en acta, 
  // necesitarías agregarlo desde la query o inferirlo

  return data
})

const totalPages = computed(() => Math.ceil(filteredActas.value.length / pageSize))

const paginatedActas = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredActas.value.slice(start, start + pageSize)
})

const startRecord = computed(() => {
  if (filteredActas.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * pageSize
  return end > filteredActas.value.length ? filteredActas.value.length : end
})

// Estadísticas
const recintosConActas = computed(() => {
  const recintos = new Set(actas.value.map(a => a.recinto))
  return recintos.size
})

const porcentajeRecintos = computed(() => {
  // Esto es aproximado, idealmente deberías obtener el total de recintos
  return Math.round((recintosConActas.value / 100) * 100) || 0
})

const operadoresActivos = computed(() => {
  const operadores = new Set()
  actas.value.forEach(acta => {
    if (acta.operadores) {
      acta.operadores.split(',').forEach(op => operadores.add(op.trim()))
    }
  })
  return operadores.size
})

const notariosActivos = computed(() => {
  const notarios = new Set()
  actas.value.forEach(acta => {
    if (acta.notarios) {
      acta.notarios.split(',').forEach(not => notarios.add(not.trim()))
    }
  })
  return notarios.size
})

// Métodos
const loadActas = async () => {
  loading.value = true
  try {
    actas.value = query(queries.getAllActas())
  } catch (error) {
    console.error('Error cargando actas:', error)
    alert('❌ Error al cargar las actas')
  } finally {
    loading.value = false
  }
}

const performSearch = (term) => {
  searchTerm.value = term
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  searchTerm.value = ''
  filterDepartamento.value = ''
  filterTipo.value = ''
  currentPage.value = 1
}

const refreshData = () => {
  loadActas()
}

const exportActas = (data = null) => {
  const dataToExport = data || filteredActas.value
  
  if (dataToExport.length === 0) {
    alert('⚠️ No hay datos para exportar')
    return
  }

  const headers = actasColumns.map(col => col.title.replace(/[📋🏫🗳️🏙️🗺️📍👷📝]/g, '').trim())
  const rows = dataToExport.map(row => 
    actasColumns.map(col => {
      const value = row[col.key] || ''
      // Escapar comillas y comas
      return value.toString().includes(',') ? `"${value}"` : value
    }).join(',')
  )
  
  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  
  // Nombre descriptivo del archivo
  let filename = 'actas'
  if (filterDepartamento.value) filename += `_${filterDepartamento.value.replace(/\s+/g, '_')}`
  if (filterTipo.value) filename += `_${filterTipo.value}`
  filename += `_${new Date().toISOString().split('T')[0]}.csv`
  
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  // Notificación de éxito
  showNotification(`✅ Exportadas ${dataToExport.length} actas`)
}

const showNotification = (message) => {
  const notification = document.createElement('div')
  notification.className = 'toast toast-top toast-center z-50'
  notification.innerHTML = `<div class="alert alert-success"><span>${message}</span></div>`
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 2000)
}

// Watchers
watch([searchTerm, filterDepartamento, filterTipo], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadActas()
})
</script>

<style scoped>
/* Animaciones suaves */
.card, .stat, .btn {
  transition: all 0.2s ease;
}

.stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>