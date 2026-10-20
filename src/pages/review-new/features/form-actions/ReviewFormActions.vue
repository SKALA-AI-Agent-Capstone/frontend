<script setup>
import BaseButton from '@/shared/components/base/BaseButton.vue'
import { useReviewDraft } from '../../composables/useReviewDraft'
defineProps({submitting:Boolean, versionLabel:String})
const {canSubmit, saveDraft} = useReviewDraft()
</script>
<template><div class="actions"><p>원본 PDF 또는 이미지를 선택한 뒤 분석을 시작하세요. 과금은 비활성 상태입니다.</p><BaseButton type="button" variant="outline" @click="saveDraft">제품정보 임시저장</BaseButton><BaseButton type="submit" :busy="submitting" :disabled="!canSubmit">{{versionLabel ? `${versionLabel} 재검토 시작` : '검토 시작'}}</BaseButton></div></template>
<style scoped>.actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.actions p{flex:1}</style>
