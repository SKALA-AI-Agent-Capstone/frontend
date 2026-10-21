import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { request } from '@/shared/api/http'
import { useSessionStore } from './session'
import { t } from '@/shared/i18n'

export const useReviewsStore = defineStore('reviews', () => {
  const session = useSessionStore()
  const items = ref([])
  const error = ref(null)
  let pollTimer = null
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
    try { items.value = await request('/reviews'); error.value = null } catch (e) { error.value = e.message }
  }
  async function refresh(id) { return upsert(await request(`/reviews/${id}`)) }
  async function poll() {
    clearTimeout(pollTimer)
    const running = list.value.filter(r => ['queued', 'analyzing'].includes(latest(r).status))
    await Promise.allSettled(running.map(r => refresh(r.id)))
    if (running.length && session.isAuthenticated) pollTimer = setTimeout(poll, 1500)
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
    return upsert(await request(`/reviews/${id}/decision`, { method: 'POST', body: JSON.stringify({ versionNo, state, comment }) }))
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
    items.value = []; await load(); poll()
  })
  return { list, error, byId, latest, pendingApprovals, poll, createReview, createVersion, decide,
    decideViolation, requestRewrite, canDelete,
    deleteReview, deleteAll, ensureSeeded: load, load, refresh, retryPublicData: unavailable, retryPatent: unavailable, confirmPatent: unavailable }
})
