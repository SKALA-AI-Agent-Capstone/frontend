<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
  labelledby: { type: String, required: true },
  width: { type: String, default: 'md' }, // md | lg
})

const emit = defineEmits(['close'])
const dialogRef = ref(null)

function close() {
  open.value = false
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(open, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    dialogRef.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @click.self="close">
        <div
          ref="dialogRef"
          class="modal__dialog"
          :class="`modal__dialog--${width}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="labelledby"
          tabindex="-1"
        >
          <header class="modal__header"><slot name="header" :close="close" /></header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__footer"><slot name="footer" :close="close" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--layout-margin);
  background: var(--color-overlay);
  backdrop-filter: blur(var(--blur-overlay));
}
/* KRDS 모달: 콘텐츠만 스크롤되고 헤더, 푸터(버튼)는 항상 보이도록 고정 */
.modal__dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - var(--layout-margin) * 2);
  overflow: hidden;
  background: var(--color-bg-surface);
  border-radius: var(--radius-xl);
  border-top: var(--space-xs) solid var(--color-primary);
  box-shadow: var(--shadow-level-3);
}
.modal__dialog:focus { outline: none; }
.modal__dialog--md { max-width: var(--modal-width-md); }
.modal__dialog--lg { max-width: var(--modal-width-lg); }
.modal__header {
  padding: var(--space-lg);
  border-bottom: var(--border-width) solid var(--color-border);
}
.modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-lg);
}
.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}

.modal-enter-active,
.modal-leave-active { transition: opacity var(--transition-base); }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>
