<!-- 🎯 MEJORA 4: Componente de búsqueda mejorada -->
<!-- src/components/SearchBarEnhanced.vue -->
<template>
  <div class="form-control w-full relative">
    <div class="input-group">
      <input 
        v-model="searchTerm"
        @input="onInput"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
        :placeholder="placeholder"
        class="input input-bordered w-full"
        autocomplete="off"
      />
      <button 
        @click="clearSearch"
        v-if="searchTerm"
        class="btn btn-square btn-outline"
      >
        ✕
      </button>
      <button class="btn btn-square btn-primary" @click="performSearch">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>

    <!-- Dropdown de sugerencias -->
    <div 
      v-if="showSuggestions && (filteredSuggestions.length > 0 || recentSearches.length > 0)"
      class="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <!-- Búsquedas recientes -->
      <div v-if="recentSearches.length > 0 && !searchTerm" class="p-2">
        <div class="text-xs font-semibold opacity-60 mb-2">Búsquedas recientes:</div>
        <div 
          v-for="recent in recentSearches" 
          :key="recent"
          @mousedown="selectSuggestion(recent)"
          class="px-3 py-2 hover:bg-base-200 cursor-pointer rounded text-sm flex items-center gap-2"
        >
          <span class="opacity-60">🕒</span>
          {{ recent }}
        </div>
      </div>

      <!-- Sugerencias filtradas -->
      <div v-if="filteredSuggestions.length > 0" class="p-2">
        <div class="text-xs font-semibold opacity-60 mb-2">Sugerencias:</div>
        <div 
          v-for="suggestion in filteredSuggestions" 
          :key="suggestion"
          @mousedown="selectSuggestion(suggestion)"
          class="px-3 py-2 hover:bg-base-200 cursor-pointer rounded text-sm flex items-center gap-2"
        >
          <span class="opacity-60">💡</span>
          {{ suggestion }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  modelValue: {
    type: String,
    default: ''
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  recentSearches: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchTerm = ref(props.modelValue)
const showSuggestions = ref(false)

const filteredSuggestions = computed(() => {
  if (!searchTerm.value) return props.suggestions.slice(0, 5)
  
  return props.suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(searchTerm.value.toLowerCase())
  ).slice(0, 5)
})

watch(searchTerm, (newValue) => {
  emit('update:modelValue', newValue)
})

const onInput = () => {
  showSuggestions.value = true
  emit('search', searchTerm.value)
}

const performSearch = () => {
  emit('search', searchTerm.value)
  showSuggestions.value = false
}

const clearSearch = () => {
  searchTerm.value = ''
  emit('search', '')
  showSuggestions.value = false
}

const selectSuggestion = (suggestion) => {
  searchTerm.value = suggestion
  emit('search', suggestion)
  showSuggestions.value = false
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>