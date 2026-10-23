/*
 * 제품 대표 이미지 손질(2026-10-23).
 * - 배경 지우기: @imgly/background-removal(AGPL-3.0)이 브라우저 안에서 처리한다. 이미지는 서버로 보내지 않고,
 *   처음 한 번 모델 파일(수십 MB)을 IMG.LY CDN에서 받는다. 등록 창에서 버튼을 눌렀을 때만 라이브러리를 불러온다.
 * - 저장 형식: 올리는 대표 이미지는 모두 긴 변을 1200px까지 줄이고 투명도를 지키는 WebP로 바꾼다. WebP로 못 바꾸는 브라우저(Safari 일부)는 PNG로 올린다.
 */
const MAX_SIDE = 1200
const WEBP_QUALITY = 0.86

let worker = null
let nextId = 0
const jobs = new Map() // id → { resolve, reject, onProgress }

function backgroundWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./backgroundRemoval.worker.js', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data }) => {
    const job = jobs.get(data.id)
    if (!job) return
    if (data.type === 'progress') { job.onProgress?.(data.key, data.current, data.total); return }
    jobs.delete(data.id)
    if (data.type === 'done') job.resolve(data.blob)
    else job.reject(new Error(data.message))
  }
  worker.onerror = (event) => {
    // 워커를 띄우지 못하면 기다리는 작업을 모두 실패로 끝내고 다음에 새로 띄운다
    for (const job of jobs.values()) job.reject(new Error(event.message || 'WORKER_FAILED'))
    jobs.clear()
    worker.terminate()
    worker = null
  }
  return worker
}

/** 작업 스레드를 끝낸다. 기다리는 작업은 실패로 끝난다. 다음 요청 때 새로 띄운다. */
export function releaseBackgroundWorker() {
  if (!worker) return
  for (const job of jobs.values()) job.reject(new Error('CANCELLED'))
  jobs.clear()
  worker.terminate()
  worker = null
}

/**
 * 배경을 지운 PNG Blob을 돌려준다. 계산은 Web Worker에서 해서 화면이 멈추지 않는다.
 * onProgress(phase, percent): phase는 'download'(처음 한 번 모델 받기) 또는 'process'(지우는 중)다.
 */
export function removeImageBackground(file, onProgress) {
  return new Promise((resolve, reject) => {
    const id = ++nextId
    jobs.set(id, {
      resolve,
      reject,
      onProgress: (key, current, total) => {
        if (key.startsWith('fetch')) onProgress?.('download', total ? Math.round((current / total) * 100) : null)
        else onProgress?.('process', null)
      },
    })
    backgroundWorker().postMessage({ id, blob: file })
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
