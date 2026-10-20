<script setup>
import { formatDate } from '@/shared/utils/format'

defineProps({
  notice: { type: Object, required: true },
})
</script>

<template>
  <li class="notice-item">
    <div class="notice-item__body">
      <a href="#" class="notice-item__title">
        <span class="notice-item__category">[{{ notice.category }}]</span>
        {{ notice.title }}
      </a>
      <p class="notice-item__summary">{{ notice.summary }}</p>
    </div>
    <time :datetime="notice.date" class="notice-item__date">{{ formatDate(notice.date) }}</time>
  </li>
</template>

<style scoped>
.notice-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.notice-item:last-child {
  border-bottom: 0;
}
.notice-item__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}
.notice-item__title {
  font-size: var(--font-size-label-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.notice-item__title:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
.notice-item__category {
  margin-right: var(--space-xs);
  font-size: var(--font-size-detail-s);
  color: var(--color-primary);
}
.notice-item__summary {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.notice-item__date {
  flex-shrink: 0;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .notice-item {
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>
