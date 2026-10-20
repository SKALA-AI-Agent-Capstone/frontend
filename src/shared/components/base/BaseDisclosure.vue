<!-- 디스클로저 (KRDS) — 기본 축소 상태, 관련 정보 바로 아래에 배치 -->
<script setup>
import { ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

defineProps({
  label: { type: String, required: true },
})
const open = ref(false)
const panelId = `disclosure-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <div class="disclosure">
    <button type="button" class="disclosure__trigger" :aria-expanded="open" :aria-controls="panelId" @click="open = !open">
      <BaseIcon :name="open ? 'expand_less' : 'expand_more'" size="sm" />
      {{ label }}
    </button>
    <div v-show="open" :id="panelId" class="disclosure__panel"><slot /></div>
  </div>
</template>

<style scoped>
.disclosure__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  min-height: var(--touch-target);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.disclosure__trigger:hover {
  text-decoration: underline;
}
.disclosure__panel {
  padding: var(--space-sm) var(--space-md);
  border-left: var(--space-xs) solid var(--color-border-strong);
  background: var(--color-bg-page);
  font-size: var(--font-size-body-s);
}
</style>
