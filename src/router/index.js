// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Operadores from '@/views/Operadores.vue'
import Notarios   from '@/views/Notarios.vue'
import Recintos   from '@/views/Recintos.vue'
import Actas      from '@/views/Actas.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',           redirect: '/operadores' },
    { path: '/operadores', component: Operadores, meta: { title: 'Operadores Electorales' } },
    { path: '/notarios',   component: Notarios,   meta: { title: 'Notarios' } },
    { path: '/recintos',   component: Recintos,   meta: { title: 'Recintos' } },
    { path: '/actas',      component: Actas,       meta: { title: 'Actas' } },
    { path: '/:pathMatch(.*)*', redirect: '/operadores' },
  ]
})

router.beforeEach((to) => {
  document.title = `${to.meta.title ?? 'Consultas'} · Electoral`
})

export default router