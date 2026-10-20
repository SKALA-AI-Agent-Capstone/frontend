import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ROLE_PERMISSIONS } from '@/shared/constants/roles'
import { request, TOKEN_KEY } from '@/shared/api/http'

export const useSessionStore = defineStore('session', () => {
  const user = ref(null)
  const tenant = ref(null)
  const isAuthenticated = computed(() => Boolean(user.value))
  let restored = false
  function accept(data) {
    if (data.accessToken) sessionStorage.setItem(TOKEN_KEY, data.accessToken)
    user.value = { ...data.user, role: data.user.role === 'author' ? 'writer' : data.user.role }
    tenant.value = data.tenant
  }
  async function restore() {
    if (restored) return
    restored = true
    if (!sessionStorage.getItem(TOKEN_KEY)) return
    try { accept(await request('/users/me')) }
    catch { sessionStorage.removeItem(TOKEN_KEY); user.value = null; tenant.value = null }
  }
  function can(permission) { return Boolean(user.value) && Boolean(ROLE_PERMISSIONS[user.value.role]?.includes(permission)) }
  async function login(email, password) { accept(await request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) })) }
  async function signup(input) { accept(await request('/users/signup', { method: 'POST', body: JSON.stringify(input) })) }
  async function logout() {
    try { await request('/users/logout', { method: 'DELETE' }) } finally {
      sessionStorage.removeItem(TOKEN_KEY); user.value = null; tenant.value = null
      window.location.assign('/login')
    }
  }
  return { user, tenant, isAuthenticated, can, login, signup, logout, restore }
})
