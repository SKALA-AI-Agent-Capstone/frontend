<!-- 심각도별 탐지 건수 요약 -->
<script setup>
import { computed } from 'vue'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '@/shared/constants/review'

const props = defineProps({
  findings: { type: Array, required: true },
  compact: { type: Boolean, default: false },
})

const counts = computed(() =>
  SEVERITY_ORDER.map((severity) => ({
    severity,
    ...SEVERITY_LABEL[severity],
    count: props.findings.filter((f) => f.severity === severity).length,
  })),
)
</script>

<template>
  <ul class="severity-summary" :class="{ 'severity-summary--compact': compact }" :aria-label="$t('ui.severitySummary')">
    <li v-for="item in counts" :key="item.severity" class="severity-summary__item" :class="`tone-${item.variant}`">
      <span class="severity-summary__label">{{ compact ? item.short : item.label }}</span>
      <strong class="severity-summary__count">{{ item.count }}<span class="sr-only">{{ $t('ui.countUnit') }}</span></strong>
    </li>
  </ul>
</template>

<style scoped>
.severity-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-sm);
}
.severity-summary__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.severity-summary__label {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.severity-summary__count {
  font-size: var(--font-size-title-xl);
}
.tone-danger .severity-summary__count { color: var(--color-danger-text); }
.tone-warning .severity-summary__count { color: var(--color-warning-text); }
.tone-info .severity-summary__count { color: var(--color-info-text); }

.severity-summary--compact {
  display: flex;
  gap: var(--space-md);
}
.severity-summary--compact .severity-summary__item {
  flex-direction: row;
  align-items: baseline;
  gap: var(--space-xs);
  padding: 0;
  border: 0;
  background: none;
}
.severity-summary--compact .severity-summary__count {
  font-size: var(--font-size-label-s);
}
</style>
