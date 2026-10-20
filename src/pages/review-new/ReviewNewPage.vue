<!-- 광고 자율심의 신청 (시안 krds_2) — 단일 입력 흐름 (FR-8) -->
<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseInfoChip from '@/shared/components/base/BaseInfoChip.vue'
import PageHeading from '@/shared/components/layout/PageHeading.vue'
import ApplicationStepper from '@/shared/components/navigation/ApplicationStepper.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { useReviewsStore } from '@/shared/stores/reviews'
import { provideReviewDraft } from './composables/useReviewDraft'
import AdContentSection from './features/ad-content/AdContentSection.vue'
import ApplicantInfoSection from './features/applicant-info/ApplicantInfoSection.vue'
import EvidenceDocsSection from './features/evidence-docs/EvidenceDocsSection.vue'
import ReviewFormActions from './features/form-actions/ReviewFormActions.vue'
import ProductInfoSection from './features/product-info/ProductInfoSection.vue'

const route = useRoute()
const router = useRouter()
const reviews = useReviewsStore()
const credits = useCreditsStore()

// FR-13: 기존 심의 건을 수정해 새 버전으로 재심의
const baseReview = computed(() => (route.query.from ? reviews.byId(String(route.query.from)) : null))
const baseVersion = baseReview.value ? reviews.latest(baseReview.value) : null
const nextVersionLabel = baseReview.value ? `v${baseVersion.no + 1}` : null

const { draft, estimate, canSubmit, clearSaved } = provideReviewDraft({
  baseVersion,
  initialCopy: typeof route.query.copy === 'string' ? route.query.copy : '',
})

const breadcrumbs = [{ label: '기업 광고 검토' }, { label: 'PDF와 이미지 검토 신청' }]
const submitting = ref(false)
const error = ref('')

async function submit() {
  if (submitting.value || !canSubmit.value) return // 중복 제출 방지
  submitting.value = true
  error.value = ''
  try {
    const { reviewId } = baseReview.value
      ? await reviews.createVersion(baseReview.value.id, draft)
      : await reviews.createReview(draft)
    clearSaved()
    await router.push({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: reviewId } })
  } catch (e) { error.value = e.message } finally { submitting.value = false }
}
</script>

<template>
  <div class="apply-page">
    <BaseCard padding="xl">
      <PageHeading
        :title="baseReview ? '광고 새 버전 검토' : '화장품 광고 사전검토 신청'"
        description="PDF 또는 이미지를 올리면 문구와 사진을 각각 분석합니다. 법령 검색 미연결 상태에서는 적법 여부를 판단하지 않습니다."
        badge="기업 내부 사전검토"
        :breadcrumbs="breadcrumbs"
      >
        <template #aside>
          <BaseInfoChip>AI 사전 진단: <strong>파일과 분석 구간 수에 따라 달라집니다</strong></BaseInfoChip>
        </template>
        <ApplicationStepper :current="1" />
      </PageHeading>
    </BaseCard>

    <BaseAlert v-if="baseReview" variant="info" title="수정본을 새 버전으로 재심의합니다">
      '{{ baseReview.productName }}' v{{ baseVersion.no }} 내용을 불러왔습니다. 제출하면 {{ nextVersionLabel }}로 저장되며,
      이전 버전의 승인 이력은 그대로 유지됩니다.
    </BaseAlert>

    <form class="apply-page__form" @submit.prevent="submit">
      <ApplicantInfoSection />
      <ProductInfoSection />
      <AdContentSection />
      <EvidenceDocsSection />
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <ReviewFormActions :submitting="submitting" :version-label="nextVersionLabel" />
    </form>
  </div>
</template>

<style scoped>
.apply-page,
.apply-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
