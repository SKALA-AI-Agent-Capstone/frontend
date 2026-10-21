<!-- 모달을 닫은 뒤 분석이 계속되는 동안 화면 위에 보여 주는 진행 안내 -->
<script setup>
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  doneCount: { type: Number, required: true },
  total: { type: Number, required: true },
  fileName: { type: String, default: '' },
})
defineEmits(['open'])
</script>

<template>
  <div class="bg-status" role="status" aria-live="polite">
    <span class="bg-status__icon"><BaseIcon name="progress_activity" size="sm" /></span>
    <p class="bg-status__text">
      <strong>{{ $t('reviewDetail.diagnosing') }}</strong>
      <span>{{ fileName }}</span>
      <span class="bg-status__count">{{ $t('reviewDetail.modal.progressText', { total, done: doneCount }) }}</span>
    </p>
    <ol class="bg-status__bar" aria-hidden="true">
      <li v-for="i in total" :key="i" :class="{ 'is-done': i <= doneCount }"></li>
    </ol>
    <BaseButton variant="outline" size="sm" @click="$emit('open')">{{ $t('reviewDetail.modal.showProgress') }}</BaseButton>
  </div>
</template>

<style scoped>
.bg-status {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 160px auto;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--color-primary-subtle);
}
.bg-status__icon { display: grid; color: var(--color-primary); animation: spin 1.2s linear infinite; }
.bg-status__text { display: flex; flex-wrap: wrap; gap: 4px 12px; min-width: 0; font-size: var(--font-size-body-s); }
.bg-status__text span { overflow-wrap: anywhere; }
.bg-status__count { color: var(--color-text-secondary); }
.bg-status__bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; }
.bg-status__bar li { height: 5px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.8); }
.bg-status__bar li.is-done { background: var(--color-primary); }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .bg-status__icon { animation: none; } }
@media (max-width: 600px) {
  .bg-status { grid-template-columns: auto minmax(0, 1fr); }
  .bg-status__bar, .bg-status :deep(.base-button) { grid-column: 1 / -1; }
}
</style>
