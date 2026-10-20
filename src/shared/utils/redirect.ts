/** 로그인 뒤 돌아갈 경로. 같은 사이트의 절대 경로만 허용하고 나머지는 첫 화면으로 보낸다. */
export function safeRedirect(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}
