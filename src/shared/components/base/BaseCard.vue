<script setup>
defineProps({
  tag: { type: String, default: 'div' },
  padding: { type: String, default: 'lg' }, // none | md | lg | xl
  variant: { type: String, default: 'default' }, // default | danger | success | muted
  flat: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="tag"
    class="base-card"
    :class="[`base-card--pad-${padding}`, `base-card--${variant}`, { 'base-card--flat': flat }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.base-card {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-level-1);
}
.base-card--flat { box-shadow: none; }
.base-card--pad-none { padding: 0; }
.base-card--pad-md { padding: var(--space-md); }
.base-card--pad-lg { padding: var(--space-lg); }
.base-card--pad-xl { padding: var(--space-xl); }
@media (max-width: 600px) {
  .base-card--pad-xl { padding: var(--space-lg) var(--space-md); }
  .base-card--pad-lg { padding: var(--space-md); }
}

.base-card--muted {
  background: var(--color-bg-page);
}
.base-card--danger {
  border: var(--border-width-strong) solid var(--color-danger);
}
.base-card--success {
  background: var(--color-success-surface);
  border: var(--border-width-strong) solid var(--color-success);
}
</style>
