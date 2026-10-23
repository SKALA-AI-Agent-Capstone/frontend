/*
 * 제품 대표 이미지 손질(2026-10-23).
 * - 배경 지우기: @imgly/background-removal(AGPL-3.0)이 브라우저 안에서 처리한다. 이미지는 서버로 보내지 않고,
 *   처음 한 번 모델 파일(수십 MB)을 IMG.LY CDN에서 받는다. 등록 창에서 버튼을 눌렀을 때만 라이브러리를 불러온다.
 * - 저장 형식: 긴 변을 1200px까지 줄이고 투명도를 지키는 WebP로 바꾼다. WebP로 못 바꾸는 브라우저(Safari 일부)는 PNG로 올린다.
 */
const MAX_SIDE = 1200
const WEBP_QUALITY = 0.86

export async function removeImageBackground(file, onProgress) {
  const { removeBackground } = await import('@imgly/background-removal')
  return removeBackground(file, {
    // 가장 작은 모델. 기본(fp16)보다 내려받는 양이 절반 정도다.
    model: 'isnet_quint8',
    output: { format: 'image/png' },
    progress: onProgress ? (key, current, total) => onProgress(key, current, total) : undefined,
  })
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** 투명도를 지키며 줄이고 WebP(안 되면 PNG) File로 돌려준다. */
export async function toUploadImage(blob, baseName = 'product') {
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  // 지원하지 않는 브라우저는 요청과 달리 PNG를 돌려준다
  let out = await canvasBlob(canvas, 'image/webp', WEBP_QUALITY)
  if (!out || out.type !== 'image/webp') out = await canvasBlob(canvas, 'image/png')
  const extension = out.type === 'image/webp' ? 'webp' : 'png'
  return new File([out], `${baseName.replace(/\.[^.]+$/, '')}.${extension}`, { type: out.type })
}
