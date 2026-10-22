<!--
  작업공간 홈: 제품 목록(2026-10-22 제품 단위 검토). 제품을 등록하고, 제품을 누르면 그 제품의 광고 검토 내역으로 간다.
  분석 중인 검토는 제품과 상관없이 맨 위에 모아 보여 준다.
  제품 카드의 상태 숫자는 reviews 스토어(최근 200건)의 최신 버전에서 계산하고, 검토 수는 서버 값을 쓴다.
-->
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/shared/stores/products'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { formatDate } from '@/shared/utils/format'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import ProductThumb from '@/shared/components/product/ProductThumb.vue'
import ProductFormModal from '@/shared/components/product/ProductFormModal.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'
import { ANALYSIS_STEPS } from '@/shared/api/analysisApi'

const RUNNING_LIMIT = 3

const products = useProductsStore()
const reviews = useReviewsStore()
const session = useSessionStore()
const router = useRouter()
const canCreate = computed(() => session.can(PERMISSIONS.REVIEW_CREATE))
const formOpen = ref(false)

// 검토 수가 바뀌었을 수 있으므로 들어올 때마다 제품을 다시 받는다
onMounted(() => {
  products.load()
  reviews.poll()
})

const isRunning = (version) => version.status === REVIEW_STATUS.QUEUED || version.status === REVIEW_STATUS.ANALYZING
const stepsDone = (version) => (version.steps ?? []).filter((v) => v >= 100).length

const rows = computed(() => reviews.list.map((review) => ({ review, version: reviews.latest(review) })))
const runningRows = computed(() => rows.value.filter((row) => isRunning(row.version)))

// 제품별 상태 숫자: 결정할 문구가 남은 건, 분석 중, 분석 실패
const statusByProduct = computed(() => {
  const counts = {}
  for (const { review, version } of rows.value) {
    const entry = (counts[review.productId] ??= { todo: 0, analyzing: 0, failed: 0 })
    if (isRunning(version)) entry.analyzing += 1
    else if (version.status === REVIEW_STATUS.FAILED) entry.failed += 1
    else if (version.status === REVIEW_STATUS.DONE && (review.hitl?.undecidedCount ?? 0) > 0) entry.todo += 1
  }
  return counts
})
const chipsOf = (product) => {
  const counts = statusByProduct.value[product.id] ?? {}
  return ['todo', 'analyzing', 'failed'].filter((key) => counts[key]).map((key) => ({ key, count: counts[key] }))
}

const productRoute = (product) => ({ name: ROUTE_NAMES.PRODUCT_DETAIL, params: { id: product.id } })
const detailRoute = (review) => ({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } })

function onSaved(product) {
  router.push(productRoute(product))
}
</script>

<template>
  <div class="home">
    <BaseAlert v-if="products.error" variant="danger">{{ $t('products.loadError') }} {{ products.error }}</BaseAlert>

    <header class="home__head">
      <div>
        <h1 class="home__title">{{ $t('products.title') }} <span class="home__count">{{ products.list.length }}</span></h1>
        <p class="home__desc">{{ $t('products.description') }}</p>
      </div>
      <BaseButton v-if="canCreate" icon="add_circle" @click="formOpen = true">{{ $t('products.create') }}</BaseButton>
    </header>

    <section v-if="runningRows.length" class="running" aria-labelledby="running-title" aria-live="polite">
      <h2 id="running-title" class="running__title">
        <span class="running__pulse" aria-hidden="true"></span>
        {{ $t('dashboard.running.title', { count: runningRows.length }) }}
      </h2>
      <ul class="running__list">
        <li v-for="row in runningRows.slice(0, RUNNING_LIMIT)" :key="row.review.id">
          <RouterLink :to="detailRoute(row.review)" class="running__item">
            <ReviewThumb :review="row.review" :version="row.version" size="sm" />
            <span class="running__text">
              <span class="running__name">{{ row.review.productName }}</span>
              <span class="running__step">
                {{ ANALYSIS_STEPS[Math.min(stepsDone(row.version), ANALYSIS_STEPS.length - 1)].title }}
                <span class="running__count">{{ stepsDone(row.version) }}/{{ ANALYSIS_STEPS.length }}</span>
              </span>
              <span class="running__bar" aria-hidden="true">
                <span v-for="(step, i) in ANALYSIS_STEPS" :key="step.id" :class="{ 'is-done': i < stepsDone(row.version), 'is-now': i === stepsDone(row.version) }"></span>
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>
      <RouterLink v-if="runningRows.length > RUNNING_LIMIT" :to="{ name: ROUTE_NAMES.HISTORY }" class="running__more">
        {{ $t('dashboard.running.all', { count: runningRows.length }) }}
      </RouterLink>
    </section>

    <ul v-if="products.list.length" class="grid">
      <li v-for="product in products.list" :key="product.id">
        <RouterLink :to="productRoute(product)" class="card">
          <ProductThumb :product="product" size="md" />
          <span class="card__body">
            <span class="card__name">{{ product.name }}</span>
            <span class="card__type" :class="`card__type--${product.type}`">{{ $t(`products.type.${product.type}`) }}</span>
            <span class="card__meta">
              <span>{{ $t('products.reviewCount', { count: product.reviewCount }) }}</span>
              <span v-if="product.latestReviewAt">{{ $t('products.latest', { date: formatDate(product.latestReviewAt) }) }}</span>
            </span>
            <span v-if="chipsOf(product).length" class="card__chips">
              <span v-for="chip in chipsOf(product)" :key="chip.key" class="chip" :class="`chip--${chip.key}`">
                {{ $t(`products.status.${chip.key}`, { count: chip.count }) }}
              </span>
            </span>
          </span>
        </RouterLink>
      </li>
    </ul>
    <p v-else-if="!products.loaded" class="empty" role="status">{{ $t('common.listLoading') }}</p>
    <div v-else class="empty">
      <img src="/doodles/unboxing.svg" alt="" class="empty__art" width="1024" height="768" />
      <p class="empty__title">{{ $t('products.empty.title') }}</p>
      <p class="empty__text">{{ $t('products.empty.text') }}</p>
      <BaseButton v-if="canCreate" icon="add_circle" @click="formOpen = true">{{ $t('products.create') }}</BaseButton>
    </div>

    <p class="home__links">
      <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }">{{ $t('products.historyAll') }}</RouterLink>
    </p>
    <p class="home__scope">{{ $t('dashboard.scope') }}</p>

    <ProductFormModal v-model:open="formOpen" @saved="onSaved" />
  </div>
