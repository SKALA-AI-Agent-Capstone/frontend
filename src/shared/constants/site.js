import { NAV_KEYS, ROUTE_NAMES } from './routes'
import { PERMISSIONS } from './roles'

/*
 * 전역 사이트 정보 — 헤더,푸터,페이지 어디서든 이 상수만 참조한다.
 * ※ 기관(식약처) 정체성 관련 값은 모두 이 파일에 모여 있다.
 *   운영 주체가 바뀌면 SITE , FOOTER 의 기관 항목과 GovMasthead/OperatorIdentifier 노출 여부만 바꾸면 된다.
 */
export const SITE = Object.freeze({
  orgCode: 'BEAUTY',
  govLabel: '기업 작업공간',
  orgName: 'Beauty Review',
  orgNameEn: 'Beauty Review Workspace',
  serviceName: '화장품 광고 사전검토',
  serviceNameEn: 'Cosmetic Ad Compliance Review',
  // 공식 배너 문구 — KRDS: 텍스트와 스타일을 변형하지 않는다
  mastheadText: '기업 내부 광고 사전검토 개발환경입니다.',
  mastheadToggle: '공식 누리집 확인방법',
  adminLinkText: '법령 조문 후보 검색',
  helpdeskPhone: '1577-1255',
  supportEmail: 'cosmetic@korea.kr',
  demoNotice: '로컬 개발환경: 법령 검색은 적재된 자료(화장품법 조문)만 대상으로 하며 결제는 테스트 모드입니다.',
})

// 메인 메뉴 — permission 이 있으면 해당 권한 보유자에게만 표시
export const GNB_MENUS = Object.freeze([
  { key: NAV_KEYS.REVIEW_NEW, label: '광고 자율심의 신청', to: { name: ROUTE_NAMES.REVIEW_NEW } },
  { key: NAV_KEYS.HISTORY, label: '심의 이력', to: { name: ROUTE_NAMES.HISTORY } },
  {
    key: NAV_KEYS.APPROVALS,
    label: '승인 대기',
    to: { name: ROUTE_NAMES.APPROVALS },
    permission: PERMISSIONS.REVIEW_APPROVE,
  },
  { key: NAV_KEYS.STANDARDS, label: '법령,고시 자료실', to: { name: ROUTE_NAMES.STANDARDS } },
])

export const UTILITY_LINKS = Object.freeze([
  { label: '누리집 안내', href: '#' },
  { label: '원격지원', href: '#' },
])

// 언어 선택 — KRDS: 국기 대신 해당 언어로 언어 이름을 표기
export const LANGUAGES = Object.freeze([
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
])

// 푸터 — 서비스 로고 → 연락처 → 유틸리티 링크 → 정책 링크 → 저작권 → 운영기관 식별자 순
export const FOOTER = Object.freeze({
 contacts: [{term:'운영',desc:'캡스톤 기업 내부 사전검토 개발환경'}],
 utilityLinks: [], policyLinks: [],
 retentionNotice:'검토 결과와 승인 이력, 업로드 원본은 서버에 보존됩니다. 사진 분석 결과는 실제 효능 판정이 아닙니다.',
 copyright:'Beauty Review Capstone', kogl:'', identifier:'정부 또는 협회가 운영하는 공식 서비스가 아닙니다.',
})
