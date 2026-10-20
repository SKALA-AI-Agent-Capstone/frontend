import { STATUS } from '@/shared/constants/status'

export const VIOLATION_CASES = [
  {
    id: 'drug-misuse',
    variant: STATUS.DANGER,
    icon: 'cancel',
    type: '의약품 오인 표현 금지',
    basis: '화장품법 제13조제1항',
    quote: '아토피, 여드름 치료, 흉터 완화, 피부염 염증 즉각 소염',
    guideLabel: '대체 권장 문구',
    guide: '건조함으로 인한 가려움 완화에 도움, 피부 진정',
  },
  {
    id: 'functional-misuse',
    variant: STATUS.WARNING,
    icon: 'warning',
    type: '기능성화장품 오인 표현',
    basis: '미심의 품목',
    quote: '피부 속 주름 다리미 효과, 2주 만에 기미, 잡티 영구 박멸',
    guideLabel: '심의 지도',
    guide: '심의 완료된 기능성 범위 내 표기 필수 (일시적 완화 한정)',
  },
  {
    id: 'absolute-claim',
    variant: STATUS.NEUTRAL,
    icon: 'info',
    type: '소비자 오인 및 절대적 표현',
    basis: '실증 불가',
    quote: '국내 최초 100% 무자극 승인, 의사 추천 1위 제품',
    guideLabel: '주의',
    guide: "'최고', '유일', '완전무결' 등 객관적 실증이 불가능한 단정적 어휘 금지",
  },
]
