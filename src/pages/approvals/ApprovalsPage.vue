<script setup>
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import ScreenTitle from '@/shared/components/layout/ScreenTitle.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import ApprovalQueue from './features/approval-queue/ApprovalQueue.vue'

const reviews = useReviewsStore()
</script>

<template>
  <div class="approvals-page">
    <ScreenTitle
      :title="$t('approvals.title')"
      :description="$t('approvals.description')"
      :count="reviews.pendingApprovals.length"
    >
      <template #note>
        <!-- NFR-2: 최종 책임은 승인자에게 있음을 화면에 밝힌다 -->
        <p class="approvals-page__note">
          <BaseIcon name="gavel" size="xs" />
          {{ $t('approvals.responsibility') }}
        </p>
      </template>
    </ScreenTitle>
    <ApprovalQueue />
  </div>
</template>

<style scoped>
.approvals-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}
.approvals-page__note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-warning-surface);
  color: var(--color-warning-text);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
}
</style>
