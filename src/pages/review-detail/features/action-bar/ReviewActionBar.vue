<!-- 하단 고정 바 (시안 krds_3) — 수정안 반영 현황 ,  리포트(FR-9) ,  수정 후 재심의(FR-13) ,  삭제(FR-12) -->
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { t } from '@/shared/i18n'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import { useReviewDetail } from '../../composables/useReviewDetail'

const { review, version, isLatest, findings, decidedFindingIds, reviseAndRecheck } = useReviewDetail()
const reviews = useReviewsStore()
const session = useSessionStore()
const router = useRouter()
const confirmOpen = ref(false)
const error = ref(null)

const revisedCount = computed(() => findings.value.filter((f) => decidedFindingIds.value.has(f.id)).length)
const ready = computed(() => findings.value.length > 0 && revisedCount.value === findings.value.length)
// 한 화면 최상위 강조 버튼은 1개 — 승인 권한자는 승인 패널의 '승인'이 강조 버튼
const recheckVariant = computed(() => (session.can(PERMISSIONS.REVIEW_APPROVE) ? 'secondary' : 'primary'))

const statusText = computed(() =>
  findings.value.length
    ? t(ready.value ? 'reviewDetail.bar.ready' : 'reviewDetail.bar.progress', { total: findings.value.length, done: revisedCount.value })
    : t('reviewDetail.bar.none'),
)

async function remove() {
  error.value = null
  try { await reviews.deleteReview(review.value.id); confirmOpen.value = false; router.replace({ name: ROUTE_NAMES.HISTORY }) }
  catch (e) { error.value = e.message; confirmOpen.value = false }
}
</script>

<template>
  <BaseAlert v-if="error" variant="danger">{{error}}</BaseAlert>
  <div class="action-bar">
    <p class="action-bar__status" :class="{ 'action-bar__status--ready': ready || !findings.length }" aria-live="polite">
      <span class="action-bar__dot" aria-hidden="true" />
      {{ statusText }}
    </p>
    <div class="action-bar__buttons">
      <BaseButton v-if="reviews.canDelete(review)" variant="ghost" icon="delete" @click="confirmOpen = true">{{ $t('reviewDetail.bar.delete') }}</BaseButton>
      <BaseButton
        variant="outline"
        icon="download"
        :to="{ name: ROUTE_NAMES.REVIEW_REPORT, params: { id: review.id }, query: { v: version.no } }"
      >
        {{ $t('reviewDetail.bar.report') }}
      </BaseButton>
      <BaseButton v-if="isLatest" :variant="recheckVariant" icon="send" @click="reviseAndRecheck">
        {{ $t(revisedCount ? 'reviewDetail.bar.recheckRevised' : 'reviewDetail.bar.recheck') }}
      </BaseButton>
    </div>
  </div>

  <BaseConfirmDialog v-model:open="confirmOpen" :title="$t('reviewDetail.bar.confirmTitle')" :confirm-label="$t('reviewDetail.bar.delete')" danger @confirm="remove">
    {{ $t('reviewDetail.bar.confirmText', { name: review.productName, count: review.versions.length }) }}
  </BaseConfirmDialog>
</template>

<style scoped>
.action-bar {
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border: var(--border-width) solid var(--color-border);
  border-bottom: 0;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-level-3);
}
.action-bar__status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-body-s);
}
.action-bar__dot {
  width: var(--space-sm);
  height: var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-danger-text);
}
.action-bar__status--ready .action-bar__dot {
  background: var(--color-success);
}
.action-bar__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  /* 모바일에서는 화면을 가리지 않도록 고정 해제 */
  .action-bar {
    position: static;
    padding: var(--space-md);
    border-bottom: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-lg);
  }
  .action-bar__buttons,
  .action-bar__buttons > * {
    width: 100%;
  }
}
</style>
