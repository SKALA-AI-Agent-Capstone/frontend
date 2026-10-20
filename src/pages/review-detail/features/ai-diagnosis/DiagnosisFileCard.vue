<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  subject: { type: Object, required: true }, // { title, ext, meta }
})
</script>

<template>
  <div class="file-card">
    <span class="file-card__thumb"><BaseIcon name="image" size="md" /></span>
    <div class="file-card__info">
      <p class="file-card__name">
        <span class="file-card__filename">{{ subject.title }}</span>
        <BaseBadge v-if="subject.ext">{{ subject.ext }}</BaseBadge>
      </p>
      <p class="file-card__meta">
        {{ subject.meta }}
      </p>
    </div>
    <BaseIcon name="lock" size="md" class="file-card__lock" aria-label="암호화 전송" />
  </div>
</template>

<style scoped>
.file-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.file-card__thumb {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-3xl);
  height: var(--space-3xl);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-primary);
}
.file-card__info {
  flex: 1;
  min-width: 0;
}
.file-card__name {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-title-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.file-card__filename {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-card__meta {
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.file-card__lock {
  color: var(--color-text-secondary);
}
</style>
