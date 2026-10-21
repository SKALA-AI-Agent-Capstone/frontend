<!-- 원문에 탐지 문구를 번호와 함께 하이라이트 (클릭 시 해당 탐지 카드로 이동) -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  findings: { type: Array, required: true }, // 이 텍스트에서 나온 findings (start/end 기준)
  numberOf: { type: Function, required: true }, // finding → 화면 번호
  activeId: { type: String, default: null },
  interactive: { type: Boolean, default: true },
})
defineEmits(['select'])

const segments = computed(() => {
  const out = []
  let cursor = 0
  for (const f of [...props.findings].sort((a, b) => a.start - b.start)) {
    if (f.start > cursor) out.push({ text: props.text.slice(cursor, f.start) })
    out.push({ text: props.text.slice(f.start, f.end), finding: f })
    cursor = f.end
  }
  if (cursor < props.text.length) out.push({ text: props.text.slice(cursor) })
  return out
})
</script>

<template>
  <p class="highlighted">
    <template v-for="(seg, i) in segments" :key="i">
      <component
        :is="interactive ? 'button' : 'mark'"
        v-if="seg.finding"
        :type="interactive ? 'button' : undefined"
        class="mark"
        :class="[`mark--${seg.finding.severity}`, { 'mark--active': activeId === seg.finding.id }]"
        @click="interactive && $emit('select', seg.finding.id)"
      >
        <span class="mark__no" aria-hidden="true">{{ numberOf(seg.finding) }}</span>
        {{ seg.text }}
        <span class="sr-only">{{ $t('ui.findingNo', { no: numberOf(seg.finding) }) }}</span>
      </component>
      <template v-else>{{ seg.text }}</template>
    </template>
  </p>
</template>

<style scoped>
.highlighted {
  font-size: var(--font-size-body-m);
  white-space: pre-wrap;
  word-break: keep-all;
}
.mark {
  display: inline;
  padding: 0 var(--space-2xs);
  border-radius: var(--radius-xs);
  border-bottom: var(--space-2xs) solid currentColor;
  font: inherit;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}
mark.mark {
  cursor: default;
}
.mark__no {
  display: inline-grid;
  place-items: center;
  min-width: var(--icon-size-xs);
  height: var(--icon-size-xs);
  margin-right: var(--space-2xs);
  border-radius: var(--radius-full);
  background: currentColor;
  font-size: var(--font-size-label-xs);
  line-height: 1;
  vertical-align: text-top;
}
.mark__no {
  color: var(--color-on-primary);
}
.mark--high { background: var(--color-danger-surface); color: var(--color-danger-text); }
.mark--high .mark__no { background: var(--color-danger-text); }
.mark--medium { background: var(--color-warning-surface); color: var(--color-warning-text); }
.mark--medium .mark__no { background: var(--color-warning-text); }
.mark--low { background: var(--color-info-surface); color: var(--color-info-text); }
.mark--low .mark__no { background: var(--color-info-text); }
.mark--active {
  outline: var(--space-2xs) solid var(--color-text);
  outline-offset: var(--space-2xs);
}
</style>
