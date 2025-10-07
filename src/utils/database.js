// src/utils/database.js - ACTUALIZADO: stats inferidas sin campo 'tipo'
class DatabaseManager {
  constructor() {
    this.db = null
    this.SQL = null
    this.isLoaded = false
    this.dbSize = 0
    this.lastUpdate = null
  }

  async initialize() {
    console.log('🚀 Inicializando base de datos...')
    
    try {
      // Cargar sql.js desde CDN como fallback
      if (!window.initSqlJs) {
        await this.loadSqlJsFromCDN()
      }
      
      // Inicializar SQL.js
      this.SQL = await window.initSqlJs({
        locateFile: file => {
          if (file === 'sql-wasm.wasm') {
            return '/sql-wasm.wasm'
          }
          return `https://sql.js.org/dist/${file}`
        }
      })
      
      console.log('✅ SQL.js inicializado')
      
      // Cargar base de datos con retry automático
      const arrayBuffer = await this.loadDatabaseWithRetry()
      
      console.log(`📊 BD cargada: ${arrayBuffer.byteLength} bytes`)
      this.dbSize = arrayBuffer.byteLength
      this.lastUpdate = new Date()
      
      if (arrayBuffer.byteLength < 1000) {
        throw new Error('La base de datos parece estar vacía o corrupta')
      }
      
      this.db = new this.SQL.Database(new Uint8Array(arrayBuffer))
      this.isLoaded = true
      
      // Test completo de la BD
      const validation = this.validateDatabase()
      if (!validation.valid) {
        throw new Error(`BD inválida: ${validation.error}`)
      }
      
      console.log('✅ Base de datos validada exitosamente')
      console.log(`📋 Tablas: ${validation.tableCount}, Registros: ${validation.totalRecords}`)
      
      return true
      
    } catch (error) {
      console.error('❌ Error detallado:', error)
      throw error
    }
  }

