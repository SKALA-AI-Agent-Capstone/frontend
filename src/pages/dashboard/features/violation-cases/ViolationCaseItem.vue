<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <article class="case-item">
    <div class="case-item__head">
      <span class="case-item__type" :class="`case-item__type--${item.variant}`">
        <BaseIcon :name="item.icon" size="xs" />
        {{ item.type }}
      </span>
      <span class="case-item__basis">{{ item.basis }}</span>
    </div>
    <p class="case-item__quote">"{{ item.quote }}"</p>
    <p class="case-item__guide">
      <strong>{{ item.guideLabel }}:</strong> {{ item.guide }}
    </p>
  </article>
</template>

<style scoped>
.case-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.case-item__head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
}
.case-item__type {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.case-item__type--danger { color: var(--color-danger-text); }
.case-item__type--warning { color: var(--color-warning-text); }
.case-item__basis {
  color: var(--color-text-secondary);
}
.case-item__quote {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.case-item__guide {
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.case-item__guide strong {
  color: var(--color-primary);
}
</style>
