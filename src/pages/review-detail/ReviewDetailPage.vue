<!-- 위반사항 분석 및 보완 (시안 krds_3) -->
<script setup>
import { computed } from 'vue'
import { APPROVAL_LABEL, REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
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
import ViolationReviewList from './features/violation-review/ViolationReviewList.vue'

const { review, version, versionNo, isDone } = provideReviewDetail()

const breadcrumbs = computed(() => [
  { label: '심의 이력', to: { name: ROUTE_NAMES.HISTORY } },
  { label: review.value?.productName ?? '' },
])
const stepLabel = computed(() =>
  isDone.value ? '심의 절차 3단계 / 총 4단계 (위반사항 확인,보완 단계)' : '심의 절차 2단계 / 총 4단계 (AI 사전 진단 중)',
)
const versionTabs = computed(() =>
  review.value.versions.map((v) => ({
    value: v.no,
    label: `v${v.no}`,
    badge: v.status === REVIEW_STATUS.DONE ? APPROVAL_LABEL[v.approval.state].label : '진단 중',
  })),
)
</script>

<template>
  <BaseEmptyState
    v-if="!review"
    icon="search_off"
    title="심의 건을 찾을 수 없습니다"
    description="삭제되었거나 다른 기업의 심의 건입니다."
  >
    <BaseButton variant="outline" :to="{ name: ROUTE_NAMES.HISTORY }">심의 이력으로</BaseButton>
  </BaseEmptyState>

  <div v-else-if="version" class="supplement-page">
    <PageHeading
      title="문구와 사진 검토 결과"
      :description="`${review.productName} — 문구 확인 후보와 사진 관찰, 증빙 추출 상태를 확인하세요. 법령 근거 대조는 아직 연결되지 않았습니다.`"
      :breadcrumbs="breadcrumbs"
    >
      <template #top-aside>
        <BaseBadge variant="secondary">{{ stepLabel }}</BaseBadge>
      </template>
      <template #aside>
        <BaseInfoChip v-if="isDone" variant="info" icon="approval">
          승인 상태: <strong>{{ APPROVAL_LABEL[version.approval.state].label }}</strong>
        </BaseInfoChip>
      </template>
      <BaseTabs v-if="review.versions.length > 1" v-model="versionNo" :tabs="versionTabs" label="심의 버전" />
    </PageHeading>

    <AnalysisDiagnosis />

    <BaseAlert v-if="version.status === REVIEW_STATUS.FAILED" variant="danger" title="분석에 실패했습니다">
      {{ version.error }}
      <BaseButton :to="{name: ROUTE_NAMES.REVIEW_NEW, query:{from:review.id}}">원본 파일을 다시 제출해 새 버전 검토</BaseButton>
    </BaseAlert>

    <template v-if="isDone">
      <BaseAlert variant="warning" title="법령 검색 미연결, 예비검토 결과">
        <ul><li v-for="warning in version.result.warnings" :key="warning">{{warning}}</li></ul>
      </BaseAlert>
      <StatusSummary />
      <OriginalPreview />

      <div class="supplement-page__body">
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
