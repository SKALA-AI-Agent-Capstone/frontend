<!-- 탭 (KRDS) — 선택 상태를 색상 외에 하단 바로도 구분, 사용 불가 탭 없음 -->
<script setup>
const model = defineModel({ type: [String, Number], required: true })

defineProps({
  tabs: { type: Array, required: true }, // [{ value, label, badge? }]
  label: { type: String, required: true },
})

function onKeydown(event, tabs, index) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
  model.value = tabs[next].value
  event.currentTarget.parentElement.children[next]?.focus()
}
</script>

<template>
  <div class="tabs" role="tablist" :aria-label="label">
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': model === tab.value }"
      :aria-selected="model === tab.value"
      :tabindex="model === tab.value ? 0 : -1"
      @click="model = tab.value"
      @keydown="onKeydown($event, tabs, index)"
    >
      {{ tab.label }}
      <span v-if="tab.badge" class="tabs__badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  border-bottom: var(--border-width) solid var(--color-border);
}
.tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: var(--control-height);
  padding: 0 var(--space-md);
  border-bottom: var(--space-xs) solid transparent;
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tabs__tab:hover {
  color: var(--color-text);
}
.tabs__tab--active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}
.tabs__badge {
  padding: 0 var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-muted);
  font-size: var(--font-size-label-xs);
  color: var(--color-text-secondary);
}
</style>
