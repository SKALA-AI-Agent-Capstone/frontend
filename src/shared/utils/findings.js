import { REVIEW_STATUS, SEVERITY } from '@/shared/constants/review'

/** 분석이 끝난 버전의 고위험 문구 수. 목록 요약은 severityCounts를, 상세는 findings를 센다. 분석 전이면 null. */
export function highCount(version) {
  if (version.status !== REVIEW_STATUS.DONE) return null
  const result = version.result ?? {}
  if (result.severityCounts) return result.severityCounts[SEVERITY.HIGH] ?? 0
  return (result.findings ?? []).filter((f) => f.severity === SEVERITY.HIGH).length
}
