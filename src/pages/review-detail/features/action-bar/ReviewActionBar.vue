<!-- 하단 고정 바 (시안 krds_3) — 수정안 반영 현황 ,  리포트(FR-9) ,  수정 후 재심의(FR-13) ,  삭제(FR-12) -->
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
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
    ? `위반 소지 ${findings.value.length}건 중 ${revisedCount.value}건 수정안 반영${ready.value ? ' — 재심의를 진행할 수 있습니다' : ''}`
    : '검토 후보가 없습니다. 법령 적합성을 확인한 결과는 아닙니다.',
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
      <BaseButton v-if="reviews.canDelete(review)" variant="ghost" icon="delete" @click="confirmOpen = true">삭제</BaseButton>
      <BaseButton
        variant="outline"
        icon="download"
        :to="{ name: ROUTE_NAMES.REVIEW_REPORT, params: { id: review.id }, query: { v: version.no } }"
      >
        심의 리포트
      </BaseButton>
      <BaseButton v-if="isLatest" :variant="recheckVariant" icon="send" @click="reviseAndRecheck">
        {{ revisedCount ? '수정안 참고해 새 파일 검토' : '새 파일로 재검토' }}
      </BaseButton>
    </div>
  </div>

  <BaseConfirmDialog v-model:open="confirmOpen" title="심의 건을 삭제할까요?" confirm-label="삭제" danger @confirm="remove">
    '{{ review.productName }}'의 모든 버전({{ review.versions.length }}개)과 판정, 근거, 승인 이력이 삭제되며 되돌릴 수 없습니다.
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
