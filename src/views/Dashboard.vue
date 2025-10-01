<!-- 🎯 MEJORA 3: Dashboard mejorado con estado de sistema -->
<!-- src/views/Dashboard.vue - Versión mejorada -->
<template>
  <div class="space-y-6">
    <!-- Header con estado del sistema -->
    <div class="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg">
      <div class="hero-content text-center">
        <div>
          <h1 class="text-4xl font-bold">📊 Dashboard</h1>
          <p class="py-2 text-lg">Sistema de Consultas de Operadores</p>
          <div class="flex justify-center gap-4 text-sm opacity-90">
            <div class="badge badge-ghost badge-lg">
              📊 {{ totalRecords }} registros
            </div>
            <div class="badge badge-ghost badge-lg">
              🕒 {{ lastUpdate }}
            </div>
            <div class="badge badge-success badge-lg">
              🟢 Conectado
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sistema de notificaciones -->
    <div v-if="systemNotifications.length > 0" class="space-y-2">
      <div 
        v-for="notification in systemNotifications" 
        :key="notification.id"
        :class="`alert ${notification.type === 'success' ? 'alert-success' : notification.type === 'warning' ? 'alert-warning' : 'alert-info'}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 class="font-bold">{{ notification.title }}</h3>
          <div class="text-xs">{{ notification.message }}</div>
        </div>
        <button @click="removeNotification(notification.id)" class="btn btn-sm btn-ghost">✕</button>
      </div>
    </div>

    <!-- Estadísticas mejoradas -->
    <StatsCards :stats="enhancedStats" />

    <!-- Panel de control rápido -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="card-title">⚡ Control Rápido</h3>
        <div class="flex flex-wrap gap-2">
          <button @click="refreshAllData" class="btn btn-outline btn-sm" :disabled="isRefreshing">
            <span v-if="isRefreshing" class="loading loading-spinner loading-xs"></span>
            🔄 Actualizar Datos
          </button>
          <button @click="exportSummary" class="btn btn-outline btn-sm">
            📤 Exportar Resumen
          </button>
          <button @click="testConnection" class="btn btn-outline btn-sm">
            🔍 Test Conexión
          </button>
          <button @click="showSystemInfo = !showSystemInfo" class="btn btn-outline btn-sm">
            ℹ️ Info Sistema
          </button>
        </div>
      </div>
    </div>

    <!-- Info detallada del sistema (colapsible) -->
    <div v-show="showSystemInfo" class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="card-title">🔧 Información Técnica</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 class="font-semibold mb-2">Base de Datos:</h4>
            <ul class="space-y-1">
              <li>📁 Tamaño: {{ systemInfo.dbSize }}</li>
              <li>📊 SQLite: {{ systemInfo.sqliteVersion }}</li>
              <li>📋 Tablas: {{ systemInfo.tableCount }}</li>
              <li>🔄 Actualizado: {{ systemInfo.lastUpdate }}</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">Rendimiento:</h4>
            <ul class="space-y-1">
              <li>⚡ Consultas realizadas: {{ queryCount }}</li>
              <li>🕒 Tiempo promedio: {{ avgQueryTime }}ms</li>
              <li>💾 En caché: {{ cacheHits }}</li>
              <li>🌐 Estado: Online</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Búsqueda global mejorada -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card bg-base-100 shadow-md">
        <div class="card-body">
          <h3 class="card-title">🔍 Búsqueda Global Inteligente</h3>
          
          <SearchBarEnhanced 
            v-model="searchTerm" 
            placeholder="Buscar operador, cédula, vehículo, grupo..."
            @search="performGlobalSearch"
            :suggestions="searchSuggestions"
          />
          
          <!-- Historial de búsquedas -->
          <div v-if="searchHistory.length > 0" class="mt-2">
            <p class="text-xs opacity-70 mb-1">Búsquedas recientes:</p>
            <div class="flex flex-wrap gap-1">
              <button 
                v-for="term in searchHistory.slice(0, 5)" 
                :key="term"
                @click="searchTerm = term; performGlobalSearch(term)"
                class="badge badge-outline badge-sm hover:badge-primary cursor-pointer"
              >
                {{ term }}
              </button>
            </div>
          </div>
          
          <!-- Resultados de búsqueda -->
          <div v-if="globalSearchResults.length > 0" class="mt-4 space-y-2">
            <h4 class="font-semibold">Resultados ({{ globalSearchResults.length }}):</h4>
            <div class="max-h-64 overflow-y-auto space-y-2">
              <div 
                v-for="result in globalSearchResults" 
                :key="`${result.tipo}-${result.id}`"
                class="alert py-2 cursor-pointer hover:bg-base-200 transition-colors"
                @click="navigateToResult(result)"
              >
                <div class="text-left">
                  <div class="flex items-center gap-2">
                    <span class="badge badge-primary badge-xs">{{ result.tipo }}</span>
                    <strong>{{ result.titulo }}</strong>
                  </div>
                  <div class="text-sm opacity-70">{{ result.subtitulo }}</div>
                  <div class="text-xs opacity-50">{{ result.descripcion }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="searchTerm && !isSearching && globalSearchResults.length === 0" class="text-center py-4 text-sm opacity-70">
            No se encontraron resultados para "{{ searchTerm }}"
          </div>
        </div>
      </div>

      <!-- Accesos rápidos mejorados -->
      <div class="space-y-4">
        <!-- Shortcuts principales -->
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="shortcut in quickShortcuts" 
            :key="shortcut.route"
            class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            @click="$router.push(shortcut.route)"
          >
            <div class="card-body text-center p-4">
              <div class="text-2xl mb-2">{{ shortcut.icon }}</div>
              <h4 class="font-semibold text-sm">{{ shortcut.title }}</h4>
              <p class="text-xs opacity-70">{{ shortcut.count }} registros</p>
            </div>
          </div>
        </div>

        <!-- Estadísticas destacadas -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h4 class="card-title text-sm">📈 Datos Destacados</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Operadores rurales:</span>
                <span class="font-mono">{{ stats.operadores_rurales || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Operadores urbanos:</span>
                <span class="font-mono">{{ stats.operadores_urbanos || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span>Vehículos activos:</span>
                <span class="font-mono">{{ stats.vehiculos_activos || 0 }}</span>
              </div>
              <div class="flex justify-between border-t pt-2">
                <span>Cobertura:</span>
                <span class="font-mono">{{ coveragePercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase.js'
import StatsCards from '@/components/StatsCards.vue'
import SearchBarEnhanced from '@/components/SearchBarEnhanced.vue'

const router = useRouter()
const { 
  stats, totalRecords, lastUpdate, refreshStats, globalSearch, 
  reload, connectionInfo, isLoading 
} = useDatabase()

// Estado del componente
const searchTerm = ref('')
const globalSearchResults = ref([])
const isSearching = ref(false)
const searchHistory = ref([])
const isRefreshing = ref(false)
const showSystemInfo = ref(false)
const systemNotifications = ref([])
const queryCount = ref(0)
const avgQueryTime = ref(0)
const cacheHits = ref(0)

// Computed
const enhancedStats = computed(() => {
  if (!stats.value) return []
  
  return [
    {
      title: 'Total Operadores',
      value: stats.value.operador || 0,
      icon: '👷',
      desc: `${stats.value.operadores_rurales || 0} rurales, ${stats.value.operadores_urbanos || 0} urbanos`
    },
    {
      title: 'Vehículos',
      value: stats.value.vehiculo || 0,
      icon: '🚗',
      desc: `${stats.value.vehiculos_activos || 0} activos`
    },
    {
      title: 'Recintos',
      value: stats.value.recinto || 0,
      icon: '🏫',
      desc: 'Ubicaciones de trabajo'
    },
    {
      title: 'Coordinadores',
      value: stats.value.coordinador || 0,
      icon: '👥',
      desc: `${stats.value.grupo || 0} grupos asignados`
    }
  ]
})

const quickShortcuts = computed(() => [
  { route: '/operadores', title: 'Operadores', icon: '👷', count: stats.value.operador || 0 },
  { route: '/vehiculos', title: 'Vehículos', icon: '🚗', count: stats.value.vehiculo || 0 },
  { route: '/recintos', title: 'Recintos', icon: '🏫', count: stats.value.recinto || 0 },
  { route: '/reportes', title: 'Reportes', icon: '📊', count: 12 }
])

const systemInfo = computed(() => {
  if (!connectionInfo.value?.systemInfo) return {}
  
  return {
    dbSize: connectionInfo.value.systemInfo.dbSize || 'Desconocido',
    sqliteVersion: connectionInfo.value.systemInfo.sqliteVersion || 'Desconocido',
    tableCount: connectionInfo.value.validation?.tableCount || 0,
    lastUpdate: connectionInfo.value.systemInfo.lastUpdate || 'Desconocido'
  }
})

const coveragePercentage = computed(() => {
  const operadores = stats.value.operador || 0
  const recintos = stats.value.recinto || 0
  if (recintos === 0) return 0
  return Math.min(100, Math.round((operadores / recintos) * 100))
})

const searchSuggestions = computed(() => {
  // Sugerencias basadas en datos reales
  return [
    'operador rural',
    'La Paz',
    'coordinador',
    'vehículo activo',
    'grupo norte'
  ]
})

// Métodos
const performGlobalSearch = async (term) => {
  if (!term || term.length < 2) {
    globalSearchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const startTime = performance.now()
    const results = globalSearch(term, 15)
    const endTime = performance.now()
    
    globalSearchResults.value = results
    
    // Actualizar métricas
    queryCount.value++
    const queryTime = endTime - startTime
    avgQueryTime.value = ((avgQueryTime.value * (queryCount.value - 1)) + queryTime) / queryCount.value
    
    // Agregar a historial
    if (results.length > 0 && !searchHistory.value.includes(term)) {
      searchHistory.value.unshift(term)
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
    }
    
  } catch (error) {
    console.error('Error en búsqueda global:', error)
    addNotification({
      type: 'error',
      title: 'Error de búsqueda',
      message: error.message
    })
  } finally {
    isSearching.value = false
  }
}

const navigateToResult = (result) => {
  const routes = {
    operador: '/operadores',
    vehiculo: '/vehiculos',
    recinto: '/recintos'
  }
  
  const route = routes[result.tipo] || '/operadores'
  router.push(`${route}?search=${result.titulo}`)
}

const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    await reload()
    refreshStats()
    
    addNotification({
      type: 'success',
      title: 'Datos actualizados',
      message: `${totalRecords.value} registros cargados exitosamente`
    })
    
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Error actualizando',
      message: error.message
    })
  } finally {
    isRefreshing.value = false
  }
}

const testConnection = () => {
  const info = connectionInfo.value
  
  if (info?.connected) {
    addNotification({
      type: 'success',
      title: 'Conexión OK',
      message: `BD funcionando correctamente - ${info.validation.totalRecords} registros`
    })
  } else {
    addNotification({
      type: 'error',
      title: 'Conexión Fallida',
      message: info?.error || 'Error desconocido'
    })
  }
}

const exportSummary = () => {
  const summary = {
    resumen_general: {
      total_registros: totalRecords.value,
      ultima_actualizacion: lastUpdate.value,
      estado_sistema: 'Operacional'
    },
    estadisticas_detalladas: stats.value
  }
  
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `resumen_sistema_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  addNotification({
    type: 'success',
    title: 'Resumen exportado',
    message: 'Archivo descargado exitosamente'
  })
}

const addNotification = (notification) => {
  const id = Date.now()
  systemNotifications.value.push({
    id,
    ...notification,
    timestamp: new Date()
  })
  
  // Auto-remove después de 5 segundos para success
  if (notification.type === 'success') {
    setTimeout(() => removeNotification(id), 5000)
  }
}

const removeNotification = (id) => {
  const index = systemNotifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    systemNotifications.value.splice(index, 1)
  }
}

// Watchers
watch(searchTerm, (newValue) => {
  if (newValue.length >= 2) {
    performGlobalSearch(newValue)
  } else {
    globalSearchResults.value = []
  }
})

onMounted(() => {
  // Cargar historial desde localStorage
  const savedHistory = localStorage.getItem('searchHistory')
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory)
  }
  
  // Guardar historial cuando cambie
  watch(searchHistory, (newHistory) => {
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }, { deep: true })
})
</script>
