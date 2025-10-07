<!-- src/App.vue - ACTUALIZADO: Actas en vez de Mesas -->
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
      <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div class="navbar-start">
          <!-- Mobile Menu -->
          <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><router-link to="/" class="gap-2">🏠 Dashboard</router-link></li>
              <li><router-link to="/operadores" class="gap-2">👷 Operadores</router-link></li>
              <li><router-link to="/notarios" class="gap-2">📝 Notarios</router-link></li>
              <li><router-link to="/recintos" class="gap-2">🏫 Recintos</router-link></li>
              <li><router-link to="/actas" class="gap-2">📋 Actas</router-link></li>
              <li><router-link to="/reportes" class="gap-2">📊 Reportes</router-link></li>
            </ul>
          </div>
          
          <!-- Logo/Title -->
          <router-link to="/" class="btn btn-ghost text-xl normal-case gap-2">
            <span>📋</span>
            <span class="hidden md:inline">Visor</span>
            <span class="md:hidden">Consultas</span>
          </router-link>
        </div>
        
        <!-- Desktop Menu -->
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1 gap-1">
            <li>
              <router-link 
                to="/" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/' }"
              >
                <span>🏠</span>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/operadores" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/operadores' }"
              >
                <span>👷</span>
                <span>Operadores</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/notarios" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/notarios' }"
              >
                <span>📝</span>
                <span>Notarios</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/recintos" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/recintos' }"
              >
                <span>🏫</span>
                <span>Recintos</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/actas" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/actas' }"
              >
                <span>📋</span>
                <span>Actas</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/reportes" 
                class="gap-2"
                :class="{ 'btn-active': $route.path === '/reportes' }"
              >
                <span>📊</span>
                <span>Reportes</span>
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- Navbar End -->
        <div class="navbar-end gap-2">
          <!-- Stats Badge -->
          <div class="hidden sm:flex items-center gap-2 text-xs opacity-70">
            <span class="badge badge-ghost badge-sm">
              {{ totalRecords }} registros
            </span>
          </div>
          
          <!-- Theme Toggle (opcional) -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <div class="indicator">
                <span class="indicator-item badge badge-xs badge-primary"></span>
                <span>🔔</span>
              </div>
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-3">
              <li class="menu-title">
                <span>Notificaciones</span>
              </li>
              <li><a class="text-xs opacity-70">No hay notificaciones nuevas</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Breadcrumbs (opcional pero útil) -->
      <div class="container mx-auto px-4 py-2">
        <div class="text-sm breadcrumbs">
          <ul>
            <li><a @click="$router.push('/')">🏠 Inicio</a></li>
            <li v-if="$route.meta.title">
              <span class="font-semibold">
                {{ $route.meta.icon }} {{ $route.meta.title }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Router View with Transition -->
      <main class="container mx-auto px-4 pb-8">
        <transition name="fade" mode="out-in">
          <router-view :key="$route.path" />
        </transition>
      </main>

      <!-- Footer -->
      <footer class="footer footer-center p-4 bg-base-100 text-base-content mt-8">
        <aside>
          <p class="text-sm">
            Sistema de Consultas v2.0 - 
            <span class="opacity-60">
              {{ new Date().getFullYear() }} · 
              Última actualización: {{ lastUpdate }}
            </span>
          </p>
        </aside>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDatabase } from '@/composables/useDatabase.js'

const { isLoading, error, ready, initialize, totalRecords, lastUpdate } = useDatabase()

onMounted(async () => {
  await initialize()
})
</script>

<style scoped>
/* Transiciones de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sticky navbar con blur */
.navbar {
  backdrop-filter: blur(10px);
  background-color: rgb(25, 30, 36);
}

/* Active link styling */
.menu .btn-active {
  background-color: hsl(var(--p) / 0.1);
  color: hsl(var(--p));
  font-weight: 600;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Breadcrumbs hover */
.breadcrumbs a:hover {
  text-decoration: underline;
  color: hsl(var(--p));
}
</style>