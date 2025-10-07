<!-- src/views/Reportes.vue - ACTUALIZADO con análisis de actas -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">📊 Reportes y Análisis</h1>
        <p class="text-sm opacity-70">Estadísticas detalladas del sistema electoral</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportAllReports" class="btn btn-outline gap-2">
          <span>📦</span>
          Exportar Todo
        </button>
        <button @click="refreshData" class="btn btn-primary gap-2" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          <span v-else>🔄</span>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Tabs de Reportes -->
    <div class="tabs tabs-boxed bg-base-100 shadow-lg">
      <a 
        class="tab gap-2" 
        :class="{ 'tab-active': activeTab === 'general' }"
        @click="activeTab = 'general'"
      >
        <span>📈</span>
        <span>General</span>
      </a>
      <a 
        class="tab gap-2" 
        :class="{ 'tab-active': activeTab === 'geografico' }"
        @click="activeTab = 'geografico'"
      >
        <span>🗺️</span>
        <span>Geográfico</span>
      </a>
      <a 
        class="tab gap-2" 
        :class="{ 'tab-active': activeTab === 'jerarquia' }"
        @click="activeTab = 'jerarquia'"
      >
        <span>👥</span>
        <span>Jerarquía</span>
      </a>
      <a 
        class="tab gap-2" 
        :class="{ 'tab-active': activeTab === 'actas' }"
        @click="activeTab = 'actas'"
      >
        <span>📋</span>
        <span>Actas</span>
      </a>
      <a 
        class="tab gap-2" 
        :class="{ 'tab-active': activeTab === 'validacion' }"
        @click="activeTab = 'validacion'"
      >
        <span>✅</span>
        <span>Validación</span>
      </a>
    </div>

    <!-- Contenido de Tabs -->
    <div class="min-h-[400px]">
      <!-- Tab: Estadísticas Generales -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <StatsCards :stats="generalStats" />
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Gráfico de distribución -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg">📊 Distribución por Tipo</h3>
              <div class="stats stats-vertical shadow">
                <div class="stat">
                  <div class="stat-title">Operadores Rurales</div>
                  <div class="stat-value text-warning">{{ stats.operadores_rurales }}</div>
                  <div class="stat-desc">{{ porcentajeRurales }}% del total</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Operadores Urbanos</div>
                  <div class="stat-value text-info">{{ stats.operadores_urbanos }}</div>
                  <div class="stat-desc">{{ porcentajeUrbanos }}% del total</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumen de recursos -->
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-lg">🎯 Cobertura del Sistema</h3>
              <div class="space-y-3">
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span>Recintos con operadores</span>
                    <span class="font-semibold">{{ recintosConOperadores }}%</span>
                  </div>
                  <progress class="progress progress-primary" :value="recintosConOperadores" max="100"></progress>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span>Recintos con notarios</span>
                    <span class="font-semibold">{{ recintosConNotarios }}%</span>
                  </div>
                  <progress class="progress progress-success" :value="recintosConNotarios" max="100"></progress>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span>Recintos con actas</span>
                    <span class="font-semibold">{{ recintosConActas }}%</span>
                  </div>
                  <progress class="progress progress-warning" :value="recintosConActas" max="100"></progress>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Análisis Geográfico -->
      <div v-show="activeTab === 'geografico'">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h3 class="card-title">🗺️ Distribución por Departamento</h3>
              <button @click="exportGeographic" class="btn btn-sm btn-outline gap-2">
                <span>📤</span>
                Exportar
              </button>
            </div>
            <DataTable 
              :data="geograficData"
              :columns="geograficColumns"
              :loading="loading"
              :page-size="15"
            />
          </div>
        </div>
      </div>

      <!-- Tab: Jerarquía Organizacional -->
      <div v-show="activeTab === 'jerarquia'">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h3 class="card-title">👥 Estructura Organizacional</h3>
              <button @click="exportHierarchy" class="btn btn-sm btn-outline gap-2">
                <span>📤</span>
                Exportar
              </button>
            </div>
            <DataTable 
              :data="hierarchyData"
              :columns="hierarchyColumns"
              :loading="loading"
              :page-size="15"
            />
          </div>
        </div>
      </div>

      <!-- Tab: NUEVO - Análisis de Actas -->
      <div v-show="activeTab === 'actas'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat bg-base-100 rounded-lg shadow">
            <div class="stat-figure text-3xl">📋</div>
            <div class="stat-title">Total de Actas</div>
            <div class="stat-value text-2xl">{{ stats.acta || 0 }}</div>
            <div class="stat-desc">registradas en el sistema</div>
          </div>
          
          <div class="stat bg-base-100 rounded-lg shadow">
            <div class="stat-figure text-3xl">🏫</div>
            <div class="stat-title">Promedio por Recinto</div>
            <div class="stat-value text-2xl text-info">{{ promedioActasPorRecinto }}</div>
            <div class="stat-desc">actas por ubicación</div>
          </div>

          <div class="stat bg-base-100 rounded-lg shadow">
            <div class="stat-figure text-3xl">✅</div>
            <div class="stat-title">Cobertura</div>
            <div class="stat-value text-2xl text-success">{{ coberturaActas }}%</div>
            <div class="stat-desc">recintos con actas</div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h3 class="card-title">📋 Actas por Recinto</h3>
              <button @click="exportActasReport" class="btn btn-sm btn-outline gap-2">
                <span>📤</span>
                Exportar
              </button>
            </div>
            <DataTable 
              :data="actasData"
              :columns="actasReportColumns"
              :loading="loading"
              :page-size="15"
            />
          </div>
        </div>
      </div>

      <!-- Tab: NUEVO - Validación de Cobertura -->
      <div v-show="activeTab === 'validacion'" class="space-y-6">
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Recintos con asignaciones incompletas o faltantes</span>
        </div>

        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h3 class="card-title">⚠️ Recintos a Revisar</h3>
              <div class="badge badge-warning gap-2">
                <span>{{ recintosIncompletos.length }}</span>
                <span>pendientes</span>
              </div>
            </div>
            
            <DataTable 
              :data="recintosIncompletos"
              :columns="validacionColumns"
              :loading="loading"
              :page-size="15"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'
