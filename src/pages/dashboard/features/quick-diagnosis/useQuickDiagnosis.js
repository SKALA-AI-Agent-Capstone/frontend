// 신속 자율 진단기 — 정식 심의와 같은 탐지 엔진으로 미리보기 (크레딧 차감 없음)
import { computed, ref, watch } from 'vue'
import { detectFindings } from '@/shared/api/engine/detect'
import { SEVERITY, SEVERITY_LABEL } from '@/shared/constants/review'
import { STATUS } from '@/shared/constants/status'

export function useQuickDiagnosis() {
  const text = ref('')
  const result = ref(null)

  const canDiagnose = computed(() => text.value.trim().length > 0)

  // 문구가 바뀌면 이전 결과는 무효
  watch(text, () => {
    result.value = null
  })

  function diagnose() {
    if (!canDiagnose.value) return
    const findings = detectFindings(text.value, { kind: 'copy' })
    const has = (s) => findings.some((f) => f.severity === s)
    const level = has(SEVERITY.HIGH) ? STATUS.DANGER : findings.length ? STATUS.WARNING : STATUS.SUCCESS
    result.value = {
      level,
      matches: findings.map((f) => ({ term: f.phrase, level: SEVERITY_LABEL[f.severity].variant, reason: f.category })),
    }
  }

  return { text, result, canDiagnose, diagnose }
}
