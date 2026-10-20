<!-- 처리기한, 보완기한 등 페이지 메타 정보를 표시하는 칩 -->
<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  icon: { type: String, default: 'schedule' },
  variant: { type: String, default: 'neutral' }, // neutral | info
})
</script>

<template>
  <span class="info-chip" :class="`info-chip--${variant}`">
    <BaseIcon :name="icon" size="sm" />
    <span><slot /></span>
  </span>
</template>

<style scoped>
.info-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.info-chip :deep(strong) {
  color: var(--color-text);
}
.info-chip--info {
  border-color: var(--color-info-border);
  background: var(--color-info-surface);
  color: var(--color-text);
}
.info-chip--info :deep(.base-icon) {
  color: var(--color-primary);
}
.info-chip--info :deep(strong) {
  color: var(--color-danger-text);
}
</style>
