/*
 * 식약처 공공데이터 — 기능성화장품 보고품목정보 조회 (FR-4, NFR-10)
 * ⚠ 목업: 실제 구현 시 공공데이터포털 API 를 백엔드에서 호출하고 같은 응답 구조로 돌려준다.
 *   FOUND     — 정상 응답 + 데이터 있음
 *   NOT_FOUND — 정상 응답 + 데이터 없음 (번호 확인 안내)
 *   ERROR     — 연동 실패 (재시도 안내)
 */
import { PUBLIC_DATA_STATUS } from '@/shared/constants/review'
import { ApiError, delay } from './mock/delay'

const SOURCE = '식약처 기능성화장품 보고품목정보 (공공데이터 ,  목업)'

const MOCK_REGISTRY = {
  '2023-보고-제09124호': { productName: '루미너스 펩타이드 리페어 앰플 크림', functions: ['미백'], reportedAt: '2023-05-12' },
  '2024-심사-제00987호': { productName: '더마 바이오 앰플 세럼', functions: ['미백', '주름개선'], reportedAt: '2024-02-03' },
}

// 데모: 번호에 'ERR' 가 포함되면 연동 실패를 흉내낸다
async function request(reportNo) {
  await delay(500)
  if (/ERR/i.test(reportNo)) throw new ApiError('공공데이터 API 응답 시간 초과')
  return MOCK_REGISTRY[reportNo.trim()] ?? null
}

export async function lookupFunctionalReport(reportNo) {
  const checkedAt = new Date().toISOString()
  if (!reportNo?.trim()) return { status: PUBLIC_DATA_STATUS.SKIPPED, reportNo: '', checkedAt: null, source: SOURCE }
  try {
    const data = await request(reportNo)
    return {
      status: data ? PUBLIC_DATA_STATUS.FOUND : PUBLIC_DATA_STATUS.NOT_FOUND,
      reportNo,
      data,
      checkedAt,
      source: SOURCE,
    }
  } catch (error) {
    return { status: PUBLIC_DATA_STATUS.ERROR, reportNo, error: error.message, checkedAt, source: SOURCE }
  }
}
