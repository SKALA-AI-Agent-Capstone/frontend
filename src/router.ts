import { createRouter, createWebHistory } from 'vue-router'
import EnvironmentView from './views/EnvironmentView.vue'
import WorkspacesView from './views/WorkspacesView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: EnvironmentView },
    { path: '/workspaces', component: WorkspacesView },
  ],
})
