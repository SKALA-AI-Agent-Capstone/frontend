<!-- 광고 자율심의 신청 (시안 krds_2) — 단일 입력 흐름 (FR-8) -->
<script setup>
import { t } from '@/shared/i18n'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { request } from '@/shared/api/http'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
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
const checkingBalance = ref(false)
const confirmOpen = ref(false)
const error = ref('')
const balanceLoaded = ref(false)
const reviewCost = ref(null)
const canAfford = computed(() => balanceLoaded.value && reviewCost.value > 0 && credits.balance >= reviewCost.value)
onMounted(async () => {
  try {
    const config = await request('/billing/config')
    reviewCost.value = config.reviewCost
    await credits.loadBalance()
    balanceLoaded.value = true
  }
  catch { error.value = t('reviewNew.credit.loadFailed') }
})

async function prepareSubmit() {
  if (checkingBalance.value || submitting.value || !canSubmit.value) return
  checkingBalance.value = true
  error.value = ''
  try {
    await credits.loadBalance()
    balanceLoaded.value = true
    if (credits.balance < reviewCost.value) throw new Error(t('reviewNew.credit.insufficient', { count: reviewCost.value }))
    confirmOpen.value = true
  } catch (e) { error.value = e.message }
  finally { checkingBalance.value = false }
}

async function submit() {
  if (submitting.value || !canSubmit.value) return // 중복 제출 방지
  submitting.value = true
  error.value = ''
  try {
    await credits.loadBalance()
    balanceLoaded.value = true
    if (credits.balance < reviewCost.value) throw new Error(t('reviewNew.credit.insufficient', { count: reviewCost.value }))
    confirmOpen.value = false
    const { reviewId } = baseReview.value
      ? await reviews.createVersion(baseReview.value.id, draft)
      : await reviews.createReview(draft)
    clearSaved()
    await credits.loadBalance().catch(() => {})
    await router.push({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: reviewId } })
  } catch (e) {
    error.value = /INSUFFICIENT_CREDITS/.test(e.message)
      ? t('reviewNew.credit.insufficientUpdated') : e.message
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

    <form class="apply-page__form" @submit.prevent="prepareSubmit">
      <ApplicantInfoSection />
      <ProductInfoSection />
      <AdContentSection />
      <EvidenceDocsSection />
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <ReviewFormActions :submitting="submitting || checkingBalance" :version-label="nextVersionLabel" :can-afford="canAfford" />
    </form>
    <BaseConfirmDialog v-model:open="confirmOpen" :title="$t('reviewNew.credit.confirmTitle')" :confirm-label="$t('reviewNew.credit.confirmButton', { count: reviewCost })" :busy="submitting" @confirm="submit">
      <CreditEstimate :required="reviewCost" :label="$t('reviewNew.credit.cost')" :note="$t('reviewNew.credit.note')" show-remaining />
    </BaseConfirmDialog>
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
