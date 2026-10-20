<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  stat: { type: Object, required: true },
})
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__head">
      <span class="stat-card__label">{{ stat.label }}</span>
      <span class="stat-card__status" :class="`tone--${stat.status.variant}`">
        <BaseIcon :name="stat.status.icon" size="xs" />
        {{ stat.status.label }}
      </span>
    </div>
    <p class="stat-card__value" :class="`tone--${stat.valueVariant}`">
      {{ stat.value }}<span class="stat-card__unit">{{ stat.unit }}</span>
    </p>
    <div class="stat-card__foot">
      <span>{{ stat.footer.label }}</span>
      <strong :class="stat.footer.variant && `tone--${stat.footer.variant}`">{{ stat.footer.value }}</strong>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.stat-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
}
.stat-card__label {
  color: var(--color-text-secondary);
}
.stat-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  font-weight: var(--font-weight-bold);
}
.stat-card__value {
  font-size: var(--font-size-heading-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-heading);
}
.stat-card__unit {
  margin-left: var(--space-xs);
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}
.stat-card__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.stat-card__foot strong {
  color: var(--color-text);
  text-align: right;
}

.stat-card .tone--success { color: var(--color-success-text); }
.stat-card .tone--warning { color: var(--color-warning-text); }
.stat-card .tone--danger { color: var(--color-danger-text); }
</style>
