<!-- 되돌릴 수 없는 작업(삭제 등) 확인 대화상자 -->
<script setup>
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
  title: { type: String, required: true },
  confirmLabel: { type: String, default: '확인' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm'])
const titleId = `confirm-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <BaseModal v-model:open="open" :labelledby="titleId">
    <template #header>
      <h2 :id="titleId" class="confirm__title">{{ title }}</h2>
    </template>
    <div class="confirm__body"><slot /></div>
    <template #footer>
      <BaseButton variant="outline" @click="open = false">취소</BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'primary'" :busy="busy" @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm__title {
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.confirm__body {
  color: var(--color-text-secondary);
}
</style>
