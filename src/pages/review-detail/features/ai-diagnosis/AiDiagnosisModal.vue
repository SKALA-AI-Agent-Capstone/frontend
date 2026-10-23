<!--
  AI 분석 진행 모달 — 서버가 알려 준 단계 완료 여부(steps)만으로 진행을 보여 준다.
  예상 시간, 기준 버전처럼 서버가 주지 않는 값은 표시하지 않는다.
-->
<script setup>
import { computed } from 'vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'

const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  review: { type: Object, required: true },
  version: { type: Object, required: true },
  subject: { type: Object, required: true }, // { title, meta }
  phase: { type: String, required: true }, // preparing | submission_failed | running | done | failed
  preparingMessage: { type: String, default: '' },
  steps: { type: Array, required: true }, // [{ id, title, description, state }]
  activity: { type: Object, default: () => ({}) }, // SSE: { tool, state, retry, live }
})

const emit = defineEmits(['history', 'background', 'view-result'])

const doneCount = computed(() => props.steps.filter((s) => s.state === 'done').length)
// 분석 중에는 아래 단계 목록이 진행을 보여 주므로 머리에는 아이콘을 두지 않는다(스피너가 두 번 돌지 않게).
const HEAD = {
  preparing: { icon: null, title: 'reviewDetail.modal.preparing', tone: 'running' },
  submission_failed: { icon: 'error', title: 'reviewDetail.modal.submissionFailed', tone: 'failed' },
  running: { icon: null, title: 'reviewDetail.modal.running', tone: 'running' },
  done: { icon: 'check_circle', title: 'reviewDetail.modal.done', tone: 'done' },
  failed: { icon: 'error', title: 'reviewDetail.modal.failed', tone: 'failed' },
}
const head = computed(() => HEAD[props.phase])
const STATE_TEXT = { done: 'reviewDetail.modal.state.done', running: 'reviewDetail.modal.state.running', pending: 'reviewDetail.modal.state.pending', failed: 'reviewDetail.modal.state.failed' }

function background() {
  open.value = false
  emit('background')
}
</script>

<template>
  <BaseModal v-model:open="open" labelledby="ai-diagnosis-title" @close="emit('background')">
    <template #header="{ close }">
      <div class="head" :class="`head--${head.tone}`">
        <span v-if="head.icon" class="head__icon"><BaseIcon :name="head.icon" size="md" /></span>
        <div class="head__text">
          <h2 id="ai-diagnosis-title">{{ $t(head.title) }}</h2>
          <p>{{ review.productName }} v{{ version.no }}</p>
        </div>
        <button type="button" class="head__close" :aria-label="$t('reviewDetail.modal.close')" @click="close">
          <BaseIcon name="close" size="md" />
        </button>
      </div>
    </template>

    <div class="body">
      <div class="file">
        <ReviewThumb :review="review" :version="version" />
        <div class="file__text">
          <p class="file__name">{{ subject.title }}</p>
          <p class="file__meta">{{ subject.meta }}</p>
        </div>
      </div>

      <div class="progress" aria-live="polite">
        <p class="progress__label">
          <i18n-t keypath="reviewDetail.modal.progress" scope="global"><template #total>{{ steps.length }}</template><template #done><strong>{{ $t('reviewDetail.modal.doneSteps', { count: doneCount }) }}</strong></template></i18n-t>
        </p>
        <ol class="progress__bar" aria-hidden="true">
          <li v-for="step in steps" :key="step.id" :class="`is-${step.state}`"></li>
        </ol>
        <p v-if="phase === 'running' && (activity.live || activity.tool || activity.retry)" class="activity">
          <span v-if="activity.live" class="activity__live">{{ $t('reviewDetail.modal.activity.live') }}</span>
          <span v-if="activity.tool" class="activity__tool" :class="`is-${activity.state}`">
            {{ $t('reviewDetail.modal.activity.now', { tool: $te(`reviewDetail.modal.activity.tools.${activity.tool}`) ? $t(`reviewDetail.modal.activity.tools.${activity.tool}`) : activity.tool }) }}
            ({{ $t(`reviewDetail.modal.activity.toolState.${activity.state}`) }})
          </span>
          <span v-if="activity.retry" class="activity__retry">{{ $t('reviewDetail.modal.activity.retry', { attempt: activity.retry }) }}</span>
        </p>
      </div>

      <ol class="steps">
        <li v-for="step in steps" :key="step.id" class="step" :class="`step--${step.state}`">
          <span class="step__mark" aria-hidden="true">
            <BaseIcon v-if="step.state === 'done'" name="check" size="xs" />
            <BaseIcon v-else-if="step.state === 'failed'" name="close" size="xs" />
          </span>
          <div class="step__text">
            <p class="step__title">{{ step.title }}</p>
            <p class="step__desc">{{ step.description }}</p>
          </div>
          <span class="step__state">{{ $t(STATE_TEXT[step.state]) }}</span>
        </li>
      </ol>

      <p v-if="phase === 'submission_failed'" class="note note--failed" role="alert">
        {{ version.error }} {{ $t('reviewDetail.modal.submissionRetryHint') }}
      </p>
      <p v-else-if="phase === 'preparing'" class="note" role="status">{{ preparingMessage }}</p>
      <p v-else-if="phase === 'failed'" class="note note--failed" role="alert">
        {{ version.error || $t('reviewDetail.modal.error') }} {{ $t('reviewDetail.modal.retryHint') }}
      </p>
      <p v-else-if="phase === 'running'" class="note">{{ $t('reviewDetail.modal.runningNote') }}</p>
      <p v-else class="note">{{ $t('reviewDetail.modal.doneNote') }}</p>
    </div>

    <template #footer>
      <template v-if="phase === 'preparing' || phase === 'submission_failed'">
        <BaseButton @click="background">{{ $t(phase === 'preparing' ? 'reviewDetail.modal.closeContinue' : 'reviewDetail.modal.close') }}</BaseButton>
      </template>
      <template v-else-if="phase === 'done'">
        <BaseButton variant="outline" @click="background">{{ $t('reviewDetail.modal.close') }}</BaseButton>
        <BaseButton icon-right="arrow_forward" @click="emit('view-result')">{{ $t('reviewDetail.modal.viewResult') }}</BaseButton>
      </template>
      <template v-else-if="phase === 'failed'">
        <BaseButton variant="outline" @click="emit('history')">{{ $t('reviewDetail.backToHistory') }}</BaseButton>
        <BaseButton @click="background">{{ $t('reviewDetail.modal.close') }}</BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="outline" @click="emit('history')">{{ $t('reviewDetail.backToHistory') }}</BaseButton>
        <BaseButton @click="background">{{ $t('reviewDetail.modal.closeContinue') }}</BaseButton>
      </template>
    </template>
  </BaseModal>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.head__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}
