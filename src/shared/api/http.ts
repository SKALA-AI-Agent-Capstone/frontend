export const TOKEN_KEY = 'beauty-review:access-token'

export async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(`/api/v1${path}`, { ...init, headers, cache: 'no-store' })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    if (response.status === 401) sessionStorage.removeItem(TOKEN_KEY)
    throw new Error(error.message || error.detail || `요청 실패 (${response.status})`)
  }
  return response.json() as Promise<T>
}
