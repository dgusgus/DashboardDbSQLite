// src/router/index.js
// Guard de navegación: si no hay sesión → redirige a /login
// Si ya está autenticado e intenta ir a /login → redirige a /operadores

import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // ── Pública ───────────────────────────────────────────────────
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: { public: true, title: 'Acceso' }
    },

    // ── Protegidas ────────────────────────────────────────────────
    { path: '/', redirect: '/operadores' },
    {
      path: '/operadores',
      component: () => import('@/views/Operadores.vue'),
      meta: { title: 'Operadores Electorales' }
    },
    {
      path: '/notarios',
      component: () => import('@/views/Notarios.vue'),
      meta: { title: 'Notarios' }
    },
    {
      path: '/recintos',
      component: () => import('@/views/Recintos.vue'),
      meta: { title: 'Recintos' }
    },
    {
      path: '/actas',
      component: () => import('@/views/Actas.vue'),
      meta: { title: 'Actas' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/operadores' },
  ]
})

router.beforeEach((to) => {
  document.title = `${to.meta.title ?? 'Consultas'} · Electoral`

  const { isAuthenticated, checkSession } = useAuth()

  // Ruta pública: siempre pasar
  if (to.meta.public) {
    // Si ya está autenticado no tiene sentido ir al login
    if (isAuthenticated.value) return '/operadores'
    return true
  }

  // Ruta protegida: verificar sesión
  if (!isAuthenticated.value || !checkSession()) {
    return '/login'
  }

  return true
})

export default router