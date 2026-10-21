<script setup>
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  buttonLabel: { type: String, default: null },
  buttonIcon: { type: String, default: null },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // md | lg
  count: { type: Number, default: 0 }, // 이미 올린 파일 수: 1개 이상이면 올림 상태로 표시
  filledTitle: { type: String, default: null }, // 올림 상태의 제목 (없으면 '파일 N개를 올렸습니다')
})

const emit = defineEmits(['select'])
const inputRef = ref(null)
const isDragging = ref(false)

function pick() {
  inputRef.value?.click()
}

function onChange(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) emit('select', files)
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('select', files)
}
</script>

<template>
  <div
    class="dropzone"
    :class="[`dropzone--${size}`, { 'dropzone--dragging': isDragging, 'dropzone--filled': count > 0 }]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <span class="dropzone__icon-wrap">
      <BaseIcon :name="count > 0 ? 'check_circle' : 'cloud_upload'" :size="size === 'lg' ? 'lg' : 'md'" />
    </span>
    <component :is="size === 'lg' ? 'h2' : 'p'" class="dropzone__title" aria-live="polite">
      {{ count > 0 ? (filledTitle ?? $t('ui.dropzone.filled', { count })) : title }}
    </component>
    <p v-if="description" class="dropzone__desc">{{ count > 0 ? $t('ui.dropzone.addMore') : description }}</p>
    <BaseButton
      :variant="size === 'lg' ? 'primary' : 'outline'"
      :size="size === 'lg' ? 'md' : 'sm'"
      :icon="buttonIcon"
      @click="pick"
    >
      {{ count > 0 ? $t('ui.dropzone.add') : (buttonLabel ?? $t('ui.dropzone.pick')) }}
    </BaseButton>
    <input
      ref="inputRef"
      class="sr-only"
      type="file"
      :accept="accept"
      :multiple="multiple"
      tabindex="-1"
      @change="onChange"
    />
    <slot />
  </div>
</template>

<style scoped>
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-sm);
  border: var(--border-width-strong) dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: var(--color-bg-page);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
.dropzone--md { padding: var(--space-lg); }
.dropzone--lg {
  padding: var(--space-4xl) var(--space-lg);
  gap: var(--space-md);
  background: var(--color-bg-surface);
}
.dropzone--dragging {
  border-color: var(--color-primary);
  background: var(--color-info-surface);
}
/* 파일을 올린 뒤: 실선 테두리와 옅은 파랑 바탕으로 올림 상태를 알린다 */
.dropzone--filled {
  border-style: solid;
  border-color: var(--color-primary);
  background: var(--color-info-surface);
}
.dropzone.dropzone--filled .dropzone__icon-wrap,
.dropzone.dropzone--filled .dropzone__title {
  color: var(--color-primary-active);
}
.dropzone__icon-wrap {
  color: var(--color-text-secondary);
}
.dropzone--lg .dropzone__icon-wrap {
  display: grid;
  place-items: center;
  width: var(--space-4xl);
  height: var(--space-4xl);
  border-radius: var(--radius-full);
  background: var(--color-info-surface);
  color: var(--color-primary);
}
.dropzone__title {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.dropzone--lg .dropzone__title {
  font-size: var(--font-size-title-l);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.dropzone__desc {
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
  max-width: var(--readable-width);
}
.dropzone--lg .dropzone__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
}
</style>
