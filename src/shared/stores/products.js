/*
 * 제품 (2026-10-22 제품 단위 검토). 광고 검토는 제품에 속한다.
 * 서버 오류는 코드(PRODUCT_NAME_TAKEN, PRODUCT_HAS_REVIEWS 등)가 Error.message로 오므로 화면이 코드별 문구로 바꾼다.
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { request } from '@/shared/api/http'
import { useSessionStore } from './session'

export const PRODUCT_TYPES = ['general', 'functional']
export const PRODUCT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

// 화면 문구가 있는 서버 오류 코드. 그 외 오류는 받은 메시지를 그대로 보여 준다.
const KNOWN_ERRORS = new Set(['PRODUCT_NAME_TAKEN', 'PRODUCT_NAME_REQUIRED', 'PRODUCT_NAME_TOO_LONG',
  'INVALID_PRODUCT_TYPE', 'IMAGE_TYPE_UNSUPPORTED', 'IMAGE_LIMIT_10_MIB', 'PRODUCT_NOT_FOUND', 'PRODUCT_HAS_REVIEWS'])
export const productErrorKey = message => (KNOWN_ERRORS.has(message) ? `products.errors.${message}` : null)

export const useProductsStore = defineStore('products', () => {
  const session = useSessionStore()
  const items = ref([])
  const error = ref(null)
  const loaded = ref(false)
  let loading = null

  const list = computed(() => items.value)
  const byId = id => items.value.find(p => p.id === id) ?? null

  function upsert(product) {
    const index = items.value.findIndex(p => p.id === product.id)
    if (index < 0) items.value.unshift(product)
    else items.value[index] = product
    return product
  }

  // 화면마다 불러도 되도록, 받는 중인 요청이 있으면 그 요청을 같이 기다린다
  function load() {
    if (!session.isAuthenticated) { items.value = []; return Promise.resolve() }
    loading ??= (async () => {
      try { items.value = await request('/products'); error.value = null } catch (e) { error.value = e.message }
      loaded.value = true
    })().finally(() => { loading = null })
    return loading
  }

  async function refresh(id) { return upsert(await request(`/products/${id}`)) }

  function form(fields, image) {
    const data = new FormData()
    data.append('metadata', JSON.stringify(fields))
    if (image) data.append('image', image)
    return data
  }

  async function create({ name, type, image = null }) {
    return upsert(await request('/products', { method: 'POST', body: form({ name, type }, image) }))
  }

  async function update(id, { name, type }) {
    return upsert(await request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify({ name, type }) }))
  }

  async function replaceImage(id, image) {
    const data = new FormData()
    data.append('image', image)
    return upsert(await request(`/products/${id}/image`, { method: 'PUT', body: data }))
  }

  // 검토가 남은 제품은 서버가 PRODUCT_HAS_REVIEWS로 거절한다. 그때는 목록을 바꾸지 않고 오류를 그대로 넘긴다.
  async function remove(id) {
    await request(`/products/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(p => p.id !== id)
  }

  watch(() => session.user?.id, () => { items.value = []; loaded.value = false })

  return { list, error, loaded, byId, load, refresh, create, update, replaceImage, remove }
})
