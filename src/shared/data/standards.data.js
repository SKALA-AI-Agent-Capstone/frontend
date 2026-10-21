import { textMap } from '@/shared/i18n'
/*
 * 참조 기준 출처 (NFR-6 최신성 ,  NFR-11 출처, 버전 관리)
 * ⚠ 데모 데이터: 버전, 개정일, 협회 기준 항목명은 예시입니다. 실제 서비스에서는 기준 관리 백엔드에서 내려받는다.
 * original 은 확인된 원문만 넣고, 확인 전에는 null 로 둬서 화면에 '원문 미등록'으로 표시한다.
 */
export const SOURCE_TYPES = Object.freeze({
  LAW: 'law',
  ASSOCIATION: 'association',
  GUIDELINE: 'guideline',
  INTERNAL: 'internal',
})

export const SOURCE_TYPE_LABEL = textMap({
  [SOURCE_TYPES.LAW]: 'common.sourceType.law',
  [SOURCE_TYPES.ASSOCIATION]: 'common.sourceType.association',
  [SOURCE_TYPES.GUIDELINE]: 'common.sourceType.guideline',
  [SOURCE_TYPES.INTERNAL]: 'common.sourceType.internal',
})

export const STANDARD_SOURCES = [
  {
    id: 'LAW-COS-13',
    type: SOURCE_TYPES.LAW,
    name: '화장품법 제13조 (부당한 표시, 광고 행위 등의 금지)',
    version: 'v2025.01',
    revisedAt: '2025-01-01',
    scope: '모든 화장품 표시, 광고',
    updateCycle: '개정 공포 후 7일 이내 반영',
    syncedAt: '2025-03-28',
    isDemo: true,
  },
  {
    id: 'LAW-FAIR-AD-3',
    type: SOURCE_TYPES.LAW,
    name: '표시, 광고의 공정화에 관한 법률 제3조 (부당한 표시, 광고 행위의 금지)',
    version: 'v2024.12',
    revisedAt: '2024-12-01',
    scope: '모든 사업자 표시, 광고',
    updateCycle: '개정 공포 후 7일 이내 반영',
    syncedAt: '2025-03-28',
    isDemo: true,
  },
  {
    id: 'ASSOC-GENERAL',
    type: SOURCE_TYPES.ASSOCIATION,
    name: '대한화장품협회 광고자문 일반기준 (5개 항목)',
    version: 'v2025-Q1',
    revisedAt: '2025-01-15',
    scope: '협회 광고자문 대상 광고',
    updateCycle: '분기 1회 정기 점검, 개정 시 14일 이내 반영',
    syncedAt: '2025-03-15',
    isDemo: true,
  },
  {
    id: 'ASSOC-DETAIL',
    type: SOURCE_TYPES.ASSOCIATION,
    name: '대한화장품협회 광고자문 세부기준 (5개 항목)',
    version: 'v2025-Q1',
    revisedAt: '2025-01-15',
    scope: '협회 광고자문 대상 광고 (시험, 특허, 인증, 원산지, 원료 인용)',
    updateCycle: '분기 1회 정기 점검, 개정 시 14일 이내 반영',
    syncedAt: '2025-03-15',
    isDemo: true,
  },
  {
    id: 'MFDS-GUIDE',
    type: SOURCE_TYPES.GUIDELINE,
    name: '식약처 화장품 표시, 광고 관리 가이드라인',
    version: 'v2024.10',
    revisedAt: '2024-10-01',
    scope: '화장품 표시, 광고 실증, 표현 기준',
    updateCycle: '월 1회 점검',
    syncedAt: '2025-03-01',
    isDemo: true,
  },
  {
    id: 'INTERNAL-POLICY',
    type: SOURCE_TYPES.INTERNAL,
    name: '사내 광고 표현 지침',
    version: 'v1.2',
    revisedAt: '2025-02-10',
    scope: '자사 브랜드 전 채널',
    updateCycle: '변경 시 즉시 반영',
    syncedAt: '2025-02-10',
    isDemo: true,
  },
]

export const SOURCE_BY_ID = Object.freeze(Object.fromEntries(STANDARD_SOURCES.map((s) => [s.id, s])))

