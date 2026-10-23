/*
 * 인증이 필요한 이미지 API를 blob URL로 바꾼다. img src는 Authorization 헤더를 못 보내므로 fetch로 받는다.
 * 같은 경로를 여러 곳이 보면 blob URL을 함께 쓰고, 더 쓰는 곳이 없을 때만 해제한다.
 * 경로가 바뀌면(예: 대표 이미지 ?v= 값) 예전 URL을 놓고 새로 받는다.
 */
import { onUnmounted, ref, watch } from 'vue'
import { requestBlob } from '@/shared/api/http'

const cache = new Map() // path → { url, refs }
// 아직 받는 중인 요청. 같은 이미지를 여러 곳이 동시에 열어도 한 번만 내려받는다.
const pending = new Map() // path → Promise<Blob>

function release(path) {
  const entry = cache.get(path)
  if (!entry) return
  entry.refs -= 1
  if (entry.refs <= 0) {
    URL.revokeObjectURL(entry.url)
    cache.delete(path)
  }
}

/** pathRef: API 경로(/api/v1 뒤)를 돌려주는 ref 또는 computed. null이면 받지 않는다. */
export function useBlobImage(pathRef) {
  const url = ref(null)
  const error = ref(null)
  let held = null

  async function load(path) {
    error.value = null
    if (held) { release(held); held = null; url.value = null }
    if (!path) return
    const existing = cache.get(path)
    if (existing) {
      existing.refs += 1
      held = path
      url.value = existing.url
      return
    }
    try {
      if (!pending.has(path)) pending.set(path, requestBlob(path).finally(() => pending.delete(path)))
      const blob = await pending.get(path)
      // 기다리는 사이 다른 경로로 바뀌었으면 이 결과는 쓰지 않는다
      if (pathRef.value !== path) return
      const entry = cache.get(path)
      if (entry) entry.refs += 1
      else cache.set(path, { url: URL.createObjectURL(blob), refs: 1 })
      held = path
      url.value = cache.get(path).url
    } catch (e) {
      error.value = e.message
    }
  }

  watch(pathRef, load, { immediate: true })
  onUnmounted(() => { if (held) release(held) })

  return { url, error }
}
