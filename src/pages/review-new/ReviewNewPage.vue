<!-- 광고 자율심의 신청 (시안 krds_2) — 단일 입력 흐름 (FR-8) -->
<script setup>
import { t } from '@/shared/i18n'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
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

const { draft, canSubmit, clearSaved, saveDraft } = provideReviewDraft({
  baseVersion,
  initialCopy: typeof route.query.copy === 'string' ? route.query.copy : '',
})

const breadcrumbs = computed(() => [{ label: t('reviewNew.crumbs.section') }, { label: t('reviewNew.crumbs.page') }])
const submitting = ref(false)
const checkingBalance = ref(false)
const confirmOpen = ref(false)
const topUpOpen = ref(false) // 잔액이 모자랄 때 충전을 안내하는 창
const error = ref('')
const balanceLoaded = ref(false)
const reviewCost = 100
const shortfall = computed(() => Math.max(0, reviewCost - credits.balance))
onMounted(async () => {
  try { await credits.loadBalance(); balanceLoaded.value = true }
  catch { error.value = t('reviewNew.credit.balanceFailed') }
})

async function prepareSubmit() {
  if (checkingBalance.value || submitting.value || !canSubmit.value) return
  checkingBalance.value = true
  error.value = ''
  try {
    await credits.loadBalance()
    balanceLoaded.value = true
    // 시작 버튼은 막지 않고, 누른 때 잔액에 따라 차감 확인 창이나 충전 안내 창을 연다
    if (credits.balance < reviewCost) topUpOpen.value = true
    else confirmOpen.value = true
  } catch { error.value = t('reviewNew.credit.balanceFailed') }
  finally { checkingBalance.value = false }
}

async function submit() {
  if (submitting.value || !canSubmit.value) return // 중복 제출 방지
  submitting.value = true
  error.value = ''
  try {
    await credits.loadBalance()
    balanceLoaded.value = true
    if (credits.balance < reviewCost) {
      confirmOpen.value = false
      topUpOpen.value = true
      return
    }
    confirmOpen.value = false
    const { reviewId } = baseReview.value
      ? await reviews.createVersion(baseReview.value.id, draft)
      : await reviews.createReview(draft)
    clearSaved()
    await credits.loadBalance().catch(() => {})
    await router.push({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: reviewId }, query: { charged: '100' } })
  } catch (e) {
    await credits.loadBalance().catch(() => {})
    // 확인 창을 연 사이 잔액이 줄었으면 서버가 거절한다. 이때도 충전 안내 창으로 보낸다.
    if (/INSUFFICIENT_CREDITS/.test(e.message)) { confirmOpen.value = false; topUpOpen.value = true }
    else error.value = e.message
  } finally { submitting.value = false }
}

// 충전 화면으로 가기 전에 입력한 글자는 임시 저장한다. 올린 파일은 저장되지 않아 돌아와서 다시 올려야 한다.
function goTopUp() {
  saveDraft()
  topUpOpen.value = false
  router.push({ name: ROUTE_NAMES.CREDITS })
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
      <ReviewFormActions :submitting="submitting || checkingBalance" :version-label="nextVersionLabel"  />
    </form>
    <!-- 잔액이 충분할 때: 차감 확인 -->
    <BaseConfirmDialog
      v-model:open="confirmOpen"
      :title="$t('reviewNew.credit.confirmTitle')"
      :confirm-label="$t('reviewNew.credit.confirmAction', { cost: reviewCost })"
      :busy="submitting"
      @confirm="submit"
    >
      <CreditEstimate :required="reviewCost" :label="$t('reviewNew.credit.cost')" :note="$t('reviewNew.credit.confirmNote')" show-remaining />
    </BaseConfirmDialog>

    <!-- 잔액이 모자랄 때: 충전 안내 -->
    <BaseConfirmDialog
      v-model:open="topUpOpen"
      :title="$t('reviewNew.credit.topUpTitle')"
      :confirm-label="$t('reviewNew.credit.topUpAction')"
      @confirm="goTopUp"
    >
      <p class="topup__lead">{{ $t('reviewNew.credit.topUpText', { cost: reviewCost, shortfall }) }}</p>
      <CreditEstimate :required="reviewCost" :note="$t('reviewNew.credit.topUpNote')" hide-shortfall />
    </BaseConfirmDialog>
  </div>
</template>

<style scoped>
.topup__lead { margin-bottom: var(--space-md); color: var(--color-text); }
.apply-page,
.apply-page__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
