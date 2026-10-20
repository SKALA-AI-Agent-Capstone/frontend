<!-- 백그라운드로 실행 중인 진단 상태 안내 (모달을 닫은 뒤 페이지에 표시) -->
<script setup>
import { computed } from 'vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseProgressBar from '@/shared/components/base/BaseProgressBar.vue'

const props = defineProps({
  done: { type: Boolean, default: false },
  totalProgress: { type: Number, required: true },
  fileName: { type: String, default: '' },
})
defineEmits(['open'])

const isDone = computed(() => props.done)
</script>

<template>
  <BaseAlert
    :variant="isDone ? 'success' : 'info'"
    :icon="isDone ? 'check_circle' : 'hourglass_top'"
    :title="isDone ? 'AI 사전 진단이 완료되었습니다' : 'AI 사전 진단이 백그라운드에서 진행 중입니다'"
    aria-live="polite"
  >
    <div class="bg-status">
      <p>{{ fileName }} ,  진행률 <strong>{{ totalProgress }}%</strong></p>
      <BaseProgressBar :value="totalProgress" :variant="isDone ? 'success' : 'primary'" label="AI 사전 진단 진행률" />
      <BaseButton variant="outline" size="sm" @click="$emit('open')">
        {{ isDone ? '진단 결과 보기' : '진행 상황 보기' }}
      </BaseButton>
    </div>
  </BaseAlert>
</template>

<style scoped>
.bg-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  width: 100%;
}
.bg-status :deep(.progress) {
  width: 100%;
}
</style>
