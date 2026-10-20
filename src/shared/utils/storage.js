/*
 * 브라우저 저장소 래퍼 — ⚠ 데모에서 '서버 보존'(NFR-3, 5)을 흉내내기 위한 용도.
 * 실제 서비스에서는 검토 결과를 서버 DB 에 보존하고 이 모듈은 사용하지 않는다.
 */
const PREFIX = 'cosmetic-ad-review:'

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* 저장 불가 환경(시크릿 모드 등)은 메모리 상태만 유지 */
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* noop */
  }
}
