<script setup>
import { computed } from 'vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from './ViolationCard.vue'

const { violations, hitl, findingFor } = useReviewDetail()
const undecidedCount = computed(() => violations.value.filter((v) => !v.finalResolution).length)
</script>

<template>
  <section class="review-list" aria-labelledby="review-heading">
    <BaseSectionHeader
      title="문구 예비검토와 수정 제안"
      heading-id="review-heading"
      size="md"
      description="각 항목의 확인 이유를 검토하세요. 법령 근거는 아직 연결되지 않았습니다."
    >
      총 {{ violations.length }}개 문구 확인 항목
    </BaseSectionHeader>

    <BaseAlert v-if="hitl?.autoApproved" variant="success" icon="check_circle" title="위반 후보 0건, 시스템 자동 승인">
      사람의 판단이 필요한 문구가 없어 시스템이 자동으로 승인했습니다. 사람이 검토해서 승인한 것과는 구분됩니다.
    </BaseAlert>
    <BaseAlert v-else-if="undecidedCount > 0" variant="warning" icon="hourglass_empty">
      아직 결정하지 않은 문구 {{ undecidedCount }}건이 있습니다. 전부 결정해야 이 버전을 승인할 수 있습니다.
    </BaseAlert>

    <BaseEmptyState
      v-if="!violations.length && !hitl?.autoApproved"
      icon="task_alt"
      title="문구 확인 항목이 없습니다"
      description="미실행 또는 근거 미연결일 수 있습니다. 적합 판정을 의미하지 않습니다."
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
