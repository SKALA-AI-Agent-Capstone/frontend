import { ROUTE_NAMES } from '@/shared/constants/routes'

export const SERVICES_SECTION = {
  title: '주요 심의 및 행정 서비스',
  description: '자율심의 신청부터 위반 의심 소명, 기준 가이드라인까지 원스톱으로 지원합니다.',
}

export const SERVICES = [
  {
    id: 'apply',
    icon: 'assignment_turned_in',
    tag: '민원신청 01',
    title: '화장품 표시, 광고 사전 자율심의 신청',
    description:
      '의약품 오인, 기능성화장품 과대광고 여부, 실증 필요 표현에 대한 사전 전문 검토를 신청하고 심의필증을 교부받습니다.',
    features: ['신규 제품 광고물 검토', '심의 접수 후 7일 이내 결과 통보'],
    action: { label: '자율심의 신청하기', icon: 'arrow_forward', variant: 'primary', to: { name: ROUTE_NAMES.REVIEW_NEW } },
  },
  {
    id: 'campaign',
    icon: 'library_add',
    tag: '민원신청 02',
    title: '캠페인 상세페이지 일괄 심의',
    description:
      '캠페인 단위로 여러 상세페이지를 한 번에 올려 순서대로 심의합니다. 일부 건이 실패해도 해당 건만 다시 처리할 수 있습니다.',
    features: ['복수 상세페이지 동시 접수', '건별 진행률, 재시도'],
    action: { label: '일괄 심의 신청', icon: 'upload_file', variant: 'secondary', to: { name: ROUTE_NAMES.BATCH } },
  },
  {
    id: 'guideline',
    icon: 'menu_book',
    tag: '자료지원 03',
    title: '식약처 고시 및 부당 표시, 광고 가이드라인',
    description:
      '최신 개정된 화장품법령, 식약처 고시 전문, 금지표현 목록집, 분기별 정기 모니터링 적발 사례집을 열람하고 다운로드합니다.',
    features: ['2025 최신 질의응답집 수록', '화장품 표시, 광고 실증에 관한 규정'],
    action: { label: '가이드라인 자료실 열람', icon: 'arrow_forward', variant: 'outline', to: { name: ROUTE_NAMES.STANDARDS } },
    muted: true,
  },
]
