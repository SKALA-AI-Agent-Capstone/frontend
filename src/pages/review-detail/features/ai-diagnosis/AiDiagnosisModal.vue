<script setup>
import { computed } from 'vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseInfoChip from '@/shared/components/base/BaseInfoChip.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import BaseProgressBar from '@/shared/components/base/BaseProgressBar.vue'
import DiagnosisFileCard from './DiagnosisFileCard.vue'
import DiagnosisStepItem from './DiagnosisStepItem.vue'
import { DIAGNOSIS_META } from './diagnosisSteps.data'

const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  subject: { type: Object, default: null }, // { title, ext, meta }
  done: { type: Boolean, default: false },
  steps: { type: Array, required: true },
  totalProgress: { type: Number, required: true },
})

const emit = defineEmits(['history', 'background', 'view-result'])

const isDone = computed(() => props.done)

function background() {
  open.value = false
  emit('background')
}
</script>

<template>
  <BaseModal v-model:open="open" labelledby="ai-diagnosis-title" @close="emit('background')">
    <template #header="{ close }">
      <div class="diag-header">
        <span class="diag-header__icon"><BaseIcon name="rule" size="md" /></span>
        <div class="diag-header__text">
          <p class="diag-header__meta">
            <BaseBadge :variant="isDone ? 'success' : 'secondary'" dot>{{ isDone ? '사전 분석 완료' : DIAGNOSIS_META.badge }}</BaseBadge>
            <span>{{ DIAGNOSIS_META.caption }}</span>
          </p>
          <h2 id="ai-diagnosis-title" class="diag-header__title">{{ DIAGNOSIS_META.title }}</h2>
        </div>
        <BaseInfoChip icon="timer" class="diag-header__time">
          예상 소요시간 약 <strong>{{ DIAGNOSIS_META.estimatedSeconds }}초</strong>
        </BaseInfoChip>
        <button type="button" class="diag-header__close" aria-label="닫기" @click="close">
          <BaseIcon name="close" size="md" />
        </button>
      </div>
    </template>

    <div class="diag-body">
      <DiagnosisFileCard v-if="subject" :subject="subject" />

      <div class="diag-progress">
        <div class="diag-progress__head">
          <p class="diag-progress__label">
            전체 분석 진행률 <strong>{{ totalProgress }}%</strong>
          </p>
          <span class="diag-progress__db">{{ DIAGNOSIS_META.dbVersion }}</span>
        </div>
        <BaseProgressBar :value="totalProgress" :variant="isDone ? 'success' : 'primary'" label="전체 분석 진행률" />
      </div>

      <div class="diag-steps">
        <p class="diag-steps__label">세부 규정 심의 파이프라인</p>
        <ol class="diag-steps__list">
          <DiagnosisStepItem v-for="step in steps" :key="step.id" :step="step" />
        </ol>
      </div>

      <BaseAlert variant="neutral" icon="verified_user">
        <strong>{{ DIAGNOSIS_META.notice }}</strong>
        {{ isDone ? '기준으로 스크리닝을 완료했습니다.' : '기준으로 실시간 스크리닝 중입니다.' }}
      </BaseAlert>
    </div>

    <template #footer>
      <template v-if="isDone">
        <BaseButton variant="outline" @click="background">닫기</BaseButton>
        <BaseButton icon-right="arrow_forward" @click="emit('view-result')">진단 결과 확인</BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="outline" @click="emit('history')">심의 이력으로</BaseButton>
        <BaseButton icon="flip_to_back" @click="background">백그라운드로 실행</BaseButton>
      </template>
    </template>
  </BaseModal>
</template>

<style scoped>
.diag-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}
.diag-header__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
  color: var(--color-secondary);
}
.diag-header__text {
  flex: 1;
  min-width: 0;
}
.diag-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.diag-header__title {
  font-size: var(--font-size-title-l);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.diag-header__close {
  display: grid;
  place-items: center;
  width: var(--control-height-sm);
  height: var(--control-height-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}
.diag-header__close:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}

.diag-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.diag-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.diag-progress__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.diag-progress__label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.diag-progress__label strong {
  margin-left: var(--space-xs);
  font-size: var(--font-size-title-m);
  color: var(--color-primary);
}
.diag-progress__db {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.diag-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.diag-steps__label {
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.diag-steps__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .diag-header__time {
    display: none;
  }
}
</style>
