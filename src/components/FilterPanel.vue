<!-- src/components/FilterPanel.vue - Panel de filtros -->
<template>
  <div class="card bg-base-100 shadow-md">
    <div class="card-body">
      <h3 class="card-title text-lg">🔍 Filtros</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Filtro por tipo -->
        <div class="form-control" v-if="showTypeFilter">
          <label class="label">
            <span class="label-text">Tipo de Operador</span>
          </label>
          <select v-model="filters.tipo" class="select select-bordered">
            <option value="">Todos</option>
            <option value="rural">Rural</option>
            <option value="urbano">Urbano</option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div class="form-control" v-if="showStatusFilter">
          <label class="label">
            <span class="label-text">Estado</span>
          </label>
          <select v-model="filters.estado" class="select select-bordered">
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <!-- Filtro por departamento -->
        <div class="form-control" v-if="showLocationFilter">
          <label class="label">
            <span class="label-text">Departamento</span>
          </label>
          <select v-model="filters.departamento" class="select select-bordered">
            <option value="">Todos</option>
            <option v-for="dept in departamentos" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
      </div>

      <!-- Acciones -->
      <div class="card-actions justify-end mt-4">
        <button @click="clearFilters" class="btn btn-outline btn-sm">
          Limpiar Filtros
        </button>
        <button @click="applyFilters" class="btn btn-primary btn-sm">
          Aplicar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  showTypeFilter: {
    type: Boolean,
    default: false
  },
  showStatusFilter: {
    type: Boolean,
    default: false
  },
  showLocationFilter: {
    type: Boolean,
    default: false
  },
  departamentos: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['filter'])

const filters = reactive({
  tipo: '',
  estado: '',
  departamento: ''
})

const clearFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  applyFilters()
}

const applyFilters = () => {
  emit('filter', { ...filters })
}

// Auto-aplicar filtros cuando cambien
watch(filters, () => {
  applyFilters()
})
</script>