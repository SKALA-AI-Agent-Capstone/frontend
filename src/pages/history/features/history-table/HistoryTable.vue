<!-- 검토 이력 목록 (FR-9 재조회, 재다운로드, FR-12 개별 삭제) — 줄마다 썸네일, 진행 단계, 리포트와 삭제 -->
<script setup>
import { ref } from 'vue'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import ReviewStage from '@/shared/components/review/ReviewStage.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { formatDateTime } from '@/shared/utils/format'
import { highCount } from '@/shared/utils/findings'

defineProps({
  rows: { type: Array, required: true },
})

const reviews = useReviewsStore()
const target = ref(null)
const error = ref(null)


async function remove() {
  error.value = null
  try { await reviews.deleteReview(target.value.id); target.value = null }
  catch (e) { error.value = e.message; target.value = null }
}
</script>

<template>
  <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
  <ul class="rows" :aria-label="$t('history.title')">
    <li v-for="{ review, version } in rows" :key="review.id" class="row">
      <ReviewThumb :review="review" :version="version" />
      <div class="row__main">
        <RouterLink :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } }" class="row__name">
          {{ review.productName }}
        </RouterLink>
        <p class="row__meta">
          <span class="row__version">v{{ version.no }}</span>
          <span>{{ review.authorName ?? $t('dashboard.unknownAuthor') }}</span>
          <span>{{ formatDateTime(review.updatedAt) }}</span>
          <span v-if="review.campaign">{{ review.campaign.name }}</span>
          <span class="row__id">{{ review.id }}</span>
        </p>
      </div>
      <p class="row__risk" :class="{ 'is-high': highCount(version) > 0 }">
        <template v-if="highCount(version) !== null">{{ $t('review.severity.high') }} <strong>{{ highCount(version) }}</strong></template>
        <template v-else>-</template>
      </p>
      <ReviewStage :version="version" />
      <div class="row__actions">
        <BaseButton
          v-if="version.status === REVIEW_STATUS.DONE"
          variant="outline"
          size="sm"
          icon="download"
          :to="{ name: ROUTE_NAMES.REVIEW_REPORT, params: { id: review.id } }"
        >
          {{ $t('history.report') }}
        </BaseButton>
        <button v-if="reviews.canDelete(review)" type="button" class="row__delete" @click="target = review">
          <span class="sr-only">{{ review.productName }}</span> {{ $t('history.delete') }}
        </button>
      </div>
    </li>
  </ul>

  <BaseConfirmDialog
    :open="Boolean(target)"
    :title="$t('history.confirmOneTitle')"
    :confirm-label="$t('history.delete')"
    danger
    @update:open="(v) => !v && (target = null)"
    @confirm="remove"
  >
    {{ $t('history.confirmOneText', { name: target?.productName }) }}
  </BaseConfirmDialog>
</template>

<style scoped>
.rows { display: grid; }
.row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 176px 150px 168px;
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
.row__id { color: var(--color-text-disabled); }
.row__risk { font-size: var(--font-size-detail-s); color: var(--color-text-disabled); white-space: nowrap; }
.row__risk strong { font-size: var(--font-size-body-s); font-variant-numeric: tabular-nums; }
.row__risk.is-high { color: var(--color-danger-text); }
.row__actions { display: flex; justify-content: flex-end; align-items: center; gap: 4px; }
.row__delete {
  height: 40px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--radius-sm-2);
  background: none;
  font: inherit;
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.row__delete:hover { background: var(--color-danger-surface); color: var(--color-danger-text); }
.row__delete:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }

@media (max-width: 1180px) {
  .row { grid-template-columns: 56px minmax(0, 1fr) 150px 168px; }
  .row__risk { display: none; }
}
@media (max-width: 760px) {
  .row { grid-template-columns: 56px minmax(0, 1fr); gap: 12px 14px; padding: 14px 16px; }
  .row > .stage { grid-column: 2; grid-template-columns: auto 1fr; align-items: center; gap: 10px; }
  .row__actions { grid-column: 1 / -1; justify-content: stretch; }
  .row__actions > * { flex: 1; }
}
</style>
