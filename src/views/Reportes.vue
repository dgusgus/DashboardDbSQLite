<!-- src/views/Reportes.vue - Vista de reportes -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold">📊 Reportes y Consultas</h1>
      <p class="text-sm opacity-70">Consultas específicas y reportes detallados</p>
    </div>

    <!-- Quick Reports -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="report in availableReports" 
        :key="report.id"
        class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        @click="loadReport(report.id)"
      >
        <div class="card-body text-center">
          <div class="text-3xl mb-2">{{ report.icon }}</div>
          <h3 class="card-title justify-center text-sm">{{ report.title }}</h3>
          <p class="text-xs opacity-70">{{ report.description }}</p>
          <div class="card-actions justify-center mt-2">
            <button 
              class="btn btn-primary btn-sm" 
              :class="{ 'loading': loadingReports[report.id] }"
              :disabled="loadingReports[report.id]"
            >
              {{ loadingReports[report.id] ? 'Cargando...' : 'Ver Reporte' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Report -->
    <div v-if="activeReport && reportData.length > 0" class="space-y-4">
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="font-bold">{{ activeReport.title }}</h3>
          <div class="text-xs">{{ activeReport.description }}</div>
        </div>
      </div>

      <DataTable 
        :title="activeReport.title"
        :data="reportData"
        :columns="reportColumns"
        :loading="isLoadingReport"
        :page-size="20"
        @export="exportReport"
      />
    </div>

    <!-- Custom Query Section -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="card-title">🔧 Consulta Personalizada (Solo Lectura)</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Ingresa tu consulta SQL SELECT:</span>
          </label>
          <textarea 
            v-model="customQuery"
            class="textarea textarea-bordered h-24 font-mono text-sm"
            placeholder="SELECT * FROM operador WHERE tipo_operador = 'rural';"
          ></textarea>
        </div>
        <div class="card-actions justify-end">
          <button 
            @click="executeCustomQuery"
            class="btn btn-primary"
            :disabled="!customQuery.trim() || isExecutingCustom"
            :class="{ 'loading': isExecutingCustom }"
          >
            {{ isExecutingCustom ? 'Ejecutando...' : '▶️ Ejecutar' }}
          </button>
        </div>

        <!-- Custom Query Results -->
        <div v-if="customResults.length > 0" class="mt-4">
          <DataTable 
            title="Resultados de Consulta Personalizada"
            :data="customResults"
            :columns="customColumns"
            :loading="false"
            :page-size="10"
            @export="exportCustomResults"
          />
        </div>

        <div v-if="customError" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ customError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'
import DataTable from '@/components/DataTable.vue'

const { query } = useDatabase()

// Estado
const activeReport = ref(null)
const reportData = ref([])
const isLoadingReport = ref(false)
const loadingReports = reactive({})

// Custom Query
const customQuery = ref('')
const customResults = ref([])
const customError = ref('')
const isExecutingCustom = ref(false)

// Reportes disponibles
const availableReports = [
  {
    id: 'operadores-vehiculos',
    title: 'Operadores con Vehículos',
    description: 'Operadores rurales y sus vehículos asignados',
    icon: '🚗👷',
    query: queries.getOperadorConVehiculo(),
    columns: [
      { key: 'operador', title: 'Operador', type: 'text' },
      { key: 'cedula', title: 'Cédula', type: 'text' },
      { key: 'placa', title: 'Placa', type: 'text' },
      { key: 'vehiculo', title: 'Vehículo', type: 'text' },
      { key: 'chofer', title: 'Chofer', type: 'text' },
      { key: 'recinto', title: 'Recinto', type: 'text' },
      { key: 'coordinador', title: 'Coordinador', type: 'text' }
    ]
  },
  {
    id: 'coordinadores-grupos',
    title: 'Coordinadores y Grupos',
    description: 'Coordinadores con sus grupos y operadores',
    icon: '👥🏢',
    query: queries.getCoordinadorConGrupo(),
    columns: [
      { key: 'coordinador', title: 'Coordinador', type: 'text' },
      { key: 'codigo_coordinador', title: 'Código', type: 'text' },
      { key: 'jefe', title: 'Jefe', type: 'text' },
      { key: 'grupo', title: 'Grupo', type: 'text' },
      { key: 'total_operadores', title: 'Total Op.', type: 'text' },
      { key: 'operadores_rurales', title: 'Rurales', type: 'text' },
      { key: 'operadores_urbanos', title: 'Urbanos', type: 'text' }
    ]
  },
  {
    id: 'operadores-departamento',
    title: 'Operadores por Ubicación',
    description: 'Distribución por departamento/provincia/municipio',
    icon: '📍📊',
    query: queries.getOperadoresPorDepartamento(),
    columns: [
      { key: 'departamento', title: 'Departamento', type: 'text' },
      { key: 'provincia', title: 'Provincia', type: 'text' },
      { key: 'municipio', title: 'Municipio', type: 'text' },
      { key: 'total_operadores', title: 'Total', type: 'text' },
      { key: 'rurales', title: 'Rurales', type: 'text' },
      { key: 'urbanos', title: 'Urbanos', type: 'text' }
    ]
  },
  {
    id: 'vehiculos-operadores',
    title: 'Vehículos con Operadores',
    description: 'Vehículos y lista de operadores transportados',
    icon: '🚐👥',
    query: queries.getVehiculosConOperadores(),
    columns: [
      { key: 'placa', title: 'Placa', type: 'text' },
      { key: 'vehiculo', title: 'Vehículo', type: 'text' },
      { key: 'chofer', title: 'Chofer', type: 'text' },
      { key: 'operadores_transportados', title: 'Cant. Op.', type: 'text' },
      { key: 'lista_operadores', title: 'Lista Operadores', type: 'text' }
    ]
  }
]

// Computed
const reportColumns = computed(() => {
  return activeReport.value ? activeReport.value.columns : []
})

const customColumns = computed(() => {
  if (customResults.value.length === 0) return []
  
  const firstRow = customResults.value[0]
  return Object.keys(firstRow).map(key => ({
    key,
    title: key.replace(/_/g, ' ').toUpperCase(),
    type: 'text'
  }))
})

// Métodos
const loadReport = async (reportId) => {
  const report = availableReports.find(r => r.id === reportId)
  if (!report) return

  loadingReports[reportId] = true
  isLoadingReport.value = true
  
  try {
    const results = query(report.query)
    activeReport.value = report
    reportData.value = results
  } catch (error) {
    console.error(`Error cargando reporte ${reportId}:`, error)
  } finally {
    loadingReports[reportId] = false
    isLoadingReport.value = false
  }
}

const executeCustomQuery = async () => {
  if (!customQuery.value.trim()) return

  // Validación básica - solo permitir SELECT
  const queryTrimmed = customQuery.value.trim().toUpperCase()
  if (!queryTrimmed.startsWith('SELECT')) {
    customError.value = 'Solo se permiten consultas SELECT por seguridad'
    return
  }

  customError.value = ''
  isExecutingCustom.value = true

  try {
    const results = query(customQuery.value)
    customResults.value = results
    
    if (results.length === 0) {
      customError.value = 'La consulta no devolvió resultados'
    }
  } catch (error) {
    customError.value = `Error en la consulta: ${error.message}`
    customResults.value = []
  } finally {
    isExecutingCustom.value = false
  }
}

const exportReport = (data) => {
  if (!activeReport.value) return
  
  const headers = reportColumns.value.map(col => col.title).join(',')
  const rows = data.map(row => 
    reportColumns.value.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  downloadCSV(csvContent, `reporte_${activeReport.value.id}_${new Date().toISOString().split('T')[0]}.csv`)
}

const exportCustomResults = (data) => {
  const headers = customColumns.value.map(col => col.title).join(',')
  const rows = data.map(row => 
    customColumns.value.map(col => row[col.key] || '').join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  downloadCSV(csvContent, `consulta_personalizada_${new Date().toISOString().split('T')[0]}.csv`)
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>