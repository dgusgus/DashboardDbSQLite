<!-- src/views/Dashboard.vue - REDISEÑADO como Vista Resumen -->
<template>
  <div class="space-y-6">
    <!-- Hero Section -->
    <div class="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
      <div class="hero-content text-center py-8">
        <div>
          <h1 class="text-4xl font-bold">📊 Sistema de Consultas Electoral</h1>
          <p class="text-lg opacity-70 mt-2">Panel de control general</p>
          <div class="text-sm opacity-60 mt-1">
            Última actualización: {{ lastUpdate }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview - Grid Principal -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Operadores -->
      <router-link 
        to="/operadores" 
        class="stat bg-base-100 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <div class="stat-figure text-4xl">👷</div>
        <div class="stat-title">Operadores</div>
        <div class="stat-value text-3xl text-primary">{{ stats.operador || 0 }}</div>
        <div class="stat-desc flex justify-between text-xs mt-2">
          <span>🌾 {{ stats.operadores_rurales || 0 }} rurales</span>
          <span>🏙️ {{ stats.operadores_urbanos || 0 }} urbanos</span>
        </div>
        <div class="stat-actions mt-2">
          <button class="btn btn-xs btn-ghost">Ver detalles →</button>
        </div>
      </router-link>

      <!-- Notarios -->
      <router-link 
        to="/notarios" 
        class="stat bg-base-100 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <div class="stat-figure text-4xl">📝</div>
        <div class="stat-title">Notarios</div>
        <div class="stat-value text-3xl text-success">{{ stats.notario || 0 }}</div>
        <div class="stat-desc text-xs mt-2">
          Personal de supervisión
        </div>
        <div class="stat-actions mt-2">
          <button class="btn btn-xs btn-ghost">Ver detalles →</button>
        </div>
      </router-link>

      <!-- Recintos -->
      <router-link 
        to="/recintos" 
        class="stat bg-base-100 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <div class="stat-figure text-4xl">🏫</div>
        <div class="stat-title">Recintos</div>
        <div class="stat-value text-3xl text-info">{{ stats.recinto || 0 }}</div>
        <div class="stat-desc flex justify-between text-xs mt-2">
          <span>🌾 {{ stats.recintos_rurales || 0 }}</span>
          <span>🏙️ {{ stats.recintos_urbanos || 0 }}</span>
        </div>
        <div class="stat-actions mt-2">
          <button class="btn btn-xs btn-ghost">Ver detalles →</button>
        </div>
      </router-link>

      <!-- Actas -->
      <router-link 
        to="/actas" 
        class="stat bg-base-100 rounded-lg shadow hover:shadow-xl transition-all cursor-pointer hover:scale-105"
      >
        <div class="stat-figure text-4xl">📋</div>
        <div class="stat-title">Actas Registradas</div>
        <div class="stat-value text-3xl text-warning">{{ stats.acta || 0 }}</div>
        <div class="stat-desc text-xs mt-2">
          Documentos electorales
        </div>
        <div class="stat-actions mt-2">
          <button class="btn btn-xs btn-ghost">Ver detalles →</button>
        </div>
      </router-link>
    </div>

    <!-- Búsqueda Global Rápida -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-lg">🔍 Búsqueda Rápida</h2>
        <div class="flex gap-2">
          <input 
            v-model="globalSearch"
            @keyup.enter="performGlobalSearch"
            type="text" 
            placeholder="Buscar por nombre, CI, recinto, código de acta..."
            class="input input-bordered flex-1"
          />
          <button 
            @click="performGlobalSearch" 
            class="btn btn-primary"
            :disabled="!globalSearch || searching"
          >
            <span v-if="searching" class="loading loading-spinner loading-sm"></span>
            <span v-else>Buscar</span>
          </button>
        </div>

        <!-- Resultados de búsqueda global -->
        <div v-if="searchResults.length > 0" class="mt-4 space-y-2">
          <div class="text-sm font-semibold opacity-70">
            {{ searchResults.length }} resultados encontrados:
          </div>
          <div class="space-y-1 max-h-60 overflow-y-auto">
            <div 
              v-for="result in searchResults" 
              :key="`${result.tipo}-${result.id}`"
              @click="goToResult(result)"
              class="p-3 hover:bg-base-200 rounded cursor-pointer transition-colors border border-base-300"
            >
              <div class="flex items-start gap-3">
                <div class="text-2xl">
                  {{ getIconForType(result.tipo) }}
                </div>
                <div class="flex-1">
                  <div class="font-semibold">{{ result.titulo }}</div>
                  <div class="text-xs opacity-60">{{ result.subtitulo }}</div>
                  <div class="text-xs opacity-50 mt-1">{{ result.descripcion }}</div>
                </div>
                <div class="badge badge-sm">{{ result.tipo }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="searchPerformed && searchResults.length === 0" class="text-center py-4 opacity-60">
          No se encontraron resultados
        </div>
      </div>
    </div>

    <!-- Indicadores Clave -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Cobertura -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-lg">📈 Cobertura del Sistema</h2>
          <div class="space-y-4 mt-2">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Recintos con operadores</span>
                <span class="font-semibold">{{ coberturaOperadores }}%</span>
              </div>
              <progress 
                class="progress progress-primary" 
                :value="coberturaOperadores" 
                max="100"
              ></progress>
            </div>
            
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Recintos con notarios</span>
                <span class="font-semibold">{{ coberturaNotarios }}%</span>
              </div>
              <progress 
                class="progress progress-success" 
                :value="coberturaNotarios" 
                max="100"
              ></progress>
            </div>
            
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Recintos con actas</span>
                <span class="font-semibold">{{ coberturaActas }}%</span>
              </div>
              <progress 
                class="progress progress-warning" 
                :value="coberturaActas" 
                max="100"
              ></progress>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribución Geográfica Top 5 -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h2 class="card-title text-lg">🗺️ Top 5 Departamentos</h2>
            <router-link to="/reportes?tab=geografico" class="btn btn-xs btn-ghost">
              Ver todos →
            </router-link>
          </div>
          <div class="space-y-2 mt-2">
            <div 
              v-for="(dept, index) in topDepartamentos" 
              :key="dept.nombre"
              class="flex items-center gap-2"
            >
              <div class="badge badge-sm">{{ index + 1 }}</div>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ dept.nombre }}</div>
              </div>
              <div class="text-sm font-semibold">{{ dept.total }} ops</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actividad Reciente / Alertas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Alertas del Sistema -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-lg">⚠️ Alertas</h2>
          <div class="space-y-2 mt-2">
            <div v-if="recintosIncompletos > 0" class="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span class="font-semibold">{{ recintosIncompletos }} recintos incompletos</span>
                <div class="text-xs">Sin operadores, notarios o actas</div>
              </div>
              <router-link to="/reportes?tab=validacion" class="btn btn-xs">
                Ver
              </router-link>
            </div>

            <div v-else class="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>✅ Todos los recintos tienen cobertura completa</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="card bg-base-100 shadow-lg">
        <div class="card-body">
          <h2 class="card-title text-lg">⚡ Accesos Rápidos</h2>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <router-link to="/operadores" class="btn btn-outline btn-sm gap-2">
              <span>👷</span>
              <span>Operadores</span>
            </router-link>
            <router-link to="/notarios" class="btn btn-outline btn-sm gap-2">
              <span>📝</span>
              <span>Notarios</span>
            </router-link>
            <router-link to="/recintos" class="btn btn-outline btn-sm gap-2">
              <span>🏫</span>
              <span>Recintos</span>
            </router-link>
            <router-link to="/actas" class="btn btn-outline btn-sm gap-2">
              <span>📋</span>
              <span>Actas</span>
            </router-link>
            <router-link to="/reportes" class="btn btn-outline btn-sm gap-2 col-span-2">
              <span>📊</span>
              <span>Ver Reportes Completos</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDatabase } from '@/composables/useDatabase.js'

