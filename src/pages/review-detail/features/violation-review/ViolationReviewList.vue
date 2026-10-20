<script setup>
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { computed } from 'vue'
import { legalSearch } from '@/shared/constants/legal'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from './ViolationCard.vue'

const { findings, result } = useReviewDetail()
const description = computed(() => `각 항목의 확인 이유를 검토하세요. ${legalSearch(result.value).summary}`)
</script>

<template>
  <section class="review-list" aria-labelledby="review-heading">
    <BaseSectionHeader
      title="문구 예비검토와 수정 제안"
      heading-id="review-heading"
      size="md"
      :description="description"
    >
      총 {{ findings.length }}개 문구 확인 항목
    </BaseSectionHeader>
    <BaseEmptyState
      v-if="!findings.length"
      icon="task_alt"
      title="문구 확인 항목이 없습니다"
      description="분석이 실행되지 않았거나 확인할 문구가 추출되지 않았을 수 있습니다. 적합 판정을 의미하지 않습니다."
    />
    <ViolationCard v-for="(finding, i) in findings" :key="finding.id" :finding="finding" :number="i + 1" />
  </section>
</template>

<style scoped>
.review-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.review-list :deep(.section-header) {
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
}
</style>
