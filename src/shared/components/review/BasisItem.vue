<!--
  대조한 조항 1건 (FR-2, NFR-8, 11)
  출처와 조항 번호를 한 줄로 보여 주고, 조문 원문과 바로 이어지는 조항은 펼쳐서 본다.
  규칙으로 붙은 조항의 설명은 카드에서 한 번만 보여 주므로 여기서는 검색으로 찾은 조항의 설명만 쓴다.
  조항이 속한 문서 전체는 '전체 원문 보기'로 연다(rag-mcp Resource).
-->
<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseDisclosure from '@/shared/components/base/BaseDisclosure.vue'
import { textMap } from '@/shared/i18n'

const SOURCE_TYPE_LABEL = textMap({
  law: 'common.sourceType.law',
  association: 'common.sourceType.association',
  guideline: 'common.sourceType.guideline',
  internal: 'common.sourceType.internal',
})
import { formatDate } from '@/shared/utils/format'
import { readableLegalText } from '@/shared/utils/legalText'
import SourceDocumentModal from './SourceDocumentModal.vue'

const props = defineProps({
  basis: { type: Object, required: true },
})
// 위임(하위 규정)과 인용만 이 조항을 읽는 데 필요하다. 이 조항을 인용하는 다른 조항은 목록만 길게 만든다.
const DIRECT = new Set(['cites', 'implements', 'implemented_by', 'annex'])
const exceptionTerms = computed(() => {
  if (!/\[별표\s*2\]/.test(props.basis.original ?? '')) return []
  const expression = props.basis.original.match(/금지 표현:\s*[·•]?\s*([^\n]+)/)?.[1] ?? ''
  return expression.match(/[가-힣]{2,}/g) ?? []
})
const relevance = (link) => exceptionTerms.value.filter((term) => link.original?.includes(term)).length
const related = computed(() => {
  const selected = new Map()
  for (const link of props.basis.related ?? []) {
    if (!DIRECT.has(link.relation)) continue
    const key = [link.sourceName, link.article, link.relation].join('|')
    if (!selected.has(key) || relevance(link) > relevance(selected.get(key))) selected.set(key, link)
  }
  return [...selected.values()]
})
// 근거에 문서 키와 버전이 있어야 같은 버전의 적재 원문을 찾을 수 있다.
const canOpenDocument = computed(() => Boolean(props.basis.sourceId && props.basis.version))
const documentOpen = ref(false)
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
      <blockquote class="basis__original">{{ readableLegalText(basis.original) }}</blockquote>
      <ul v-if="related.length" class="basis__related">
        <li v-for="(link, i) in related" :key="i">
          {{ $t(`checks.relation.${link.relation}`) }}: {{ link.sourceName }} {{ link.article }}
          <p v-if="relevance(link) > 0" class="basis__exception">
            {{ $t('ui.basis.exceptionDetail') }}: {{ readableLegalText(link.original) }}
          </p>
        </li>
      </ul>
      <p class="basis__meta">{{ $t('ui.basis.meta', { version: basis.version, date: formatDate(basis.revisedAt) }) }}</p>
      <BaseButton v-if="canOpenDocument" variant="ghost" size="sm" icon="article" class="basis__document" @click="documentOpen = true">
        {{ $t('ui.basis.showDocument') }}
      </BaseButton>
    </BaseDisclosure>
    <p v-else class="basis__no-original">{{ $t('ui.basis.noOriginal') }}</p>
    <SourceDocumentModal v-if="canOpenDocument" v-model:open="documentOpen" :basis="basis" />
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
.basis__document {
  align-self: flex-start;
  margin-top: var(--space-2xs);
}
.basis__exception {
  margin: var(--space-2xs) 0 0;
  white-space: pre-line;
  color: var(--color-text);
}
.basis__no-original,
.basis__meta {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
