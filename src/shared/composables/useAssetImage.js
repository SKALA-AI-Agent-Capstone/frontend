/*
 * 원본 이미지 보존(2026-10-20 설계 변경) — 위반 검토/리포트 화면에서 보여줄 원본을
 * /api/v1/reviews/{id}/assets/{assetId}에서 받아 blob URL로 바꾼다.
 * img src는 Authorization 헤더를 못 보내므로 fetch로 받는다. 같은 asset을 여러 카드가
 * 참조할 수 있어 blob URL을 캐시로 공유하고, 더 쓰는 곳이 없을 때만 해제한다.
 */
import { onUnmounted, ref, watch } from 'vue'
import { requestBlob } from '@/shared/api/http'

const cache = new Map() // key → { url, refs }

function keyOf(reviewId, assetId) {
  return `${reviewId}:${assetId}`
}

function release(key) {
  const entry = cache.get(key)
  if (!entry) return
  entry.refs -= 1
  if (entry.refs <= 0) {
    URL.revokeObjectURL(entry.url)
    cache.delete(key)
  }
}

export function useAssetImage(reviewId, assetId) {
  const url = ref(null)
  const error = ref(null)
  let heldKey = null

  async function load() {
    error.value = null
    if (heldKey) { release(heldKey); heldKey = null; url.value = null }
    const id = reviewId.value, asset = assetId.value
    if (!id || !asset) return
    const key = keyOf(id, asset)
    const existing = cache.get(key)
    if (existing) {
      existing.refs += 1
      heldKey = key
      url.value = existing.url
      return
    }
    try {
      const blob = await requestBlob(`/reviews/${id}/assets/${asset}`)
      cache.set(key, { url: URL.createObjectURL(blob), refs: 1 })
      heldKey = key
      url.value = cache.get(key).url
    } catch (e) {
      error.value = e.message
    }
  }

  watch([reviewId, assetId], load, { immediate: true })
  onUnmounted(() => { if (heldKey) release(heldKey) })

  return { url, error }
}
