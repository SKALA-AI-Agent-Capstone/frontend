// 개인정보처리방침/이용약관을 어디서든 같은 모달로 띄우기 위한 전역(모듈 싱글턴) 상태.
import { ref } from 'vue'

const open = ref(null) // 'privacy' | 'terms' | null

export function useLegalDocument() {
  return {
    open,
    openPrivacyPolicy: () => { open.value = 'privacy' },
    openTerms: () => { open.value = 'terms' },
    close: () => { open.value = null },
  }
}
