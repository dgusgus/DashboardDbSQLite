<!-- src/App.vue - Componente principal -->
<template>
  <div id="app" class="min-h-screen bg-base-200">
    <!-- Loading Screen -->
    <div v-if="!ready" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div v-if="isLoading" class="flex flex-col items-center gap-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <h2 class="text-xl font-semibold">Cargando base de datos...</h2>
          <p class="text-sm opacity-70">Esto puede tomar unos segundos</p>
        </div>
        
        <div v-else-if="error" class="alert alert-error max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-bold">Error cargando datos</h3>
            <div class="text-xs">{{ error }}</div>
            <button @click="initialize" class="btn btn-sm btn-outline mt-2">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main App -->
    <div v-else>
      <!-- Navigation -->
      <div class="navbar bg-base-100 shadow-lg">
        <div class="navbar-start">
          <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><router-link to="/">🏠 Dashboard</router-link></li>
              <li><router-link to="/operadores">👷 Operadores</router-link></li>
              <li><router-link to="/vehiculos">🚗 Vehículos</router-link></li>
              <li><router-link to="/recintos">🏫 Recintos</router-link></li>
              <li><router-link to="/reportes">📊 Reportes</router-link></li>
            </ul>
          </div>
          <router-link to="/" class="btn btn-ghost text-xl">
            📋 Sistema de Consultas
          </router-link>
        </div>
        
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li><router-link to="/" class="btn btn-ghost">🏠 Dashboard</router-link></li>
            <li><router-link to="/operadores" class="btn btn-ghost">👷 Operadores</router-link></li>
            <li><router-link to="/vehiculos" class="btn btn-ghost">🚗 Vehículos</router-link></li>
            <li><router-link to="/recintos" class="btn btn-ghost">🏫 Recintos</router-link></li>
            <li><router-link to="/reportes" class="btn btn-ghost">📊 Reportes</router-link></li>
          </ul>
        </div>
        
        <div class="navbar-end">
          <div class="btn btn-ghost btn-circle">
            <div class="indicator">
              <span class="indicator-item badge badge-xs badge-primary"></span>
              🔔
            </div>
          </div>
        </div>
      </div>

      <!-- Router View -->
      <main class="container mx-auto px-4 py-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'

const { isLoading, error, ready, initialize } = useDatabase()

onMounted(async () => {
  await initialize()
})
</script>