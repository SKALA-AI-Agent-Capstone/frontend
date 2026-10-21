import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { request } from '@/shared/api/http'
import { openReviewStream } from '@/shared/api/reviewEvents'
import { useSessionStore } from './session'
import { useCreditsStore } from './credits'
import { t } from '@/shared/i18n'

export const useReviewsStore = defineStore('reviews', () => {
  const session = useSessionStore()
  const items = ref([])
  const error = ref(null)
  let pollTimer = null
  // 실행 중인 건마다 SSE 구독 하나. 구독이 실패한 건만 폴링한다.
  const streams = new Map()
  const fallback = new Set()
  // 화면에 보여 줄 최근 진행 이벤트: { [reviewId]: { tool, state, retry, live } }
  const activity = ref({})
  const MAX_STREAMS = 4
  const list = computed(() => items.value.filter(r => r.tenantId === session.tenant?.id))
  const latest = review => review.versions[review.versions.length - 1]
  const byId = id => list.value.find(r => r.id === id) ?? null
  const pendingApprovals = computed(() => list.value.map(review => ({ review, version: latest(review) })).filter(x => x.version.status === 'done' && x.version.approval.state === 'pending'))
  function upsert(review) {
    const index = items.value.findIndex(r => r.id === review.id)
    if (index < 0) items.value.unshift(review)
    else items.value[index] = review
    return review
  }
  async function load() {
    if (!session.isAuthenticated) { items.value = []; return }
    try { items.value = (await request('/reviews')).map(keepDetail); error.value = null } catch (e) { error.value = e.message }
  }
  // 목록 API는 violations와 canApprove를 싣지 않는다. 상세로 먼저 받아 둔 건을 목록이 늦게 덮으면
  // 수정안 카드가 통째로 사라지므로, 최신 버전이 그대로일 때만 상세 값을 이어 붙인다.
  function keepDetail(review) {
    const known = items.value.find(r => r.id === review.id)
    if (!known?.violations || !review.versions?.length) return review
    const [before, after] = [latest(known), latest(review)]
    if (before.no !== after.no || before.status !== after.status) return review
    return { ...review, violations: known.violations, hitl: { ...known.hitl, ...review.hitl } }
  }
  async function refresh(id) { return upsert(await request(`/reviews/${id}`)) }
  const isRunning = review => ['queued', 'analyzing'].includes(latest(review).status)
  // 결정 뒤 Agent 재개를 기다리는 건도 resume_completed 또는 resume_failed를 받을 때까지 따라간다.
  const needsStream = review => isRunning(review) || latest(review).approval?.agentResume === 'pending'
  function setActivity(id, patch) {
    activity.value = { ...activity.value, [id]: { ...activity.value[id], ...patch } }
  }
  function onEvent(id, event) {
    const data = event.data
    if (event.type === 'snapshot') { setActivity(id, { live: true }); upsert(data); return }
    const review = byId(id)
    const version = review && latest(review)
    if (!version || data.versionNo !== version.no) return
    if (event.type === 'started') setActivity(id, { tool: null, state: null, retry: null })
    else if (event.type === 'step_done' && Array.isArray(version.steps)) {
      const steps = [...version.steps]
      steps[data.step] = 100
      version.steps = steps
    } else if (event.type === 'tool_started') setActivity(id, { tool: data.tool, state: 'running' })
    else if (event.type === 'tool_finished') setActivity(id, { tool: data.tool, state: data.ok ? 'done' : 'failed' })
    else if (event.type === 'retry_scheduled') setActivity(id, { retry: data.attempt })
    else if (event.type === 'completed' || event.type === 'failed') {
      setActivity(id, { tool: null, state: null })
      // 위반 0건 자동 승인이면 이어서 재개를 기다리므로 새 상태로 다시 구독한다.
      refresh(id).then(() => poll()).catch(() => {})
      useCreditsStore().loadBalance().catch(() => {})
    } else if (event.type === 'resume_completed' || event.type === 'resume_failed') refresh(id).catch(() => {})
  }
  function follow(id) {
    if (streams.has(id) || fallback.has(id) || streams.size >= MAX_STREAMS) return streams.has(id)
    setActivity(id, { live: false })
    streams.set(id, openReviewStream(id, {
      onEvent: event => onEvent(id, event),
      onClose: reason => {
        streams.delete(id)
        setActivity(id, { live: false })
        if (reason === 'fallback') { fallback.add(id); poll() }
      },
    }))
    return true
  }
  function closeStreams() {
    for (const close of streams.values()) close()
    streams.clear(); fallback.clear()
  }
  // 실행 중인 건은 SSE로 따라간다. 스트림을 열지 못한 건(연결 실패, 동시 구독 한도)만 1.5초 폴링을 유지한다.
  async function poll() {
    clearTimeout(pollTimer)
    if (!session.isAuthenticated) return
    const running = list.value.filter(needsStream)
    const polled = running.filter(r => !follow(r.id))
    await Promise.allSettled(polled.map(r => refresh(r.id)))
    if (polled.length) {
      if (polled.some(r => { const current = byId(r.id); return current && !needsStream(current) }))
        await useCreditsStore().loadBalance().catch(() => {})
      pollTimer = setTimeout(poll, 1500)
    }
    for (const id of fallback) if (!running.some(r => r.id === id)) fallback.delete(id)
  }
  function form(input) {
    const data = new FormData()
    data.append('metadata', JSON.stringify({ product: input.product, media: input.media, evidence: input.evidence.map(e => ({ docType: e.docType })) }))
    for (const file of input.files) {
      if (!(file.file instanceof File)) throw new Error(t('ui.errors.reselectAd'))
      data.append('files', file.file)
    }
    for (const evidence of input.evidence) {
      if (!(evidence.file instanceof File)) throw new Error(t('ui.errors.reselectEvidence'))
      data.append('evidence', evidence.file)
    }
    return data
  }
  async function submit(path, input) {
    const review = upsert(await request(path, { method: 'POST', body: form(input) }))
    const version = latest(review)
    poll()
    return { reviewId: review.id, versionNo: version.no }
  }
  const createReview = input => submit('/reviews', input)
  const createVersion = (id, input) => submit(`/reviews/${id}/re-review`, input)
  async function decide(id, versionNo, state, comment) {
    const review = upsert(await request(`/reviews/${id}/decision`, { method: 'POST', body: JSON.stringify({ versionNo, state, comment }) }))
    poll() // 결정은 저장됐고 Agent 재개는 서버 큐가 처리한다. 결과를 SSE로 받는다.
    return review
  }
  async function decideViolation(id, violationId, body) {
    return upsert(await request(`/reviews/${id}/violations/${violationId}/decision`, { method: 'POST', body: JSON.stringify(body) }))
  }
  async function requestRewrite(id, violationId, body = {}) {
    return upsert(await request(`/reviews/${id}/violations/${violationId}/rewrite-requests`, { method: 'POST', body: JSON.stringify(body) }))
  }
  const canDelete = review => review.authorId === session.user?.id || session.user?.role === 'admin'
  async function deleteReview(id) {
    await request(`/reviews/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(r => r.id !== id)
    return true
  }
  async function deleteAll() { const result = await request('/reviews', { method: 'DELETE' }); await load(); return result.deleted }
  async function unavailable() { throw new Error(t('ui.errors.retryUnavailable')) }
  watch(() => session.user?.id, async () => {
    clearTimeout(pollTimer)
    closeStreams(); activity.value = {}
    items.value = []; await load(); poll()
  })
  return { list, error, byId, latest, pendingApprovals, poll, activity, createReview, createVersion, decide,
    decideViolation, requestRewrite, canDelete,
    deleteReview, deleteAll, ensureSeeded: load, load, refresh, retryPublicData: unavailable, retryPatent: unavailable, confirmPatent: unavailable }
})
