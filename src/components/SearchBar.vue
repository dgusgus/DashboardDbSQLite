<!-- src/components/SearchBar.vue - Barra de búsqueda -->
<template>
  <div class="form-control w-full max-w-md">
    <div class="input-group">
      <input 
        v-model="searchTerm"
        @input="onSearch"
        :placeholder="placeholder"
        class="input input-bordered w-full"
      />
      <button 
        @click="clearSearch"
        v-if="searchTerm"
        class="btn btn-square btn-outline"
      >
        ✕
      </button>
      <button class="btn btn-square btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchTerm = ref(props.modelValue)

watch(searchTerm, (newValue) => {
  emit('update:modelValue', newValue)
})

const onSearch = () => {
  emit('search', searchTerm.value)
}

const clearSearch = () => {
  searchTerm.value = ''
  emit('search', '')
}
</script>