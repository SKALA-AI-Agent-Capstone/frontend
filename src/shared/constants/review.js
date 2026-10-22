// 검토 도메인 전역 상수 — 상태, 심각도, 증빙 유형, 주장 유형 등 모든 화면이 공유한다.
import { STATUS } from './status'
import { textMap, translated } from '@/shared/i18n'

// 검토 버전 처리 상태
export const REVIEW_STATUS = Object.freeze({
  QUEUED: 'queued',
  ANALYZING: 'analyzing',
  DONE: 'done',
  FAILED: 'failed',
})

export const REVIEW_STATUS_LABEL = Object.freeze({
  [REVIEW_STATUS.QUEUED]: translated({ variant: STATUS.NEUTRAL }, { label: 'review.status.queued' }),
  [REVIEW_STATUS.ANALYZING]: translated({ variant: STATUS.INFO }, { label: 'review.status.analyzing' }),
  [REVIEW_STATUS.DONE]: translated({ variant: STATUS.SUCCESS }, { label: 'review.status.done' }),
  [REVIEW_STATUS.FAILED]: translated({ variant: STATUS.DANGER }, { label: 'review.status.failed' }),
})

// 위반 소지 심각도 — NFR-2: 누락보다 과탐지가 안전하므로 '검토 권고' 단계까지 표시
export const SEVERITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
})

export const SEVERITY_ORDER = [SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW]

export const SEVERITY_LABEL = Object.freeze({
  [SEVERITY.HIGH]: translated({ variant: STATUS.DANGER, icon: 'error' }, { label: 'review.severity.high', short: 'review.severityShort.high' }),
  [SEVERITY.MEDIUM]: translated({ variant: STATUS.WARNING, icon: 'warning' }, { label: 'review.severity.medium', short: 'review.severityShort.medium' }),
  [SEVERITY.LOW]: translated({ variant: STATUS.INFO, icon: 'info' }, { label: 'review.severity.low', short: 'review.severityShort.low' }),
})

// 문구 단위 HITL 최종 결정 (2026-10-20 HITL 재설계: violation 단위 kept/rewritten/rewritten_manual)
export const VIOLATION_RESOLUTION = Object.freeze({
  KEPT: 'kept',
  REWRITTEN: 'rewritten',
  REWRITTEN_MANUAL: 'rewritten_manual',
})

export const VIOLATION_RESOLUTION_LABEL = Object.freeze({
  [VIOLATION_RESOLUTION.KEPT]: translated({ variant: STATUS.NEUTRAL }, { label: 'review.resolution.kept' }),
  [VIOLATION_RESOLUTION.REWRITTEN]: translated({ variant: STATUS.SUCCESS }, { label: 'review.resolution.rewritten' }),
  [VIOLATION_RESOLUTION.REWRITTEN_MANUAL]: translated({ variant: STATUS.SUCCESS }, { label: 'review.resolution.rewrittenManual' }),
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

export const CLAIM_LABEL = textMap({
  [CLAIM_TYPES.DRUG]: 'review.claim.drug',
  [CLAIM_TYPES.ENDORSEMENT]: 'review.claim.endorsement',
  [CLAIM_TYPES.ABSOLUTE]: 'review.claim.absolute',
  [CLAIM_TYPES.WHITENING]: 'review.claim.whitening',
  [CLAIM_TYPES.WRINKLE]: 'review.claim.wrinkle',
  [CLAIM_TYPES.CLINICAL]: 'review.claim.clinical',
  [CLAIM_TYPES.IN_VITRO]: 'review.claim.in_vitro',
  [CLAIM_TYPES.PATENT]: 'review.claim.patent',
  [CLAIM_TYPES.TRADEMARK]: 'review.claim.trademark',
  [CLAIM_TYPES.CERTIFICATION]: 'review.claim.certification',
  [CLAIM_TYPES.ORIGIN]: 'review.claim.origin',
  [CLAIM_TYPES.INGREDIENT]: 'review.claim.ingredient',
  [CLAIM_TYPES.EXAGGERATION]: 'review.claim.exaggeration',
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
  translated({ value: DOC_TYPES.FUNCTIONAL_REPORT }, { label: 'review.docType.functional_report' }),
  translated({ value: DOC_TYPES.INGREDIENT_LIST }, { label: 'review.docType.ingredient_list' }),
  translated({ value: DOC_TYPES.CLINICAL_TEST }, { label: 'review.docType.clinical_test' }),
  translated({ value: DOC_TYPES.IN_VITRO_TEST }, { label: 'review.docType.in_vitro_test' }),
  translated({ value: DOC_TYPES.CERTIFICATE }, { label: 'review.docType.certificate' }),
  translated({ value: DOC_TYPES.PATENT_CERT }, { label: 'review.docType.patent_cert' }),
  translated({ value: DOC_TYPES.TRADEMARK_CERT }, { label: 'review.docType.trademark_cert' }),
  translated({ value: DOC_TYPES.ORIGIN_CERT }, { label: 'review.docType.origin_cert' }),
  translated({ value: DOC_TYPES.OTHER }, { label: 'review.docType.other' }),
])

export const DOC_TYPE_LABEL = textMap(
  Object.fromEntries(Object.values(DOC_TYPES).map((value) => [value, `review.docType.${value}`])),
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
  [PATENT_STATUS.NEEDS_CONFIRM]: translated({ variant: STATUS.WARNING }, { label: 'review.patentStatus.needsConfirm' }),
  [PATENT_STATUS.REGISTERED]: translated({ variant: STATUS.SUCCESS }, { label: 'review.patentStatus.registered' }),
  [PATENT_STATUS.UNAVAILABLE]: translated({ variant: STATUS.NEUTRAL }, { label: 'review.patentStatus.unavailable' }),
  [PATENT_STATUS.ERROR]: translated({ variant: STATUS.DANGER }, { label: 'review.patentStatus.error' }),
})

// 특허 청구항 ↔ 광고 효능 대조 결과 (FR-15)
export const PATENT_MATCH = Object.freeze({
  RELATED: 'related',
  PARTIAL: 'partial',
  UNRELATED: 'unrelated',
  UNKNOWN: 'unknown',
})

export const PATENT_MATCH_LABEL = Object.freeze({
  [PATENT_MATCH.RELATED]: translated({ variant: STATUS.SUCCESS }, { label: 'review.patentMatch.related' }),
  [PATENT_MATCH.PARTIAL]: translated({ variant: STATUS.WARNING }, { label: 'review.patentMatch.partial' }),
  [PATENT_MATCH.UNRELATED]: translated({ variant: STATUS.DANGER }, { label: 'review.patentMatch.unrelated' }),
  [PATENT_MATCH.UNKNOWN]: translated({ variant: STATUS.NEUTRAL }, { label: 'review.patentMatch.unknown' }),
})

// 업로드 파일 종류
export const FILE_KIND = Object.freeze({
  IMAGE: 'image',
  DETAIL_PAGE: 'detail_page',
})
