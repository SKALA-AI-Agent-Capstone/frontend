/*
 * 원본 이미지 보존(2026-10-20 설계 변경) — 위반 검토/리포트 화면에서 보여줄 원본을
 * /api/v1/reviews/{id}/assets/{assetId}에서 받아 blob URL로 바꾼다.
 * 목록 화면은 thumbnail 선택지로 .../thumbnail(너비 160px JPEG)만 받는다.
 * 받기와 공유 캐시는 useBlobImage가 맡는다.
 */
import { computed } from 'vue'
import { useBlobImage } from './useBlobImage'

export function useAssetImage(reviewId, assetId, { thumbnail = false } = {}) {
  const path = computed(() => {
    const id = reviewId.value, asset = assetId.value
    if (!id || !asset) return null
    return `/reviews/${id}/assets/${asset}${thumbnail ? '/thumbnail' : ''}`
  })
  return useBlobImage(path)
}
