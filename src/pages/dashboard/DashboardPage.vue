<!--
  작업공간 홈 — 광고 검토 목록이 중심이다.
  상태 탭으로 거르고, 줄마다 광고 썸네일, 접수 > 분석 > 검토자 결정 단계, 지금 할 수 있는 행동을 보여 준다.
  모든 숫자와 상태는 reviews 스토어의 최신 버전에서 계산한다.
-->
<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { APPROVAL_STATE, REVIEW_STATUS, SEVERITY } from '@/shared/constants/review'
import { formatDateTime } from '@/shared/utils/format'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import ReviewThumb from '@/shared/components/review/ReviewThumb.vue'
import ReviewStage from '@/shared/components/review/ReviewStage.vue'
import { ANALYSIS_STEPS } from '@/shared/api/analysisApi'
import StartCards from './features/StartCards.vue'

const LIST_LIMIT = 10
const RUNNING_LIMIT = 3

const reviews = useReviewsStore()
const session = useSessionStore()
const route = useRoute()
const router = useRouter()
const canApprove = computed(() => session.can(PERMISSIONS.REVIEW_APPROVE))
const canCreate = computed(() => session.can(PERMISSIONS.REVIEW_CREATE))

const rows = computed(() =>
  reviews.list
    .map((review) => ({ review, version: reviews.latest(review) }))
    .sort((a, b) => new Date(b.review.updatedAt) - new Date(a.review.updatedAt)),
)

// 분석 중인 건은 탭과 상관없이 맨 위에 보이고, 서버 단계 완료 여부로 진행을 보여 준다
const runningRows = computed(() => rows.value.filter((row) => isRunning(row.version)))
const stepsDone = (version) => (version.steps ?? []).filter((v) => v >= 100).length
// 대시보드에 들어오면 분석 중인 건의 상태를 주기적으로 다시 받아 온다
onMounted(() => reviews.poll())

const decided = (version, state) => version.status === REVIEW_STATUS.DONE && version.approval.state === state
const isRunning = (version) => version.status === REVIEW_STATUS.QUEUED || version.status === REVIEW_STATUS.ANALYZING

// 이 계정이 지금 손댈 수 있는 건: 승인 권한이면 승인 대기, 신청 권한이면 수정 요청과 분석 실패
function isTodo(version) {
  if (canApprove.value && decided(version, APPROVAL_STATE.PENDING)) return true
  if (canCreate.value && decided(version, APPROVAL_STATE.CHANGES_REQUESTED)) return true
  return canCreate.value && version.status === REVIEW_STATUS.FAILED
}

const TABS = [
  { key: 'todo', label: 'dashboard.tabs.todo', match: isTodo },
  { key: 'analyzing', label: 'dashboard.tabs.analyzing', match: isRunning },
  { key: 'pending', label: 'dashboard.tabs.pending', match: (v) => decided(v, APPROVAL_STATE.PENDING) },
  { key: 'changes', label: 'dashboard.tabs.changes', match: (v) => decided(v, APPROVAL_STATE.CHANGES_REQUESTED) },
  { key: 'closed', label: 'dashboard.tabs.closed', match: (v) => decided(v, APPROVAL_STATE.APPROVED) || decided(v, APPROVAL_STATE.REJECTED) },
  { key: 'all', label: 'dashboard.tabs.all', match: () => true },
]
const tabs = computed(() => TABS.map((tab) => ({ ...tab, count: rows.value.filter((row) => tab.match(row.version)).length })))
const countOf = (key) => tabs.value.find((tab) => tab.key === key).count

// 탭은 주소에 남겨 새로고침과 뒤로 가기에도 유지한다. 처음에는 할 일이 있으면 할 일, 없으면 전체를 연다.
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
  document.getElementById(`dash-tab-${next.key}`)?.focus()
}

const filtered = computed(() => {
  const tab = TABS.find((t) => t.key === activeTab.value)
  return rows.value.filter((row) => tab.match(row.version))
})
const visible = computed(() => filtered.value.slice(0, LIST_LIMIT))

const activeLabel = computed(() => TABS.find((tab) => tab.key === activeTab.value).label)

const detailRoute = (review) => ({ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id } })
const newVersionRoute = (review) => ({ name: ROUTE_NAMES.REVIEW_NEW, query: { from: review.id } })
// 줄마다 지금 할 수 있는 행동 하나. 권한이 없는 행동은 보여 주지 않는다.
function actionOf({ review, version }) {
  if (canApprove.value && decided(version, APPROVAL_STATE.PENDING)) return { text: 'dashboard.actions.decide', to: detailRoute(review), strong: true }
  if (canCreate.value && decided(version, APPROVAL_STATE.CHANGES_REQUESTED)) return { text: 'dashboard.actions.newVersion', to: newVersionRoute(review), strong: true }
  if (canCreate.value && version.status === REVIEW_STATUS.FAILED) return { text: 'dashboard.actions.retry', to: newVersionRoute(review), strong: true }
  if (isRunning(version)) return { text: 'dashboard.actions.progress', to: detailRoute(review) }
  return { text: 'dashboard.actions.result', to: detailRoute(review) }
}

const highCount = (version) =>
  version.status === REVIEW_STATUS.DONE ? version.result.findings.filter((f) => f.severity === SEVERITY.HIGH).length : null

const EMPTY = {
  todo: 'dashboard.empty.todo',
  analyzing: 'dashboard.empty.analyzing',
  pending: 'dashboard.empty.pending',
  changes: 'dashboard.empty.changes',
  closed: 'dashboard.empty.closed',
  all: 'dashboard.empty.all',
}
</script>

