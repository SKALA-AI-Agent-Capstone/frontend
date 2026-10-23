/*
 * 제품 증빙 (시험 성적서 등). 올리면 서버가 읽기를 시작하고(status=reading) 끝나면 기관, 코드, 버전, 제품별 쪽 범위가 채워진다.
 * 읽는 중인 증빙이 있는 동안 그 제품의 검토는 접수되지 않는다(서버 409 PRODUCT_EVIDENCE_READING).
 * 읽는 중이면 몇 초마다 다시 받아 끝나는 것을 따라간다.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/shared/api/http'
import { useProductsStore } from './products'

export const EVIDENCE_MAX_BYTES = 25 * 1024 * 1024
const POLL_MS = 4000

const KNOWN_ERRORS = new Set(['EVIDENCE_FILE_REQUIRED', 'FILE_LIMIT_25_MIB', 'PDF_OR_IMAGE_REQUIRED', 'DOC_TYPE_TOO_LONG',
  'EVIDENCE_NOT_FOUND', 'EVIDENCE_ALREADY_READING', 'PRODUCT_NOT_FOUND'])
export const evidenceErrorKey = message => (KNOWN_ERRORS.has(message) ? `products.evidence.errors.${message}` : null)

// 읽기에 실패했거나 일부 쪽을 못 읽은 이유. 문구가 없는 코드는 그대로 보여 준다.
const FAILURES = new Set(['EVIDENCE_PAGE_LIMIT', 'FILE_TOO_LARGE', 'PDF_OR_IMAGE_REQUIRED', 'EVIDENCE_READ_TIMEOUT',
  'EVIDENCE_READ_FAILED', 'EVIDENCE_FILE_NOT_FOUND', 'READER_BUSY', 'READ_INTERRUPTED'])
export const failureKey = code => (FAILURES.has(code) ? `products.evidence.failures.${code}` : null)

export const useProductEvidenceStore = defineStore('productEvidence', () => {
  const byProduct = ref({})
  let timers = {}

  const list = productId => byProduct.value[productId] ?? []
  const reading = productId => list(productId).some(item => item.status === 'reading')

  function stop(productId) {
    clearTimeout(timers[productId])
    delete timers[productId]
  }

  function follow(productId) {
    stop(productId)
    if (!reading(productId)) return
    timers[productId] = setTimeout(() => load(productId).catch(() => follow(productId)), POLL_MS)
  }

  async function load(productId) {
    const wasReading = reading(productId)
    byProduct.value[productId] = await request(`/products/${productId}/evidence`)
    follow(productId)
    // 읽기가 끝나면 제품의 evidenceReading 표시도 바뀐다
    if (wasReading && !reading(productId)) useProductsStore().refresh(productId).catch(() => {})
  }

  async function upload(productId, file, docType) {
    const data = new FormData()
    data.append('file', file)
    data.append('docType', docType || 'other')
    const saved = await request(`/products/${productId}/evidence`, { method: 'POST', body: data })
    await load(productId)
    useProductsStore().refresh(productId).catch(() => {})
    return saved
  }

  async function reread(productId, id) {
    await request(`/products/${productId}/evidence/${id}/reread`, { method: 'POST' })
    await load(productId)
    useProductsStore().refresh(productId).catch(() => {})
  }

  async function remove(productId, id) {
    await request(`/products/${productId}/evidence/${id}`, { method: 'DELETE' })
    await load(productId)
    useProductsStore().refresh(productId).catch(() => {})
  }

  function clear(productId) { stop(productId); delete byProduct.value[productId] }

  return { list, reading, load, upload, reread, remove, clear }
})
