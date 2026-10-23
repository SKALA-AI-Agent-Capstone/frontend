/*
 * 배경 지우기 전용 Web Worker. AI 계산이 화면 스레드를 막지 않도록 여기서 돌린다.
 * 메시지: 받기 { id, blob }, 보내기 { id, type: 'progress', key, current, total } | { id, type: 'done', blob } | { id, type: 'error', message }
 */
import { removeBackground } from '@imgly/background-removal'

self.onmessage = async ({ data: { id, blob } }) => {
  try {
    const result = await removeBackground(blob, {
      // 가장 작은 모델. 기본(fp16)보다 내려받는 양이 절반 정도다.
      model: 'isnet_quint8',
      output: { format: 'image/png' },
      progress: (key, current, total) => self.postMessage({ id, type: 'progress', key, current, total }),
    })
    self.postMessage({ id, type: 'done', blob: result })
  } catch (error) {
    self.postMessage({ id, type: 'error', message: String(error?.message ?? error) })
  }
}