.head--done .head__icon { background: var(--color-success-surface); color: var(--color-success-text); }
.head--failed .head__icon { background: var(--color-danger-surface); color: var(--color-danger-text); }
.head__text { flex: 1; min-width: 0; }
.head__text h2 { font-size: var(--font-size-title-m); font-weight: var(--font-weight-bold); line-height: 1.35; }
.head__text p { font-size: var(--font-size-body-s); color: var(--color-text-secondary); overflow-wrap: anywhere; }
.head__close {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: var(--radius-md);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.head__close:hover { background: var(--color-bg-muted); color: var(--color-text); }

.body { display: grid; gap: 20px; }
.file {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: var(--color-bg-page);
}
.file__text { min-width: 0; }
.file__name { font-weight: var(--font-weight-bold); overflow-wrap: anywhere; }
.file__meta { margin-top: 2px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }

.progress { display: grid; gap: 8px; }
.progress__label { font-size: var(--font-size-body-s); color: var(--color-text-secondary); }
.progress__label strong { color: var(--color-text); }
.progress__bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.progress__bar li { height: 6px; border-radius: var(--radius-full); background: var(--color-bg-muted); transition: background-color 300ms ease; }
.progress__bar li.is-done { background: var(--color-primary); }
.progress__bar li.is-running { background: var(--color-primary-subtle); }
.progress__bar li.is-failed { background: var(--color-danger); }

.activity { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.activity__live { display: inline-flex; align-items: center; gap: 6px; font-weight: var(--font-weight-bold); color: var(--color-success-text); }
.activity__live::before { content: ''; width: 8px; height: 8px; border-radius: var(--radius-full); background: currentColor; }
.activity__tool { overflow-wrap: anywhere; }
.activity__tool.is-failed, .activity__retry { color: var(--color-danger-text); }

.steps { display: grid; }
.step {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  padding: 10px 0;
}
.step + .step { border-top: var(--border-width) solid var(--color-border); }
.step__mark {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-strong);
  color: var(--color-on-primary);
}
.step--done .step__mark { border-color: var(--color-primary); background: var(--color-primary); }
.step--running .step__mark { border-color: var(--color-primary); border-right-color: transparent; animation: spin 0.9s linear infinite; }
.step--failed .step__mark { border-color: var(--color-danger); background: var(--color-danger); }
.step__title { font-weight: var(--font-weight-bold); }
.step--pending .step__title { color: var(--color-text-secondary); }
.step__desc { margin-top: 2px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.step__state { font-size: var(--font-size-detail-s); font-weight: var(--font-weight-bold); color: var(--color-text-secondary); white-space: nowrap; }
.step--done .step__state { color: var(--color-primary-active); }
.step--running .step__state { color: var(--color-primary); }
.step--failed .step__state { color: var(--color-danger-text); }

.note { font-size: var(--font-size-body-s); color: var(--color-text-secondary); }
.note--failed { padding: 12px 14px; border-radius: var(--radius-md); background: var(--color-danger-surface); color: var(--color-danger-text); }

@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .step--running .step__mark { animation: none; }
}
</style>
