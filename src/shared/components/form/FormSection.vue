<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'

defineProps({
  title: { type: String, required: true },
  aside: { type: String, default: null },
  columns: { type: Number, default: 2 }, // 데스크톱 그리드 열 수
})
</script>

<template>
  <BaseCard tag="section" padding="xl" class="form-section">
    <BaseSectionHeader :title="title" size="md" accent>{{ aside }}</BaseSectionHeader>
    <div class="form-section__grid" :style="{ '--form-columns': columns }">
      <slot />
    </div>
  </BaseCard>
</template>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.form-section :deep(.section-header) {
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
}
.form-section__grid {
  display: grid;
  grid-template-columns: repeat(var(--form-columns), minmax(0, 1fr));
  gap: var(--space-lg) var(--layout-gutter);
}
.form-section__grid > :deep(.span-full) {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .form-section {
    padding: var(--space-lg);
  }
  .form-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
