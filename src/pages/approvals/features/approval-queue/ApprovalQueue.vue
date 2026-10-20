<!-- 승인 대기 목록 (FR-6) — 분석 완료 + 승인 대기 상태의 최신 버전 -->
<script setup>
import { SEVERITY } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import SeveritySummary from '@/shared/components/review/SeveritySummary.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { formatDateTime } from '@/shared/utils/format'

const reviews = useReviewsStore()
const highCount = (version) => version.result.findings.filter((f) => f.severity === SEVERITY.HIGH).length
</script>

<template>
  <BaseEmptyState
    v-if="!reviews.pendingApprovals.length"
    icon="task_alt"
    title="승인 대기 중인 검토가 없습니다"
  />
  <ul v-else class="queue">
    <li v-for="{ review, version } in reviews.pendingApprovals" :key="review.id">
      <BaseCard tag="article" class="item" :aria-label="review.productName">
        <div class="item__main">
          <p class="item__title">
            {{ review.productName }} <span class="item__version">v{{ version.no }}</span>
          </p>
          <p class="item__meta">
            {{ review.id }} ,  작성 {{ version.authorName }} ,  분석 {{ formatDateTime(version.result.analyzedAt) }}
            <template v-if="version.no > 1"> ,  수정본 재검토</template>
          </p>
          <SeveritySummary :findings="version.result.findings" compact />
        </div>
        <BaseButton
          :variant="highCount(version) ? 'secondary' : 'outline'"
          icon-right="chevron_right"
          :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } }"
        >
          검토하기
        </BaseButton>
      </BaseCard>
    </li>
  </ul>
</template>

<style scoped>
.queue {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}
.item__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
}
.item__title {
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
}
.item__version {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.item__meta {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
