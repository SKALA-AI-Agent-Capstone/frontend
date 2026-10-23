<!--
  제출 증빙과 광고 주장 대조 (FR-3, FR-10), 공공데이터 교차검증 (FR-4, NFR-10)
  1) 제출한 문서마다 무엇을 시험한 자료인지(목적, 측정 항목, 기간, 대상, 기관, 결과) 요약을 보여 준다.
  2) 실증이 필요한 광고 주장별로 증빙이 뒷받침하는지, 다른 시험인지, 조건이 다른지, 다루지 않는지 센다.
  3) 읽지 못한 문서는 이유(페이지 한도, 파일 형식, 원본 만료)를 문장으로 보여 준다.
  대조 결과는 어떤 서류를 더 받아야 하는지 알려 주는 것이지 위반 판정이 아니다.
  서류 목록에는 이 검토와 함께 올린 파일과, 제품에 등록해 검토마다 함께 들어가는 제품 증빙을 모두 보여 준다.
  분석 결과(evidence.documents)에 없는 서류는 "이번 분석에 쓰이지 않음"으로 표시한다.
-->
<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { DOC_TYPE_LABEL } from '@/shared/constants/review'
import { useProductEvidenceStore } from '@/shared/stores/productEvidence'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import PublicDataResult from '@/shared/components/review/PublicDataResult.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'

const { review, version, result, findings, focusFinding } = useReviewDetail()

const evidence = computed(() => result.value?.evidence ?? {})
const summaries = computed(() => evidence.value.summaries ?? [])
const documents = computed(() => evidence.value.documents ?? [])
const failures = computed(() => evidence.value.failures ?? [])
const VERDICTS = ['supports', 'different_test', 'condition_mismatch', 'not_covered']
const VERDICT_VARIANT = { supports: 'success', different_test: 'danger', condition_mismatch: 'warning', not_covered: 'warning' }
const matches = computed(() =>
  (evidence.value.claimMatches ?? []).map((m) => ({ ...m, phrase: findings.value.find((f) => f.id === m.findingId)?.phrase ?? '' })),
)
const tally = computed(() => VERDICTS.map((v) => [v, matches.value.filter((m) => m.verdict === v).length]).filter(([, n]) => n))
const problems = computed(() => matches.value.filter((m) => m.verdict !== 'supports'))
const readOf = (id) => documents.value.find((d) => d.id === id)

// 제품에 등록된 증빙: 분석이 가져가지 않았어도 무엇이 등록되어 있는지 보여 준다
const productEvidence = useProductEvidenceStore()
const productId = computed(() => review.value?.productId ?? '')
watch(productId, (id, before) => {
  if (before) productEvidence.clear(before)
  if (id) productEvidence.load(id).catch(() => { /* 못 받으면 분석 결과의 서류만 보여 준다 */ })
}, { immediate: true })
onBeforeUnmount(() => { if (productId.value) productEvidence.clear(productId.value) })

// 이 검토와 함께 올린 파일, 분석이 쓴 제품 증빙, 제품에 등록되어 있지만 분석이 쓰지 않은 증빙 순서
const submitted = computed(() => {
  const uploaded = (version.value?.input?.evidence ?? []).map((doc) => ({ ...doc, source: 'review', used: Boolean(readOf(doc.id)) }))
  const seen = new Set(uploaded.map((doc) => doc.id))
  const usedProduct = documents.value.filter((doc) => !seen.has(doc.id))
    .map((doc) => ({ id: doc.id, name: doc.name, docType: doc.docType, source: 'product', used: true }))
  usedProduct.forEach((doc) => seen.add(doc.id))
  const registered = (productId.value ? productEvidence.list(productId.value) : [])
    .filter((item) => item.isCurrent && item.status !== 'failed' && !seen.has(item.id))
    .map((item) => ({ id: item.id, name: item.fileName, docType: item.docType, source: 'product', used: false }))
  return [...uploaded, ...usedProduct, ...registered]
})
const analyzed = computed(() => version.value?.status === 'done')
const unusedProductCount = computed(() => submitted.value.filter((doc) => doc.source === 'product' && !doc.used).length)
</script>

