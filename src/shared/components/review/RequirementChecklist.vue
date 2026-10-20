<!-- 주장별 필요 서류 체크리스트 (FR-10) — 입력 화면 사전 안내와 결과 화면 증빙 대조에서 공용 -->
<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  requirements: { type: Array, required: true },
})
</script>

<template>
  <ul class="requirements">
    <li v-for="req in requirements" :key="req.claimType" class="requirement">
      <p class="requirement__claim">{{ req.claimLabel }}</p>
      <p v-if="req.prohibited" class="requirement__doc requirement__doc--prohibited">
        <BaseIcon name="block" size="xs" /> 증빙으로 허용되지 않는 표현 — 문구 수정 필요
      </p>
      <p
        v-for="doc in req.docs"
        :key="doc.docType"
        class="requirement__doc"
        :class="doc.provided ? 'requirement__doc--ok' : 'requirement__doc--missing'"
      >
        <BaseIcon :name="doc.provided ? 'check_circle' : 'radio_button_unchecked'" size="xs" />
        {{ doc.label }}
        <span class="sr-only">{{ doc.provided ? '제출됨' : '미제출' }}</span>
      </p>
    </li>
  </ul>
</template>

<style scoped>
.requirements {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.requirement {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.requirement__claim {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.requirement__doc {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-detail-m);
}
.requirement__doc--ok { color: var(--color-success-text); }
.requirement__doc--missing { color: var(--color-warning-text); }
.requirement__doc--prohibited { color: var(--color-danger-text); }
</style>
