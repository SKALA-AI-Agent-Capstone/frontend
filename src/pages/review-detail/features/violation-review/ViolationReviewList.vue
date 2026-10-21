<script setup>
import { computed } from 'vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { legalSearch } from '@/shared/constants/legal'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from './ViolationCard.vue'
import { t } from '@/shared/i18n'

const { violations, hitl, findingFor, result } = useReviewDetail()
const undecidedCount = computed(() => violations.value.filter((v) => !v.finalResolution).length)
const description = computed(() => t('reviewDetail.list.description', { summary: legalSearch(result.value).summary }))
</script>

<template>
  <section class="review-list" aria-labelledby="review-heading">
    <BaseSectionHeader
      :title="$t('reviewDetail.list.title')"
      heading-id="review-heading"
      size="md"
      :description="description"
    >
      {{ $t('reviewDetail.list.total', { count: violations.length }) }}
    </BaseSectionHeader>

    <BaseAlert v-if="hitl?.autoApproved" variant="success" icon="check_circle" :title="$t('reviewDetail.list.autoTitle')">
      {{ $t('reviewDetail.list.autoText') }}
    </BaseAlert>
    <BaseAlert v-else-if="undecidedCount > 0" variant="warning" icon="hourglass_empty">
      {{ $t('reviewDetail.list.undecided', { count: undecidedCount }) }}
    </BaseAlert>

    <BaseEmptyState
      v-if="!violations.length && !hitl?.autoApproved"
      icon="task_alt"
      :title="$t('reviewDetail.list.emptyTitle')"
      :description="$t('reviewDetail.list.emptyText')"
    />
    <ViolationCard
      v-for="(violation, i) in violations"
      :key="violation.id"
      :violation="violation"
      :finding="findingFor(violation)"
      :number="i + 1"
    />
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