</template>

<style scoped>
.home {
  display: grid;
  /* 긴 이름이 있어도 화면 폭을 넘지 않도록 열 폭을 화면에 묶는다 */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}
.home__head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap; }
.home__title { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-title-l); font-weight: var(--font-weight-bold); }
.home__count {
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.home__desc { margin-top: 4px; color: var(--color-text-secondary); }

/* 분석 중: 제품과 상관없이 맨 위에 보이는 진행 줄 */
.running {
  display: grid;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  background: var(--color-primary-subtle);
}
.running__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-active);
}
.running__pulse {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 50% { opacity: 0.3; } }
.running__list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.running__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--color-bg-surface);
  color: var(--color-text);
  text-decoration: none;
  transition: translate 200ms ease;
}
.running__item:hover { translate: 0 -2px; }
.running__item:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
.running__text { display: grid; gap: 4px; min-width: 0; flex: 1; }
.running__name { font-weight: var(--font-weight-bold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.running__step { display: flex; justify-content: space-between; gap: 8px; font-size: var(--font-size-detail-s); color: var(--color-primary-active); }
.running__count { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.running__bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; }
.running__bar span { height: 4px; border-radius: var(--radius-full); background: var(--color-bg-muted); }
.running__bar span.is-done { background: var(--color-primary); }
.running__bar span.is-now { background: var(--color-primary); opacity: 0.4; animation: pulse 1.4s ease-in-out infinite; }
.running__more {
  justify-self: start;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
@media (prefers-reduced-motion: reduce) {
  .running__pulse, .running__bar span.is-now { animation: none; }
}

/* 제품 카드 */
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  height: 100%;
  padding: 18px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
  color: var(--color-text);
  text-decoration: none;
  transition: border-color var(--transition-fast), translate 200ms ease;
}
.card:hover { border-color: var(--color-primary); translate: 0 -2px; }
.card:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
.card__body { display: grid; gap: 6px; min-width: 0; justify-items: start; }
.card__name { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); overflow-wrap: anywhere; }
.card__type {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.card__type--functional { background: var(--color-info-surface); color: var(--color-info-text); }
.card__meta { display: flex; flex-wrap: wrap; gap: 2px 12px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.card__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.chip { padding: 2px 8px; border-radius: var(--radius-full); font-size: var(--font-size-detail-s); font-weight: var(--font-weight-bold); }
.chip--todo { background: var(--color-primary-subtle); color: var(--color-primary-active); }
.chip--analyzing { background: var(--color-info-surface); color: var(--color-info-text); }
.chip--failed { background: var(--color-danger-surface); color: var(--color-danger-text); }

.empty {
  display: grid;
  justify-items: center;
  gap: var(--space-sm);
  padding: 48px 24px 64px;
  border: 1.5px dashed var(--color-border-strong);
  border-radius: 16px;
  background: var(--color-bg-surface);
  text-align: center;
}
.empty__art { width: 200px; height: auto; }
.empty__title { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); }
.empty__text { max-width: 34em; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }

.home__links a { font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); color: var(--color-primary); }
.home__scope { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }

@media (max-width: 1180px) {
  .running__list, .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .running__list, .grid { grid-template-columns: 1fr; }
}
</style>
