/*
 * 심의 결과 화면 상태 — 선택 버전(FR-13), 활성 위반 지점, 수정안 반영(FR-5), 연동 재시도를 하위 feature 에 공유한다.
 */
import { computed, inject, provide, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { useReviewsStore } from '@/shared/stores/reviews'

const DETAIL_KEY = Symbol('review-detail')

export function provideReviewDetail() {
  const route = useRoute()
  const router = useRouter()
  const reviews = useReviewsStore()

  const review = computed(() => reviews.byId(String(route.params.id)))
  const latestNo = computed(() => (review.value ? reviews.latest(review.value).no : null))
  const versionNo = computed({
    get: () => Number(route.query.v) || latestNo.value,
    set: (no) => router.replace({ query: { ...route.query, v: no === latestNo.value ? undefined : no } }),
  })
  const version = computed(() => review.value?.versions.find((v) => v.no === versionNo.value) ?? null)
  const isLatest = computed(() => versionNo.value === latestNo.value)
  const isDone = computed(() => version.value?.status === REVIEW_STATUS.DONE)
  const result = computed(() => version.value?.result ?? null)
  const findings = computed(() => result.value?.findings ?? [])

  // ── 위반 지점 선택 (뷰어 ↔ 카드) ──
  const activeFindingId = ref(null)
  function focusFinding(id, { scrollTo = 'card' } = {}) {
    activeFindingId.value = id
    const target = scrollTo === 'viewer' ? 'ad-viewer' : `finding-${id}`
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: scrollTo === 'viewer' ? 'start' : 'center' })
  }

  // ── 수정안 반영 (FR-5 → FR-13 재심의 초안) ──
  const revisions = reactive({}) // findingId → 반영한 제안 index
  watch(versionNo, () => {
    activeFindingId.value = findings.value[0]?.id ?? null
    for (const key of Object.keys(revisions)) delete revisions[key]
  }, { immediate: true })

  function applyRevision(findingId, index) {
    revisions[findingId] = index
  }
  function clearRevision(findingId) {
    delete revisions[findingId]
  }

  // PDF와 이미지는 사용자가 편집한 새 원본으로 재검토한다.
  function reviseAndRecheck() {
    router.push({ name: ROUTE_NAMES.REVIEW_NEW, query: { from: review.value.id } })
  }

  const context = {
    review,
    version,
    versionNo,
    latestNo,
    isLatest,
    isDone,
    result,
    findings,
    activeFindingId,
    focusFinding,
    revisions,
    applyRevision,
    clearRevision,
    reviseAndRecheck,
    retryPatent: (patentId) => reviews.retryPatent(review.value.id, version.value.no, patentId),
    confirmPatent: (patentId, number) => reviews.confirmPatent(review.value.id, version.value.no, patentId, number),
  }
  provide(DETAIL_KEY, context)
  return context
}

export function useReviewDetail() {
  const context = inject(DETAIL_KEY)
  if (!context) throw new Error('useReviewDetail() 는 provideReviewDetail() 하위에서만 사용할 수 있습니다.')
  return context
}
