import { t, translated } from '@/shared/i18n'
import { NAV_KEYS, ROUTE_NAMES } from './routes'
import { PERMISSIONS } from './roles'

/*
 * 전역 사이트 정보 — 헤더,푸터,페이지 어디서든 이 상수만 참조한다.
 * ※ 기관(식약처) 정체성 관련 값은 모두 이 파일에 모여 있다.
 *   운영 주체가 바뀌면 SITE, FOOTER 의 기관 항목과 GovMasthead 노출 여부만 바꾸면 된다.
 */
export const SITE = translated({
  orgCode: 'BEAUTY',
  orgName: 'Beauty Review',
  orgNameEn: 'Beauty Review Workspace',
  serviceNameEn: 'Cosmetic Ad Compliance Review',
  helpdeskPhone: '1577-1255',
  supportEmail: 'cosmetic@korea.kr',
}, {
  govLabel: 'common.site.govLabel',
  serviceName: 'common.site.serviceName',
  // 공식 배너 문구 — KRDS: 텍스트와 스타일을 변형하지 않는다
  mastheadText: 'common.site.mastheadText',
  mastheadToggle: 'common.site.mastheadToggle',
  adminLinkText: 'common.site.adminLinkText',
  demoNotice: 'common.site.demoNotice',
})

// 메인 메뉴 — permission 이 있으면 해당 권한 보유자에게만 표시
export const GNB_MENUS = Object.freeze([
  translated({ key: NAV_KEYS.REVIEW_NEW, to: { name: ROUTE_NAMES.REVIEW_NEW } }, { label: 'common.nav.reviewNew' }),
  translated({ key: NAV_KEYS.HISTORY, to: { name: ROUTE_NAMES.HISTORY } }, { label: 'common.nav.history' }),
  translated({ key: NAV_KEYS.APPROVALS, to: { name: ROUTE_NAMES.APPROVALS }, permission: PERMISSIONS.REVIEW_APPROVE }, { label: 'common.nav.approvals' }),
  translated({ key: NAV_KEYS.STANDARDS, to: { name: ROUTE_NAMES.STANDARDS } }, { label: 'common.nav.standards' }),
])

export const UTILITY_LINKS = Object.freeze([
  translated({ href: '#' }, { label: 'common.utility.siteGuide' }),
  translated({ href: '#' }, { label: 'common.utility.remoteSupport' }),
])

// 언어 선택 — KRDS: 국기 대신 해당 언어로 언어 이름을 표기
export const LANGUAGES = Object.freeze([
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
])

// 푸터 — 서비스 이름과 운영 정보 → 안내 문장(한 줄에 한 문장) → 저작권과 비공식 서비스 안내
const FOOTER_NOTICE_KEYS = ['common.footer.storageNotice', 'common.footer.photoNotice', 'common.site.demoNotice']
export const FOOTER_LINKS = Object.freeze([
  translated({ kind: 'privacy' }, { label: 'ui.titles.privacyPolicy' }),
  translated({ kind: 'terms' }, { label: 'ui.titles.terms' }),
])
export const FOOTER = translated({
  contacts: [translated({}, { term: 'common.footer.contactTerm', desc: 'common.footer.contactDesc' })],
  copyright: 'Beauty Review Capstone',
  // 읽을 때마다 현재 언어로 번역한다
  get notices() { return FOOTER_NOTICE_KEYS.map((key) => t(key)) },
}, {
  retentionNotice: 'common.footer.retentionNotice',
  identifier: 'common.footer.identifier',
})
