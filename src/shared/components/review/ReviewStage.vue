<!--
  검토 진행 단계: 접수 > 분석 > 리포트를 점 세 개로 보이고, 지금 단계를 글자로 적는다.
  분석이 끝나면 결과가 곧 리포트다. 검토 전체 승인과 완료 상태는 2026-10-22에 없앴다.
-->
<script setup>
import { computed } from 'vue'
import { REVIEW_STATUS } from '@/shared/constants/review'

const props = defineProps({
  version: { type: Object, required: true },
})

const ANALYSIS = {
  [REVIEW_STATUS.QUEUED]: { text: 'ui.stage.queued', state: 'current' },
  [REVIEW_STATUS.ANALYZING]: { text: 'ui.stage.analyzing', state: 'current' },
  [REVIEW_STATUS.DONE]: { text: 'ui.stage.analyzed', state: 'done' },
  [REVIEW_STATUS.FAILED]: { text: 'ui.stage.failed', state: 'failed' },
}
const REPORT_READY = { text: 'ui.stage.report', state: 'done' }
const REPORT_WAITING = { text: 'ui.stage.report', state: 'waiting' }

const stages = computed(() => {
  const v = props.version
  const analysis = ANALYSIS[v.status] ?? { text: 'ui.stage.analysis', state: 'waiting' }
  const report = v.status === REVIEW_STATUS.DONE ? REPORT_READY : REPORT_WAITING
  return [{ key: 'submit', text: 'ui.stage.submitted', state: 'done' }, { key: 'analysis', ...analysis }, { key: 'report', ...report }]
})
// 글자로 보여 줄 대표 단계: 분석이 끝났으면 리포트, 아니면 분석 단계
const current = computed(() => (props.version.status === REVIEW_STATUS.DONE ? stages.value[2] : stages.value[1]))
</script>

<template>
  <div class="stage" :class="`is-${current.state}`">
    <ol class="steps" :aria-label="$t('ui.stage.label', { steps: stages.map((s) => $t(s.text)).join(', ') })">
      <li v-for="item in stages" :key="item.key" class="step" :class="`step--${item.state}`" aria-hidden="true"></li>
    </ol>
    <span class="stage__text">{{ $t(current.text) }}</span>
  </div>
</template>

<style scoped>
.stage { display: grid; gap: 6px; }
.steps { display: flex; align-items: center; }
.step {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  flex: none;
}
.step + .step { margin-left: 22px; }
.step + .step::before {
  content: '';
  position: absolute;
  right: 12px;
  top: 4px;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-border);
}
.step--done { background: var(--color-primary); }
.step--done + .step::before { background: var(--color-primary); }
.step--current { background: var(--color-warning); }
.step--failed { background: var(--color-danger); }
.stage__text { font-size: var(--font-size-detail-s); font-weight: var(--font-weight-bold); }
.stage.is-done .stage__text { color: var(--color-primary-active); }
.stage.is-current .stage__text { color: var(--color-warning-text); }
.stage.is-failed .stage__text { color: var(--color-danger-text); }
</style>
