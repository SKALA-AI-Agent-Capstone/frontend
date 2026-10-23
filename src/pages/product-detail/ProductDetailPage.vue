<!--
  제품 상세: 제품 정보와 그 제품의 광고 검토 내역. 새 광고 검토는 여기서 시작한다.
  검토 목록은 제품별 API(/products/{id}/reviews)로 모두 받아 reviews 스토어에 합친다. 분석 중인 건은 스토어가 따라간다.
  제품 삭제는 검토가 0건일 때만 된다. 검토가 남아 있으면 먼저 지우라는 창을 띄운다(서버도 409 PRODUCT_HAS_REVIEWS로 막는다).
-->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { t } from '@/shared/i18n'
import { productErrorKey, useProductsStore } from '@/shared/stores/products'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { formatDate } from '@/shared/utils/format'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import ProductFormModal from '@/shared/components/product/ProductFormModal.vue'
import ProductThumb from '@/shared/components/product/ProductThumb.vue'
import ReviewBoard from '@/shared/components/review/ReviewBoard.vue'

const route = useRoute()
const router = useRouter()
const products = useProductsStore()
const reviews = useReviewsStore()
const session = useSessionStore()
const canCreate = computed(() => session.can(PERMISSIONS.REVIEW_CREATE))

const id = computed(() => String(route.params.id))
const product = computed(() => products.byId(id.value))
const loading = ref(false)
const missing = ref(false)
const error = ref('')

async function load() {
  missing.value = false
  error.value = ''
  loading.value = true
  try {
    await products.refresh(id.value)
  } catch (e) {
    if (e.message === 'PRODUCT_NOT_FOUND') missing.value = true
    else error.value = e.message
  } finally {
    loading.value = false
  }
}
// 이 제품의 검토는 제품별 API로 모두 받는다. 받은 뒤 분석 중인 건을 따라간다.
const reviewsLoaded = ref(false)
async function loadReviews() {
  reviewsLoaded.value = false
  try { await reviews.loadByProduct(id.value) } catch { /* 제품이 없으면 위의 load가 알려 준다 */ }
  reviewsLoaded.value = true
  reviews.poll()
}
onMounted(() => reviews.poll())
watch(id, () => { load(); loadReviews() }, { immediate: true })

const rows = computed(() =>
  reviews.list
    .filter((review) => review.productId === id.value)
    .map((review) => ({ review, version: reviews.latest(review) }))
    .sort((a, b) => new Date(b.review.updatedAt) - new Date(a.review.updatedAt)),
)
// 서버 검토 수와 화면에 받아 둔 수 중 큰 값(목록을 받기 전에도 숫자가 보이게)
const reviewCount = computed(() => Math.max(product.value?.reviewCount ?? 0, rows.value.length))
const newReviewRoute = computed(() => ({ name: ROUTE_NAMES.REVIEW_NEW, query: { product: id.value } }))

const formOpen = ref(false)
const confirmOpen = ref(false)
const blockedOpen = ref(false)
const deleting = ref(false)

function askDelete() {
  error.value = ''
  if (rows.value.length) blockedOpen.value = true
  else confirmOpen.value = true
}

async function remove() {
  deleting.value = true
  try {
    await products.remove(id.value)
    confirmOpen.value = false
    router.replace({ name: ROUTE_NAMES.DASHBOARD })
  } catch (e) {
    confirmOpen.value = false
    // 확인 창을 연 사이 다른 사람이 검토를 올렸으면 서버가 거절한다
    if (e.message === 'PRODUCT_HAS_REVIEWS') { blockedOpen.value = true; reviews.load() }
    else { const key = productErrorKey(e.message); error.value = key ? t(key) : e.message }
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="product">
    <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="product__back">
      <span aria-hidden="true">&larr;</span> {{ $t('products.detail.back') }}
    </RouterLink>

    <p v-if="!product && loading" class="product__state" role="status">{{ $t('products.detail.loading') }}</p>
    <div v-else-if="missing" class="product__state">
      <p class="product__state-title">{{ $t('products.detail.notFound') }}</p>
      <p>{{ $t('products.detail.notFoundText') }}</p>
    </div>

    <template v-else-if="product">
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>

      <header class="head">
        <ProductThumb :product="product" size="lg" />
        <div class="head__body">
          <span class="head__type" :class="`head__type--${product.type}`">{{ $t(`products.type.${product.type}`) }}</span>
          <h1 class="head__name">{{ product.name }}</h1>
          <p class="head__meta">
            <span>{{ $t('products.reviewCount', { count: reviewCount }) }}</span>
            <span>{{ $t('products.detail.registered', { date: formatDate(product.createdAt) }) }}</span>
          </p>
        </div>
        <div class="head__actions">
          <BaseButton v-if="canCreate" icon="add_circle" :to="newReviewRoute">{{ $t('products.detail.newReview') }}</BaseButton>
          <BaseButton variant="outline" icon="edit" @click="formOpen = true">{{ $t('products.detail.edit') }}</BaseButton>
          <BaseButton variant="ghost" icon="delete" @click="askDelete">{{ $t('products.detail.delete') }}</BaseButton>
        </div>
      </header>

      <ReviewBoard
        :rows="rows"
        :loaded="reviewsLoaded"
        :can-create="canCreate"
        :title="$t('products.detail.reviews')"
        :new-review-route="newReviewRoute"
      />

      <ProductFormModal v-model:open="formOpen" :product="product" />

      <BaseConfirmDialog v-model:open="confirmOpen" :title="$t('products.delete.confirmTitle')"
        :confirm-label="$t('products.delete.confirm')" danger :busy="deleting" @confirm="remove">
        {{ $t('products.delete.confirmText', { name: product.name }) }}
      </BaseConfirmDialog>

      <BaseModal v-model:open="blockedOpen" labelledby="product-delete-blocked">
        <template #header>
          <h2 id="product-delete-blocked" class="blocked__title">{{ $t('products.delete.blockedTitle') }}</h2>
        </template>
        <p class="blocked__text">{{ $t('products.delete.blockedText') }}</p>
        <p v-if="rows.length" class="blocked__text">{{ $t('products.delete.blockedCount', { count: rows.length }) }}</p>
        <template #footer>
          <BaseButton @click="blockedOpen = false">{{ $t('products.delete.blockedOk') }}</BaseButton>
        </template>
      </BaseModal>
    </template>

    <BaseAlert v-else-if="error" variant="danger">{{ error }}</BaseAlert>
  </div>
</template>

<style scoped>
.product {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}
.product__back {
  justify-self: start;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-decoration: none;
}
.product__back:hover { color: var(--color-primary); }
.product__state {
  display: grid;
  gap: 6px;
  padding: 64px 24px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-surface);
  text-align: center;
  color: var(--color-text-secondary);
}
.product__state-title { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); color: var(--color-text); }

.head {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
}
.head__body { display: grid; gap: 6px; justify-items: start; min-width: 0; flex: 1; }
.head__type {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.head__type--functional { background: var(--color-info-surface); color: var(--color-info-text); }
.head__name { font-size: var(--font-size-title-l); font-weight: var(--font-weight-bold); overflow-wrap: anywhere; }
.head__meta { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: var(--font-size-body-s); color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.head__actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }

.blocked__title { font-size: var(--font-size-title-m); font-weight: var(--font-weight-bold); }
.blocked__text { color: var(--color-text-secondary); }
.blocked__text + .blocked__text { margin-top: 6px; }

@media (max-width: 760px) {
  .head { flex-wrap: wrap; }
  .head__actions { width: 100%; justify-content: stretch; }
}
</style>
