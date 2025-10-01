// src/composables/useDatabase.js - Versión mejorada
import { ref, computed } from 'vue'
import { db } from '@/utils/database.js'
import { appConfig } from '@/utils/config.js'

// Estado global reactivo
const isLoading = ref(false)
const isInitialized = ref(false)
const error = ref(null)
const connectionInfo = ref(null)
const stats = ref({})

export function useDatabase() {
  const initialize = async () => {
    if (isInitialized.value) return true
    
    isLoading.value = true
    error.value = null
    
    try {
      console.log('🔄 Inicializando base de datos...')
      
      await db.initialize()
      
      // Obtener info de conexión
      connectionInfo.value = db.testConnection()
      
      if (!connectionInfo.value.connected) {
        throw new Error(connectionInfo.value.error)
      }
      
      // Cargar estadísticas iniciales
      stats.value = db.getStats()
      
      console.log(`✅ BD lista - ${connectionInfo.value.validation.totalRecords} registros`)
      isInitialized.value = true
      return true
      
    } catch (err) {
      console.error('❌ Error inicializando BD:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 🔄 NUEVO: Recargar datos
  const reload = async () => {
    try {
      await db.reload()
      connectionInfo.value = db.testConnection()
      stats.value = db.getStats()
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  // 🔍 NUEVO: Búsqueda global mejorada
  const globalSearch = (term, limit = 20) => {
    if (!isInitialized.value) return []
    return db.searchGlobal(term, limit)
  }

  // 📊 NUEVO: Actualizar estadísticas
  const refreshStats = () => {
    if (!isInitialized.value) return {}
    stats.value = db.getStats()
    return stats.value
  }

  const query = (sql, params = []) => {
    if (!isInitialized.value) {
      throw new Error('Base de datos no inicializada')
    }
    return db.query(sql, params)
  }

  const queryFirst = (sql, params = []) => {
    const results = query(sql, params)
    return results.length > 0 ? results[0] : null
  }

  const getStats = () => {
    return stats.value
  }

  // Computed properties
  const ready = computed(() => isInitialized.value && !isLoading.value && !error.value)
  const totalRecords = computed(() => stats.value.total || 0)
  const lastUpdate = computed(() => stats.value.lastUpdate?.toLocaleString() || 'Desconocido')


  // 📊 NUEVO: Métricas extendidas del sistema
  const getSystemMetrics = () => {
    if (!isInitialized.value) return {}
    
    const stats = getCachedStats()
    const perfMetrics = db.getPerformanceMetrics()
    const validation = connectionInfo.value?.validation || {}
    
    return {
      // Estadísticas de datos
      datos: {
        totalRegistros: stats.total || 0,
        operadores: {
          total: stats.operador || 0,
          rurales: stats.operadores_rurales || 0,
          urbanos: stats.operadores_urbanos || 0
        },
        recintos: {
          total: stats.recinto || 0,
          rurales: stats.recintos_rurales || 0,
          urbanos: stats.recintos_urbanos || 0
        },
        mesas: stats.mesa || 0,
        actas: stats.acta || 0,
        notarios: stats.notario || 0
      },
      
      // Rendimiento
      rendimiento: {
        consultasEjecutadas: perfMetrics.queryCount || 0,
        tasaExito: perfMetrics.successRate || 0,
        tamanoBD: perfMetrics.dbSize || 0
      },
      
      // Validación
      validacion: {
        tablasEsperadas: appConfig.expectedTables.length,
        tablasEncontradas: validation.tableCount || 0,
        estado: validation.valid ? '✅ Válida' : '❌ Inválida'
      }
    }
  }

  // 🔍 NUEVO: Verificar salud del sistema
  const checkSystemHealth = () => {
    if (!isInitialized.value) return { healthy: false, message: 'Sistema no inicializado' }
    
    const metrics = getSystemMetrics()
    const issues = []
    
    // Verificar datos críticos
    if (metrics.datos.operadores.total === 0) {
      issues.push('No hay operadores registrados')
    }
    
    if (metrics.datos.recintos.total === 0) {
      issues.push('No hay recintos registrados')
    }
    
    if (metrics.rendimiento.tasaExito < 90) {
      issues.push('Alta tasa de errores en consultas')
    }
    
    if (!metrics.validacion.estado.includes('✅')) {
      issues.push('Problemas de validación en BD')
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      metrics
    }
  }

  return {
    // Estado
    isLoading,
    isInitialized,
    error,
    connectionInfo,
    stats,
    ready,
    totalRecords,
    lastUpdate,
    
    // Métodos
    initialize,
    reload,
    query,
    queryFirst,
    getStats,
    refreshStats,
    globalSearch,
    getSystemMetrics,
    checkSystemHealth
  }
}