const router = useRouter()
const { query, getStats, globalSearch: dbGlobalSearch } = useDatabase()

// Estado
const stats = ref({})
const globalSearch = ref('')
const searchResults = ref([])
const searching = ref(false)
const searchPerformed = ref(false)
const topDepartamentos = ref([])
const recintosIncompletos = ref(0)

// Computed
const lastUpdate = computed(() => {
  const now = new Date()
  return now.toLocaleString('es-ES', { 
    dateStyle: 'long', 
    timeStyle: 'short' 
  })
})

const coberturaOperadores = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  // Estimación aproximada
  return Math.min(100, Math.round((stats.value.operador / total) * 100))
})

const coberturaNotarios = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  return Math.min(100, Math.round((stats.value.notario / total) * 100))
})

const coberturaActas = computed(() => {
  const total = stats.value.recinto || 0
  if (total === 0) return 0
  return Math.min(100, Math.round((stats.value.acta / total) * 50))
})

// Métodos
const loadStats = () => {
  stats.value = getStats()
}

const loadTopDepartamentos = () => {
  try {
    const data = query(`
      SELECT 
        d.nombre,
        COUNT(DISTINCT o.id) as total
      FROM departamento d
      LEFT JOIN provincia p ON d.id = p.departamento_id
      LEFT JOIN municipio m ON p.id = m.provincia_id
      LEFT JOIN asiento_electoral ae ON m.id = ae.municipio_id
      LEFT JOIN recinto r ON ae.id = r.asiento_id
      LEFT JOIN operador o ON r.id = o.recinto_id
      GROUP BY d.nombre
      HAVING total > 0
      ORDER BY total DESC
      LIMIT 5
    `)
    topDepartamentos.value = data
  } catch (error) {
    console.error('Error cargando top departamentos:', error)
  }
}

