/**
 * PDF 첫 쪽을 작은 이미지로 그린다. pdf.js와 워커는 PDF 썸네일이 처음 필요할 때만 불러온다.
 * 같은 원본은 한 번만 그리도록 key 단위로 결과(data URL)를 기억한다.
 */
type PdfJs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<PdfJs> | null = null
const cache = new Map<string, Promise<string>>()

function loadPdfJs(): Promise<PdfJs> {
  // 워커는 Vite가 .js로 묶게 한다. 운영 nginx는 .mjs를 자바스크립트 형식으로 보내지 않는다.
  pdfjsPromise ??= Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?worker'),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerPort = new worker.default()
    return pdfjs
  })
  return pdfjsPromise
}

async function render(source: string, width: number): Promise<string> {
  const pdfjs = await loadPdfJs()
  const task = pdfjs.getDocument({ url: source })
  const pdf = await task.promise
  try {
    const page = await pdf.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: width / base.width })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    await task.destroy()
  }
}

/** key는 원본을 구분하는 값(검토 ID와 원본 ID), source는 PDF를 읽을 수 있는 URL(blob URL 포함). */
export function pdfThumbnail(key: string, source: string, width = 160): Promise<string> {
  let pending = cache.get(key)
  if (!pending) {
    pending = render(source, width)
    // 실패한 결과는 기억하지 않아 다음에 다시 시도할 수 있게 한다
    pending.catch(() => cache.delete(key))
    cache.set(key, pending)
  }
  return pending
}
