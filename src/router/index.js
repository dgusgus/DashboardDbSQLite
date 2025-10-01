// src/router/index.js - Configuración de rutas
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Operadores from '@/views/Operadores.vue'
import Vehiculos from '@/views/Vehiculos.vue'
import Recintos from '@/views/Recintos.vue'
import Reportes from '@/views/Reportes.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { 
        title: 'Dashboard',
        icon: '🏠'
      }
    },
    {
      path: '/operadores',
      name: 'operadores',
      component: Operadores,
      meta: { 
        title: 'Operadores',
        icon: '👷'
      }
    },
    {
      path: '/vehiculos',
      name: 'vehiculos',
      component: Vehiculos,
      meta: { 
        title: 'Vehículos',
        icon: '🚗'
      }
    },
    {
      path: '/recintos',
      name: 'recintos',
      component: Recintos,
      meta: { 
        title: 'Recintos',
        icon: '🏫'
      }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: Reportes,
      meta: { 
        title: 'Reportes',
        icon: '📊'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/'
    }
  ]
})

// Guard para actualizar título de la página
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Sistema'} - Consultas de Operadores`
  next()
})

export default router