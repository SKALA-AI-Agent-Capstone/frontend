import { textMap } from '@/shared/i18n'
// 역할, 권한 (NFR-9) — 화면에서는 역할명 대신 PERMISSIONS 로 판단한다.
export const ROLES = Object.freeze({
  WRITER: 'writer',
  REVIEWER: 'reviewer',
  ADMIN: 'admin',
})

export const ROLE_LABEL = textMap({
  [ROLES.WRITER]: 'common.roles.writer',
  [ROLES.REVIEWER]: 'common.roles.reviewer',
  [ROLES.ADMIN]: 'common.roles.admin',
})

export const PERMISSIONS = Object.freeze({
  REVIEW_CREATE: 'review:create',
  REVIEW_DELETE_ANY: 'review:delete_any', // 테넌트 전체 이력 삭제
  STANDARDS_MANAGE: 'standards:manage',
  CREDITS_CHARGE: 'credits:charge',
})

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.WRITER]: [PERMISSIONS.REVIEW_CREATE, PERMISSIONS.CREDITS_CHARGE],
  // 검토자는 남의 검토에서도 위반 문구를 결정할 수 있다(서버가 검사). 검토 전체 승인은 2026-10-22에 없앴다.
  [ROLES.REVIEWER]: [PERMISSIONS.REVIEW_CREATE, PERMISSIONS.CREDITS_CHARGE],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
})
