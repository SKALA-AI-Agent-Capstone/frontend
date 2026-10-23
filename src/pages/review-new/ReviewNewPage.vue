<!-- 광고 자율심의 신청 (시안 krds_2) — 단일 입력 흐름 (FR-8) -->
<script setup>
import { t } from '@/shared/i18n'
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { request } from '@/shared/api/http'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import MascotNotice from '@/shared/components/feedback/MascotNotice.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
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
import CreditDialog from './features/credit-dialog/CreditDialog.vue'
import AiDiagnosisModal from '@/pages/review-detail/features/ai-diagnosis/AiDiagnosisModal.vue'
import DiagnosisBackgroundStatus from '@/pages/review-detail/features/ai-diagnosis/DiagnosisBackgroundStatus.vue'
import { stepStates } from '@/shared/api/analysisApi'
import { formatFileSize } from '@/shared/utils/format'

const route = useRoute()
const router = useRouter()
const reviews = useReviewsStore()
const credits = useCreditsStore()

// 이전 검토의 제품 정보와 매체를 불러와 새 검토로 신청한다. 같은 검토에 새 버전을 올리는 재검토는 2026-10-22에 없앴다.
const baseReview = computed(() => (route.query.from ? reviews.byId(String(route.query.from)) : null))
const baseVersion = baseReview.value ? reviews.latest(baseReview.value) : null

// 제품 상세에서 시작하면 ?product=, 이전 검토를 불러오면 그 검토의 제품을 고른다
const initialProductId = typeof route.query.product === 'string' ? route.query.product : baseReview.value?.productId ?? ''
const { draft, canSubmit, clearSaved, saveDraft, loadSaved, saving: savingDraft, lastSavedAt } = provideReviewDraft({
  baseVersion,
  initialCopy: typeof route.query.copy === 'string' ? route.query.copy : '',
  productId: initialProductId,
})

const breadcrumbs = computed(() => [{ label: t('reviewNew.crumbs.section') }, { label: t('reviewNew.crumbs.page') }])
const submitting = ref(false)
const checkingBalance = ref(false)
const confirmOpen = ref(false)
const topUpOpen = ref(false) // 잔액이 모자랄 때 충전을 안내하는 창
const error = ref('')
const balanceLoaded = ref(false)
const reviewCost = ref(null)
const progressOpen = ref(false)
const submissionInput = shallowRef(null)
const acceptedId = ref(null)
const submissionError = ref('')
const preparingMessage = ref('')
const progressReview = computed(() => (acceptedId.value && reviews.byId(acceptedId.value)) || {
  id: null, productName: submissionInput.value?.product.name ?? '',
})
const progressVersion = computed(() => acceptedId.value && progressReview.value.versions
  ? reviews.latest(progressReview.value)
  : { no: 1, input: submissionInput.value ?? {}, error: submissionError.value })
const progressPhase = computed(() => {
  if (submissionError.value) return 'submission_failed'
  if (!acceptedId.value) return 'preparing'
  const status = progressVersion.value.status
  return status === 'done' ? 'done' : status === 'failed' ? 'failed' : 'running'
})
const progressSteps = computed(() => stepStates(progressVersion.value, progressPhase.value, { active: Boolean(acceptedId.value) }))
const progressSubject = computed(() => {
  const { files = [], evidence = [] } = progressVersion.value.input
  const first = files[0]
  const counts = [t('reviewDetail.modal.adFiles', { count: files.length }),
    evidence.length ? t('reviewDetail.modal.evidenceFiles', { count: evidence.length }) : null].filter(Boolean).join(', ')
  return { title: first?.name ?? progressReview.value.productName,
    meta: first ? `${formatFileSize(first.size)}, ${counts}` : counts }
})
// 임시저장 불러오기(?draft=). 이전 검토에서 시작한 경우는 그쪽을 따른다.
const draftNotice = ref('') // loaded | missing
const draftError = ref('')
onMounted(async () => {
  if (typeof route.query.draft === 'string' && !baseReview.value) {
    try { draftNotice.value = (await loadSaved(route.query.draft)) ? 'loaded' : 'missing' }
    catch { draftNotice.value = 'missing' }
  }
})

const savedOpen = ref(false) // 임시저장 버튼을 눌렀을 때 마스코트 알림

/** 임시저장하고 주소에 ?draft=를 남긴다(새로고침이나 뒤로 가기에도 이어서 작성). */
async function saveNow({ notify = true } = {}) {
  draftError.value = ''
  try {
    const id = await saveDraft()
    if (route.query.draft !== id) await router.replace({ query: { ...route.query, draft: id } })
    if (notify) savedOpen.value = true
    return true
  } catch (e) {
    draftError.value = e.message === 'DRAFT_PRODUCT_REQUIRED' ? t('reviewNew.draft.productRequired') : t('reviewNew.draft.saveFailed')
    return false
  }
}

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
    // 검토 비용을 서버에서 받지 못했으면 금액 없이 확인 창을 열지 않는다
    if (!reviewCost.value) throw new Error(t('reviewNew.credit.loadFailed'))
    // 시작 버튼은 막지 않고, 누른 때 잔액에 따라 차감 확인 창이나 충전 안내 창을 연다
    if (credits.balance < reviewCost.value) topUpOpen.value = true
    else confirmOpen.value = true
  } catch (e) { error.value = e.message }
  finally { checkingBalance.value = false }
}

