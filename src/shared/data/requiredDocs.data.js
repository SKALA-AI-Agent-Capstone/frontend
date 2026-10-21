/*
 * 주장 유형별 필요 증빙 (FR-10 — 협회 구비서류 체크리스트 반영)
 * ⚠ 데모 데이터: 실제 협회 구비서류 목록으로 교체 필요.
 * prohibited: 증빙으로 해결되지 않는 금지 표현 → 서류 대신 표현 수정 안내
 */
import { CLAIM_TYPES, DOC_TYPES } from '@/shared/constants/review'
import { translated } from '@/shared/i18n'

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
  translated({ value: 'functional', functional: true }, { label: 'common.product.functional' }),
  translated({ value: 'general', functional: false }, { label: 'common.product.general' }),
  translated({ value: 'baby', functional: false }, { label: 'common.product.baby' }),
  translated({ value: 'custom', functional: false }, { label: 'common.product.custom' }),
]

// 광고 매체 (검토 건 메타 정보) — KRDS: 체크박스 옵션 가나다순
export const MEDIA_CHANNELS = [
  translated({ value: 'live' }, { label: 'common.media.live.label', description: 'common.media.live.description' }),
  translated({ value: 'detail-page' }, { label: 'common.media.detailPage.label', description: 'common.media.detailPage.description' }),
  translated({ value: 'print' }, { label: 'common.media.print.label', description: 'common.media.print.description' }),
  translated({ value: 'sns' }, { label: 'common.media.sns.label', description: 'common.media.sns.description' }),
  translated({ value: 'broadcast' }, { label: 'common.media.broadcast.label', description: 'common.media.broadcast.description' }),
]