import { queries } from '@/utils/queries.js'
import StatsCards from '@/components/StatsCards.vue'
import DataTable from '@/components/DataTable.vue'

const { query, getStats } = useDatabase()

// Estado
const activeTab = ref('general')
const loading = ref(false)
const geograficData = ref([])
const hierarchyData = ref([])
const actasData = ref([])
const recintosIncompletos = ref([])

// Stats
const stats = computed(() => getStats())

// Configuración de columnas
const geograficColumns = [
  { key: 'departamento', title: 'Departamento', type: 'text' },
  { key: 'provincia', title: 'Provincia', type: 'text' },
  { key: 'municipio', title: 'Municipio', type: 'text' },
  { key: 'total_operadores', title: 'Operadores', type: 'text' },
  { key: 'rurales', title: 'Rurales', type: 'text' },
  { key: 'urbanos', title: 'Urbanos', type: 'text' },
  { key: 'recintos', title: 'Recintos', type: 'text' },
  { key: 'actas_registradas', title: 'Actas', type: 'text' }
]

const hierarchyColumns = [
  { key: 'jefe', title: 'Jefe', type: 'text' },
  { key: 'jefe_telefono', title: 'Teléfono Jefe', type: 'phone' },
  { key: 'coordinador', title: 'Coordinador', type: 'text' },
  { key: 'coordinador_telefono', title: 'Teléfono Coord.', type: 'phone' },
  { key: 'grupo', title: 'Grupo', type: 'text' },
  { key: 'total_operadores', title: 'Total Op.', type: 'text' },
  { key: 'operadores_rurales', title: 'Rurales', type: 'text' },
  { key: 'operadores_urbanos', title: 'Urbanos', type: 'text' }
]

const actasReportColumns = [
  { key: 'recinto', title: 'Recinto', type: 'text' },
  { key: 'tipo', title: 'Tipo', type: 'badge' },
  { key: 'municipio', title: 'Municipio', type: 'text' },
  { key: 'total_actas', title: 'Actas', type: 'text' },
  { key: 'operadores', title: 'Operadores', type: 'text' },
  { key: 'notarios', title: 'Notarios', type: 'text' }
]

const validacionColumns = [
  { key: 'recinto', title: 'Recinto', type: 'text' },
  { key: 'municipio', title: 'Municipio', type: 'text' },
  { key: 'operadores', title: 'Operadores', type: 'text' },
  { key: 'notarios', title: 'Notarios', type: 'text' },
  { key: 'actas', title: 'Actas', type: 'text' },
  { key: 'estado', title: 'Estado', type: 'text' }
]

