import { textMap } from '@/shared/i18n'
// 크레딧 과금 기준 (FR-11) — 텍스트 분량, 이미지 수 기준
export const PRICING = Object.freeze({
  TEXT_UNIT_CHARS: 500, // 텍스트 1단위 = 500자
  CREDITS_PER_TEXT_UNIT: 1,
  CREDITS_PER_IMAGE: 3,
})

// 충전 금액권. 가격은 서버 BillingController의 PRICES와 같아야 한다 (결제 금액은 서버가 정한다).
// 많이 살수록 크레딧당 값이 크게 내려가도록 잡았다. 할인율은 정가(크레딧당 50원) 대비로 계산한다.
const LIST_PRICE_PER_CREDIT = 50
export const CREDIT_PACKAGES = Object.freeze(
  [
    { credits: 100, price: 5000 },
    { credits: 500, price: 23000 },
    { credits: 1000, price: 42000 },
    { credits: 2000, price: 70000 },
  ].map(({ credits, price }) => Object.freeze({
    credits,
    price,
    discountPercent: Math.round((1 - price / (credits * LIST_PRICE_PER_CREDIT)) * 100),
  }))
)

export const LEDGER_TYPE = Object.freeze({
  CHARGE: 'charge',
  USAGE: 'usage',
})

export const LEDGER_TYPE_LABEL = textMap({
  [LEDGER_TYPE.CHARGE]: 'common.ledger.charge',
  [LEDGER_TYPE.USAGE]: 'common.ledger.usage',
})

/** 사용량 → 크레딧 계산 (사전 확인과 확정 차감이 같은 식을 쓴다) */
export function calcUsage({ textChars = 0, images = 0 }) {
  const textUnits = textChars > 0 ? Math.ceil(textChars / PRICING.TEXT_UNIT_CHARS) : 0
  const credits = textUnits * PRICING.CREDITS_PER_TEXT_UNIT + images * PRICING.CREDITS_PER_IMAGE
  return { textChars, textUnits, images, credits }
}