  async loadDatabaseWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch('/operadores.db', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return await response.arrayBuffer()
        
      } catch (error) {
        console.warn(`⚠️ Intento ${i + 1}/${maxRetries} falló:`, error.message)
        
        if (i === maxRetries - 1) throw error
        
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  async loadSqlJsFromCDN() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://sql.js.org/dist/sql-wasm.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  validateDatabase() {
    try {
      const tables = this.query("SELECT name FROM sqlite_master WHERE type='table'")
      const expectedTables = [
        'operador', 'recinto', 'coordinador', 'grupo', 'jefe',
        'departamento', 'provincia', 'municipio', 'asiento_electoral',
        'notario', 'acta', 'cuenta'
      ]
      
      const tableNames = tables.map(t => t.name)
      const missingTables = expectedTables.filter(t => !tableNames.includes(t))
      
      if (missingTables.length > 0) {
        return {
          valid: false,
          error: `Tablas faltantes: ${missingTables.join(', ')}`,
          tableCount: tables.length,
          availableTables: tableNames
        }
      }

      let totalRecords = 0
      for (const table of expectedTables) {
        try {
          const count = this.queryFirst(`SELECT COUNT(*) as count FROM ${table}`)
          totalRecords += count?.count || 0
        } catch (error) {
          console.warn(`⚠️ Error contando ${table}:`, error)
        }
      }

      return {
        valid: true,
        tableCount: tables.length,
        totalRecords,
        expectedTables,
        availableTables: tableNames
      }
      
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        tableCount: 0
      }
    }
  }

  testConnection() {
    if (!this.isLoaded) {
      return { connected: false, error: 'Base de datos no inicializada' }
    }
    
    try {
      const validation = this.validateDatabase()
      const systemInfo = {
        dbSize: `${(this.dbSize / 1024).toFixed(1)} KB`,
        lastUpdate: this.lastUpdate?.toLocaleString() || 'Desconocido',
        sqliteVersion: this.queryFirst("SELECT sqlite_version() as version")?.version
      }
      
      return { 
        connected: true, 
        error: null,
        validation,
        systemInfo
      }
    } catch (error) {
      return { connected: false, error: error.message }
    }
  }

  // 📊 ACTUALIZADO: Estadísticas inferidas (sin campo 'tipo' directo)
  getStats() {
    const tables = [
      'operador', 'recinto', 'coordinador', 'grupo', 'jefe',
      'departamento', 'provincia', 'municipio', 'asiento_electoral',
      'notario', 'acta', 'cuenta'
    ]
    
    const stats = {}
    let totalRecords = 0
    
    for (const table of tables) {
      try {
        const result = this.queryFirst(`SELECT COUNT(*) as count FROM ${table}`)
        const count = result ? result.count : 0
        stats[table] = count
        totalRecords += count
      } catch (error) {
        stats[table] = 0
      }
    }
    
    stats.total = totalRecords
    stats.dbSize = this.dbSize
    stats.lastUpdate = this.lastUpdate
    
    // 📊 ESTADÍSTICAS ESPECÍFICAS INFERIDAS
    try {
      // Operadores rurales: distrito = 0
      stats.operadores_rurales = this.queryFirst(`
        SELECT COUNT(*) as count 
        FROM operador o 
        JOIN recinto r ON o.recinto_id = r.id 
        WHERE r.distrito = 0
      `)?.count || 0
      
      // Operadores urbanos: distrito > 0
      stats.operadores_urbanos = this.queryFirst(`
        SELECT COUNT(*) as count 
        FROM operador o 
        JOIN recinto r ON o.recinto_id = r.id 
        WHERE r.distrito > 0
      `)?.count || 0
      
      // Recintos rurales
      stats.recintos_rurales = this.queryFirst(`
        SELECT COUNT(*) as count FROM recinto WHERE distrito = 0
      `)?.count || 0
      
      // Recintos urbanos
      stats.recintos_urbanos = this.queryFirst(`
        SELECT COUNT(*) as count FROM recinto WHERE distrito > 0
      `)?.count || 0
      
      // Notarios rurales
      stats.notarios_rurales = this.queryFirst(`
        SELECT COUNT(*) as count 
        FROM notario n 
        JOIN recinto r ON n.recinto_id = r.id 
        WHERE r.distrito = 0
      `)?.count || 0
      
      // Notarios urbanos
      stats.notarios_urbanos = this.queryFirst(`
        SELECT COUNT(*) as count 
        FROM notario n 
        JOIN recinto r ON n.recinto_id = r.id 
        WHERE r.distrito > 0
      `)?.count || 0
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo estadísticas específicas:', error)
    }
    
    return stats
  }

  searchGlobal(term, limit = 20) {
    if (!term || term.length < 2) return []
    
    const searchTerm = `%${term.toLowerCase()}%`
    
    try {
      const results = this.query(`
        SELECT 'operador' as tipo, o.id, o.nombre as titulo, o.ci as subtitulo,
               COALESCE(g.nombre, 'Sin grupo') || ' | ' || COALESCE(r.nombre, 'Sin recinto') as descripcion
        FROM operador o
        LEFT JOIN grupo g ON o.grupo_id = g.id
        LEFT JOIN recinto r ON o.recinto_id = r.id
        WHERE o.nombre LIKE ? OR o.ci LIKE ?
        
        UNION ALL
        
        SELECT 'notario' as tipo, n.id, n.nombre as titulo, n.ci as subtitulo,
               COALESCE(r.nombre, 'Sin recinto') as descripcion
        FROM notario n
        LEFT JOIN recinto r ON n.recinto_id = r.id
        WHERE n.nombre LIKE ? OR n.ci LIKE ?
        
        UNION ALL
        
        SELECT 'recinto' as tipo, r.id, r.nombre as titulo, r.direccion as subtitulo,
               COALESCE(ae.nombre, 'Sin asiento') as descripcion
        FROM recinto r
        LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
        WHERE r.nombre LIKE ? OR r.direccion LIKE ?
        
        UNION ALL
        
        SELECT 'acta' as tipo, a.id, a.codigo as titulo, r.nombre as subtitulo,
               COALESCE(m.nombre, 'Sin municipio') as descripcion
        FROM acta a
        LEFT JOIN recinto r ON a.recinto_id = r.id
        LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
        LEFT JOIN municipio m ON ae.municipio_id = m.id
        WHERE a.codigo LIKE ?
        
        LIMIT ?
      `, [
        searchTerm, searchTerm, // operador
        searchTerm, searchTerm, // notario
        searchTerm, searchTerm, // recinto
        searchTerm,             // acta
        limit
      ])
      
      return results
      
    } catch (error) {
      console.error('❌ Error en búsqueda global:', error)
      return []
    }
  }

  async reload() {
    try {
      console.log('🔄 Recargando base de datos...')
      
      const arrayBuffer = await this.loadDatabaseWithRetry()
      
      if (this.db) {
        this.db.close()
      }
      
      this.db = new this.SQL.Database(new Uint8Array(arrayBuffer))
      this.dbSize = arrayBuffer.byteLength
      this.lastUpdate = new Date()
      
      const validation = this.validateDatabase()
      if (!validation.valid) {
        throw new Error(`BD inválida: ${validation.error}`)
      }
      
      console.log('✅ Base de datos recargada exitosamente')
      return true
      
    } catch (error) {
      console.error('❌ Error recargando BD:', error)
      throw error
    }
  }

  query(sql, params = []) {
    if (!this.isLoaded) {
      throw new Error('BD no inicializada')
    }

    try {
      const results = this.db.exec(sql, params)
      
      if (results.length === 0) return []
      
      const columns = results[0].columns
      const values = results[0].values
      
      return values.map(row => {
        const obj = {}
        columns.forEach((col, index) => {
          obj[col] = row[index]
        })
        return obj
      })
      
    } catch (error) {
      console.error('❌ Error SQL:', sql, error)
      throw error
    }
  }

  queryFirst(sql, params = []) {
    const results = this.query(sql, params)
    return results.length > 0 ? results[0] : null
  }
}

export const db = new DatabaseManager()