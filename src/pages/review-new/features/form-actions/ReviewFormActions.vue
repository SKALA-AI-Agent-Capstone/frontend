<script setup>
import BaseButton from '@/shared/components/base/BaseButton.vue'
import { useReviewDraft } from '../../composables/useReviewDraft'
defineProps({submitting:Boolean})
const {canSubmit, saveDraft} = useReviewDraft()
</script>
<template><div class="actions"><BaseButton type="button" variant="outline" @click="saveDraft">{{ $t('reviewNew.actions.saveDraft') }}</BaseButton><BaseButton type="submit" :busy="submitting" :disabled="!canSubmit">{{ $t('reviewNew.actions.start') }}</BaseButton></div></template>
<style scoped>.actions{display:flex;align-items:center;justify-content:flex-end;gap:16px;flex-wrap:wrap}</style>
