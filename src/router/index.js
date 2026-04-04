// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login',      component: () => import('@/views/Login.vue'),      meta: { public: true, title: 'Acceso' } },
    { path: '/',           redirect: '/operadores' },
    { path: '/operadores', component: () => import('@/views/Operadores.vue'), meta: { title: 'Operadores Electorales' } },
    { path: '/notarios',   component: () => import('@/views/Notarios.vue'),   meta: { title: 'Notarios' } },
    { path: '/recintos',   component: () => import('@/views/Recintos.vue'),   meta: { title: 'Recintos' } },
    { path: '/actas',      component: () => import('@/views/Actas.vue'),      meta: { title: 'Actas' } },
    { path: '/:pathMatch(.*)*', redirect: '/operadores' },
  ]
})

router.beforeEach((to) => {
  document.title = `${to.meta.title ?? 'Consultas'} · Electoral`
  const { isAuthenticated, checkSession } = useAuth()
  if (to.meta.public) {
    return isAuthenticated.value ? '/operadores' : true
  }
  if (!isAuthenticated.value || !checkSession()) return '/login'
  return true
})

export default router