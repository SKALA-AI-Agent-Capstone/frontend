// 역할, 권한 (NFR-9) — 화면에서는 역할명 대신 PERMISSIONS 로 판단한다.
export const ROLES = Object.freeze({
  WRITER: 'writer',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
})

export const ROLE_LABEL = Object.freeze({
  [ROLES.WRITER]: '작성자',
  [ROLES.REVIEWER]: '검토자',
  [ROLES.ADMIN]: '관리자',
})

export const PERMISSIONS = Object.freeze({
  REVIEW_CREATE: 'review:create',
  REVIEW_APPROVE: 'review:approve', // HITL 승인은 검토자, 관리자만
  REVIEW_DELETE_ANY: 'review:delete_any', // 테넌트 전체 이력 삭제
  STANDARDS_MANAGE: 'standards:manage',
  CREDITS_CHARGE: 'credits:charge',
})

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.WRITER]: [PERMISSIONS.REVIEW_CREATE, PERMISSIONS.CREDITS_CHARGE],
  [ROLES.REVIEWER]: [PERMISSIONS.REVIEW_CREATE, PERMISSIONS.REVIEW_APPROVE, PERMISSIONS.CREDITS_CHARGE],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
})
