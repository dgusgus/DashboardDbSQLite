/* <!-- 🎯 MEJORA 6: Configuración mejorada del sistema -->
<!-- src/utils/config.js - Configuración centralizada --> */
export const appConfig = {
  // Configuración de la aplicación
  app: {
    name: 'Sistema de Consultas',
    version: '2.0.0',
    author: 'Tu Equipo',
    description: 'Visor avanzado de datos de operadores electorales'
  },
  
  // Configuración de la base de datos
  database: {
    maxRetries: 3,
    retryDelay: 1000,
    queryTimeout: 5000,
    cacheQueries: true,
    validateOnLoad: true
  },
  
  // Configuración de la interfaz
  ui: {
    defaultPageSize: 15,
    maxSearchResults: 50,
    searchMinLength: 2,
    searchDebounce: 300,
    animationDuration: 200,
    showAdvancedFeatures: true
  },
  
  // Configuración de exportación
  export: {
    maxRecords: 10000,
    defaultFormat: 'csv',
    includeTimestamp: true,
    dateFormat: 'YYYY-MM-DD',
    filename: 'exportacion_operadores'
  },
  
  // Tablas esperadas en la base de datos
  expectedTables: [
    'jefe', 'coordinador', 'grupo', 'departamento', 'provincia', 
    'municipio', 'asiento_electoral', 'recinto', 'operador', 
    'notario', 'mesa', 'acta', 'cuenta'
  ],
  
  // Configuración de consultas predefinidas
  queries: {
    enableCustomQueries: true,
    maxQueryLength: 1000,
    allowedKeywords: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT'],
    blockedKeywords: ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'CREATE', 'ALTER']
  },
  
  // Configuración PWA
  pwa: {
    enabled: true,
    name: 'Consultas App',
    shortName: 'Consultas',
    themeColor: '#3b82f6',
    backgroundColor: '#ffffff',
    display: 'standalone'
  }
}

// src/utils/performance.js - Monitor de rendimiento
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      queries: [],
      pageLoads: [],
      errors: []
    }
  }

  // Monitorear consulta SQL
  trackQuery(sql, duration, recordCount = 0) {
    this.metrics.queries.push({
      sql: sql.substring(0, 100),
      duration,
      recordCount,
      timestamp: new Date()
    })
    
    // Mantener solo los últimos 100 registros
    if (this.metrics.queries.length > 100) {
      this.metrics.queries = this.metrics.queries.slice(-100)
    }
  }

  // Monitorear carga de páginas
  trackPageLoad(route, duration) {
    this.metrics.pageLoads.push({
      route,
      duration,
      timestamp: new Date()
    })
  }

  // Monitorear errores
  trackError(error, context = '') {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date()
    })
  }

  // Obtener estadísticas
  getStats() {
    const queries = this.metrics.queries
    const avgQueryTime = queries.length > 0 
      ? queries.reduce((sum, q) => sum + q.duration, 0) / queries.length 
      : 0

    return {
      totalQueries: queries.length,
      avgQueryTime: Math.round(avgQueryTime),
      slowQueries: queries.filter(q => q.duration > 1000).length,
      totalErrors: this.metrics.errors.length,
      recentErrors: this.metrics.errors.slice(-5)
    }
  }

  // Limpiar métricas
  clear() {
    this.metrics = {
      queries: [],
      pageLoads: [],
      errors: []
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()
  