const loadAlerts = () => {
  try {
    const data = query(`
      SELECT COUNT(*) as total
      FROM recinto r
      LEFT JOIN operador o ON r.id = o.recinto_id
      LEFT JOIN notario n ON r.id = n.recinto_id
      LEFT JOIN acta a ON r.id = a.recinto_id
      WHERE o.id IS NULL OR n.id IS NULL OR a.id IS NULL
    `)
    recintosIncompletos.value = data[0]?.total || 0
  } catch (error) {
    console.error('Error cargando alertas:', error)
  }
}

const performGlobalSearch = () => {
  if (!globalSearch.value) return

  searching.value = true
  searchPerformed.value = true
  
  try {
    searchResults.value = dbGlobalSearch(globalSearch.value, 10)
  } catch (error) {
    console.error('Error en búsqueda:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

const getIconForType = (tipo) => {
  const icons = {
    'operador': '👷',
    'notario': '📝',
    'recinto': '🏫',
    'acta': '📋',
    'coordinador': '👨‍💼'
  }
  return icons[tipo] || '📄'
}

const goToResult = (result) => {
  const routes = {
    'operador': '/operadores',
    'notario': '/notarios',
    'recinto': '/recintos',
    'acta': '/actas'
  }
  
  const route = routes[result.tipo]
  if (route) {
    router.push(route)
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadTopDepartamentos()
  loadAlerts()
})
</script>

<style scoped>
/* Gradient hero */
.hero {
  background: linear-gradient(135deg, hsl(var(--p) / 0.1) 0%, hsl(var(--s) / 0.1) 100%);
}

/* Animación de stats */
.stat {
  transition: all 0.3s ease;
}

.stat:hover {
  transform: translateY(-4px);
}

/* Progress bars animadas */
.progress {
  transition: value 0.5s ease;
}
</style>