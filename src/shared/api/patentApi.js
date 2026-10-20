/*
 * 특허정보 조회 (FR-14, 15, NFR-13, 14, 16)
 * ⚠ 목업: 실제 구현 시 특허정보 API(예: KIPRIS Plus)를 백엔드에서 호출한다.
 *   조회 실패는 throw → 화면에서 '조회 실패 + 재시도', 다른 검토 기능은 계속 동작
 *   결과 없음은 data:null → '확인 불가' (특허 없음으로 단정하지 않음)
 */
import { ApiError, delay } from './mock/delay'

export const PATENT_SOURCE = '특허정보 검색 API (목업)'

const MOCK_PATENTS = {
  '10-2345678': {
    title: '펩타이드 복합체를 포함하는 피부 보습용 화장료 조성물',
    holder: '(주)한국코스메틱랩',
    registeredAt: '2021-08-19',
    claims: [
      { no: 1, text: '아세틸헥사펩타이드 및 팔미토일트라이펩타이드를 포함하는 펩타이드 복합체를 유효성분으로 함유하는 피부 보습용 화장료 조성물.' },
      { no: 2, text: '제1항에 있어서, 상기 조성물은 피부 장벽 강화 및 수분 손실 감소 효과를 나타내는 것을 특징으로 하는 화장료 조성물.' },
    ],
    description: '본 발명은 펩타이드 복합체를 이용하여 피부 보습력과 장벽 기능을 개선하는 화장료 조성물에 관한 것이다.',
  },
  '10-1111111': {
    title: '식물 추출물을 포함하는 피부 진정용 조성물',
    holder: '(주)네이처코스메틱랩',
    registeredAt: '2019-03-02',
    claims: [{ no: 1, text: '병풀 추출물을 포함하는 피부 진정용 화장료 조성물.' }],
    description: '병풀 추출물을 이용한 피부 진정 조성물.',
  },
}

// 데모: '10-1111111' 은 첫 조회만 실패 → 재시도 시 성공 (NFR-16 재시도 흐름 확인용)
const failedOnce = new Set()

export async function lookupPatent(number) {
  await delay(700)
  if (number === '10-1111111' && !failedOnce.has(number)) {
    failedOnce.add(number)
    throw new ApiError('특허정보 API 응답 지연 (timeout)')
  }
  return { data: MOCK_PATENTS[number] ?? null, source: PATENT_SOURCE, queriedAt: new Date().toISOString() }
}
