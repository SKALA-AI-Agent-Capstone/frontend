/*
 * 위반 소지 탐지 규칙 (FR-1, 2, 5) — ⚠ 데모용 키워드 규칙.
 * 실제 서비스에서는 백엔드 판정 엔진(LLM/RAG)이 같은 Finding 구조로 응답한다.
 * rewrites: { text } 대체 ,  { text: '' } 삭제 ,  { keep: true } 증빙 제출 시 현재 표현 유지 (note 는 화면 안내용)
 * NFR-2: 누락보다 과탐지가 안전하므로 단어 단위로 넓게 잡고, 애매한 표현은 LOW(검토 권고)로 표시한다.
 */
import { CLAIM_TYPES, SEVERITY } from '@/shared/constants/review'
import { ARTICLES } from './standards.data'

export const RULES = [
  {
    id: 'R-DRUG',
    category: '의약품 오인 표현',
    severity: SEVERITY.HIGH,
    claimType: CLAIM_TYPES.DRUG,
    patterns: [/세포\s*재생/g, /피부\s*재생/g, /재생\s*복구/g, /치료/g, /치유/g, /염증/g, /소염/g, /아토피/g, /여드름\s*(완화|개선)/g, /흉터/g, /피부염/g],
    basis: [ARTICLES.COS_13_1_1, ARTICLES.ASSOC_G1],
    rewrites: [{ text: '피부 진정에 도움' }, { text: '건조함으로 인한 피부 거칠음 완화에 도움' }, { text: '피부 컨디션을 건강하게 가꿔줌' }],
  },
  {
    id: 'R-ENDORSE',
    category: '전문가, 기관 공인, 추천 표현',
    severity: SEVERITY.HIGH,
    claimType: CLAIM_TYPES.ENDORSEMENT,
    patterns: [/(피부과\s*)?전문의\s*(추천|인증|개발)?/g, /의사\s*(추천|개발)/g, /약사\s*추천/g, /식약처\s*(인증|인정|추천|승인)/g],
    basis: [ARTICLES.COS_13_1_3, ARTICLES.ASSOC_G4],
    rewrites: [{ text: '', note: '공인, 추천 표현 삭제' }, { text: '자체 연구소에서 개발한' }],
  },
  {
    id: 'R-ABSOLUTE',
    category: '절대적, 최상급 표현',
    severity: SEVERITY.MEDIUM,
    claimType: CLAIM_TYPES.ABSOLUTE,
    patterns: [/100\s*%(?!\s*함유)/g, /완벽/g, /최고/g, /최초/g, /유일/g, /완전(히)?/g, /영구/g, /부작용\s*(0|없)/g, /무자극/g],
    basis: [ARTICLES.FAIR_3_1_1, ARTICLES.ASSOC_G3],
    rewrites: [{ text: '', note: '최상급, 절대 표현 삭제' }, { text: '자극 테스트 완료', note: '시험 조건 병기' }],
  },
  {
    id: 'R-WHITENING',
    category: '미백 기능성 주장',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.WHITENING,
    patterns: [/미백/g, /화이트닝/g, /기미/g, /잡티/g, /브라이트닝/g],
    basis: [ARTICLES.COS_13_1_2, ARTICLES.ASSOC_G2],
    rewrites: [{ keep: true, note: '미백 기능성 심사, 보고 범위 내라면 유지' }, { text: '피부 톤을 맑게 가꾸는 데 도움', note: '기능성 미보고 시' }],
  },
  {
    id: 'R-WRINKLE',
    category: '주름개선 기능성 주장',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.WRINKLE,
    patterns: [/주름\s*(개선|완화|감소|다리미)?/g, /탄력\s*개선/g],
    basis: [ARTICLES.COS_13_1_2, ARTICLES.ASSOC_G2],
    rewrites: [{ keep: true, note: '주름개선 기능성 심사, 보고 범위 내라면 유지' }, { text: '피부 결을 매끄럽게 가꿔줌', note: '기능성 미보고 시' }],
  },
  {
    id: 'R-CLINICAL',
    category: '시험 결과, 수치 인용',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.CLINICAL,
    patterns: [/\d+(\.\d+)?\s*%\s*(개선|감소|증가|향상)/g, /인체\s*적용\s*시험/g, /임상/g, /\d+\s*(일|주)\s*만에/g],
    basis: [ARTICLES.ASSOC_D1, ARTICLES.GUIDE_EVIDENCE],
    rewrites: [{ keep: true, note: '시험 자료 제출, 시험기관, 기간, 대상 수 병기' }, { text: '', note: '수치, 기간 표현 삭제' }],
  },
  {
    id: 'R-IN-VITRO',
    category: '인체외 시험 인용',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.IN_VITRO,
    patterns: [/인체\s*외\s*시험/g, /세포\s*실험/g, /in[\s-]?vitro/gi],
    basis: [ARTICLES.ASSOC_D1, ARTICLES.GUIDE_EVIDENCE],
    rewrites: [{ text: '인체외 시험 결과(실제 효과와 다를 수 있음)' }],
  },
  {
    id: 'R-PATENT',
    category: '특허 표현',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.PATENT,
    patterns: [/특허(\s*(받은|등록|성분|기술|공법))?/g],
    basis: [ARTICLES.ASSOC_D2, ARTICLES.COS_13_1_4],
    rewrites: [{ keep: true, note: '특허등록증 제출, 등록번호, 명칭 병기, 효능은 청구항 범위 내' }, { text: '', note: '특허 표현 삭제' }],
  },
  {
    id: 'R-TRADEMARK',
    category: '상표 표현',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.TRADEMARK,
    patterns: [/®/g, /등록\s*상표/g],
    basis: [ARTICLES.COS_13_1_4],
    rewrites: [{ keep: true, note: '상표등록증 범위 내 사용' }],
  },
  {
    id: 'R-CERT',
    category: '인증, 수상 표현',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.CERTIFICATION,
    patterns: [/(비건|유기농|EWG)\s*인증/g, /인증\s*(받은|획득)/g, /수상/g, /어워드/g],
    basis: [ARTICLES.ASSOC_D5],
    rewrites: [{ keep: true, note: '인증서 제출, 인증기관명, 연도 병기' }, { text: '', note: '인증 표현 삭제' }],
  },
  {
    id: 'R-ORIGIN',
    category: '원산지 표현',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.ORIGIN,
    patterns: [/(국내|프랑스|스위스|제주|독일)\s*산/g, /원산지/g, /made\s*in\s*\w+/gi],
    basis: [ARTICLES.ASSOC_D4],
    rewrites: [{ keep: true, note: '원산지증명서 범위 내 유지' }],
  },
  {
    id: 'R-INGREDIENT',
    category: '원료 함량, 배합 표현',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.INGREDIENT,
    patterns: [/\d+(\.\d+)?\s*%\s*함유/g, /고함량/g, /고농축/g],
    basis: [ARTICLES.ASSOC_D3],
    rewrites: [{ keep: true, note: '전성분표 기준, 원료적 특성에 한함 병기' }],
  },
  {
    id: 'R-EXAGGERATION',
    category: '즉각, 과장 효과',
    severity: SEVERITY.LOW,
    claimType: CLAIM_TYPES.EXAGGERATION,
    patterns: [/즉각/g, /즉시/g, /바로\s*(효과|변화)/g, /직접\s*침투/g, /진피층/g],
    basis: [ARTICLES.ASSOC_G5, ARTICLES.FAIR_3_1_1],
    rewrites: [{ text: '사용 후 피부가 촉촉하게 느껴짐', note: '사용감 표현' }, { text: '각질층까지 흡수' }],
  },
]

// 과거 적발, 심의 사례 (FR-2 보조 참고) — 출처 검증 전 데이터는 verified:false 로 표시
export const REFERENCE_CASES = [
  {
    id: 'C-01',
    ruleId: 'R-DRUG',
    summary: "'아토피, 여드름 치료' 표현 사용 광고 — 의약품 오인으로 시정 대상",
    source: '업계 공유 사례집 (출처 미검증)',
    verified: false,
  },
  {
    id: 'C-02',
    ruleId: 'R-WRINKLE',
    summary: "미백만 보고된 제품의 '주름 다리미 효과' 표현 — 기능성 범위 초과",
    source: '업계 공유 사례집 (출처 미검증)',
    verified: false,
  },
  {
    id: 'C-03',
    ruleId: 'R-ABSOLUTE',
    summary: "'국내 최초 100% 무자극' 표현 — 실증 불가 절대 표현",
    source: '업계 공유 사례집 (출처 미검증)',
    verified: false,
  },
  {
    id: 'C-04',
    ruleId: 'R-ENDORSE',
    summary: "'피부과 전문의 추천 1위' 표현 — 전문가 추천 표현으로 시정 대상",
    source: '업계 공유 사례집 (출처 미검증)',
    verified: false,
  },
]
