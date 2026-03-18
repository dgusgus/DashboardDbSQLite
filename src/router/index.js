// src/router/index.js
// ✅ MEJORA: lazy loading — cada vista carga solo cuando se navega a ella
// Reduce el bundle inicial y acelera el primer render
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
})

export default router