<!-- 광고 자율심의 신청 (시안 krds_2) — 단일 입력 흐름 (FR-8) -->
<script setup>
import { t } from '@/shared/i18n'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import PageHeading from '@/shared/components/layout/PageHeading.vue'
import ApplicationStepper from '@/shared/components/navigation/ApplicationStepper.vue'
import CreditEstimate from '@/shared/components/review/CreditEstimate.vue'
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

const { draft, canSubmit, clearSaved } = provideReviewDraft({
  baseVersion,
  initialCopy: typeof route.query.copy === 'string' ? route.query.copy : '',
})

const breadcrumbs = computed(() => [{ label: t('reviewNew.crumbs.section') }, { label: t('reviewNew.crumbs.page') }])
const submitting = ref(false)
const error = ref('')
const balanceLoaded = ref(false)
const reviewCost = 100
const canAfford = computed(() => balanceLoaded.value && credits.balance >= reviewCost)
onMounted(async () => {
  try { await credits.loadBalance(); balanceLoaded.value = true }
  catch { error.value = '크레딧 잔액을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' }
})

async function submit() {
  if (submitting.value || !canSubmit.value) return // 중복 제출 방지
  submitting.value = true
  error.value = ''
  try {
    await credits.loadBalance()
    balanceLoaded.value = true
    if (credits.balance < reviewCost) throw new Error('검사에 100크레딧이 필요합니다. 먼저 크레딧을 충전해 주세요.')
    const { reviewId } = baseReview.value
      ? await reviews.createVersion(baseReview.value.id, draft)
      : await reviews.createReview(draft)
    clearSaved()
    await credits.loadBalance().catch(() => {})
    await router.push({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: reviewId } })
  } catch (e) {
    error.value = /INSUFFICIENT_CREDITS/.test(e.message)
      ? '크레딧이 부족합니다. 잔액을 확인하고 충전해 주세요.' : e.message
    await credits.loadBalance().catch(() => {})
  } finally { submitting.value = false }
}
</script>

<template>
  <div class="apply-page">
    <BaseCard padding="xl">
      <PageHeading
        :title="baseReview ? $t('reviewNew.titleVersion') : $t('reviewNew.title')"
        :description="$t('reviewNew.description')"
        :badge="$t('reviewNew.badge')"
        :breadcrumbs="breadcrumbs"
      >
        <ApplicationStepper :current="1" />
      </PageHeading>
    </BaseCard>

    <BaseAlert v-if="baseReview" variant="info" :title="$t('reviewNew.versionAlert.title')">
      {{ $t('reviewNew.versionAlert.text', { name: baseReview.productName, from: baseVersion.no, to: nextVersionLabel }) }}
    </BaseAlert>

    <form class="apply-page__form" @submit.prevent="submit">
      <ApplicantInfoSection />
      <ProductInfoSection />
      <AdContentSection />
      <EvidenceDocsSection />
      <CreditEstimate :required="reviewCost" label="검사 비용" note="검사 시작 시 100크레딧이 차감됩니다. 분석이 실패하면 자동으로 반환됩니다." />
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <ReviewFormActions :submitting="submitting" :version-label="nextVersionLabel" :can-afford="canAfford" />
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
