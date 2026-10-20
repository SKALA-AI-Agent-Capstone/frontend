<!-- 뷰어 하단 조작 도구 막대 (확대, 축소, 원본 크기, 오버레이 토글) -->
<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const zoom = defineModel('zoom', { type: Number, required: true })
const overlay = defineModel('overlay', { type: Boolean, required: true })

const props = defineProps({
  min: { type: Number, default: 100 },
  max: { type: Number, default: 200 },
  step: { type: Number, default: 25 },
})

function zoomIn() {
  zoom.value = Math.min(props.max, zoom.value + props.step)
}
function zoomOut() {
  zoom.value = Math.max(props.min, zoom.value - props.step)
}
</script>

<template>
  <div class="toolbar" role="toolbar" aria-label="광고물 뷰어 도구">
    <div class="toolbar__group">
      <button type="button" class="tool" @click="zoom = min">
        <span>{{ zoom }}%</span>
        <span class="sr-only">원본 크기로 복원</span>
      </button>
      <button type="button" class="tool" :disabled="zoom >= max" @click="zoomIn">
        <BaseIcon name="zoom_in" size="sm" />
        <span class="sr-only">확대</span>
      </button>
      <button type="button" class="tool" :disabled="zoom <= min" @click="zoomOut">
        <BaseIcon name="zoom_out" size="sm" />
        <span class="sr-only">축소</span>
      </button>
    </div>
    <button type="button" class="tool tool--toggle" :aria-pressed="overlay" @click="overlay = !overlay">
      <BaseIcon name="layers" size="sm" />
      오버레이 표시 {{ overlay ? 'ON' : 'OFF' }}
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.toolbar__group {
  display: flex;
  gap: var(--space-xs);
}
.tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-width: var(--touch-target);
  height: var(--touch-target);
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm-2);
  border: var(--border-width) solid var(--color-border-strong);
  background: var(--color-bg-surface);
  font-size: var(--font-size-label-xs);
  font-weight: var(--font-weight-bold);
}
.tool:hover:not(:disabled) {
  background: var(--color-bg-muted);
}
.tool:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
.tool--toggle[aria-pressed='true'] {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
