<!--
  판정 근거 1건 (FR-2, NFR-8, 11)
  쉬운 설명을 먼저 보여주고 원문 조항은 디스클로저로 병기, 출처, 버전, 개정일을 함께 표시한다.
-->
<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseDisclosure from '@/shared/components/base/BaseDisclosure.vue'
import { SOURCE_TYPE_LABEL } from '@/shared/data/standards.data'
import { formatDate } from '@/shared/utils/format'

defineProps({
  basis: { type: Object, required: true },
})
</script>

<template>
  <div class="basis">
    <p class="basis__head">
      <BaseBadge variant="secondary">{{ SOURCE_TYPE_LABEL[basis.sourceType] ?? $t('ui.basis.standard') }}</BaseBadge>
      <strong>{{ basis.sourceName }}</strong>
      <span>{{ basis.article }}</span>
    </p>
    <p class="basis__plain">{{ basis.plain }}</p>
    <BaseDisclosure v-if="basis.original" :label="$t('ui.basis.showOriginal')">
      <blockquote class="basis__original">{{ basis.original }}</blockquote>
    </BaseDisclosure>
    <p v-else class="basis__no-original">{{ $t('ui.basis.noOriginal') }}</p>
    <p class="basis__meta">{{ $t('ui.basis.meta', { version: basis.version, date: formatDate(basis.revisedAt) }) }}</p>
  </div>
</template>

<style scoped>
.basis {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.basis__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  font-size: var(--font-size-label-s);
}
.basis__head span {
  color: var(--color-text-secondary);
}
.basis__plain {
  font-size: var(--font-size-body-s);
}
.basis__original {
  margin: 0;
  color: var(--color-text);
}
.basis__no-original,
.basis__meta {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
