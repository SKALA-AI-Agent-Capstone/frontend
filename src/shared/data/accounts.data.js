/*
 * 데모 계정, 테넌트 (NFR-9) — ⚠ 실제 서비스에서는 로그인 API 가 사용자, 역할, 테넌트를 내려준다.
 * 테넌트(기업) 단위로 검토 데이터와 크레딧이 격리된다.
 */
import { ROLES } from '@/shared/constants/roles'

export const TENANTS = [
  { id: 'T-KCL', name: '(주)한국코스메틱랩', type: '브랜드' },
  { id: 'T-BRIGHT', name: '브라이트애드', type: '광고 대행사' },
]

export const DEMO_ACCOUNTS = [
  { id: 'U-1', name: '김작성', email: 'writer@kcl.example', role: ROLES.WRITER, tenantId: 'T-KCL' },
  { id: 'U-2', name: '이검토', email: 'reviewer@kcl.example', role: ROLES.REVIEWER, tenantId: 'T-KCL' },
  { id: 'U-3', name: '박관리', email: 'admin@kcl.example', role: ROLES.ADMIN, tenantId: 'T-KCL' },
  { id: 'U-4', name: '최대행', email: 'writer@bright.example', role: ROLES.WRITER, tenantId: 'T-BRIGHT' },
]

export const INITIAL_CREDITS = { 'T-KCL': 120, 'T-BRIGHT': 30 }
