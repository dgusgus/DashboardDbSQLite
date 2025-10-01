<!-- src/components/DataTable.vue - Tabla de datos reutilizable -->
<template>
  <div class="card bg-base-100 shadow-md">
    <!-- Header -->
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h2 class="card-title">{{ title }}</h2>
        <div class="flex gap-2">
          <button 
            @click="exportData"
            class="btn btn-outline btn-sm"
          >
            📤 Exportar
          </button>
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-outline btn-sm">
              Columnas ⬇
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li v-for="column in columns" :key="column.key">
                <label class="cursor-pointer label">
                  <span class="label-text">{{ column.title }}</span>
                  <input 
                    type="checkbox" 
                    :checked="visibleColumns.includes(column.key)"
                    @change="toggleColumn(column.key)"
                    class="checkbox checkbox-sm"
                  />
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <span class="loading loading-spinner loading-md"></span>
        <p class="mt-2 text-sm opacity-70">Cargando datos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!data || data.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-lg font-semibold">No hay datos para mostrar</p>
        <p class="text-sm opacity-70">Intenta ajustar los filtros de búsqueda</p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th v-for="column in visibleColumnsData" :key="column.key">
                {{ column.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in paginatedData" :key="index">
              <td v-for="column in visibleColumnsData" :key="column.key">
                <span v-if="column.type === 'badge'" :class="`badge ${getBadgeClass(row[column.key])}`">
                  {{ row[column.key] }}
                </span>
                <span v-else-if="column.type === 'phone'" class="font-mono">
                  {{ formatPhone(row[column.key]) }}
                </span>
                <span v-else-if="column.type === 'date'">
                  {{ formatDate(row[column.key]) }}
                </span>
                <span v-else>
                  {{ row[column.key] || '-' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-6">
          <div class="btn-group">
            <button 
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="btn btn-sm"
            >
              ««
            </button>
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="btn btn-sm"
            >
              «
            </button>
            
            <span class="btn btn-sm btn-active">
              {{ currentPage }} / {{ totalPages }}
            </span>
            
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="btn btn-sm"
            >
              »
            </button>
            <button 
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="btn btn-sm"
            >
              »»
            </button>
          </div>
        </div>

        <!-- Results Info -->
        <div class="text-center mt-4 text-sm opacity-70">
          Mostrando {{ startRecord }} - {{ endRecord }} de {{ data.length }} registros
        </div>
      </div>
    </div>
  </div>

  



    <!-- Nuevas funciones agregadas al final del template -->
  <div class="card-footer" v-if="!loading && data && data.length > 0">
    <div class="flex justify-between items-center text-sm opacity-70 pt-4 border-t">
      <div class="flex items-center gap-4">
        <!-- Selector de tamaño de página -->
        <div class="flex items-center gap-2">
          <span>Mostrar:</span>
          <select v-model="currentPageSize" class="select select-xs select-bordered">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span>por página</span>
        </div>
        
        <!-- Filtro rápido -->
        <div class="flex items-center gap-2">
          <span>Filtro rápido:</span>
          <input 
            v-model="quickFilter"
            placeholder="Filtrar tabla..."
            class="input input-xs input-bordered w-32"
          />
        </div>
      </div>
      
      <!-- Información adicional -->
      <div class="flex items-center gap-4">
        <span>
          Mostrando {{ startRecord }} - {{ endRecord }} de {{ filteredData.length }} 
          {{ filteredData.length !== data.length ? `(filtrado de ${data.length})` : '' }}
        </span>
        <button @click="toggleCompactMode" class="btn btn-xs btn-ghost">
          {{ compactMode ? '📖' : '📋' }} {{ compactMode ? 'Normal' : 'Compacto' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Datos'
  },
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 10
  }
})




// Nuevas variables reactivas
const quickFilter = ref('')
const currentPageSize = ref(props.pageSize)
const compactMode = ref(false)

// Computed para datos filtrados
const filteredData = computed(() => {
  if (!quickFilter.value) return props.data
  
  const filter = quickFilter.value.toLowerCase()
  return props.data.filter(row => {
    return Object.values(row).some(value => 
      value && value.toString().toLowerCase().includes(filter)
    )
  })
})



const emit = defineEmits(['export'])

// Estado
const currentPage = ref(1)
const visibleColumns = ref(props.columns.map(col => col.key))

// Computed
const visibleColumnsData = computed(() => {
  return props.columns.filter(col => visibleColumns.value.includes(col.key))
})

// Recalcular páginas totales
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / currentPageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * currentPageSize.value
  const end = start + currentPageSize.value
  return filteredData.value.slice(start, end)
})

const startRecord = computed(() => {
  return (currentPage.value - 1) * props.pageSize + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * props.pageSize
  return end > props.data.length ? props.data.length : end
})

// Métodos
const goToPage = (page) => {
  currentPage.value = page
}

const toggleColumn = (columnKey) => {
  const index = visibleColumns.value.indexOf(columnKey)
  if (index > -1) {
    visibleColumns.value.splice(index, 1)
  } else {
    visibleColumns.value.push(columnKey)
  }
}

const exportData = () => {
  emit('export', props.data)
}

const getBadgeClass = (value) => {
  if (!value) return 'badge-ghost'
  
  const lowercaseValue = value.toString().toLowerCase()
  if (lowercaseValue.includes('activo')) return 'badge-success'
  if (lowercaseValue.includes('rural')) return 'badge-warning'
  if (lowercaseValue.includes('urbano')) return 'badge-info'
  return 'badge-ghost'
}

const formatPhone = (phone) => {
  if (!phone) return '-'
  return phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES')
}

// Nuevos métodos
const toggleCompactMode = () => {
  compactMode.value = !compactMode.value
}


// Watchers para resetear página cuando cambian filtros
watch([quickFilter, currentPageSize], () => {
  currentPage.value = 1
})
</script>

<style scoped lang="postcss">
/* Modo compacto */
.compact-mode .table td,
.compact-mode .table th {
  @apply py-1 px-2 text-xs;
}
</style>