// Computed properties
const generalStats = computed(() => [
  {
    icon: '👷',
    title: 'Total Operadores',
    value: stats.value.operador || 0,
    desc: `${stats.value.operadores_rurales || 0} rurales, ${stats.value.operadores_urbanos || 0} urbanos`
  },
  {
    icon: '📝',
    title: 'Notarios',
    value: stats.value.notario || 0,
    desc: 'Supervisando recintos'
  },
  {
    icon: '🏫',
    title: 'Recintos',
    value: stats.value.recinto || 0,
    desc: `${stats.value.recintos_rurales || 0} rurales, ${stats.value.recintos_urbanos || 0} urbanos`
  },
  {
    icon: '📋',
    title: 'Actas Registradas',
    value: stats.value.acta || 0,
    desc: 'Documentos en sistema'
  }
])

const porcentajeRurales = computed(() => {
  const total = stats.value.operador || 0
  if (total === 0) return 0
  return Math.round(((stats.value.operadores_rurales || 0) / total) * 100)
})

const porcentajeUrbanos = computed(() => {
  const total = stats.value.operador || 0
  if (total === 0) return 0
  return Math.round(((stats.value.operadores_urbanos || 0) / total) * 100)
})

const recintosConOperadores = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  // Esto es una aproximación, idealmente necesitarías una query específica
  return Math.min(100, Math.round(((stats.value.operador || 0) / total) * 100))
})

const recintosConNotarios = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  return Math.min(100, Math.round(((stats.value.notario || 0) / total) * 100))
})

const recintosConActas = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  // Calcular basado en actas únicas por recinto
  const actasUnicas = actasData.value.filter(a => a.total_actas > 0).length
  return Math.min(100, Math.round((actasUnicas / total) * 100))
})

const promedioActasPorRecinto = computed(() => {
  const totalRecintos = stats.value.recinto || 0
  const totalActas = stats.value.acta || 0
  if (totalRecintos === 0) return 0
  return (totalActas / totalRecintos).toFixed(1)
})

const coberturaActas = computed(() => recintosConActas.value)

// Métodos
const loadGeographicData = async () => {
  try {
    geograficData.value = query(queries.getOperadoresPorDepartamento())
  } catch (error) {
    console.error('Error cargando datos geográficos:', error)
  }
}

const loadHierarchyData = async () => {
  try {
    hierarchyData.value = query(queries.getJerarquiaCompleta())
  } catch (error) {
    console.error('Error cargando jerarquía:', error)
  }
}

const loadActasData = async () => {
  try {
    actasData.value = query(queries.getActasPorRecinto())
  } catch (error) {
    console.error('Error cargando datos de actas:', error)
  }
}

const loadValidacionData = async () => {
  try {
    recintosIncompletos.value = query(queries.getRecintosIncompletos())
  } catch (error) {
    console.error('Error cargando validación:', error)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadGeographicData(),
      loadHierarchyData(),
      loadActasData(),
      loadValidacionData()
    ])
  } finally {
    loading.value = false
  }
}

const exportGeographic = () => {
  exportToCSV(geograficData.value, geograficColumns, 'reporte_geografico')
}

const exportHierarchy = () => {
  exportToCSV(hierarchyData.value, hierarchyColumns, 'reporte_jerarquia')
}

const exportActasReport = () => {
  exportToCSV(actasData.value, actasReportColumns, 'reporte_actas')
}

const exportAllReports = () => {
  exportGeographic()
  exportHierarchy()
  exportActasReport()
  
  showNotification('✅ Todos los reportes han sido exportados')
}

const exportToCSV = (data, columns, filename) => {
  if (!data || data.length === 0) {
    alert('⚠️ No hay datos para exportar')
    return
  }

  const headers = columns.map(col => col.title).join(',')
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key] || ''
      // Escapar comillas y comas
      return value.toString().includes(',') || value.toString().includes('"')
        ? `"${value.toString().replace(/"/g, '""')}"`
        : value
    }).join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
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

const showNotification = (message) => {
  const notification = document.createElement('div')
  notification.className = 'toast toast-top toast-center z-50'
  notification.innerHTML = `<div class="alert alert-success"><span>${message}</span></div>`
  document.body.appendChild(notification)
  setTimeout(() => notification.remove(), 2000)
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
/* Animaciones de tabs */
.tab {
  transition: all 0.2s ease;
}

.tab:hover {
  transform: translateY(-2px);
}

.tab-active {
  font-weight: 600;
}

/* Progress bar animations */
.progress {
  transition: value 0.3s ease;
}

/* Card hover effects */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.stat:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}
</style>