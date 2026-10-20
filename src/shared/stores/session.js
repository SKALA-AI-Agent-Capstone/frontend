import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ROLE_PERMISSIONS } from '@/shared/constants/roles'
import { onSessionExpired, refreshSession, request, TOKEN_KEY } from '@/shared/api/http'

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
  function clear() { sessionStorage.removeItem(TOKEN_KEY); user.value = null; tenant.value = null }
  // 재발급까지 실패하면 로그인 화면으로 보낸다.
  onSessionExpired(() => {
    const wasAuthenticated = Boolean(user.value)
    clear()
    if (wasAuthenticated && window.location.pathname !== '/login') {
      window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  })
  async function restore() {
    if (restored) return
    restored = true
    // 새 탭과 새로고침에는 sessionStorage 토큰이 없을 수 있으므로 Refresh 쿠키로 먼저 이어 간다.
    try {
      const session = await refreshSession()
      if (session) accept(session)
      else clear()
    } catch {
      // 서버 오류로 재발급을 확인하지 못하면 남은 Access Token으로 시도한다.
      if (!sessionStorage.getItem(TOKEN_KEY)) return
      try { accept(await request('/users/me')) }
      catch { clear() }
    }
  }
  function can(permission) { return Boolean(user.value) && Boolean(ROLE_PERMISSIONS[user.value.role]?.includes(permission)) }
  async function login(email, password) { accept(await request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) })) }
  async function signup(input) { accept(await request('/users/signup', { method: 'POST', body: JSON.stringify(input) })) }
  async function logout() {
    // Access Token이 만료돼도 서버가 Refresh 쿠키 기준으로 세션을 폐기한다. 실패해도 로컬 상태는 지운다.
    try { await request('/users/logout', { method: 'DELETE' }) } catch { /* 로컬 정리는 계속한다 */ }
    clear()
    window.location.assign('/login')
  }
  return { user, tenant, isAuthenticated, can, login, signup, logout, restore }
})
