// 목업 API 지연 — 실제 네트워크 응답 시간을 흉내낸다.
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** 목업 API 에서 던지는 연동 오류 (NFR-10, 16: '데이터 없음'과 구분) */
export class ApiError extends Error {
  constructor(message, { retryable = true } = {}) {
    super(message)
    this.name = 'ApiError'
    this.retryable = retryable
  }
}
