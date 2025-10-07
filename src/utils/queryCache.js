// src/utils/queryCache.js - Sistema de caché para consultas
class QueryCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  /**
   * Guardar dato en caché
   * @param {string} key - Clave única
   * @param {any} data - Datos a cachear
   * @param {number} ttl - Tiempo de vida en ms (default: 5 min)
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    this.cache.set(key, data)
    this.timestamps.set(key, {
      createdAt: Date.now(),
      ttl
    })
  }

  /**
   * Obtener dato del caché
   * @param {string} key - Clave única
   * @returns {any|null} Datos o null si expiró/no existe
   */
  get(key) {
    if (!this.cache.has(key)) return null

    const timestamp = this.timestamps.get(key)
    const now = Date.now()

    // Verificar si expiró
    if (now - timestamp.createdAt > timestamp.ttl) {
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Eliminar entrada del caché
   */
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  /**
   * Limpiar todo el caché o por patrón
   */
  clear(pattern = null) {
    if (!pattern) {
      this.cache.clear()
      this.timestamps.clear()
      return
    }

    // Limpiar por patrón
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.delete(key)
      }
    })
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const entries = Array.from(this.timestamps.entries())
    const now = Date.now()

    return {
      totalEntries: this.cache.size,
      validEntries: entries.filter(([_, ts]) => 
        now - ts.createdAt <= ts.ttl
      ).length,
      expiredEntries: entries.filter(([_, ts]) => 
        now - ts.createdAt > ts.ttl
      ).length,
      memoryUsage: this._estimateSize()
    }
  }

  /**
   * Estimar tamaño en memoria (aproximado)
   */
  _estimateSize() {
    let size = 0
    this.cache.forEach(value => {
      try {
        size += JSON.stringify(value).length
      } catch {
        size += 100 // Estimación default
      }
    })
    return `${(size / 1024).toFixed(2)} KB`
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup() {
    const now = Date.now()
    const keys = Array.from(this.timestamps.keys())
    
    keys.forEach(key => {
      const timestamp = this.timestamps.get(key)
      if (now - timestamp.createdAt > timestamp.ttl) {
        this.delete(key)
      }
    })
  }
}

// Singleton global
const cacheInstance = new QueryCache()

// Limpieza automática cada 5 minutos
setInterval(() => {
  cacheInstance.cleanup()
  console.log('🧹 Caché limpiado:', cacheInstance.getStats())
}, 5 * 60 * 1000)

export const useQueryCache = () => cacheInstance