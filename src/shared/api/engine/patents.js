/*
 * 특허번호 추출, 검증 (FR-14, NFR-12)과 청구항 대조 (FR-15) — 순수 함수.
 * 신뢰도가 낮거나 형식이 맞지 않거나 비슷한 번호가 겹치면 자동 확정하지 않고 사용자 확인을 요청한다.
 */
import { PATENT_MATCH, PATENT_STATUS } from '@/shared/constants/review'

const VALID_FORMAT = /^(10|20)-\d{7}$/
// 특허/실용신안 등록번호 후보: 10-1234567, 10 1234567, 1O-12345678(오인식) 등 넓게 수집
const CANDIDATE = /(?:특허\s*(?:제|번호)?\s*)?([12][0O])\s*[-–]?\s*([0-9OIl]{6,8})\s*호?/g
const AUTO_CONFIRM_CONFIDENCE = 0.9

function normalize(prefix, body) {
  const clean = (s) => s.replace(/[O]/g, '0').replace(/[Il]/g, '1')
  return `${clean(prefix)}-${clean(body)}`
}

function digitDistance(a, b) {
  if (a.length !== b.length) return Infinity
  let diff = 0
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diff += 1
  return diff
}

/**
 * @param {Array<{ text: string, origin: string, baseConfidence: number }>} sources
 *   origin 예: '광고 카피', '증빙: 특허등록증.pdf', '이미지: poster.jpg'
 */
export function extractPatentCandidates(sources) {
  const byNumber = new Map()
  for (const source of sources) {
    for (const match of (source.text ?? '').matchAll(CANDIDATE)) {
      const raw = match[0].trim()
      const number = normalize(match[1], match[2])
      const misread = /[OIl]/.test(match[1] + match[2])
      const formatValid = VALID_FORMAT.test(number)
      let confidence = source.baseConfidence
      if (misread) confidence -= 0.3
      if (!formatValid) confidence -= 0.4
      const prev = byNumber.get(number)
      if (prev) {
        prev.origins.push(source.origin)
        prev.confidence = Math.max(prev.confidence, confidence)
      } else {
        byNumber.set(number, { number, raw, origins: [source.origin], formatValid, confidence, notes: [] })
      }
    }
  }

  const candidates = [...byNumber.values()]
  // 한 자리만 다른 번호가 함께 인식되면 오인식 가능성 → 둘 다 확인 요청
  for (const a of candidates) {
    for (const b of candidates) {
      if (a !== b && digitDistance(a.number, b.number) === 1) {
        a.notes.push(`유사 번호(${b.number})와 함께 인식됨`)
      }
    }
  }

  return candidates.map((c, index) => {
    if (!c.formatValid) c.notes.push('등록번호 형식(10-0000000)과 일치하지 않음')
    if (c.confidence < AUTO_CONFIRM_CONFIDENCE && c.formatValid) c.notes.push('번호 인식 신뢰도 낮음')
    const needsConfirm = !c.formatValid || c.confidence < AUTO_CONFIRM_CONFIDENCE || c.notes.length > 0
    return {
      id: `P-${index + 1}`,
      ...c,
      confidence: Math.max(0, Math.round(c.confidence * 100) / 100),
      status: needsConfirm ? PATENT_STATUS.NEEDS_CONFIRM : null,
      confirmedNumber: needsConfirm ? null : c.number,
    }
  })
}

export function isValidPatentNumber(number) {
  return VALID_FORMAT.test(number)
}

// 효능 키워드 사전 — 광고 주장과 청구항을 같은 기준으로 비교
const EFFICACY_TERMS = ['보습', '수분', '장벽', '주름', '탄력', '미백', '톤', '진정', '재생', '펩타이드', '콜라겐', '항산화', '피지', '모공', '흡수']

function excerpt(text, term, radius = 24) {
  const i = text.indexOf(term)
  if (i < 0) return null
  const s = Math.max(0, i - radius)
  return `${s > 0 ? '…' : ''}${text.slice(s, i + term.length + radius)}${i + term.length + radius < text.length ? '…' : ''}`
}

/**
 * 특허 청구항, 명세서와 광고 효능 주장 대조 (FR-15)
 * 원문을 확보하지 못하면 단정하지 않고 UNKNOWN (NFR-13)
 */
export function matchPatentClaims(adText, patent) {
  const adTerms = EFFICACY_TERMS.filter((t) => adText.includes(t))
  if (!patent?.claims?.length) {
    return { verdict: PATENT_MATCH.UNKNOWN, reasons: [], summary: '청구항 원문을 확보하지 못해 대조할 수 없습니다.' }
  }
  if (!adTerms.length) {
    return { verdict: PATENT_MATCH.UNKNOWN, reasons: [], summary: '광고에서 대조할 효능 주장을 찾지 못했습니다.' }
  }
  const sections = [
    ...patent.claims.map((c) => ({ location: `청구항 ${c.no}`, text: c.text })),
    ...(patent.description ? [{ location: '명세서 요약', text: patent.description }] : []),
  ]
  const reasons = adTerms.map((term) => {
    const hit = sections.find((s) => s.text.includes(term))
    return {
      adTerm: term,
      adExcerpt: excerpt(adText, term),
      found: Boolean(hit),
      location: hit?.location ?? null,
      patentExcerpt: hit ? excerpt(hit.text, term) : null,
    }
  })
  const foundCount = reasons.filter((r) => r.found).length
  const verdict =
    foundCount === reasons.length
      ? PATENT_MATCH.RELATED
      : foundCount > 0
        ? PATENT_MATCH.PARTIAL
        : PATENT_MATCH.UNRELATED
  const missing = reasons.filter((r) => !r.found).map((r) => r.adTerm)
  const summary =
    verdict === PATENT_MATCH.RELATED
      ? '광고의 효능 주장이 모두 특허 청구항, 명세서에 기재되어 있습니다.'
      : `광고의 '${missing.join(', ')}' 주장은 특허 청구항, 명세서에서 확인되지 않습니다.`
  return { verdict, reasons, summary }
}