// 근거 조항 단위 (판정 근거로 인용되는 최소 단위)
export const ARTICLES = {
  COS_13_1_1: {
    sourceId: 'LAW-COS-13',
    article: '제13조 제1항 제1호',
    plain: '화장품 광고에서 병을 고치거나 낫게 한다는 식의 표현을 쓰면 의약품으로 오해할 수 있어 금지됩니다.',
    original: '의약품으로 잘못 인식할 우려가 있는 표시 또는 광고',
  },
  COS_13_1_2: {
    sourceId: 'LAW-COS-13',
    article: '제13조 제1항 제2호',
    plain: '기능성화장품으로 심사, 보고받지 않은 효능을 주장하거나, 심사 결과와 다른 효능을 광고하면 안 됩니다.',
    original:
      '기능성화장품, 천연화장품 또는 유기농화장품이 아닌 화장품을 기능성화장품, 천연화장품 또는 유기농화장품으로 잘못 인식할 우려가 있거나 기능성화장품, 천연화장품 또는 유기농화장품의 안전성ㆍ유효성에 관한 심사결과와 다른 내용의 표시 또는 광고',
  },
  COS_13_1_3: {
    sourceId: 'LAW-COS-13',
    article: '제13조 제1항 제3호',
    plain: '의사, 약사, 기관 등이 추천하거나 인정했다는 식의 표현은 금지됩니다.',
    original:
      '의사ㆍ치과의사ㆍ한의사ㆍ약사ㆍ의료기관 또는 그 밖의 자가 이를 지정ㆍ공인ㆍ추천ㆍ지도ㆍ연구ㆍ개발 또는 사용하고 있다는 내용이나 이를 암시하는 등의 표시 또는 광고',
  },
  COS_13_1_4: {
    sourceId: 'LAW-COS-13',
    article: '제13조 제1항 제4호',
    plain: '사실과 다르거나 소비자가 잘못 이해할 수 있는 표현은 금지됩니다.',
    original: '그 밖에 사실과 다르게 소비자를 속이거나 소비자가 잘못 인식하도록 할 우려가 있는 표시 또는 광고',
  },
  FAIR_3_1_1: {
    sourceId: 'LAW-FAIR-AD-3',
    article: '제3조 제1항 제1호',
    plain: '사실과 다르거나 지나치게 부풀린 광고(거짓, 과장 광고)는 금지됩니다.',
    original: '거짓ㆍ과장의 표시ㆍ광고',
  },
  ASSOC_G1: {
    sourceId: 'ASSOC-GENERAL',
    article: '일반기준 1 (데모)',
    plain: '의약품으로 오인될 수 있는 효능, 효과 표현을 사용하지 않습니다.',
    original: null,
  },
  ASSOC_G2: {
    sourceId: 'ASSOC-GENERAL',
    article: '일반기준 2 (데모)',
    plain: '기능성 효능은 심사, 보고된 범위 안에서만 표현합니다.',
    original: null,
  },
  ASSOC_G3: {
    sourceId: 'ASSOC-GENERAL',
    article: '일반기준 3 (데모)',
    plain: '객관적으로 입증할 수 없는 최상급, 절대적 표현을 사용하지 않습니다.',
    original: null,
  },
  ASSOC_G4: {
    sourceId: 'ASSOC-GENERAL',
    article: '일반기준 4 (데모)',
    plain: '전문가, 기관이 추천, 공인했다는 표현을 사용하지 않습니다.',
    original: null,
  },
  ASSOC_G5: {
    sourceId: 'ASSOC-GENERAL',
    article: '일반기준 5 (데모)',
    plain: '효과의 즉시성, 지속성을 과장하지 않습니다.',
    original: null,
  },
  ASSOC_D1: {
    sourceId: 'ASSOC-DETAIL',
    article: '세부기준 1 (데모)',
    plain: '시험 결과, 수치를 인용할 때는 시험 자료를 보유하고 시험 조건을 함께 표시합니다.',
    original: null,
  },
  ASSOC_D2: {
    sourceId: 'ASSOC-DETAIL',
    article: '세부기준 2 (데모)',
    plain: '특허를 언급할 때는 등록된 특허이고, 특허 내용과 광고 효능이 일치해야 합니다.',
    original: null,
  },
  ASSOC_D3: {
    sourceId: 'ASSOC-DETAIL',
    article: '세부기준 3 (데모)',
    plain: '원료의 함량, 효능을 표현할 때는 전성분표 등 근거가 있어야 합니다.',
    original: null,
  },
  ASSOC_D4: {
    sourceId: 'ASSOC-DETAIL',
    article: '세부기준 4 (데모)',
    plain: '원산지, 제조국 표현은 원산지 증빙이 있어야 합니다.',
    original: null,
  },
  ASSOC_D5: {
    sourceId: 'ASSOC-DETAIL',
    article: '세부기준 5 (데모)',
    plain: '인증, 수상 표현은 인증기관, 연도 등 근거를 함께 표시합니다.',
    original: null,
  },
  GUIDE_EVIDENCE: {
    sourceId: 'MFDS-GUIDE',
    article: '실증 대상 표현 (데모)',
    plain: '수치, 비교, 효과 지속 같은 표현은 객관적 실증자료로 입증할 수 있어야 합니다.',
    original: null,
  },
}

// 대시보드 '기준 업데이트 소식' (NFR-6)
export const STANDARD_UPDATES = [
  { id: 1, sourceId: 'LAW-COS-13', title: '화장품법 제13조 기준 v2025.01 반영', date: '2025-03-28' },
  { id: 2, sourceId: 'ASSOC-DETAIL', title: '협회 세부기준 2025년 1분기 정기 점검 반영', date: '2025-03-15' },
  { id: 3, sourceId: 'INTERNAL-POLICY', title: '사내 지침 v1.2 — 인플루언서 협찬 표기 항목 추가', date: '2025-02-10' },
]
