<!-- 첨부된 파일 목록 (파일 업로드 컴포넌트와 함께 사용) -->
<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  files: { type: Array, required: true }, // [{ name, size }]
})
defineEmits(['remove'])

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}
</script>

<template>
  <ul v-if="files.length" class="attachments" :aria-label="$t('ui.attachments.label')">
    <li v-for="(file, index) in files" :key="`${file.name}-${index}`" class="attachments__item">
      <BaseIcon name="draft" size="sm" class="attachments__icon" />
      <span class="attachments__name">{{ file.name }}</span>
      <span class="attachments__size">{{ formatSize(file.size) }}</span>
      <button type="button" class="attachments__remove" @click="$emit('remove', index)">
        <BaseIcon name="close" size="sm" />
        <span class="sr-only">{{ $t('ui.attachments.remove', { name: file.name }) }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
.attachments {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.attachments__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  font-size: var(--font-size-body-s);
}
.attachments__icon {
  color: var(--color-primary);
}
.attachments__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.attachments__size {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.attachments__remove {
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: var(--radius-sm-2);
  color: var(--color-text-secondary);
}
.attachments__remove:hover {
  background: var(--color-bg-muted);
  color: var(--color-danger-text);
}
</style>
