export const TOKEN_KEY = 'beauty-review:access-token'
import { t } from '@/shared/i18n'

// 인증 자체를 다루는 경로는 401을 받아도 재발급하지 않는다.
const AUTH_PATHS = new Set(['/users/signup', '/users/login', '/users/refresh', '/users/logout'])
// 다른 탭이 회전시킨 새 쿠키가 저장될 시간을 잠시 기다린 뒤 한 번만 재시도한다.
const ROTATED_RETRY_DELAY_MS = 300

export interface AuthSession {
  user: Record<string, unknown>
  tenant: Record<string, unknown>
  accessToken: string
  expiresIn: number
}

let refreshing: Promise<AuthSession | null> | null = null
let sessionExpired: (() => void) | null = null

/** refresh 실패로 로그인 상태를 잃었을 때 호출할 함수를 등록한다. */
export function onSessionExpired(handler: () => void) {
  sessionExpired = handler
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

async function errorOf(response: Response) {
  const error = await response.json().catch(() => ({}))
  return new Error(error.message || error.detail || t('ui.requestFailed', { status: response.status }))
}

async function refreshOnce(retried = false): Promise<AuthSession | null> {
  const response = await fetch('/api/v1/users/refresh', { method: 'POST', credentials: 'same-origin', cache: 'no-store' })
  if (response.ok) {
    const session = await response.json() as AuthSession
    sessionStorage.setItem(TOKEN_KEY, session.accessToken)
    return session
  }
  const error = await errorOf(response)
  if (response.status !== 401) throw error
  if (error.message === 'REFRESH_TOKEN_ROTATED' && !retried) {
    await new Promise(resolve => setTimeout(resolve, ROTATED_RETRY_DELAY_MS))
    return refreshOnce(true)
  }
  clearToken()
  return null
}

/** Refresh 쿠키로 Access Token을 재발급한다. 동시에 호출해도 요청은 한 번만 보낸다. 로그인 상태가 아니면 null. */
export function refreshSession(): Promise<AuthSession | null> {
  refreshing ??= refreshOnce().finally(() => { refreshing = null })
  return refreshing
}

function send(path: string, init: RequestInit, token: string | null) {
  // FormData와 문자열 body는 다시 읽을 수 있으므로 재시도 때 같은 init을 그대로 보낸다.
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  // JSON API는 항상 새로 받는다. 원본과 썸네일처럼 서버가 캐시를 허용한 응답만 호출하는 쪽에서 cache를 바꾼다.
  return fetch(`/api/v1${path}`, { ...init, headers, cache: init.cache ?? 'no-store' })
}

/** 인증과 401 재발급을 거친 원본 응답. 스트림(SSE)처럼 본문을 직접 읽을 때 쓴다. */
export async function requestRaw(path: string, init: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem(TOKEN_KEY)
  let response = await send(path, init, token)
  if (response.status === 401 && !AUTH_PATHS.has(path.split('?')[0])) {
    // 다른 요청이 이미 재발급했다면 새 토큰으로 바로 재시도한다.
    const current = sessionStorage.getItem(TOKEN_KEY)
    const next = current && current !== token ? current : (await refreshSession())?.accessToken
    if (!next) {
      sessionExpired?.()
      throw await errorOf(response)
    }
    response = await send(path, init, next)
    if (response.status === 401) {
      clearToken()
      sessionExpired?.()
    }
  }
  if (!response.ok) throw await errorOf(response)
  return response
}

export async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  return (await requestRaw(path, init)).json() as Promise<T>
}

/** 원본 이미지/PDF처럼 JSON이 아닌 응답을 받는다. img src는 Authorization 헤더를 못 보내므로
 * fetch로 받아 blob URL을 만들어 쓴다 — 쓰고 나면 반드시 URL.revokeObjectURL로 해제해야 한다.
 * 원본과 썸네일은 asset id마다 내용이 바뀌지 않아 서버가 private 캐시를 허용하므로 브라우저 캐시를 쓴다. */
export async function requestBlob(path: string): Promise<Blob> {
  return (await requestRaw(path, { cache: 'default' })).blob()
}
