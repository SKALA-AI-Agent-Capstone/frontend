<!--
  마스코트 알림(2026-10-23): 화면 주변을 살짝 어둡게 하고 가운데에 마스코트가 튀어 오르며 짧은 문구를 보여 준다.
  duration 뒤 저절로 닫히고, 누르거나 Esc를 눌러도 닫힌다. 움직임 줄이기 설정이면 튀어 오르지 않고 바로 나타난다.
  busy이면 저절로 닫히지 않고 누르거나 Esc로도 닫히지 않으며, 뒤 화면을 inert로 막아 다른 곳을 누르거나 탭으로 옮겨 갈 수 없다.
  이때 마스코트 아래에 점 세 개가 움직이고, 기본 슬롯(예: 기다리지 않고 닫기 버튼)을 말풍선 안에 둘 수 있다.
  마스코트 그림은 public/brand/<버전>/vero-body-outline.webp(현재 마스코트 버전을 따른다).
-->
<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { brandAsset } from '@/shared/constants/site'

const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
  message: { type: String, required: true },
  detail: { type: String, default: '' },
  duration: { type: Number, default: 1800 },
  busy: { type: Boolean, default: false },
})

let timer = 0
const root = ref(null)
let blocked = []
const close = () => { if (!props.busy) open.value = false }
function onKey(event) { if (event.key === 'Escape') close() }

// busy인 동안 뒤 화면(body의 다른 자식들)을 inert로 막는다
function block(on) {
  blocked.forEach(el => el.removeAttribute('inert'))
  blocked = []
  if (!on || !root.value) return
  blocked = [...document.body.children].filter(el => el !== root.value && !el.hasAttribute('inert'))
  blocked.forEach(el => el.setAttribute('inert', ''))
}

watch([open, () => props.busy], async ([value, busy]) => {
  clearTimeout(timer)
  window.removeEventListener('keydown', onKey)
  if (value) {
    if (!busy) timer = setTimeout(close, props.duration)
    window.addEventListener('keydown', onKey)
  }
  await nextTick()
  block(value && busy)
}, { immediate: true })
onBeforeUnmount(() => { clearTimeout(timer); window.removeEventListener('keydown', onKey); block(false) })
</script>

<template>
  <Teleport to="body">
    <Transition name="mascot-notice">
      <div v-if="open" ref="root" class="mascot-notice" :class="{ 'mascot-notice--busy': busy }" role="status" aria-live="polite" :aria-busy="busy" @click.self="close">
        <div class="mascot-notice__stage">
          <img :src="brandAsset('vero-body-outline.webp')" alt="" class="mascot-notice__mascot" width="560" height="623" @click="close" />
          <div class="mascot-notice__bubble" @click="close">
            <strong>{{ message }}</strong>
            <span v-if="detail">{{ detail }}</span>
            <span v-if="busy" class="mascot-notice__dots" aria-hidden="true"><i /><i /><i /></span>
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mascot-notice {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-modal) + 100); /* 모달 위에도 뜬다 */
  display: grid;
  place-items: center;
  background: rgba(11, 22, 44, 0.38);
  cursor: pointer;
}
.mascot-notice--busy { cursor: progress; background: rgba(11, 22, 44, 0.5); }
.mascot-notice--busy .mascot-notice__mascot { animation: mascot-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both, mascot-bob 0.9s 520ms infinite; }
.mascot-notice--busy .mascot-notice__bubble { cursor: default; }
.mascot-notice__dots { display: flex; gap: 6px; margin-top: 6px; }
.mascot-notice__dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary); animation: dot 1.2s ease-in-out infinite; }
.mascot-notice__dots i:nth-child(2) { animation-delay: 0.15s; }
.mascot-notice__dots i:nth-child(3) { animation-delay: 0.3s; }
.mascot-notice__bubble :deep(button) { margin-top: 10px; }
.mascot-notice__stage {
  display: grid;
  justify-items: center;
  gap: 4px;
}
.mascot-notice__mascot {
  width: 168px;
  transform-origin: 50% 100%;
  height: auto;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.25));
  animation: mascot-pop 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.mascot-notice__bubble {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 14px 24px;
  border-radius: 18px;
  background: var(--color-bg-surface);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  text-align: center;
  animation: bubble-in 360ms 180ms ease-out both;
}
/* 말풍선 꼬리: 마스코트 쪽(위)을 가리킨다 */
.mascot-notice__bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  width: 16px;
  height: 16px;
  background: inherit;
  border-radius: 3px;
  transform: translateX(-50%) rotate(45deg);
}
.mascot-notice__bubble strong { position: relative; font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); color: var(--color-text); }
.mascot-notice__bubble span { position: relative; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }

@keyframes mascot-pop {
  0% { opacity: 0; transform: translateY(40px) scale(0.6); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
/* 기다리는 동안 통통 튄다: 바닥에서 살짝 눌렸다가 튀어 오른다 */
@keyframes mascot-bob {
  0%, 100% { transform: translateY(0) scale(1.06, 0.94); animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1); }
  12% { transform: translateY(0) scale(0.96, 1.04); }
  50% { transform: translateY(-28px) scale(1, 1); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.3); }
  88% { transform: translateY(0) scale(1, 1); }
}
@keyframes dot {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
@keyframes bubble-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.mascot-notice-enter-active { transition: opacity 200ms ease; }
.mascot-notice-leave-active { transition: opacity 260ms ease; }
.mascot-notice-enter-from,
.mascot-notice-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .mascot-notice__mascot,
  .mascot-notice--busy .mascot-notice__mascot,
  .mascot-notice__bubble,
  .mascot-notice__dots i { animation: none; }
}
</style>
