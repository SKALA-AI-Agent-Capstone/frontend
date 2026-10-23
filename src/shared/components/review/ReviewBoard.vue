<!--
  검토 목록: 상태 탭으로 거르고, 줄마다 광고 썸네일, 접수 > 분석 > 리포트 단계, 지금 할 수 있는 행동을 보여 준다.
  2026-10-22까지 대시보드에 있던 목록을 제품 상세에서 쓰도록 옮겼다. 탭은 주소(?tab=)에 남는다.
  검토 전체 승인과 완료 상태, 재검토는 2026-10-22에 없앴다. 분석이 끝나면 결과가 곧 리포트다.
-->
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { formatDateTime } from '@/shared/utils/format'
import { highCount } from '@/shared/utils/findings'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'
import ReviewStage from '@/shared/components/review/ReviewStage.vue'

const LIST_LIMIT = 10

const props = defineProps({
  rows: { type: Array, required: true }, // [{ review, version }], 최근 순
  loaded: { type: Boolean, default: true },
  canCreate: { type: Boolean, default: false },
  title: { type: String, default: null }, // 목록 머리 제목. 없으면 현재 탭 이름
  newReviewRoute: { type: Object, default: () => ({ name: ROUTE_NAMES.REVIEW_NEW }) },
})

const route = useRoute()
const router = useRouter()

const isRunning = (version) => version.status === REVIEW_STATUS.QUEUED || version.status === REVIEW_STATUS.ANALYZING
// 리포트에서 아직 결정하지 않은 문구가 남은 건. 다 결정해도 따로 완료 처리는 없다.
const hasUndecided = (review, version) => version.status === REVIEW_STATUS.DONE && (review.hitl?.undecidedCount ?? 0) > 0

const TABS = [
  { key: 'todo', label: 'dashboard.tabs.todo', match: hasUndecided },
  { key: 'analyzing', label: 'dashboard.tabs.analyzing', match: (_review, v) => isRunning(v) },
  { key: 'failed', label: 'dashboard.tabs.failed', match: (_review, v) => v.status === REVIEW_STATUS.FAILED },
  { key: 'all', label: 'dashboard.tabs.all', match: () => true },
]
const tabs = computed(() => TABS.map((tab) => ({ ...tab, count: props.rows.filter((row) => tab.match(row.review, row.version)).length })))
const countOf = (key) => tabs.value.find((tab) => tab.key === key).count

// 처음에는 할 일이 있으면 할 일, 없으면 전체를 연다
const activeTab = computed(() => {
  const asked = TABS.find((tab) => tab.key === route.query.tab)
  if (asked) return asked.key
  return countOf('todo') ? 'todo' : 'all'
})
function selectTab(key) {
  router.replace({ query: { ...route.query, tab: key } })
}
function onTabKey(event, index) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  const next = TABS[(index + step + TABS.length) % TABS.length]
  selectTab(next.key)
  document.getElementById(`board-tab-${next.key}`)?.focus()
}

const filtered = computed(() => {
  const tab = TABS.find((t) => t.key === activeTab.value)
  return props.rows.filter((row) => tab.match(row.review, row.version))
})
const visible = computed(() => filtered.value.slice(0, LIST_LIMIT))
const activeLabel = computed(() => TABS.find((tab) => tab.key === activeTab.value).label)

// 한 제품 안에서는 제품 이름이 모두 같으므로 첫 광고 파일 이름으로 줄을 구분한다
const titleOf = ({ review, version }) => version.input?.files?.[0]?.name ?? review.productName

const detailRoute = (review) => ({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } })
// 실패한 건은 제품과 매체를 불러온 새 검토로 다시 신청한다
const retryRoute = (review) => ({ name: ROUTE_NAMES.REVIEW_NEW, query: { from: review.id } })
// 줄마다 지금 할 수 있는 행동 하나. 권한이 없는 행동은 보여 주지 않는다.
function actionOf({ review, version }) {
  if (hasUndecided(review, version)) return { text: 'dashboard.actions.decide', to: detailRoute(review), strong: true }
  if (props.canCreate && version.status === REVIEW_STATUS.FAILED) return { text: 'dashboard.actions.retry', to: retryRoute(review), strong: true }
  if (isRunning(version)) return { text: 'dashboard.actions.progress', to: detailRoute(review) }
  return { text: 'dashboard.actions.result', to: detailRoute(review) }
}

const EMPTY = {
  todo: 'dashboard.empty.todo',
  analyzing: 'dashboard.empty.analyzing',
  failed: 'dashboard.empty.failed',
  all: 'dashboard.empty.all',
}
</script>

