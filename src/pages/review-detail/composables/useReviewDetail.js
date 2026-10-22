/*
 * 심의 결과 화면 상태 — 선택 버전(FR-13), 활성 위반 지점, 수정안 반영(FR-5), 연동 재시도를 하위 feature 에 공유한다.
 */
import { computed, inject, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { REVIEW_STATUS, VIOLATION_RESOLUTION } from '@/shared/constants/review'
import { ACTION, actionFor } from '@/shared/constants/reviewActions'
import { useReviewsStore } from '@/shared/stores/reviews'
import { visibleVisualFindings } from '@/shared/utils/visualFindings'

const DETAIL_KEY = Symbol('review-detail')

export function provideReviewDetail() {
  const route = useRoute()
  const reviews = useReviewsStore()

  // 목록 요약 항목은 결과 전체가 없으므로 상세 응답을 받을 때까지 그리지 않는다
  const review = computed(() => {
    const item = reviews.byId(String(route.params.id))
    return reviews.isDetailed(item) ? item : null
  })
  const loading = ref(true)
  const latestNo = computed(() => (review.value ? reviews.latest(review.value).no : null))
  // 재검토(새 버전)는 2026-10-22에 없앴다. 그 전에 만든 v2 이상 검토도 최신 버전 리포트만 보여 준다.
  const versionNo = computed(() => latestNo.value)
  const version = computed(() => review.value?.versions.find((v) => v.no === versionNo.value) ?? null)
  const isLatest = computed(() => versionNo.value === latestNo.value)
  const isDone = computed(() => version.value?.status === REVIEW_STATUS.DONE)
  const result = computed(() => {
    const saved = version.value?.result
    return saved ? { ...saved, visualFindings: visibleVisualFindings(saved.visualFindings ?? []) } : null
  })
  const findings = computed(() => result.value?.findings ?? [])

  // 목록 API(/reviews)는 violations를 싣지 않는다. 이미 끝난 검토를 열 때도 상세를 한 번 받아 위반 행을 채운다.
  function loadDetail(id) {
    loading.value = true
    reviews.refresh(String(id)).catch(() => {}).finally(() => { loading.value = false })
  }
  watch(() => route.params.id, (id) => { if (id) loadDetail(id) }, { immediate: true })
  // 상태가 바뀐 뒤 목록 요약이 상세를 덮어쓰면 상세를 다시 받는다.
  watch(() => reviews.byId(String(route.params.id))?.summary, (summary) => {
    if (summary && route.params.id && !loading.value) loadDetail(route.params.id)
  })

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
  // ── 다음 행동 분류 (수정 권고, 자료 확인, 분석 보류, 표현 참고)와 목록 필터 ──
  const actionFilter = ref('all')
  const actionOf = (violation) => actionFor(findingFor(violation))
  const actionCounts = computed(() => {
    const counts = Object.fromEntries(Object.values(ACTION).map((a) => [a, 0]))
    for (const v of violations.value) counts[actionOf(v)] += 1
    return counts
  })
  // 표현 참고 문구는 원문 유지로 한 번에 결정할 수 있다. 서버 결정 API를 문구마다 그대로 호출한다.
  const bulkProgress = ref(null)
  async function keepAllNotes() {
    const targets = violations.value.filter((v) => !v.finalResolution && actionOf(v) === ACTION.NOTE)
    bulkProgress.value = { done: 0, count: targets.length }
    try {
      for (const v of targets) {
        await decideViolation(v.id, VIOLATION_RESOLUTION.KEPT)
        bulkProgress.value = { ...bulkProgress.value, done: bulkProgress.value.done + 1 }
      }
    } finally {
      bulkProgress.value = null
    }
  }

  // 어떤 문구(findingId)가 이미 결정됐는지 — ad-viewer/action-bar의 "반영됨" 표시가 실제 저장된
  // 결정을 반영하도록, 로컬로만 켜지는 플래그 대신 이걸 기준으로 삼는다.
  const decidedFindingIds = computed(() => new Set(violations.value.filter((v) => v.finalResolution).map((v) => v.findingId)))
  // 카드 번호(violations 순서)를 뷰어의 박스 번호에도 같이 쓴다.
  const violationNumbers = computed(() => new Map(violations.value.map((v, i) => [v.findingId, i + 1])))

  // ── 타일 단위 검토 (backend docs/03-contracts.md의 result.tiles와 tileId) ──
  // tiles가 없는 이전 결과와 PDF 원본은 기존 추출 문구 뷰어로 보여 준다.
  const tiles = computed(() => result.value?.tiles ?? [])
  // 규칙 sweep으로 추가된 문구는 예전 결과에서 finding.tileId가 비어 있다. OCR이 읽은 구간(location.tileId)으로 대신한다.
  const tileOf = (finding) => finding?.tileId ?? finding?.location?.tileId ?? null
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
    const tileId = tileMode.value ? tileOf(findings.value.find((f) => f.id === id)) : null
    const target = scrollTo === 'viewer' ? (tileId ? `tile-${tileId}` : 'ad-viewer') : `finding-${id}`
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: scrollTo === 'viewer' ? 'start' : 'center' })
  }

  watch(versionNo, () => {
    activeFindingId.value = findings.value[0]?.id ?? null
  }, { immediate: true })

  const context = {
    review,
    loading,
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
    actionFilter,
    actionOf,
    actionCounts,
    keepAllNotes,
    bulkProgress,
    tiles,
    tileOf,
    tileMode,
    activeFindingId,
    focusFinding,
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