<template>
  <BaseCard tag="section" class="evidence" aria-labelledby="evidence-title">
    <BaseSectionHeader :title="$t('reviewDetail.evidence.title')" heading-id="evidence-title" size="md" />

    <p v-if="!submitted.length" class="evidence__muted">{{ $t('reviewDetail.evidence.submittedNone') }}</p>

    <template v-else>
      <!-- 광고 주장별 대조 결과 -->
      <div v-if="matches.length" class="evidence__block">
        <p class="evidence__label">{{ $t('reviewDetail.evidence.matchTitle', { count: matches.length }) }}</p>
        <p class="evidence__tally">
          <BaseBadge v-for="[verdict, count] in tally" :key="verdict" :variant="VERDICT_VARIANT[verdict]">
            {{ $t(`reviewDetail.evidence.verdict.${verdict}`) }} {{ count }}
          </BaseBadge>
        </p>
        <ul v-if="problems.length" class="evidence__problems">
          <li v-for="m in problems" :key="m.findingId">
            <button type="button" class="evidence__phrase" @click="focusFinding(m.findingId)">"{{ m.phrase }}"</button>
            <span>{{ m.reason }}</span>
            <span v-if="m.needed" class="evidence__needed">{{ $t('reviewDetail.evidence.needed', { what: m.needed }) }}</span>
          </li>
        </ul>
      </div>
      <p v-else-if="documents.length" class="evidence__muted">{{ $t('reviewDetail.evidence.noClaims') }}</p>

      <!-- 제출 문서별 요약 -->
      <div class="evidence__block">
        <p class="evidence__label">{{ $t('reviewDetail.evidence.submitted') }}</p>
        <p v-if="analyzed && unusedProductCount" class="evidence__muted">{{ $t('reviewDetail.evidence.productNotUsed', { count: unusedProductCount }) }}</p>
        <article v-for="doc in submitted" :key="doc.id" class="doc">
          <p class="doc__head">
            <BaseIcon :name="doc.source === 'product' ? 'inventory_2' : 'description'" size="xs" />
            <strong>{{ doc.name }}</strong>
            <span class="evidence__muted">{{ DOC_TYPE_LABEL[doc.docType] ?? doc.docType }}</span>
            <BaseBadge v-if="doc.source === 'product'" variant="secondary">{{ $t('reviewDetail.evidence.fromProduct') }}</BaseBadge>
            <BaseBadge v-if="analyzed && !doc.used" variant="warning">{{ $t('reviewDetail.evidence.notUsed') }}</BaseBadge>
            <span v-if="readOf(doc.id)" class="evidence__muted">{{ $t('reviewDetail.evidence.read', { pages: readOf(doc.id).pages }) }}</span>
          </p>
          <dl v-if="summaries.find((s) => s.documentId === doc.id)" class="doc__summary">
            <template v-for="s in summaries.filter((x) => x.documentId === doc.id)" :key="s.documentId">
              <div><dt>{{ $t('reviewDetail.evidence.kind') }}</dt><dd>{{ $t(`reviewDetail.evidence.kinds.${s.kind}`) }}, {{ s.title }}</dd></div>
              <div v-if="s.measures.length"><dt>{{ $t('reviewDetail.evidence.measures') }}</dt><dd>{{ s.measures.join(', ') }}</dd></div>
              <div v-if="s.period"><dt>{{ $t('reviewDetail.evidence.period') }}</dt><dd>{{ s.period }}</dd></div>
              <div v-if="s.subjects"><dt>{{ $t('reviewDetail.evidence.subjects') }}</dt><dd>{{ s.subjects }}</dd></div>
              <div v-if="s.institution"><dt>{{ $t('reviewDetail.evidence.institution') }}</dt><dd>{{ s.institution }}</dd></div>
              <div v-if="s.result"><dt>{{ $t('reviewDetail.evidence.result') }}</dt><dd>{{ s.result }}</dd></div>
            </template>
          </dl>
          <p
            v-for="failure in failures.filter((f) => f.documentId === doc.id)"
            :key="`${failure.code}:${failure.page ?? ''}`"
            class="doc__failure"
          >
            {{ $t(`reviewDetail.evidence.failure.${failure.code}`, { page: failure.page ?? '' }) }}
          </p>
        </article>
        <details v-if="evidence.text" class="evidence__text">
          <summary>{{ $t('reviewDetail.evidence.text') }}</summary>
          <pre>{{ evidence.text }}</pre>
        </details>
      </div>
    </template>

    <div class="evidence__block">
      <p class="evidence__label">{{ $t('reviewDetail.evidence.publicData') }}</p>
      <PublicDataResult :result="result.publicData" />
    </div>
  </BaseCard>
</template>

<style scoped>
.evidence {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.evidence__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.evidence__label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.evidence__muted {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.evidence__tally {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.evidence__problems {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  font-size: var(--font-size-body-s);
}
.evidence__problems li {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding: var(--space-sm) var(--space-md);
  border-left: 3px solid var(--color-warning-text);
  background: var(--color-bg-page);
}
.evidence__phrase {
  align-self: flex-start;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: left;
}
.evidence__needed {
  font-weight: var(--font-weight-bold);
}
.doc {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
}
.doc__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-body-s);
  overflow-wrap: anywhere;
}
.doc__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--space-xs) var(--space-md);
  margin: 0;
  font-size: var(--font-size-body-s);
}
.doc__summary dt {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.doc__summary dd {
  margin: 0;
}
.doc__failure {
  font-size: var(--font-size-body-s);
  color: var(--color-warning-text);
}
.evidence__text pre {
  max-height: 20rem;
  overflow: auto;
  white-space: pre-wrap;
  font-size: var(--font-size-detail-s);
}
</style>
