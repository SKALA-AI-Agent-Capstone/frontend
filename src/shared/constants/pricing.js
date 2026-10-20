// 크레딧 과금 기준 (FR-11) — 텍스트 분량, 이미지 수 기준
export const PRICING = Object.freeze({
  TEXT_UNIT_CHARS: 500, // 텍스트 1단위 = 500자
  CREDITS_PER_TEXT_UNIT: 1,
  CREDITS_PER_IMAGE: 3,
})

// 충전 금액권. 결제 승인 및 크레딧 적립은 서버 연동 후 처리한다.
export const CREDIT_PACKAGES = Object.freeze(
  [
    { credits: 100, discountPercent: 0 },
    { credits: 200, discountPercent: 5 },
    { credits: 300, discountPercent: 10 },
    { credits: 400, discountPercent: 12 },
    { credits: 600, discountPercent: 14 },
    { credits: 800, discountPercent: 16 },
    { credits: 1000, discountPercent: 18 },
    { credits: 2000, discountPercent: 20 },
  ].map(({ credits, discountPercent }) => Object.freeze({
    credits, discountPercent, price: credits * 10 * (100 - discountPercent) / 100,
  }))
)

export const LEDGER_TYPE = Object.freeze({
  CHARGE: 'charge',
  USAGE: 'usage',
})

export const LEDGER_TYPE_LABEL = Object.freeze({
  [LEDGER_TYPE.CHARGE]: '충전',
  [LEDGER_TYPE.USAGE]: '사용 차감',
})

/** 사용량 → 크레딧 계산 (사전 확인과 확정 차감이 같은 식을 쓴다) */
export function calcUsage({ textChars = 0, images = 0 }) {
  const textUnits = textChars > 0 ? Math.ceil(textChars / PRICING.TEXT_UNIT_CHARS) : 0
  const credits = textUnits * PRICING.CREDITS_PER_TEXT_UNIT + images * PRICING.CREDITS_PER_IMAGE
  return { textChars, textUnits, images, credits }
}
