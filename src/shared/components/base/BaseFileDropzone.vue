<script setup>
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseIcon from './BaseIcon.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  buttonLabel: { type: String, default: '컴퓨터에서 파일 선택' },
  buttonIcon: { type: String, default: null },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: false },
  size: { type: String, default: 'md' }, // md | lg
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
    :class="[`dropzone--${size}`, { 'dropzone--dragging': isDragging }]"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <span class="dropzone__icon-wrap">
      <BaseIcon name="cloud_upload" :size="size === 'lg' ? 'lg' : 'md'" />
    </span>
    <component :is="size === 'lg' ? 'h2' : 'p'" class="dropzone__title">{{ title }}</component>
    <p v-if="description" class="dropzone__desc">{{ description }}</p>
    <BaseButton
      :variant="size === 'lg' ? 'primary' : 'outline'"
      :size="size === 'lg' ? 'md' : 'sm'"
      :icon="buttonIcon"
      @click="pick"
    >
      {{ buttonLabel }}
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
