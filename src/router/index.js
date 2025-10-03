// src/router/index.js - ACTUALIZADO para nueva estructura
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Operadores from '@/views/Operadores.vue'
import Notarios from '@/views/Notarios.vue'
import Recintos from '@/views/Recintos.vue'
import Mesas from '@/views/Mesas.vue'
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
      path: '/notarios',
      name: 'notarios',
      component: Notarios,
      meta: { 
        title: 'Notarios',
        icon: '📝'
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
      path: '/mesas',
      name: 'mesas',
      component: Mesas,
      meta: { 
        title: 'Mesas',
        icon: '🗳️'
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

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Sistema'} - Consultas de Operadores`
  next()
})

export default router