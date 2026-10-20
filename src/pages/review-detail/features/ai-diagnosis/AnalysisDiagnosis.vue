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
import { formatFileSize, formatNumber } from '@/shared/utils/format'
import { useReviewDetail } from '../../composables/useReviewDetail'
import AiDiagnosisModal from './AiDiagnosisModal.vue'
import DiagnosisBackgroundStatus from './DiagnosisBackgroundStatus.vue'

const { review, version } = useReviewDetail()
const router = useRouter()

const running = computed(() => [REVIEW_STATUS.QUEUED, REVIEW_STATUS.ANALYZING].includes(version.value.status))
const done = computed(() => version.value.status === REVIEW_STATUS.DONE)
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

const steps = computed(() =>
  ANALYSIS_STEPS.map((step, i) => {
    const progress = version.value.steps[i] ?? 0
    return { ...step, progress, state: progress >= 100 ? 'done' : progress > 0 ? 'running' : 'pending' }
  }),
)
const totalProgress = computed(() => Math.round(steps.value.reduce((s, x) => s + x.progress, 0) / steps.value.length))

const subject = computed(() => {
  const file = version.value.input.files[0]
  if (file) {
    return {
      title: file.name,
      ext: file.name.split('.').pop()?.toUpperCase(),
      meta: `파일 크기: ${formatFileSize(file.size)} • 광고물 ${version.value.input.files.length}건 • 텍스트 ${formatNumber(version.value.input.copy.length)}자`,
    }
  }
  return { title: review.value.productName, ext: 'TEXT', meta: `광고 문구 ${formatNumber(version.value.input.copy.length)}자 • v${version.value.no}` }
})

function background() {
  open.value = false
  dismissed.value = true
}
</script>

<template>
  <DiagnosisBackgroundStatus
    v-if="dismissed && running && !open"
    :done="done"
    :total-progress="totalProgress"
    :file-name="subject.title"
    @open="open = true"
  />
  <AiDiagnosisModal
    v-model:open="open"
    :subject="subject"
    :done="done"
    :steps="steps"
    :total-progress="totalProgress"
    @background="background"
    @history="router.push({ name: ROUTE_NAMES.HISTORY })"
    @view-result="open = false"
  />
</template>