<template>
  <div class="board">
    <div class="status" role="tablist" :aria-label="$t('dashboard.statusLabel')">
      <button
        v-for="(tab, i) in tabs"
        :id="`board-tab-${tab.key}`"
        :key="tab.key"
        type="button"
        role="tab"
        class="status__card"
        :class="[`status__card--${tab.key}`, { 'is-active': activeTab === tab.key }]"
        :aria-selected="activeTab === tab.key"
        aria-controls="board-panel"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="selectTab(tab.key)"
        @keydown="onTabKey($event, i)"
      >
        <span class="status__label">{{ $t(tab.label) }}</span>
        <span class="status__count" :class="{ 'is-zero': !tab.count }">{{ tab.count }}</span>
      </button>
    </div>

    <section id="board-panel" class="list" role="tabpanel" :aria-labelledby="`board-tab-${activeTab}`">
      <div class="list__head">
        <h2>{{ title ?? $t(activeLabel) }} <span class="list__count">{{ filtered.length }}</span></h2>
        <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }" class="list__link">{{ $t('dashboard.historyAll') }}</RouterLink>
      </div>

      <ul v-if="visible.length" class="rows">
        <li v-for="row in visible" :key="row.review.id" class="row">
          <ReviewThumb :review="row.review" :version="row.version" />
          <div class="row__main">
            <RouterLink :to="detailRoute(row.review)" class="row__name">{{ titleOf(row) }}</RouterLink>
            <p class="row__meta">
              <span>{{ row.review.authorName ?? $t('dashboard.unknownAuthor') }}</span>
              <span>{{ formatDateTime(row.review.updatedAt) }}</span>
            </p>
          </div>
          <p class="row__risk" :class="{ 'is-high': highCount(row.version) > 0 }">
            <template v-if="highCount(row.version) !== null">{{ $t('review.severity.high') }} <strong>{{ highCount(row.version) }}</strong></template>
            <template v-else>-</template>
          </p>
          <ReviewStage :version="row.version" />
          <BaseButton
            class="row__action"
            :variant="actionOf(row).strong ? 'secondary' : 'ghost'"
            size="sm"
            :to="actionOf(row).to"
          >
            {{ $t(actionOf(row).text) }}
          </BaseButton>
        </li>
      </ul>
      <p v-else-if="!loaded" class="list__empty" role="status">{{ $t('common.listLoading') }}</p>
      <div v-else class="list__empty">
        <p class="list__empty-title">{{ $t(EMPTY[activeTab]) }}</p>
        <p v-if="!rows.length" class="list__empty-text">{{ $t('dashboard.emptyText') }}</p>
        <BaseButton v-if="!rows.length && canCreate" variant="outline" size="sm" :to="newReviewRoute">{{ $t('dashboard.firstReview') }}</BaseButton>
      </div>
      <p v-if="filtered.length > LIST_LIMIT" class="list__more">
        {{ $t('dashboard.more.recent', { count: LIST_LIMIT }) }}
        <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }">{{ $t('dashboard.more.link', { count: filtered.length }) }}</RouterLink>
      </p>
    </section>
  </div>
</template>

<style scoped>
.board { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-lg); }

/* 상태 카드: 숫자로 고르는 탭. 점선 테두리와 상태별 색 포인트 */
.status {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}
.status__card {
  --tone: var(--color-text);
  --tone-bg: var(--color-bg-muted);
  display: grid;
  gap: 10px;
  justify-items: start;
  padding: 16px 18px;
  border: 1.5px dashed var(--color-border-strong);
  border-radius: 16px;
  background: var(--color-bg-surface);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast), translate 200ms ease;
}
.status__card--todo { --tone: var(--color-primary); --tone-bg: var(--color-primary-subtle); }
.status__card--analyzing { --tone: var(--color-info-text); --tone-bg: var(--color-info-surface); }
.status__card--failed { --tone: var(--color-danger-text); --tone-bg: var(--color-danger-surface); }
.status__card:hover { border-color: var(--tone); translate: 0 -2px; }
.status__card:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
.status__label {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  white-space: nowrap;
}
.status__count {
  font-size: 2.8rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}
.status__count.is-zero { color: var(--color-text-secondary); }
.status__card.is-active {
  border-style: solid;
  border-color: var(--tone);
  background: var(--tone-bg);
}
.status__card.is-active .status__count { color: var(--tone); }

/* 목록 */
.list {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  overflow: clip;
}
.list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 18px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.list__head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
}
.list__count {
  padding: 0 8px;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.list__link {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: none;
}
.list__link:hover { text-decoration: underline; text-underline-offset: 3px; }

.rows { display: grid; }
.row {
  /* 줄마다 따로 그리는 그리드라 칸 너비를 고정해야 모든 줄이 같은 자리에 맞는다 */
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 176px 150px 180px;
  align-items: center;
  gap: 20px;
  padding: 14px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color var(--transition-fast);
}
.row:last-child { border-bottom: 0; }
.row:hover { background: var(--color-bg-page); }
.row__name {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-decoration: none;
  overflow-wrap: anywhere;
}
.row__name:hover { color: var(--color-primary); }
.row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin-top: 4px;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.row__risk { font-size: var(--font-size-detail-s); color: var(--color-text-disabled); white-space: nowrap; }
.row__risk strong { font-size: var(--font-size-body-s); font-variant-numeric: tabular-nums; }
.row__risk.is-high { color: var(--color-danger-text); }
.row__action { justify-self: end; }

.list__empty {
  display: grid;
  justify-items: center;
  gap: var(--space-sm);
  padding: 72px 24px;
  text-align: center;
}
.list__empty-title { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); }
.list__empty-text { max-width: 32em; color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
.list__more {
  padding: 14px 24px;
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.list__more a { color: var(--color-primary); font-weight: var(--font-weight-bold); }

@media (max-width: 1180px) {
  .status { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .row { grid-template-columns: 56px minmax(0, 1fr) 150px 180px; }
  .row__risk { display: none; }
}
@media (max-width: 760px) {
  .status { display: flex; overflow-x: auto; gap: 8px; scrollbar-width: none; }
  .status__card { flex: none; min-width: 112px; padding: 12px 14px; }
  .status__count { font-size: 2.2rem; }
  .list__head { padding: 14px 16px; }
  .row { grid-template-columns: 56px minmax(0, 1fr); gap: 12px 14px; padding: 14px 16px; }
  .row > .stage { grid-column: 2; grid-template-columns: auto 1fr; align-items: center; gap: 10px; }
  .row__action { grid-column: 1 / -1; justify-self: stretch; }
}
</style>
