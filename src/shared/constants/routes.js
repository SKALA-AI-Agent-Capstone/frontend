// 전역 라우트 이름 — 경로 문자열을 컴포넌트에 직접 쓰지 않고 이 상수로 참조한다.
export const ROUTE_NAMES = Object.freeze({
  LANDING: 'landing',
  LOGIN: 'login',
  SIGNUP: 'signup',
  DASHBOARD: 'dashboard',
  REVIEW_NEW: 'review-new',
  REVIEW_DETAIL: 'review-detail',
  REVIEW_REPORT: 'review-report',
  BATCH: 'batch',
  HISTORY: 'history',
  APPROVALS: 'approvals',
  CREDITS: 'credits',
  STANDARDS: 'standards',
  PRIVACY_POLICY: 'privacy-policy',
  TERMS: 'terms',
})

// GNB 활성 메뉴 판별용 키 (route.meta.navKey)
export const NAV_KEYS = Object.freeze({
  DASHBOARD: 'dashboard',
  REVIEW_NEW: 'review-new',
  BATCH: 'batch',
  HISTORY: 'history',
  APPROVALS: 'approvals',
  STANDARDS: 'standards',
})
