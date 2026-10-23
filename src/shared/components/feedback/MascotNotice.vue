<!--
  마스코트 알림(2026-10-23): 화면 주변을 살짝 어둡게 하고 가운데에 마스코트가 튀어 오르며 짧은 문구를 보여 준다.
  duration 뒤 저절로 닫히고, 누르거나 Esc를 눌러도 닫힌다. 움직임 줄이기 설정이면 튀어 오르지 않고 바로 나타난다.
  마스코트 그림은 public/brand/<버전>/vero-body-outline.webp(현재 마스코트 버전을 따른다).
-->
<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { brandAsset } from '@/shared/constants/site'

const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
  message: { type: String, required: true },
  detail: { type: String, default: '' },
  duration: { type: Number, default: 1800 },
})

let timer = 0
const close = () => { open.value = false }
function onKey(event) { if (event.key === 'Escape') close() }

watch(open, (value) => {
  clearTimeout(timer)
  if (value) {
    timer = setTimeout(close, props.duration)
    window.addEventListener('keydown', onKey)
  } else {
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => { clearTimeout(timer); window.removeEventListener('keydown', onKey) })
</script>

<template>
  <Teleport to="body">
    <Transition name="mascot-notice">
      <div v-if="open" class="mascot-notice" role="status" aria-live="polite" @click="close">
        <div class="mascot-notice__stage">
          <img :src="brandAsset('vero-body-outline.webp')" alt="" class="mascot-notice__mascot" width="560" height="623" />
          <p class="mascot-notice__bubble">
            <strong>{{ message }}</strong>
            <span v-if="detail">{{ detail }}</span>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mascot-notice {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  background: rgba(11, 22, 44, 0.38);
  cursor: pointer;
}
.mascot-notice__stage {
  display: grid;
  justify-items: center;
  gap: 4px;
}
.mascot-notice__mascot {
  width: 168px;
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
  .mascot-notice__bubble { animation: none; }
}
</style>
