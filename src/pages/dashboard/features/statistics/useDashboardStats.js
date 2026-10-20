// 시안 krds_1 지표 카드 4종을 현재 테넌트의 실제 심의 데이터로 계산한다.
import { computed } from 'vue'
import { APPROVAL_STATE, REVIEW_STATUS, SEVERITY } from '@/shared/constants/review'
import { STATUS } from '@/shared/constants/status'
import { useCreditsStore } from '@/shared/stores/credits'
import { useReviewsStore } from '@/shared/stores/reviews'
import { formatNumber } from '@/shared/utils/format'

const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0)

export function useDashboardStats() {
  const reviews = useReviewsStore()
  const credits = useCreditsStore()

  const latest = computed(() => reviews.list.map((r) => reviews.latest(r)).filter((v) => v.status === REVIEW_STATUS.DONE))

  const counts = computed(() => {
    const done = latest.value
    const byState = (s) => done.filter((v) => v.approval.state === s).length
    return {
      total: reviews.list.length,
      done: done.length,
      approved: byState(APPROVAL_STATE.APPROVED),
      changes: byState(APPROVAL_STATE.CHANGES_REQUESTED) + byState(APPROVAL_STATE.REJECTED),
      pending: byState(APPROVAL_STATE.PENDING),
      highRisk: done.filter((v) => v.result.findings.some((f) => f.severity === SEVERITY.HIGH)).length,
      versions: reviews.list.reduce((n, r) => n + r.versions.length, 0),
    }
  })

  const legend = computed(() => [
    { label: `승인 ${pct(counts.value.approved, counts.value.done)}%`, variant: STATUS.SUCCESS },
    { label: `승인 대기 ${pct(counts.value.pending, counts.value.done)}%`, variant: STATUS.WARNING },
    { label: `수정, 반려 ${pct(counts.value.changes, counts.value.done)}%`, variant: STATUS.DANGER },
  ])

  const stats = computed(() => [
    {
      id: 'total',
      label: '자율심의 누적신청',
      status: { label: '정상 접수', icon: 'check_circle', variant: STATUS.SUCCESS },
      value: formatNumber(counts.value.total),
      unit: '건',
      valueVariant: 'default',
      footer: { label: '버전 포함 심의', value: `${formatNumber(counts.value.versions)}회` },
    },
    {
      id: 'approval',
      label: '승인 완료율',
      status: { label: '적합 기준', icon: 'verified', variant: STATUS.SUCCESS },
      value: String(pct(counts.value.approved, counts.value.done)),
      unit: '%',
      valueVariant: STATUS.SUCCESS,
      footer: { label: '승인 완료', value: `${counts.value.approved}건` },
    },
    {
      id: 'changes',
      label: '승인 대기 ,  수정 요청',
      status: { label: '주의/보완', icon: 'warning', variant: STATUS.WARNING },
      value: formatNumber(counts.value.pending + counts.value.changes),
      unit: '건',
      valueVariant: STATUS.WARNING,
      footer: { label: '수정, 반려', value: `${counts.value.changes}건` },
    },
    {
      id: 'risk',
      label: '위반 소지 높음 포함',
      status: { label: '위반 의심', icon: 'error', variant: STATUS.DANGER },
      value: formatNumber(counts.value.highRisk),
      unit: '건',
      valueVariant: STATUS.DANGER,
      footer: { label: '크레딧 잔액', value: `${formatNumber(credits.balance)} 크레딧` },
    },
  ])

  return { stats, legend }
}
