/*
 * Agent 결과의 warnings는 "타일id:코드" 형태의 처리 기록이다. 화면에는 코드별로 묶어 사람이 읽는 문장으로 보여 준다.
 * 문장으로 온 안내(법령 검색 상태)는 그대로 둔다. 모르는 코드는 숨기지 않고 "기타"로 센다.
 */
import { t } from '@/shared/i18n'

const KNOWN = new Set([
  'OCR_CORRECTION_FAILED', 'OCR_PROVIDER_FAILED', 'OCR_NOT_AVAILABLE', 'UNREADABLE_TEXT', 'VISUAL_UNREADABLE',
  'VISION_PROVIDER_FAILED', 'TEXT_REVIEW_PROVIDER_FAILED', 'TEXT_REVIEW_INPUT_TRUNCATED', 'NO_READABLE_TEXT',
  'TEXT_MODEL_NOT_CONFIGURED', 'VISION_MODEL_NOT_CONFIGURED', 'LEGAL_SEARCH_PARTIAL', 'LEGAL_SEARCH_FAILED',
  'LEGAL_SEARCH_UNAVAILABLE', 'LEGAL_CORPUS_NOT_INDEXED', 'LEGAL_RULE_PROVISION_NOT_LOADED', 'EVIDENCE_TOOL_UNAVAILABLE',
  'FUNCTIONAL_TOOL_UNAVAILABLE', 'PATENT_TOOL_UNAVAILABLE', 'CROSS_CHECK_UNAVAILABLE',
])

export function warningLines(warnings = []) {
  const counts = new Map()
  const sentences = []
  for (const warning of warnings) {
    const code = String(warning).split(':').pop()
    if (!/^[A-Z][A-Z0-9_]+$/.test(code)) {
      sentences.push(warning)
      continue
    }
    counts.set(code, (counts.get(code) ?? 0) + 1)
  }
  const lines = [...counts].map(([code, count]) =>
    KNOWN.has(code) ? t(`reviewDetail.warnings.${code}`, { count }) : t('reviewDetail.warnings.other', { code, count }))
  return [...sentences, ...lines]
}
