<!-- 검토 이력 목록 (FR-9 재조회, 재다운로드, FR-12 개별 삭제) -->
<script setup>
import { ref } from 'vue'
import { REVIEW_STATUS, SEVERITY } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import ReviewStatusBadge from '@/shared/components/review/ReviewStatusBadge.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { formatDateTime } from '@/shared/utils/format'

defineProps({
  rows: { type: Array, required: true },
})

const reviews = useReviewsStore()
const target = ref(null)
const error = ref(null)

const highCount = (version) =>
  version.status === REVIEW_STATUS.DONE ? version.result.findings.filter((f) => f.severity === SEVERITY.HIGH).length : null

async function remove() {
  error.value = null
  try { await reviews.deleteReview(target.value.id); target.value = null }
  catch (e) { error.value = e.message; target.value = null }
}
</script>

<template>
  <BaseAlert v-if="error" variant="danger">{{error}}</BaseAlert>
  <div class="table-wrap">
    <table class="history-table">
      <caption class="sr-only">검토 이력</caption>
      <thead>
        <tr>
          <th scope="col">제품 ,  캠페인</th>
          <th scope="col">버전</th>
          <th scope="col">상태</th>
          <th scope="col" class="num">위반 소지 높음</th>
          <th scope="col">작성자</th>
          <th scope="col">최근 변경</th>
          <th scope="col"><span class="sr-only">작업</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ review, version } in rows" :key="review.id">
          <td>
            <RouterLink :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } }" class="history-table__link">
              {{ review.productName }}
            </RouterLink>
            <p class="history-table__sub">{{ review.id }}<template v-if="review.campaign"> ,  {{ review.campaign.name }}</template></p>
          </td>
          <td>v{{ version.no }}</td>
          <td><ReviewStatusBadge :version="version" /></td>
          <td class="num">{{ highCount(version) ?? '-' }}</td>
          <td>{{ review.authorName }}</td>
          <td>{{ formatDateTime(review.updatedAt) }}</td>
          <td>
            <div class="history-table__actions">
              <BaseButton
                v-if="version.status === REVIEW_STATUS.DONE"
                variant="ghost"
                size="sm"
                icon="download"
                :to="{ name: ROUTE_NAMES.REVIEW_REPORT, params: { id: review.id } }"
              >
                리포트
              </BaseButton>
              <BaseButton v-if="reviews.canDelete(review)" variant="ghost" size="sm" icon="delete" @click="target = review">
                삭제
              </BaseButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <BaseConfirmDialog
    :open="Boolean(target)"
    title="검토 건을 삭제할까요?"
    confirm-label="삭제"
    danger
    @update:open="(v) => !v && (target = null)"
    @confirm="remove"
  >
    '{{ target?.productName }}'의 모든 버전과 판정, 근거, 승인 이력이 삭제되며 되돌릴 수 없습니다.
  </BaseConfirmDialog>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.history-table {
  width: 100%;
  min-width: 80rem;
  border-collapse: collapse;
  font-size: var(--font-size-body-s);
}
.history-table th,
.history-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}
.history-table th {
  background: var(--color-bg-page);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}
.history-table tbody tr:last-child td {
  border-bottom: 0;
}
/* KRDS 표: 숫자는 오른쪽 정렬 */
.history-table .num {
  text-align: right;
}
.history-table__link {
  font-weight: var(--font-weight-bold);
  text-decoration: underline;
}
.history-table__sub {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.history-table__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2xs);
}
</style>
