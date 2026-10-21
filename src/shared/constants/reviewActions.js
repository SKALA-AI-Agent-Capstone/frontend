/*
 * 문구 하나를 담당자의 "다음 행동"으로 분류한다. 우선순위(severity)와는 다른 축이다.
 * severity는 무엇을 먼저 볼지, action은 무엇을 해야 하는지를 말한다.
 *
 *   revise    표현 자체에서 구체적인 위험을 찾았다 (의약품 오인, 절대 표현, 노화를 되돌린다는 식의 효능,
 *             보고 기능과 다름, 금지 원료, 높은 우선순위)
 *   evidence  표현을 뒷받침하는 자료를 확인해야 한다 (시험자료, 기능성 보고번호, 인증 근거, 함량, GMP)
 *   hold      조회가 실패해 판단하지 못했다. 광고의 문제가 아니라 다시 조회하거나 직접 확인할 일이다
 *   note      일반적인 효능, 감성 표현이다. 표현 수위만 보고 원문을 유지할 수 있다
 *
 * Agent 결과(rules, checks, severity)만으로 계산하므로 이전에 저장된 결과에도 같은 분류가 적용된다.
 */
import { t } from '@/shared/i18n'

export const ACTION = Object.freeze({ REVISE: 'revise', EVIDENCE: 'evidence', HOLD: 'hold', NOTE: 'note' })
export const ACTION_ORDER = [ACTION.REVISE, ACTION.EVIDENCE, ACTION.HOLD, ACTION.NOTE]
export const ACTION_VARIANT = Object.freeze({ revise: 'danger', evidence: 'warning', hold: 'neutral', note: 'info' })

const REVISE_RULES = new Set(['drug', 'absolute_comparison'])
// 객관적으로 확인되지 않은 효능 규칙 중 표현 자체가 문제인 말. 탄력, 윤기 같은 일반 표현은 여기에 넣지 않는다.
const REVISE_WORDS = /되돌|회춘|젊어|리프팅|안티에이징|재생/
const REVISE_STATUS = new Set(['mismatch', 'prohibited'])
const HOLD_STATUS = new Set(['unavailable', 'evidence_unread'])
// 대조 결과 상태 → 요청할 자료. 같은 자료는 요약에서 한 줄로 묶는다.
const MATERIAL_BY_STATUS = {
  evidence_missing: 'test',
  evidence_submitted: 'compare',
  evidence_mismatch: 'rightTest',
  evidence_conditions: 'rightTest',
  evidence_not_covering: 'test',
  not_found: 'report',
  ambiguous: 'report',
  restricted: 'amount',
  gmp_not_listed: 'gmp',
}

/** 이 문구에 필요한 자료 키 목록(중복 없음). */
// 기능성 보고 조회는 문구가 주름, 미백 같은 기능을 실제로 말할 때만 자료 요청이 된다.
// 성분 대조의 needs_input은 문구에 성분 이름이 없다는 뜻이라 요청할 자료가 아니다.
const relevant = (check) => check.type !== 'functional_report' || check.status === 'needs_input' || (check.detail?.claimedFunctions ?? []).length > 0
const material = (check) => (check.status === 'needs_input' ? (check.type === 'functional_report' ? 'report' : null) : MATERIAL_BY_STATUS[check.status])

export function materialsFor(finding) {
  const keys = (finding?.checks ?? []).filter(relevant).map(material).filter(Boolean)
  if ((finding?.rules ?? []).some((r) => r.id === 'official_endorsement')) keys.push('endorsement')
  return [...new Set(keys)]
}

export function actionFor(finding) {
  if (!finding) return ACTION.NOTE
  const checks = finding.checks ?? []
  const rules = (finding.rules ?? []).map((r) => r.id)
  // severity(검토 순서)만으로는 수정 권고로 올리지 않는다. high는 모델이 근거까지 보고 위험이 크다고 본 경우다.
  if (finding.severity === 'high' || rules.some((r) => REVISE_RULES.has(r)) || REVISE_WORDS.test(finding.phrase ?? '')
      || checks.some((c) => REVISE_STATUS.has(c.status)))
    return ACTION.REVISE
  if (materialsFor(finding).length) return ACTION.EVIDENCE
  if (checks.filter(relevant).some((c) => HOLD_STATUS.has(c.status)) || finding.legalSearch === 'failed') return ACTION.HOLD
  return ACTION.NOTE
}

/** 카드에 쓰는 "다음 행동" 한 줄. */
export function nextStepFor(finding) {
  const action = actionFor(finding)
  if (action === ACTION.EVIDENCE) {
    const names = materialsFor(finding).map((key) => t(`reviewActions.material.${key}`))
    return t('reviewActions.next.evidence', { materials: names.join(', ') })
  }
  return t(`reviewActions.next.${action}`)
}

export function actionLabel(action) {
  return t(`reviewActions.label.${action}`)
}
