<!--
  대조한 조항 1건 (FR-2, NFR-8, 11)
  출처와 조항 번호를 한 줄로 보여 주고, 조문 원문과 바로 이어지는 조항은 펼쳐서 본다.
  규칙으로 붙은 조항의 설명은 카드에서 한 번만 보여 주므로 여기서는 검색으로 찾은 조항의 설명만 쓴다.
-->
<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseDisclosure from '@/shared/components/base/BaseDisclosure.vue'
import { SOURCE_TYPE_LABEL } from '@/shared/data/standards.data'
import { formatDate } from '@/shared/utils/format'

const props = defineProps({
  basis: { type: Object, required: true },
})
// 위임(하위 규정)과 인용만 이 조항을 읽는 데 필요하다. 이 조항을 인용하는 다른 조항은 목록만 길게 만든다.
const DIRECT = new Set(['cites', 'implements', 'implemented_by', 'annex'])
const related = computed(() => (props.basis.related ?? []).filter((link) => DIRECT.has(link.relation)))
</script>

<template>
  <div class="basis">
    <p class="basis__head">
      <BaseBadge variant="secondary">{{ SOURCE_TYPE_LABEL[basis.sourceType] ?? $t('ui.basis.standard') }}</BaseBadge>
      <strong>{{ basis.sourceName }}</strong>
      <span>{{ basis.article }}</span>
    </p>
    <p v-if="!basis.ruleId && basis.plain" class="basis__plain">{{ basis.plain }}</p>
    <BaseDisclosure v-if="basis.original" :label="$t('ui.basis.showOriginal')">
      <blockquote class="basis__original">{{ basis.original }}</blockquote>
      <ul v-if="related.length" class="basis__related">
        <li v-for="(link, i) in related" :key="i">
          {{ $t(`checks.relation.${link.relation}`) }}: {{ link.sourceName }} {{ link.article }}
        </li>
      </ul>
      <p class="basis__meta">{{ $t('ui.basis.meta', { version: basis.version, date: formatDate(basis.revisedAt) }) }}</p>
    </BaseDisclosure>
    <p v-else class="basis__no-original">{{ $t('ui.basis.noOriginal') }}</p>
  </div>
</template>

<style scoped>
.basis {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-xs) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.basis:last-of-type {
  border-bottom: 0;
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
  white-space: pre-line;
}
.basis__related {
  margin: var(--space-xs) 0 0;
  padding-left: var(--space-lg);
  list-style: disc;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.basis__no-original,
.basis__meta {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
