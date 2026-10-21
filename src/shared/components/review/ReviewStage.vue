<!--
  검토 진행 단계: 접수 > 분석 > 검토자 결정을 점 세 개로 보이고, 지금 단계를 글자로 적는다.
  상태 문구는 review.js의 처리, 승인 상태와 같은 뜻으로 쓴다.
-->
<script setup>
import { computed } from 'vue'
import { APPROVAL_STATE, REVIEW_STATUS } from '@/shared/constants/review'

const props = defineProps({
  version: { type: Object, required: true },
})

const ANALYSIS = {
  [REVIEW_STATUS.QUEUED]: { text: 'ui.stage.queued', state: 'current' },
  [REVIEW_STATUS.ANALYZING]: { text: 'ui.stage.analyzing', state: 'current' },
  [REVIEW_STATUS.DONE]: { text: 'ui.stage.analyzed', state: 'done' },
  [REVIEW_STATUS.FAILED]: { text: 'ui.stage.failed', state: 'failed' },
}
const DECISION = {
  [APPROVAL_STATE.PENDING]: { text: 'ui.stage.pending', state: 'current' },
  [APPROVAL_STATE.APPROVED]: { text: 'ui.stage.approved', state: 'done' },
  [APPROVAL_STATE.CHANGES_REQUESTED]: { text: 'ui.stage.changes', state: 'failed' },
  [APPROVAL_STATE.REJECTED]: { text: 'ui.stage.rejected', state: 'failed' },
}
const WAITING = { text: 'ui.stage.decision', state: 'waiting' }

const stages = computed(() => {
  const v = props.version
  const analysis = ANALYSIS[v.status] ?? { text: 'ui.stage.analysis', state: 'waiting' }
  const decision = v.status === REVIEW_STATUS.DONE ? DECISION[v.approval?.state] ?? WAITING : WAITING
  return [{ key: 'submit', text: 'ui.stage.submitted', state: 'done' }, { key: 'analysis', ...analysis }, { key: 'decision', ...decision }]
})
// 글자로 보여 줄 대표 단계: 분석이 끝났으면 검토자 결정, 아니면 분석 단계
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
