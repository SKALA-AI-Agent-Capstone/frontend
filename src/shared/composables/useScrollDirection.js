import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 스크롤 방향 감지 — KRDS 헤더: 스크롤을 내릴 때는 숨기고, 올릴 때 뷰포트 상단에 고정한다.
 * @param {number} threshold 방향 전환으로 인정할 최소 이동 거리(px)
 */
export function useScrollDirection(threshold = 8) {
  const isScrollingUp = ref(true)
  const isAtTop = ref(true)
  let lastY = 0
  let ticking = false

  function update() {
    const y = window.scrollY
    isAtTop.value = y <= 0
    if (Math.abs(y - lastY) >= threshold) {
      isScrollingUp.value = y < lastY
      lastY = y
    }
    ticking = false
  }

  function onScroll() {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(update)
    }
  }

  onMounted(() => {
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

  return { isScrollingUp, isAtTop }
}
