// 검토 도메인 전역 상수 — 상태, 심각도, 증빙 유형, 주장 유형 등 모든 화면이 공유한다.
import { STATUS } from './status'

// 검토 버전 처리 상태
export const REVIEW_STATUS = Object.freeze({
  QUEUED: 'queued',
  ANALYZING: 'analyzing',
  DONE: 'done',
  FAILED: 'failed',
})

export const REVIEW_STATUS_LABEL = Object.freeze({
  [REVIEW_STATUS.QUEUED]: { label: '대기 중', variant: STATUS.NEUTRAL },
  [REVIEW_STATUS.ANALYZING]: { label: '분석 중', variant: STATUS.INFO },
  [REVIEW_STATUS.DONE]: { label: '분석 완료', variant: STATUS.SUCCESS },
  [REVIEW_STATUS.FAILED]: { label: '분석 실패', variant: STATUS.DANGER },
})

// HITL 승인 상태 (FR-6)
export const APPROVAL_STATE = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'changes_requested',
})

export const APPROVAL_LABEL = Object.freeze({
  [APPROVAL_STATE.PENDING]: { label: '승인 대기', variant: STATUS.WARNING },
  [APPROVAL_STATE.APPROVED]: { label: '승인', variant: STATUS.SUCCESS },
  [APPROVAL_STATE.REJECTED]: { label: '반려', variant: STATUS.DANGER },
  [APPROVAL_STATE.CHANGES_REQUESTED]: { label: '수정 요청', variant: STATUS.INFO },
})

export const APPROVAL_ACTIONS = Object.freeze([
  { state: APPROVAL_STATE.APPROVED, label: '승인', variant: 'primary', commentRequired: false },
  { state: APPROVAL_STATE.CHANGES_REQUESTED, label: '수정 요청', variant: 'secondary', commentRequired: true },
  { state: APPROVAL_STATE.REJECTED, label: '반려', variant: 'outline', commentRequired: true },
])

// 위반 소지 심각도 — NFR-2: 누락보다 과탐지가 안전하므로 '검토 권고' 단계까지 표시
export const SEVERITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
})

export const SEVERITY_ORDER = [SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW]

export const SEVERITY_LABEL = Object.freeze({
  [SEVERITY.HIGH]: { label: '위반 소지 높음', short: '높음', variant: STATUS.DANGER, icon: 'error' },
  [SEVERITY.MEDIUM]: { label: '주의 필요', short: '주의', variant: STATUS.WARNING, icon: 'warning' },
  [SEVERITY.LOW]: { label: '검토 권고', short: '권고', variant: STATUS.INFO, icon: 'info' },
})

// 문구 단위 HITL 최종 결정 (2026-10-20 HITL 재설계: violation 단위 kept/rewritten/rewritten_manual)
export const VIOLATION_RESOLUTION = Object.freeze({
  KEPT: 'kept',
  REWRITTEN: 'rewritten',
  REWRITTEN_MANUAL: 'rewritten_manual',
})

export const VIOLATION_RESOLUTION_LABEL = Object.freeze({
  [VIOLATION_RESOLUTION.KEPT]: { label: '원문 유지', variant: STATUS.NEUTRAL },
  [VIOLATION_RESOLUTION.REWRITTEN]: { label: '수정안 채택', variant: STATUS.SUCCESS },
  [VIOLATION_RESOLUTION.REWRITTEN_MANUAL]: { label: '직접 수정', variant: STATUS.SUCCESS },
})

// 광고 주장 유형 — 증빙 대조(FR-3)와 필요 서류 안내(FR-10)의 기준 키
export const CLAIM_TYPES = Object.freeze({
  DRUG: 'drug',
  ENDORSEMENT: 'endorsement',
  ABSOLUTE: 'absolute',
  WHITENING: 'whitening',
  WRINKLE: 'wrinkle',
  CLINICAL: 'clinical',
  IN_VITRO: 'in_vitro',
  PATENT: 'patent',
  TRADEMARK: 'trademark',
  CERTIFICATION: 'certification',
  ORIGIN: 'origin',
  INGREDIENT: 'ingredient',
  EXAGGERATION: 'exaggeration',
})

