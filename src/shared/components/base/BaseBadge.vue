<!--
  배지 (KRDS 레이아웃, 표현 / 배지)
  - 비대화형 요소로만 사용한다 (클릭 이벤트 금지)
  - 하나의 요소에 한 개의 배지만 사용한다
  - 배경색으로 주조색(Primary)을 사용하지 않는다 → primary variant 를 제공하지 않음
-->
<script setup>
import { STATUS } from '@/shared/constants/status'
import BaseIcon from './BaseIcon.vue'

defineProps({
  variant: { type: String, default: STATUS.NEUTRAL }, // neutral | secondary | info | success | warning | danger
  icon: { type: String, default: null },
  solid: { type: Boolean, default: false }, // 상태(success/warning/danger) 강조용
  dot: { type: Boolean, default: false },
})
</script>

<template>
  <span class="base-badge" :class="[`base-badge--${variant}`, { 'base-badge--solid': solid }]">
    <span v-if="dot" class="base-badge__dot" aria-hidden="true" />
    <BaseIcon v-if="icon" :name="icon" size="xs" />
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  --badge-bg: var(--color-bg-muted);
  --badge-fg: var(--color-text-secondary);
  --badge-border: var(--color-border);
  --badge-solid: var(--color-text-secondary);

  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--badge-border);
  background: var(--badge-bg);
  color: var(--badge-fg);
  font-size: var(--font-size-label-xs);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
  max-width: 100%;
  white-space: nowrap;
}
.base-badge--solid {
  background: var(--badge-solid);
  border-color: var(--badge-solid);
  color: var(--color-on-primary);
}
.base-badge__dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: var(--radius-full);
  background: currentColor;
}

.base-badge--secondary {
  --badge-bg: var(--color-secondary-subtle);
  --badge-fg: var(--color-secondary);
  --badge-border: var(--color-secondary-subtle);
  --badge-solid: var(--color-secondary);
}
.base-badge--info {
  --badge-bg: var(--color-info-surface);
  --badge-fg: var(--color-info-text);
  --badge-border: var(--color-info-border);
  --badge-solid: var(--color-info-text);
}
.base-badge--success {
  --badge-bg: var(--color-success-surface);
  --badge-fg: var(--color-success-text);
  --badge-border: var(--color-success-border);
  --badge-solid: var(--color-success);
}
.base-badge--warning {
  --badge-bg: var(--color-warning-surface);
  --badge-fg: var(--color-warning-text);
  --badge-border: var(--color-warning-border);
  --badge-solid: var(--color-warning-text);
}
.base-badge--danger {
  --badge-bg: var(--color-danger-surface);
  --badge-fg: var(--color-danger-text);
  --badge-border: var(--color-danger-border);
  --badge-solid: var(--color-danger-text);
}
</style>
