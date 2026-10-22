<!-- 승인 대기 목록 (FR-6) — 분석 완료 + 승인 대기 상태의 최신 버전. 오래 기다린 건부터 보인다. -->
<script setup>
import { computed } from 'vue'
import { SEVERITY_LABEL, SEVERITY_ORDER } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { formatDateTime } from '@/shared/utils/format'

const reviews = useReviewsStore()
const waitedSince = ({ review, version }) => new Date(version.result.analyzedAt ?? review.updatedAt).getTime() || 0
const items = computed(() =>
  [...reviews.pendingApprovals].sort((a, b) => waitedSince(a) - waitedSince(b)),
)
const severityCounts = (version) =>
  SEVERITY_ORDER.map((severity) => ({
    severity,
    ...SEVERITY_LABEL[severity],
    count: version.result.findings.filter((f) => f.severity === severity).length,
  }))
</script>

<template>
  <section class="list" :aria-label="$t('approvals.listLabel')">
    <ul v-if="items.length" class="rows">
      <li v-for="{ review, version } in items" :key="review.id" class="row">
        <ReviewThumb :review="review" :version="version" />
        <div class="row__main">
          <RouterLink :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } }" class="row__name">
            {{ review.productName }}
          </RouterLink>
          <p class="row__meta">
            <span class="row__version">v{{ version.no }}</span>
            <span>{{ version.authorName ?? review.authorName ?? $t('dashboard.unknownAuthor') }}</span>
            <span>{{ $t('approvals.analyzedAt', { time: formatDateTime(version.result.analyzedAt) }) }}</span>
            <span v-if="version.no > 1" class="row__tag">{{ $t('approvals.revision') }}</span>
          </p>
        </div>
        <ul class="severity" :aria-label="$t('ui.severitySummary')">
          <li v-for="item in severityCounts(version)" :key="item.severity" class="severity__chip" :class="[`tone-${item.variant}`, { 'is-zero': !item.count }]">
            {{ item.short }} <strong>{{ item.count }}</strong>
          </li>
        </ul>
        <BaseButton variant="secondary" size="sm" icon-right="chevron_right" :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } }">
          {{ $t('approvals.review') }}
        </BaseButton>
      </li>
    </ul>
    <p v-else-if="!reviews.loaded" class="list__empty" role="status">{{ $t('common.listLoading') }}</p>
    <div v-else class="list__empty">
      <p class="list__empty-title">{{ $t('approvals.empty') }}</p>
      <p class="list__empty-text">{{ $t('approvals.emptyText') }}</p>
    </div>
  </section>
</template>

<style scoped>
.list {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  overflow: clip;
}
.rows { display: grid; }
.row {
  display: grid;
  /* 줄마다 따로 그리는 그리드라 칸 너비를 고정해 모든 줄을 맞춘다 */
  grid-template-columns: 56px minmax(0, 1fr) 240px 132px;
  align-items: center;
  gap: 20px;
  padding: 14px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color var(--transition-fast);
}
.row:last-child { border-bottom: 0; }
.row:hover { background: var(--color-bg-page); }
.row__name {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.row__name:hover { color: var(--color-primary); }
.row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin-top: 4px;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.row__version {
  padding: 0 6px;
  border-radius: 4px;
  background: var(--color-bg-muted);
  font-weight: var(--font-weight-bold);
}
.row__tag { color: var(--color-info-text); font-weight: var(--font-weight-bold); }

.severity { display: flex; justify-content: flex-end; gap: 6px; }
.row > :deep(.base-button) { justify-self: end; }
.severity__chip {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-detail-s);
  white-space: nowrap;
}
.severity__chip strong { margin-left: 2px; font-variant-numeric: tabular-nums; }
.tone-danger { background: var(--color-danger-surface); color: var(--color-danger-text); }
.tone-warning { background: var(--color-warning-surface); color: var(--color-warning-text); }
.tone-info { background: var(--color-info-surface); color: var(--color-info-text); }
.severity__chip.is-zero { background: var(--color-bg-muted); color: var(--color-text-secondary); }

.list__empty {
  display: grid;
  justify-items: center;
  gap: var(--space-sm);
  padding: 72px 24px;
  text-align: center;
}
.list__empty-title { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); }
.list__empty-text { color: var(--color-text-secondary); }

@media (max-width: 760px) {
  .row { grid-template-columns: 56px minmax(0, 1fr); gap: 12px 14px; padding: 14px 16px; }
  .severity { grid-column: 2; flex-wrap: wrap; justify-content: flex-start; }
  .row :deep(.base-button) { grid-column: 1 / -1; justify-self: stretch; }
}
</style>
