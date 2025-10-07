// src/router/index.js - ACTUALIZADO: Actas reemplaza a Mesas
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Operadores from '@/views/Operadores.vue'
import Notarios from '@/views/Notarios.vue'
import Recintos from '@/views/Recintos.vue'
import Actas from '@/views/Actas.vue'
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
        icon: '🏠',
        description: 'Vista general del sistema'
      }
    },
    {
      path: '/operadores',
      name: 'operadores',
      component: Operadores,
      meta: { 
        title: 'Operadores',
        icon: '👷',
        description: 'Gestión de operadores electorales'
      }
    },
    {
      path: '/notarios',
      name: 'notarios',
      component: Notarios,
      meta: { 
        title: 'Notarios',
        icon: '📝',
        description: 'Gestión de notarios electorales'
      }
    },
    {
      path: '/recintos',
      name: 'recintos',
      component: Recintos,
      meta: { 
        title: 'Recintos',
        icon: '🏫',
        description: 'Ubicaciones y recintos electorales'
      }
    },
    {
      path: '/actas',
      name: 'actas',
      component: Actas,
      meta: { 
        title: 'Actas',
        icon: '📋',
        description: 'Registro y control de actas'
      }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: Reportes,
      meta: { 
        title: 'Reportes',
        icon: '📊',
        description: 'Análisis y reportes del sistema'
      }
    },
    // Redirecciones de URLs antiguas
    {
      path: '/mesas',
      redirect: '/actas'
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/'
    }
  ]
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  // Actualizar título del documento
  document.title = `${to.meta.title || 'Sistema'} - Consultas de Operadores`
  
  // Log de navegación en desarrollo
  if (import.meta.env.DEV) {
    console.log(`🧭 Navegando: ${from.path} → ${to.path}`)
  }
  
  next()
})

export default router