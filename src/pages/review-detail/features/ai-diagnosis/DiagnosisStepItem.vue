<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  step: { type: Object, required: true }, // { title, description, currentPhrase?, progress, state }
})

const STATE_VIEW = {
  done: { icon: 'check', badge: '완료', variant: 'success' },
  running: { icon: 'progress_activity', badge: '진행 중', variant: 'primary' },
  pending: { icon: 'schedule', badge: '대기 중', variant: 'neutral' },
}

const view = computed(() => STATE_VIEW[props.step.state])
const badgeText = computed(() =>
  props.step.state === 'pending' ? view.value.badge : `${view.value.badge} (${Math.round(props.step.progress)}%)`,
)
</script>

<template>
  <li class="step-item" :class="`step-item--${step.state}`">
    <span class="step-item__icon">
      <BaseIcon :name="view.icon" size="sm" />
    </span>
    <div class="step-item__body">
      <div class="step-item__head">
        <p class="step-item__title">{{ step.title }}</p>
        <BaseBadge :variant="view.variant">{{ badgeText }}</BaseBadge>
      </div>
      <p class="step-item__desc">
        {{ step.state === 'running' && step.runningDescription ? step.runningDescription : step.description }}
      </p>
      <p v-if="step.state === 'running' && step.currentPhrase" class="step-item__phrase">
        <BaseIcon name="find_in_page" size="sm" />
        현재 대조 문구: "{{ step.currentPhrase }}"
      </p>
    </div>
  </li>
</template>

<style scoped>
.step-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.step-item--running {
  border: var(--border-width-strong) solid var(--color-primary);
  background: var(--color-bg-surface);
}
.step-item--pending {
  opacity: 0.6;
}
.step-item__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-xl);
  height: var(--space-xl);
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}
.step-item--done .step-item__icon {
  background: var(--color-success);
  color: var(--color-on-primary);
}
.step-item--running .step-item__icon {
  background: var(--color-info-surface);
  color: var(--color-primary);
}
.step-item--running .step-item__icon :deep(.base-icon) {
  animation: spin 1s linear infinite;
}
.step-item__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}
.step-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}
.step-item__title {
  font-size: var(--font-size-title-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.step-item--running .step-item__title {
  color: var(--color-primary);
}
.step-item__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.step-item__phrase {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
