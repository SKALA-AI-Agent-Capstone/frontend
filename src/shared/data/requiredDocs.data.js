/*
 * 주장 유형별 필요 증빙 (FR-10 — 협회 구비서류 체크리스트 반영)
 * ⚠ 데모 데이터: 실제 협회 구비서류 목록으로 교체 필요.
 * prohibited: 증빙으로 해결되지 않는 금지 표현 → 서류 대신 표현 수정 안내
 */
import { CLAIM_TYPES, DOC_TYPES } from '@/shared/constants/review'

export const REQUIRED_DOCS = {
  [CLAIM_TYPES.DRUG]: { prohibited: true, docs: [] },
  [CLAIM_TYPES.ENDORSEMENT]: { prohibited: true, docs: [] },
  [CLAIM_TYPES.ABSOLUTE]: { prohibited: false, docs: [DOC_TYPES.CLINICAL_TEST] },
  [CLAIM_TYPES.WHITENING]: { prohibited: false, docs: [DOC_TYPES.FUNCTIONAL_REPORT] },
  [CLAIM_TYPES.WRINKLE]: { prohibited: false, docs: [DOC_TYPES.FUNCTIONAL_REPORT] },
  [CLAIM_TYPES.CLINICAL]: { prohibited: false, docs: [DOC_TYPES.CLINICAL_TEST] },
  [CLAIM_TYPES.IN_VITRO]: { prohibited: false, docs: [DOC_TYPES.IN_VITRO_TEST] },
  [CLAIM_TYPES.PATENT]: { prohibited: false, docs: [DOC_TYPES.PATENT_CERT] },
  [CLAIM_TYPES.TRADEMARK]: { prohibited: false, docs: [DOC_TYPES.TRADEMARK_CERT] },
  [CLAIM_TYPES.CERTIFICATION]: { prohibited: false, docs: [DOC_TYPES.CERTIFICATE] },
  [CLAIM_TYPES.ORIGIN]: { prohibited: false, docs: [DOC_TYPES.ORIGIN_CERT] },
  [CLAIM_TYPES.INGREDIENT]: { prohibited: false, docs: [DOC_TYPES.INGREDIENT_LIST] },
  [CLAIM_TYPES.EXAGGERATION]: { prohibited: false, docs: [DOC_TYPES.CLINICAL_TEST] },
}

// 품목 유형 (기능성 여부)
export const PRODUCT_CATEGORIES = [
  { value: 'functional', label: '기능성화장품', functional: true },
  { value: 'general', label: '일반화장품 (기초, 색조 등)', functional: false },
  { value: 'baby', label: '영유아, 어린이용 화장품', functional: false },
  { value: 'custom', label: '맞춤형화장품', functional: false },
]

// 광고 매체 (검토 건 메타 정보) — KRDS: 체크박스 옵션 가나다순
export const MEDIA_CHANNELS = [
  { value: 'sns', label: 'SNS / 숏폼 콘텐츠', description: '인스타, 유튜브, 틱톡' },
  { value: 'detail-page', label: '온라인 상세페이지', description: '자사몰 및 오픈마켓' },
  { value: 'print', label: '인쇄물 / 옥외광고', description: '카탈로그, 리플릿, 전광판' },
  { value: 'broadcast', label: 'TV / 라디오 방송', description: '지상파 및 케이블 송출' },
  { value: 'live', label: '라이브 커머스', description: '실시간 판매 방송 대본' },
].sort((a, b) => a.label.localeCompare(b.label, 'ko'))