async function submit() {
  if (submitting.value || !canSubmit.value) return // 중복 제출 방지
  submitting.value = true
  error.value = ''
  submissionError.value = ''
  acceptedId.value = null
  submissionInput.value = {
    productId: draft.productId, product: { ...draft.product }, media: [...draft.media],
    files: [...draft.files], evidence: [...draft.evidence],
  }
  confirmOpen.value = false
  preparingMessage.value = t('reviewDetail.modal.checkingBalance')
  progressOpen.value = true
  try {
    // 첫 네트워크 요청 전에 모달을 렌더링한다. 접수 전에는 분석 단계를 완료로 표시하지 않는다.
    await nextTick()
    await credits.loadBalance()
    balanceLoaded.value = true
    if (credits.balance < reviewCost.value) {
      progressOpen.value = false
      topUpOpen.value = true
      return
    }
    preparingMessage.value = t('reviewDetail.modal.uploading')
    const { reviewId } = await reviews.createReview(submissionInput.value)
    acceptedId.value = reviewId
    clearSaved()
    credits.loadBalance().catch(() => {})
    await router.push({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: reviewId },
      state: { diagnosisOpen: progressOpen.value } })
  } catch (e) {
    credits.loadBalance().catch(() => {})
    // 확인 창을 연 사이 잔액이 줄었으면 서버가 거절한다. 이때도 충전 안내 창으로 보낸다.
    if (/INSUFFICIENT_CREDITS/.test(e.message)) { progressOpen.value = false; topUpOpen.value = true }
    else { error.value = e.message; submissionError.value = e.message }
  } finally { submitting.value = false }
}

// 충전 화면으로 가기 전에 입력한 글자는 임시 저장한다. 올린 파일은 저장되지 않아 돌아와서 다시 올려야 한다.
// 충전 화면으로 가기 전에 임시저장한다. 돌아오면(뒤로 가기) 주소의 ?draft=로 이어서 작성한다.
async function goTopUp() {
  if (draft.productId) await saveNow({ notify: false })
  topUpOpen.value = false
  router.push({ name: ROUTE_NAMES.CREDITS })
}
</script>

<template>
  <div class="apply-page">
    <BaseCard padding="xl">
      <PageHeading
        :title="$t('reviewNew.title')"
        :description="$t('reviewNew.description')"
        :badge="$t('reviewNew.badge')"
        :breadcrumbs="breadcrumbs"
      >
        <ApplicationStepper :current="1" />
      </PageHeading>
    </BaseCard>

    <BaseAlert v-if="draftNotice === 'loaded'" variant="info">{{ $t('reviewNew.draft.loaded') }}</BaseAlert>
    <BaseAlert v-else-if="draftNotice === 'missing'" variant="warning">{{ $t('reviewNew.draft.missing') }}</BaseAlert>

    <BaseAlert v-if="baseReview" variant="info" :title="$t('reviewNew.fromAlert.title')">
      {{ $t('reviewNew.fromAlert.text', { name: baseReview.productName }) }}
    </BaseAlert>

    <DiagnosisBackgroundStatus v-if="submitting && !progressOpen"
      :done-count="progressSteps.filter(step => step.state === 'done').length"
      :total="progressSteps.length" :file-name="progressSubject.title" @open="progressOpen = true" />

    <form class="apply-page__form" @submit.prevent="prepareSubmit">
      <ApplicantInfoSection />
      <ProductInfoSection />
      <AdContentSection />
      <EvidenceDocsSection />
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <ReviewFormActions :submitting="submitting || checkingBalance" :saving="savingDraft" :saved-at="lastSavedAt"
        :save-error="draftError" @save="saveNow" />
    </form>
    <!-- 잔액이 충분할 때: 차감 확인 / 모자랄 때: 충전 안내 -->
    <CreditDialog v-model:open="confirmOpen" mode="confirm" :cost="reviewCost ?? 0" :balance="credits.balance" :busy="submitting" @confirm="submit" />
    <!-- 임시저장 완료: 마스코트가 잠깐 나타났다 사라진다 -->
    <MascotNotice v-model:open="savedOpen" :message="$t('reviewNew.draft.savedTitle')" :detail="$t('reviewNew.draft.savedText')" />
    <CreditDialog v-model:open="topUpOpen" mode="topup" :cost="reviewCost ?? 0" :balance="credits.balance" @confirm="goTopUp" />
    <AiDiagnosisModal v-if="submissionInput" v-model:open="progressOpen"
      :review="progressReview" :version="progressVersion" :subject="progressSubject"
      :phase="progressPhase" :steps="progressSteps" :preparing-message="preparingMessage"
      :activity="acceptedId ? reviews.activity[acceptedId] ?? {} : {}"
      @background="progressOpen = false"
      @history="router.push({ name: ROUTE_NAMES.HISTORY })" @view-result="progressOpen = false" />
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