export const CLAIM_LABEL = Object.freeze({
  [CLAIM_TYPES.DRUG]: '의약품 효능 표방',
  [CLAIM_TYPES.ENDORSEMENT]: '전문가, 기관 공인, 추천',
  [CLAIM_TYPES.ABSOLUTE]: '절대적, 최상급 표현',
  [CLAIM_TYPES.WHITENING]: '미백 기능',
  [CLAIM_TYPES.WRINKLE]: '주름개선 기능',
  [CLAIM_TYPES.CLINICAL]: '시험 결과, 수치 인용',
  [CLAIM_TYPES.IN_VITRO]: '인체외 시험 인용',
  [CLAIM_TYPES.PATENT]: '특허 표현',
  [CLAIM_TYPES.TRADEMARK]: '상표 표현',
  [CLAIM_TYPES.CERTIFICATION]: '인증, 수상 표현',
  [CLAIM_TYPES.ORIGIN]: '원산지 표현',
  [CLAIM_TYPES.INGREDIENT]: '원료 함량, 배합',
  [CLAIM_TYPES.EXAGGERATION]: '즉각, 과장 효과',
})

// 기능성 주장 → 식약처 보고 기능 매핑
export const FUNCTION_OF_CLAIM = Object.freeze({
  [CLAIM_TYPES.WHITENING]: '미백',
  [CLAIM_TYPES.WRINKLE]: '주름개선',
})

// 증빙서류 유형 (FR-3)
export const DOC_TYPES = Object.freeze({
  FUNCTIONAL_REPORT: 'functional_report',
  INGREDIENT_LIST: 'ingredient_list',
  CLINICAL_TEST: 'clinical_test',
  IN_VITRO_TEST: 'in_vitro_test',
  CERTIFICATE: 'certificate',
  PATENT_CERT: 'patent_cert',
  TRADEMARK_CERT: 'trademark_cert',
  ORIGIN_CERT: 'origin_cert',
  OTHER: 'other',
})

export const DOC_TYPE_OPTIONS = Object.freeze([
  { value: DOC_TYPES.FUNCTIONAL_REPORT, label: '기능성화장품 심사, 보고서' },
  { value: DOC_TYPES.INGREDIENT_LIST, label: '전성분표' },
  { value: DOC_TYPES.CLINICAL_TEST, label: '인체적용시험 결과서' },
  { value: DOC_TYPES.IN_VITRO_TEST, label: '인체외시험 결과서' },
  { value: DOC_TYPES.CERTIFICATE, label: '인증서, 수상 증명서' },
  { value: DOC_TYPES.PATENT_CERT, label: '특허등록증' },
  { value: DOC_TYPES.TRADEMARK_CERT, label: '상표등록증' },
  { value: DOC_TYPES.ORIGIN_CERT, label: '원산지증명서' },
  { value: DOC_TYPES.OTHER, label: '기타 증빙' },
])

export const DOC_TYPE_LABEL = Object.freeze(
  Object.fromEntries(DOC_TYPE_OPTIONS.map((o) => [o.value, o.label])),
)

// 공공데이터 조회 결과 (NFR-10: 미조회와 오류를 구분)
export const PUBLIC_DATA_STATUS = Object.freeze({
  SKIPPED: 'skipped',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
})

// 특허 확인 결과 (NFR-12, 13, 16)
export const PATENT_STATUS = Object.freeze({
  NEEDS_CONFIRM: 'needs_confirm',
  REGISTERED: 'registered',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
})

export const PATENT_STATUS_LABEL = Object.freeze({
  [PATENT_STATUS.NEEDS_CONFIRM]: { label: '번호 확인 필요', variant: STATUS.WARNING },
  [PATENT_STATUS.REGISTERED]: { label: '등록 특허 확인', variant: STATUS.SUCCESS },
  [PATENT_STATUS.UNAVAILABLE]: { label: '확인 불가', variant: STATUS.NEUTRAL },
  [PATENT_STATUS.ERROR]: { label: '조회 실패', variant: STATUS.DANGER },
})

// 특허 청구항 ↔ 광고 효능 대조 결과 (FR-15)
export const PATENT_MATCH = Object.freeze({
  RELATED: 'related',
  PARTIAL: 'partial',
  UNRELATED: 'unrelated',
  UNKNOWN: 'unknown',
})

export const PATENT_MATCH_LABEL = Object.freeze({
  [PATENT_MATCH.RELATED]: { label: '광고 주장과 관련 있음', variant: STATUS.SUCCESS },
  [PATENT_MATCH.PARTIAL]: { label: '일부만 관련', variant: STATUS.WARNING },
  [PATENT_MATCH.UNRELATED]: { label: '광고 주장과 관련 없음', variant: STATUS.DANGER },
  [PATENT_MATCH.UNKNOWN]: { label: '대조 불가', variant: STATUS.NEUTRAL },
})

// 업로드 파일 종류
export const FILE_KIND = Object.freeze({
  IMAGE: 'image',
  DETAIL_PAGE: 'detail_page',
})
