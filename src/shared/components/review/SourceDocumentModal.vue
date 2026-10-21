<!--
  근거 조항이 속한 문서의 적재 원문 전체 (NFR-8, 11)
  Agent가 rag-mcp Resource(regulation://corpus, regulation://documents)로 읽은 원문을 그대로 보여 주고,
  근거로 붙은 조항을 강조해 그 위치로 옮긴다. 근거에 남은 버전만 찾으며 다른 버전으로 바꾸지 않는다.
-->
<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import { request } from '@/shared/api/http'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import { formatDate } from '@/shared/utils/format'

const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
  basis: { type: Object, required: true },
})

const source = ref(null), error = ref(''), loading = ref(false)
const titleId = `source-document-${useId()}`
const body = ref(null)
const sourceUrl = computed(() => source.value?.source_url || props.basis.sourceUrl)

// 근거의 article은 "조문 제목 + 항호"라서 조문 제목이 같거나 그 뒤에 항호가 붙은 조각이 근거 조항이다.
// 별표 5와 별표 5 제2호처럼 여러 조각이 맞으면 가장 구체적인 조각 하나만 강조한다.
const basisSection = computed(() => {
  const article = props.basis.article ?? ''
  return (source.value?.sections ?? [])
    .map((part) => part.section)
    .filter((section) => section && (article === section || article.startsWith(`${section} `)))
    .reduce((best, section) => (section.length > best.length ? section : best), '')
})

async function load() {
  if (source.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const query = new URLSearchParams({ key: props.basis.sourceId, version: props.basis.version })
    source.value = await request(`/reference-documents?${query}`)
    await nextTick()
    body.value?.querySelector('.source-doc__section--basis')?.scrollIntoView({ block: 'center' })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(open, (isOpen) => { if (isOpen) load() })
</script>

<template>
  <BaseModal v-model:open="open" :labelledby="titleId" width="lg">
    <template #header="{ close }">
      <div class="source-doc__head">
        <div>
          <h2 :id="titleId">{{ source?.title ?? basis.sourceName }}</h2>
          <p class="source-doc__meta">
            {{ $t('ui.sourceDocument.meta', { version: basis.version, date: formatDate(source?.effective_from ?? basis.revisedAt) }) }}
          </p>
        </div>
        <button type="button" class="source-doc__close" :aria-label="$t('ui.close')" @click="close">
          <BaseIcon name="close" />
        </button>
      </div>
    </template>

    <div ref="body" class="source-doc">
      <p v-if="loading" class="source-doc__state">{{ $t('ui.sourceDocument.loading') }}</p>
      <BaseAlert v-else-if="error" variant="danger">{{ $t('ui.sourceDocument.loadError') }} {{ error }}</BaseAlert>
      <template v-else-if="source">
        <p class="source-doc__note">{{ $t('ui.sourceDocument.note') }}</p>
        <section
          v-for="(part, i) in source.sections"
          :key="i"
          class="source-doc__section"
          :class="{ 'source-doc__section--basis': basisSection && part.section === basisSection }"
        >
          <h3 v-if="part.section" class="source-doc__title">
            {{ part.section }}
            <span v-if="part.page" class="source-doc__page">p.{{ part.page }}</span>
          </h3>
          <p class="source-doc__text">{{ part.text }}</p>
        </section>
      </template>
    </div>

    <template #footer="{ close }">
      <BaseButton v-if="sourceUrl" variant="outline" :href="sourceUrl" external>
        {{ $t('ui.sourceDocument.official') }}
      </BaseButton>
      <BaseButton variant="outline" @click="close">{{ $t('ui.close') }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.source-doc__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}
.source-doc__head h2 {
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.source-doc__meta,
.source-doc__note,
.source-doc__state,
.source-doc__page {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.source-doc__close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-xl);
  height: var(--space-xl);
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.source-doc__close:hover {
  background: var(--color-bg-muted);
}
.source-doc {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.source-doc__section {
  padding: var(--space-xs) var(--space-sm);
  border-left: 3px solid transparent;
  border-radius: var(--radius-sm);
}
.source-doc__section--basis {
  border-left-color: var(--color-primary);
  background: var(--color-primary-subtle);
}
.source-doc__title {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.source-doc__text {
  font-size: var(--font-size-body-s);
  white-space: pre-line;
}
</style>
