<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, required: true },
  description: { type: String, default: null },
})
</script>

<template>
  <div class="empty">
    <BaseIcon :name="icon" size="lg" class="empty__icon" />
    <p class="empty__title">{{ title }}</p>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-md);
  text-align: center;
}
.empty__icon {
  color: var(--color-text-secondary);
}
.empty__title {
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
}
.empty__desc {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
</style>
