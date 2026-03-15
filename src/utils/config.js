// src/utils/config.js
// ✅ Actualizado para BD v2

export const appConfig = {
  app: {
    name: 'Sistema de Consultas',
    version: '2.0.0',
    description: 'Visor de datos de operadores electorales'
  },
  database: {
    maxRetries: 3,
    retryDelay: 1000,
    queryTimeout: 5000,
    cacheQueries: true,
    validateOnLoad: true
  },
  ui: {
    defaultPageSize: 15,
    maxSearchResults: 50,
    searchMinLength: 2,
    searchDebounce: 300,
    animationDuration: 200,
  },
  export: {
    maxRecords: 10000,
    defaultFormat: 'csv',
    includeTimestamp: true,
    filename: 'exportacion_operadores'
  },

  // ✅ Tablas reales de BD v2
  expectedTables: [
    'jefe', 'coordinador',
    'departamento', 'provincia', 'municipio',
    'asiento_electoral', 'recinto',
    'persona', 'acta'
  ],

  queries: {
    enableCustomQueries: false,
    allowedKeywords: ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT', 'JOIN'],
    blockedKeywords: ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'CREATE', 'ALTER']
  },
  pwa: {
    enabled: true,
    name: 'Consultas Electoral',
    shortName: 'Consultas',
    themeColor: '#3b82f6',
  }
}