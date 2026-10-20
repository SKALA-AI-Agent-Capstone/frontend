/*
 * 이미지, 상세페이지 텍스트 추출 (FR-1)
 * ⚠ 목업: 실제 OCR 이 없으므로 샘플 문구를 돌려주고 mock:true 로 표시한다.
 *   실제 구현 시 백엔드 OCR 결과(문구 + 위치)를 같은 구조로 돌려준다.
 */
import { delay } from './mock/delay'

const SAMPLE_TEXTS = [
  '피부 세포 재생 100% 보장! 단 7일 만에 주름 개선, 특허 성분 10-2345678 함유',
  '흉터 완전 소멸 입증 ,  피부과 전문의 추천 ,  진피층까지 직접 침투',
  '프랑스산 유기농 원료 5% 함유, 비건 인증 받은 순한 토너',
  '인체적용시험 결과 수분 32% 증가 ,  특허 제1O-1111111호 진정 성분',
]

export async function extractText(file, index = 0) {
  await delay(300)
  return { text: SAMPLE_TEXTS[index % SAMPLE_TEXTS.length], mock: true, fileName: file.name }
}
