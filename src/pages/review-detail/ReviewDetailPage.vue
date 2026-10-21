<!-- 위반사항 분석 및 보완 (시안 krds_3) -->
<script setup>
import { computed, ref, watch } from 'vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { request } from '@/shared/api/http'
import { legalSearch } from '@/shared/constants/legal'
import { APPROVAL_LABEL, REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { t } from '@/shared/i18n'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseInfoChip from '@/shared/components/base/BaseInfoChip.vue'
import BaseTabs from '@/shared/components/base/BaseTabs.vue'
import PageHeading from '@/shared/components/layout/PageHeading.vue'
import { provideReviewDetail } from './composables/useReviewDetail'
import ReviewActionBar from './features/action-bar/ReviewActionBar.vue'
import AdViewer from './features/ad-viewer/AdViewer.vue'
import OriginalPreview from './features/ad-viewer/OriginalPreview.vue'
import VisualReviewSection from './features/visual-review/VisualReviewSection.vue'
import AnalysisDiagnosis from './features/ai-diagnosis/AnalysisDiagnosis.vue'
import ApprovalPanel from './features/approval/ApprovalPanel.vue'
import EvidenceCheckSection from './features/evidence-check/EvidenceCheckSection.vue'
import PatentCheckSection from './features/patent-check/PatentCheckSection.vue'
import StatusSummary from './features/status-summary/StatusSummary.vue'
import { warningLines } from '@/shared/utils/warnings'
import ViolationReviewList from './features/violation-review/ViolationReviewList.vue'
import TileReview from './features/tile-review/TileReview.vue'

const { review, version, versionNo, isDone, tileMode } = provideReviewDetail()
const credits = useCreditsStore()
const charge = ref(null)
const balanceLoaded = ref(false)
watch([() => review.value?.id, versionNo, () => version.value?.status], async ([id, no], _, onCleanup) => {
  if (!id || !no) return
  let stale = false
  onCleanup(() => { stale = true })
  try {
    const result = await request(`/billing/reviews/${encodeURIComponent(id)}/charge?versionNo=${no}`)
    if (stale) return
    charge.value = result.charged ? result : null
    if (charge.value) {
      balanceLoaded.value = false
      await credits.loadBalance()
      if (!stale) balanceLoaded.value = true
    }
  } catch { if (!stale) { charge.value = null; balanceLoaded.value = false } }
}, { immediate: true })
const legal = computed(() => legalSearch(version.value?.result))

const breadcrumbs = computed(() => [
  { label: t('reviewDetail.crumbHistory'), to: { name: ROUTE_NAMES.HISTORY } },
  { label: review.value?.productName ?? '' },
])
const stepLabel = computed(() =>
  t(isDone.value ? 'reviewDetail.stepDone' : 'reviewDetail.stepAnalyzing'),
)
const versionTabs = computed(() =>
  review.value.versions.map((v) => ({
    value: v.no,
    label: `v${v.no}`,
    badge: v.status === REVIEW_STATUS.DONE ? APPROVAL_LABEL[v.approval.state].label : t('reviewDetail.diagnosing'),
  })),
)
</script>

<template>
  <BaseEmptyState
    v-if="!review"
    icon="search_off"
    :title="$t('reviewDetail.notFoundTitle')"
    :description="$t('reviewDetail.notFoundText')"
  >
    <BaseButton variant="outline" :to="{ name: ROUTE_NAMES.HISTORY }">{{ $t('reviewDetail.backToHistory') }}</BaseButton>
  </BaseEmptyState>

  <div v-else-if="version" class="supplement-page">
    <PageHeading
      :title="$t('reviewDetail.title')"
      :description="$t('reviewDetail.description', { name: review.productName })"
      :breadcrumbs="breadcrumbs"
    >
      <template #top-aside>
        <BaseBadge variant="secondary">{{ stepLabel }}</BaseBadge>
      </template>
      <template #aside>
        <BaseInfoChip v-if="isDone" variant="info" icon="approval">
          {{ $t('reviewDetail.approvalState') }} <strong>{{ APPROVAL_LABEL[version.approval.state].label }}</strong>
        </BaseInfoChip>
      </template>
      <BaseTabs v-if="review.versions.length > 1" v-model="versionNo" :tabs="versionTabs" :label="$t('reviewDetail.versions')" />
    </PageHeading>

    <BaseAlert v-if="charge" variant="info" :title="$t(`reviewDetail.credit.${charge.status}`, { count: charge.credits })">
      <span v-if="balanceLoaded">{{ $t('reviewDetail.credit.balance') }} <strong>{{ $t('credits.amount', { count: credits.balance.toLocaleString('ko-KR') }) }}</strong></span>
      <span v-else>{{ $t('reviewDetail.credit.loading') }}</span>
    </BaseAlert>

    <AnalysisDiagnosis />

    <BaseAlert v-if="version.status === REVIEW_STATUS.FAILED" variant="danger" :title="$t('reviewDetail.failedTitle')">
      {{ version.error }}
      <BaseButton :to="{name: ROUTE_NAMES.REVIEW_NEW, query:{from:review.id}}">{{ $t('reviewDetail.resubmit') }}</BaseButton>
    </BaseAlert>

    <template v-if="isDone">
      <BaseAlert :variant="legal.variant" :title="legal.alertTitle">
        <ul><li v-for="line in warningLines(version.result.warnings)" :key="line">{{ line }}</li></ul>
      </BaseAlert>
      <StatusSummary />
      <OriginalPreview />

      <!-- 타일 좌표가 있는 최신 이미지 결과는 타일별로, 이전 결과와 PDF는 추출 문구 뷰어로 보여 준다. -->
      <template v-if="tileMode">
        <TileReview class="supplement-page__tiles" />
        <div class="supplement-page__extras">
          <EvidenceCheckSection />
          <PatentCheckSection />
          <ApprovalPanel />
        </div>
      </template>
      <div v-else class="supplement-page__body">
        <AdViewer class="supplement-page__viewer" />
        <div class="supplement-page__side">
          <ViolationReviewList />
          <VisualReviewSection />
          <EvidenceCheckSection />
          <PatentCheckSection />
          <ApprovalPanel />
        </div>
      </div>

      <ReviewActionBar />
    </template>
  </div>
</template>

<style scoped>
.supplement-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.supplement-page__body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: start;
  gap: var(--layout-gutter);
  margin-top: var(--space-lg);
}
.supplement-page__tiles {
  margin-top: var(--space-lg);
}
.supplement-page__extras {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.supplement-page__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
/* 넓은 화면에서는 뷰어를 고정해 카드와 함께 볼 수 있게 한다 */
@media (min-width: 1025px) {
  .supplement-page__viewer {
    position: sticky;
    top: var(--space-md);
    max-height: calc(100vh - var(--space-xl));
    overflow-y: auto;
  }
}

@media (max-width: 1024px) {
  .supplement-page__body {
    grid-template-columns: 1fr;
  }
}
</style>
