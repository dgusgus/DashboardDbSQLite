<!-- src/components/StatsCards.vue - Tarjetas de estadísticas -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div 
      v-for="stat in stats" 
      :key="stat.title"
      class="stat bg-base-100 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div class="stat-figure text-2xl">
        {{ stat.icon }}
      </div>
      <div class="stat-title text-sm opacity-70">{{ stat.title }}</div>
      <div class="stat-value text-2xl font-bold text-primary">
        {{ formatNumber(stat.value) }}
      </div>
      <div v-if="stat.desc" class="stat-desc text-xs">
        {{ stat.desc }}
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Array,
    default: () => []
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num)
}
</script>