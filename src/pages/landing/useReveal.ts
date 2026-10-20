import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * 섹션이 화면에 들어올 때 [data-reveal] 요소에 is-in을 붙인다.
 * 움직임 줄이기를 켠 사용자와 IntersectionObserver가 없는 환경에서는 처음부터 모두 보인다.
 */
export function useReveal(root: Ref<HTMLElement | null>) {
  const canAnimate =
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  const ready = ref(canAnimate)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!canAnimate || !root.value) return
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer?.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    root.value.querySelectorAll('[data-reveal]').forEach((el) => observer?.observe(el))
  })
  onBeforeUnmount(() => observer?.disconnect())

  return { ready }
}
