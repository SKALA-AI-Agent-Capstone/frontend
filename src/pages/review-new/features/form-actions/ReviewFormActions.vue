<!--
  신청서 아래 버튼: 임시저장과 검토 시작. 임시저장하면 저장 시각을 보여 주고, 저장한 신청서는 제품 화면의 검토 목록 위에 칸으로 생긴다.
-->
<script setup>
import BaseButton from '@/shared/components/base/BaseButton.vue'
import { formatDateTime } from '@/shared/utils/format'
import { useReviewDraft } from '../../composables/useReviewDraft'

defineProps({
  submitting: Boolean,
  saving: Boolean,
  savedAt: { type: Date, default: null },
  saveError: { type: String, default: '' },
})
const emit = defineEmits(['save'])
const { canSubmit } = useReviewDraft()
</script>

<template>
  <div class="actions">
    <p v-if="saveError" class="actions__status actions__status--error" role="alert">{{ saveError }}</p>
    <p v-else-if="savedAt" class="actions__status" role="status">{{ $t('reviewNew.draft.saved', { time: formatDateTime(savedAt) }) }}</p>
    <BaseButton type="button" variant="outline" icon="draft" :busy="saving" @click="emit('save')">{{ $t('reviewNew.actions.saveDraft') }}</BaseButton>
    <BaseButton type="submit" :busy="submitting" :disabled="!canSubmit">{{ $t('reviewNew.actions.start') }}</BaseButton>
  </div>
</template>

<style scoped>
.actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }
.actions__status { margin-right: auto; font-size: var(--font-size-body-s); color: var(--color-text-secondary); }
.actions__status--error { color: var(--color-danger-text); }
</style>
