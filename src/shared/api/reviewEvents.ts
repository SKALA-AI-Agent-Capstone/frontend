import { requestRaw } from './http'

/**
 * 검토 진행 SSE 구독 (GET /api/v1/reviews/{id}/events).
 * 브라우저 EventSource는 Authorization 헤더를 못 보내고 토큰을 주소에 넣지 않기로 했으므로
 * fetch로 text/event-stream을 직접 읽는다. 끊기면 Last-Event-ID로 다시 붙고,
 * 계속 실패하면 onFallback을 불러 호출한 쪽이 폴링으로 돌아가게 한다.
 */
export interface ReviewEvent {
  id: string | null
  type: string
  data: Record<string, any>
}

export interface StreamHandlers {
  onEvent: (event: ReviewEvent) => void
  /** 다시 붙지 않고 끝낼 때 한 번 부른다. fallback이면 폴링으로 바꿔야 한다. */
  onClose: (reason: 'finished' | 'fallback') => void
}

const RETRY_DELAYS_MS = [1000, 3000, 6000]

/** 한 덩어리(빈 줄로 끝나는 블록)를 이벤트로 바꾼다. 주석(:ping)만 있으면 null. */
export function parseBlock(block: string): ReviewEvent | null {
  let id: string | null = null
  let type = 'message'
  const data: string[] = []
  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue
    const at = line.indexOf(':')
    const field = at < 0 ? line : line.slice(0, at)
    const value = at < 0 ? '' : line.slice(at + 1).replace(/^ /, '')
    if (field === 'id') id = value
    else if (field === 'event') type = value
    else if (field === 'data') data.push(value)
  }
  if (!data.length) return null
  try {
    return { id, type, data: JSON.parse(data.join('\n')) }
  } catch {
    return null
  }
}

export function openReviewStream(reviewId: string, handlers: StreamHandlers): () => void {
  const controller = new AbortController()
  let lastEventId: string | null = null
  let failures = 0
  let finished = false
  let timer: ReturnType<typeof setTimeout> | null = null

  function close(reason: 'finished' | 'fallback') {
    if (finished) return
    finished = true
    if (timer) clearTimeout(timer)
    controller.abort()
    handlers.onClose(reason)
  }

  async function connect() {
    let terminal = false
    let progressed = false
    const startedAt = Date.now()
    try {
      const headers: Record<string, string> = { Accept: 'text/event-stream' }
      if (lastEventId) headers['Last-Event-ID'] = lastEventId
      const response = await requestRaw(`/reviews/${reviewId}/events`, { headers, signal: controller.signal })
      if (!response.body) throw new Error('STREAM_UNSUPPORTED')
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += value.replace(/\r\n?/g, '\n')
        let end
        while ((end = buffer.indexOf('\n\n')) >= 0) {
          const event = parseBlock(buffer.slice(0, end))
          buffer = buffer.slice(end + 2)
          if (!event) continue
          if (event.type !== 'snapshot') { progressed = true; failures = 0 }
          if (event.id) lastEventId = event.id
          handlers.onEvent(event)
          if (TERMINAL.has(event.type)) terminal = true
          // 실행 중도 재개 대기도 아닌 건은 서버가 스냅샷만 보내고 닫는다.
          if (event.type === 'snapshot' && !waiting(event.data)) terminal = true
        }
      }
    } catch {
      if (controller.signal.aborted) return
    }
    // 진행 이벤트 없이 금방 끊긴 연결은 실패로 센다. 프록시가 곧바로 끊는 환경에서 무한 재접속을 막는다.
    if (!progressed && Date.now() - startedAt < 20000) failures += 1
    if (finished) return
    if (terminal) return close('finished')
    // 서버 타임아웃이나 프록시가 끊은 연결은 다시 붙는다.
    if (failures >= RETRY_DELAYS_MS.length) return close('fallback')
    timer = setTimeout(connect, RETRY_DELAYS_MS[Math.max(0, failures - 1)])
  }

  connect()
  return () => close('finished')
}

const TERMINAL = new Set(['completed', 'failed', 'resume_completed', 'resume_failed'])

function waiting(review: Record<string, any>): boolean {
  const versions = review?.versions ?? []
  const latest = versions[versions.length - 1]
  return ['queued', 'analyzing'].includes(latest?.status ?? '') || latest?.approval?.agentResume === 'pending'
}
