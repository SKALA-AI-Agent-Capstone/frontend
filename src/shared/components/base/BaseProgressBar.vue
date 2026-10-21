<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  variant: { type: String, default: 'primary' }, // primary | danger | success
  marker: { type: Number, default: null }, // 기준선 위치 (예: 승인 기준 90)
  label: { type: String, default: null },
})

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
const markerPercent = computed(() =>
  props.marker === null ? null : (props.marker / props.max) * 100,
)
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    :aria-label="label ?? $t('ui.progress')"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div class="progress__fill" :class="`progress__fill--${variant}`" :style="{ width: `${percent}%` }" />
    <span v-if="markerPercent !== null" class="progress__marker" :style="{ left: `${markerPercent}%` }" />
  </div>
</template>

<style scoped>
.progress {
  position: relative;
  height: var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  border: var(--border-width) solid var(--color-border);
}
.progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}
.progress__fill--primary { background: var(--color-primary); }
.progress__fill--danger { background: var(--color-danger-text); }
.progress__fill--success { background: var(--color-success); }
.progress__marker {
  position: absolute;
  top: calc(var(--space-xs) * -1);
  bottom: calc(var(--space-xs) * -1);
  width: var(--space-2xs);
  background: var(--color-text);
  transform: translateX(-50%);
}
</style>
