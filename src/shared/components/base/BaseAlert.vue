<script setup>
import { computed } from 'vue'
import { STATUS, STATUS_ICONS } from '@/shared/constants/status'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  variant: { type: String, default: STATUS.INFO }, // info | success | warning | danger | neutral
  icon: { type: String, default: null },
  title: { type: String, default: null },
})

const resolvedIcon = computed(() => props.icon ?? STATUS_ICONS[props.variant] ?? 'info')
</script>

<template>
  <div class="base-alert" :class="`base-alert--${variant}`" role="note">
    <BaseIcon :name="resolvedIcon" size="sm" class="base-alert__icon" />
    <div class="base-alert__body">
      <p v-if="title" class="base-alert__title">{{ title }}</p>
      <div class="base-alert__content"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.base-alert {
  --alert-bg: var(--color-bg-page);
  --alert-border: var(--color-border);
  --alert-accent: var(--color-text-secondary);

  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--alert-border);
  background: var(--alert-bg);
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.base-alert__icon {
  color: var(--alert-accent);
  margin-top: var(--space-2xs);
}
.base-alert__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.base-alert__title {
  color: var(--alert-accent);
  font-weight: var(--font-weight-bold);
}
.base-alert__content :deep(strong) {
  color: var(--color-text);
}

.base-alert--info {
  --alert-bg: var(--color-info-surface);
  --alert-border: var(--color-info-border);
  --alert-accent: var(--color-info-text);
}
.base-alert--success {
  --alert-bg: var(--color-success-surface);
  --alert-border: var(--color-success-border);
  --alert-accent: var(--color-success-text);
}
.base-alert--warning {
  --alert-bg: var(--color-warning-surface);
  --alert-border: var(--color-warning-border);
  --alert-accent: var(--color-warning-text);
}
.base-alert--danger {
  --alert-bg: var(--color-danger-surface);
  --alert-border: var(--color-danger-border);
  --alert-accent: var(--color-danger-text);
}
.base-alert--neutral {
  --alert-bg: var(--color-bg-muted);
  --alert-border: var(--color-border);
  --alert-accent: var(--color-text-secondary);
}
</style>