<template>
  <div class="home">

    <BaseAlert v-if="reviews.error" variant="danger">{{ $t('dashboard.loadError') }} {{ reviews.error }}</BaseAlert>

    <StartCards :can-create="canCreate" :can-approve="canApprove" />

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
              <span class="running__name">{{ row.review.productName }} <span class="running__version">v{{ row.version.no }}</span></span>
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
      <button v-if="runningRows.length > RUNNING_LIMIT" type="button" class="running__more" @click="selectTab('analyzing')">
        {{ $t('dashboard.running.all', { count: runningRows.length }) }}
      </button>
    </section>

    <div class="status" role="tablist" :aria-label="$t('dashboard.statusLabel')">
      <button
        v-for="(tab, i) in tabs"
        :id="`dash-tab-${tab.key}`"
        :key="tab.key"
        type="button"
        role="tab"
        class="status__card"
        :class="[`status__card--${tab.key}`, { 'is-active': activeTab === tab.key }]"
        :aria-selected="activeTab === tab.key"
        aria-controls="dash-panel"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="selectTab(tab.key)"
        @keydown="onTabKey($event, i)"
      >
        <span class="status__label">{{ $t(tab.label) }}</span>
        <span class="status__count" :class="{ 'is-zero': !tab.count }">{{ tab.count }}</span>
      </button>
    </div>

    <section id="dash-panel" class="list" role="tabpanel" :aria-labelledby="`dash-tab-${activeTab}`">
      <div class="list__head">
        <h2>{{ $t(activeLabel) }} <span class="list__count">{{ filtered.length }}</span></h2>
        <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }" class="list__link">{{ $t('dashboard.historyAll') }}</RouterLink>
      </div>

      <ul v-if="visible.length" class="rows">
        <li v-for="row in visible" :key="row.review.id" class="row">
          <ReviewThumb :review="row.review" :version="row.version" />
          <div class="row__main">
            <RouterLink :to="detailRoute(row.review)" class="row__name">{{ row.review.productName }}</RouterLink>
            <p class="row__meta">
              <span class="row__version">v{{ row.version.no }}</span>
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
      <div v-else class="list__empty">
        <p class="list__empty-title">{{ $t(EMPTY[activeTab]) }}</p>
        <p v-if="!rows.length" class="list__empty-text">{{ $t('dashboard.emptyText') }}</p>
        <BaseButton v-if="!rows.length && canCreate" variant="outline" size="sm" :to="{ name: ROUTE_NAMES.REVIEW_NEW }">{{ $t('dashboard.firstReview') }}</BaseButton>
      </div>
      <p v-if="filtered.length > LIST_LIMIT" class="list__more">
        {{ $t('dashboard.more.recent', { count: LIST_LIMIT }) }}
        <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }">{{ $t('dashboard.more.link', { count: filtered.length }) }}</RouterLink>
      </p>
    </section>

    <p class="home__scope">
      {{ $t('dashboard.scope') }}
    </p>
  </div>
</template>

<style scoped>
.home {
  display: grid;
  /* 긴 줄이 있어도 화면 폭을 넘지 않도록 열 폭을 화면에 묶는다 */
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}

/* 상태 카드: 숫자로 고르는 탭. 새로 시작하기 카드처럼 점선 테두리와 상태별 색 포인트 */
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
.status__card--pending { --tone: #b86e00; --tone-bg: var(--color-warning-surface); }
.status__card--changes { --tone: var(--color-danger-text); --tone-bg: var(--color-danger-surface); }
.status__card--closed { --tone: var(--color-success-text); --tone-bg: var(--color-success-surface); }
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

/* 분석 중: 탭과 상관없이 맨 위에 보이는 진행 줄 */
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
.running__version { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.running__step { display: flex; justify-content: space-between; gap: 8px; font-size: var(--font-size-detail-s); color: var(--color-primary-active); }
.running__count { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.running__bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; }
.running__bar span { height: 4px; border-radius: var(--radius-full); background: var(--color-bg-muted); }
.running__bar span.is-done { background: var(--color-primary); }
.running__bar span.is-now { background: var(--color-primary); opacity: 0.4; animation: pulse 1.4s ease-in-out infinite; }
.running__more {
  justify-self: start;
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .running__pulse, .running__bar span.is-now { animation: none; }
}

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
  /* 줄마다 따로 그리는 그리드라 칸 너비를 고정해야 모든 줄이 같은 자리에 맞는다.
     너비는 가장 긴 영어 문구(High risk of violation, Changes requested, Submit new version) 기준 */
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
.row__version {
  padding: 0 6px;
  border-radius: 4px;
  background: var(--color-bg-muted);
  font-weight: var(--font-weight-bold);
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
.home__scope { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }

@media (max-width: 1180px) {
  .running__list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .status { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .row { grid-template-columns: 56px minmax(0, 1fr) 150px 180px; }
  .row__risk { display: none; }
}
@media (max-width: 760px) {
  .running__list { grid-template-columns: 1fr; }
  .status { display: flex; overflow-x: auto; gap: 8px; scrollbar-width: none; }
  .status__card { flex: none; min-width: 112px; padding: 12px 14px; }
  .status__count { font-size: 2.2rem; }
  .list__head { padding: 14px 16px; }
  .row { grid-template-columns: 56px minmax(0, 1fr); gap: 12px 14px; padding: 14px 16px; }
  .row > .stage { grid-column: 2; grid-template-columns: auto 1fr; align-items: center; gap: 10px; }
  .row__action { grid-column: 1 / -1; justify-self: stretch; }
}
</style>
