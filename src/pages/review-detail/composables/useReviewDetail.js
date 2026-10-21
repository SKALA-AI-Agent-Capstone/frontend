/*
 * 심의 결과 화면 상태 — 선택 버전(FR-13), 활성 위반 지점, 수정안 반영(FR-5), 연동 재시도를 하위 feature 에 공유한다.
 */
import { computed, inject, provide, ref, watch } from 'vue'
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

  // 목록 API(/reviews)는 violations를 싣지 않는다. 이미 끝난 검토를 열 때도 상세를 한 번 받아 위반 행을 채운다.
  watch(() => route.params.id, (id) => { if (id) reviews.refresh(String(id)).catch(() => {}) }, { immediate: true })

  // ── 문구별 위반과 HITL 결정 (violations는 항상 "최신 버전" 기준, 재검토 버전 구조 없음) ──
  const violations = computed(() => review.value?.violations ?? [])
  const hitl = computed(() => review.value?.hitl ?? null)
  const latestFindings = computed(() => (review.value ? reviews.latest(review.value).result?.findings ?? [] : []))
  function findingFor(violation) {
    return latestFindings.value.find((f) => f.id === violation.findingId) ?? null
  }
  async function decideViolation(violationId, resolution, extra = {}) {
    await reviews.decideViolation(review.value.id, violationId, { resolution, ...extra })
  }
  async function requestViolationRewrite(violationId, retryNote) {
    await reviews.requestRewrite(review.value.id, violationId, retryNote ? { retryNote } : {})
  }
  // 어떤 문구(findingId)가 이미 결정됐는지 — ad-viewer/action-bar의 "반영됨" 표시가 실제 저장된
  // 결정을 반영하도록, 로컬로만 켜지는 플래그 대신 이걸 기준으로 삼는다.
  const decidedFindingIds = computed(() => new Set(violations.value.filter((v) => v.finalResolution).map((v) => v.findingId)))
  // 카드 번호(violations 순서)를 뷰어의 박스 번호에도 같이 쓴다.
  const violationNumbers = computed(() => new Map(violations.value.map((v, i) => [v.findingId, i + 1])))

  // ── 타일 단위 검토 (backend docs/03-contracts.md의 result.tiles와 tileId) ──
  // tiles가 없는 이전 결과와 PDF 원본은 기존 추출 문구 뷰어로 보여 준다.
  const tiles = computed(() => result.value?.tiles ?? [])
  function isPdfFile(fileId) {
    const file = version.value?.input?.files?.find((f) => f.id === fileId)
    return file?.mime === 'application/pdf' || /\.pdf$/i.test(file?.name ?? '')
  }
  // violations(문구 결정)는 최신 버전 기준이므로 타일 화면도 최신 버전에서만 쓴다.
  const tileMode = computed(() =>
    isLatest.value && tiles.value.length > 0 && tiles.value.every((tile) => !isPdfFile(tile.fileId)),
  )

  // ── 위반 지점 선택 (뷰어 ↔ 카드) ──
  const activeFindingId = ref(null)
  function focusFinding(id, { scrollTo = 'card' } = {}) {
    activeFindingId.value = id
    const tileId = tileMode.value ? findings.value.find((f) => f.id === id)?.tileId : null
    const target = scrollTo === 'viewer' ? (tileId ? `tile-${tileId}` : 'ad-viewer') : `finding-${id}`
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: scrollTo === 'viewer' ? 'start' : 'center' })
  }

  watch(versionNo, () => {
    activeFindingId.value = findings.value[0]?.id ?? null
  }, { immediate: true })

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
    violations,
    hitl,
    findingFor,
    decideViolation,
    requestViolationRewrite,
    decidedFindingIds,
    violationNumbers,
    tiles,
    tileMode,
    activeFindingId,
    focusFinding,
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
