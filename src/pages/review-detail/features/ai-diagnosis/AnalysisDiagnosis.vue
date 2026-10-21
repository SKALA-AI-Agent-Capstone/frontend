<!--
  AI 사전 진단 (시안 ai_krds) — 분석 중에는 모달로 단계별 진행률을 보여주고,
  '백그라운드로 실행' 시 화면 상단 안내로 전환한다 (NFR-1 비블로킹).
-->
<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ANALYSIS_STEPS } from '@/shared/api/analysisApi'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatFileSize } from '@/shared/utils/format'
import { t } from '@/shared/i18n'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useReviewDetail } from '../../composables/useReviewDetail'
import AiDiagnosisModal from './AiDiagnosisModal.vue'
import DiagnosisBackgroundStatus from './DiagnosisBackgroundStatus.vue'

const { review, version } = useReviewDetail()
const router = useRouter()
const reviews = useReviewsStore()
// SSE로 받은 최근 도구 실행과 재시도. 폴링으로 돌아간 경우에는 비어 있다.
const activity = computed(() => reviews.activity[review.value.id] ?? {})

const running = computed(() => [REVIEW_STATUS.QUEUED, REVIEW_STATUS.ANALYZING].includes(version.value.status))
const phase = computed(() => {
  if (running.value) return 'running'
  return version.value.status === REVIEW_STATUS.FAILED ? 'failed' : 'done'
})
const open = ref(running.value)
const dismissed = ref(false)

// 분석 중인 버전으로 들어오면 모달을 연다
watch(
  () => version.value.no,
  () => {
    open.value = running.value
    dismissed.value = false
  },
)

// 서버는 단계마다 완료(100) 여부만 알려 준다. 끝나지 않은 첫 단계를 진행 중(실패 시 중단)으로 본다.
const steps = computed(() => {
  const marks = version.value.steps ?? []
  const firstOpen = ANALYSIS_STEPS.findIndex((_, i) => (marks[i] ?? 0) < 100)
  return ANALYSIS_STEPS.map((step, i) => {
    let state = (marks[i] ?? 0) >= 100 || phase.value === 'done' ? 'done' : 'pending'
    if (state !== 'done' && i === firstOpen) state = phase.value === 'failed' ? 'failed' : 'running'
    return { ...step, state }
  })
})
const doneCount = computed(() => steps.value.filter((s) => s.state === 'done').length)

const subject = computed(() => {
  const files = version.value.input.files ?? []
  const evidence = version.value.input.evidence ?? []
  const first = files[0]
  const counts = [t('reviewDetail.modal.adFiles', { count: files.length }), evidence.length ? t('reviewDetail.modal.evidenceFiles', { count: evidence.length }) : null].filter(Boolean).join(', ')
  return {
    title: first?.name ?? review.value.productName,
    meta: first ? `${formatFileSize(first.size)}, ${counts}` : counts,
  }
})

function background() {
  open.value = false
  dismissed.value = true
}
</script>

<template>
  <DiagnosisBackgroundStatus
    v-if="dismissed && running && !open"
    :done-count="doneCount"
    :total="steps.length"
    :file-name="subject.title"
    @open="open = true"
  />
  <AiDiagnosisModal
    v-model:open="open"
    :review="review"
    :version="version"
    :subject="subject"
    :phase="phase"
    :steps="steps"
    :activity="activity"
    @background="background"
    @history="router.push({ name: ROUTE_NAMES.HISTORY })"
    @view-result="open = false"
  />
</template>
