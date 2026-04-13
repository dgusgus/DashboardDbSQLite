// src/utils/database.js
// ✅ Actualizado para BD v2: tabla 'persona' unificada, sin 'grupo' separado

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
      if (!window.initSqlJs) {
        await this.loadSqlJsFromCDN()
      }
      // ✅ CORRECTO — usa BASE_URL de Vite
      this.SQL = await window.initSqlJs({
        locateFile: file => {
          if (file === 'sql-wasm.wasm') return `${import.meta.env.BASE_URL}sql-wasm.wasm`
          return `https://sql.js.org/dist/${file}`
        }
      })
      console.log('✅ SQL.js inicializado')

      const arrayBuffer = await this.loadDatabaseWithRetry()
      console.log(`📊 BD cargada: ${arrayBuffer.byteLength} bytes`)
      this.dbSize = arrayBuffer.byteLength
      this.lastUpdate = new Date()

      if (arrayBuffer.byteLength < 1000) {
        throw new Error('La base de datos parece estar vacía o corrupta')
      }

      this.db = new this.SQL.Database(new Uint8Array(arrayBuffer))
      this.isLoaded = true

      const validation = this.validateDatabase()
      if (!validation.valid) {
        throw new Error(`BD inválida: ${validation.error}`)
      }

      console.log('✅ Base de datos validada')
      console.log(`📋 Tablas: ${validation.tableCount}, Registros: ${validation.totalRecords}`)
      return true

    } catch (error) {
      console.error('❌ Error:', error)
      throw error
    }
  }

  async loadDatabaseWithRetry(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const BASE = import.meta.env.BASE_URL   // ya configurado en vite.config.js
        const response = await fetch(`${BASE}operadores.db`, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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

  // ✅ Tablas esperadas en BD v2
  validateDatabase() {
    try {
      const tables = this.query("SELECT name FROM sqlite_master WHERE type='table'")
      const tableNames = tables.map(t => t.name)

      // Tablas requeridas en la BD v2
      const requiredTables = [
        'jefe', 'coordinador',
        'departamento', 'provincia', 'municipio',
        'asiento_electoral', 'recinto',
        'persona', 'acta'
      ]

      const missingTables = requiredTables.filter(t => !tableNames.includes(t))

      if (missingTables.length > 0) {
        return {
          valid: false,
          error: `Tablas faltantes: ${missingTables.join(', ')}`,
          tableCount: tables.length,
          availableTables: tableNames
        }
      }

      let totalRecords = 0
      for (const table of requiredTables) {
        try {
          const count = this.queryFirst(`SELECT COUNT(*) as count FROM ${table}`)
          totalRecords += count?.count || 0
        } catch (e) {
          console.warn(`⚠️ Error contando ${table}:`, e)
        }
      }

      return { valid: true, tableCount: tables.length, totalRecords }

    } catch (error) {
      return { valid: false, error: error.message, tableCount: 0 }
    }
  }

  testConnection() {
    if (!this.isLoaded) return { connected: false, error: 'BD no inicializada' }
    try {
      const validation = this.validateDatabase()
      return {
        connected: true,
        error: null,
        validation,
        systemInfo: {
          dbSize: `${(this.dbSize / 1024).toFixed(1)} KB`,
          lastUpdate: this.lastUpdate?.toLocaleString() || 'Desconocido',
          sqliteVersion: this.queryFirst("SELECT sqlite_version() as version")?.version
        }
      }
    } catch (error) {
      return { connected: false, error: error.message }
    }
  }

  // ✅ Estadísticas usando estructura v2
  getStats() {
    const stats = {}

    const tableCounts = [
      'jefe', 'coordinador', 'departamento', 'provincia',
      'municipio', 'asiento_electoral', 'recinto', 'acta'
    ]

    let totalRecords = 0
    for (const table of tableCounts) {
      try {
        const result = this.queryFirst(`SELECT COUNT(*) as count FROM ${table}`)
        stats[table] = result?.count || 0
        totalRecords += stats[table]
      } catch {
        stats[table] = 0
      }
    }

    // Personas separadas por tipo
    try {
      stats.persona            = this.queryFirst(`SELECT COUNT(*) as c FROM persona`)?.c || 0
      stats.operador           = this.queryFirst(`SELECT COUNT(*) as c FROM persona WHERE tipo = 'operador'`)?.c || 0
      stats.notario            = this.queryFirst(`SELECT COUNT(*) as c FROM persona WHERE tipo = 'notario'`)?.c || 0
      stats.cuentas            = this.queryFirst(`SELECT COUNT(*) as c FROM persona WHERE user IS NOT NULL`)?.c || 0

      // Rural/urbano inferido desde provincia.es_urbano
      stats.operadores_rurales = this.queryFirst(`
        SELECT COUNT(*) as c FROM persona p
        JOIN recinto r ON p.recinto_id = r.id
        JOIN asiento_electoral ae ON r.asiento_id = ae.id
        JOIN municipio m ON ae.municipio_id = m.id
        WHERE p.tipo = 'operador' AND m.es_urbano = 0
      `)?.c || 0


      stats.operadores_urbanos = this.queryFirst(`
        SELECT COUNT(*) as c FROM persona p
        JOIN recinto r ON p.recinto_id = r.id
        JOIN asiento_electoral ae ON r.asiento_id = ae.id
        JOIN municipio m ON ae.municipio_id = m.id
        WHERE p.tipo = 'operador' AND m.es_urbano = 1
      `)?.c || 0

      stats.recintos_rurales = this.queryFirst(`
        SELECT COUNT(DISTINCT r.id) as c FROM recinto r
        JOIN asiento_electoral ae ON r.asiento_id = ae.id
        JOIN municipio m ON ae.municipio_id = m.id
        WHERE m.es_urbano = 0
      `)?.c || 0

      stats.recintos_urbanos = this.queryFirst(`
        SELECT COUNT(DISTINCT r.id) as c FROM recinto r
        JOIN asiento_electoral ae ON r.asiento_id = ae.id
        JOIN municipio m ON ae.municipio_id = m.id
        WHERE m.es_urbano = 1
      `)?.c || 0

      totalRecords += stats.persona + stats.acta
    } catch (e) {
      console.warn('⚠️ Error stats específicas:', e)
    }

    stats.total      = totalRecords
    stats.dbSize     = this.dbSize
    stats.lastUpdate = this.lastUpdate
    return stats
  }

  // ✅ Búsqueda global usando tabla persona
  searchGlobal(term, limit = 20) {
    if (!term || term.length < 2) return []
    const s = `%${term.toLowerCase()}%`
    try {
      return this.query(`
        SELECT 'operador' as tipo, p.id,
               p.nombre as titulo, p.ci as subtitulo,
               COALESCE(c.nombre_grupo, 'Sin grupo') || ' | ' || COALESCE(r.nombre, 'Sin recinto') as descripcion
        FROM persona p
        LEFT JOIN coordinador c ON p.coordinador_id = c.id
        LEFT JOIN recinto r ON p.recinto_id = r.id
        WHERE p.tipo = 'operador' AND (p.nombre LIKE ? OR p.ci LIKE ?)

        UNION ALL

        SELECT 'notario' as tipo, p.id,
               p.nombre as titulo, p.ci as subtitulo,
               COALESCE(r.nombre, 'Sin recinto') as descripcion
        FROM persona p
        LEFT JOIN recinto r ON p.recinto_id = r.id
        WHERE p.tipo = 'notario' AND (p.nombre LIKE ? OR p.ci LIKE ?)

        UNION ALL

        SELECT 'recinto' as tipo, r.id,
               r.nombre as titulo, r.direccion as subtitulo,
               COALESCE(ae.nombre, 'Sin asiento') as descripcion
        FROM recinto r
        LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
        WHERE r.nombre LIKE ? OR r.direccion LIKE ?

        UNION ALL

        SELECT 'acta' as tipo, a.id,
               a.codigo as titulo,
               COALESCE(r.nombre, 'Sin recinto') as subtitulo,
               COALESCE(m.nombre, 'Sin municipio') as descripcion
        FROM acta a
        JOIN persona p ON a.persona_id = p.id
        LEFT JOIN recinto r ON p.recinto_id = r.id
        LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
        LEFT JOIN municipio m ON ae.municipio_id = m.id
        WHERE a.codigo LIKE ?

        LIMIT ?
      `, [s, s, s, s, s, s, s, limit])
    } catch (e) {
      console.error('❌ Error búsqueda global:', e)
      return []
    }
  }

  async reload() {
    console.log('🔄 Recargando BD...')
    const arrayBuffer = await this.loadDatabaseWithRetry()
    if (this.db) this.db.close()
    this.db = new this.SQL.Database(new Uint8Array(arrayBuffer))
    this.dbSize = arrayBuffer.byteLength
    this.lastUpdate = new Date()
    const validation = this.validateDatabase()
    if (!validation.valid) throw new Error(`BD inválida: ${validation.error}`)
    console.log('✅ BD recargada')
    return true
  }

  query(sql, params = []) {
    if (!this.isLoaded) throw new Error('BD no inicializada')
    try {
      const results = this.db.exec(sql, params)
      if (results.length === 0) return []
      const { columns, values } = results[0]
      return values.map(row => {
        const obj = {}
        columns.forEach((col, i) => { obj[col] = row[i] })
        return obj
      })
    } catch (error) {
      console.error('❌ Error SQL:', sql.slice(0, 80), error)
      throw error
    }
  }

  queryFirst(sql, params = []) {
    const results = this.query(sql, params)
    return results.length > 0 ? results[0] : null
  }
}

export const db = new DatabaseManager()