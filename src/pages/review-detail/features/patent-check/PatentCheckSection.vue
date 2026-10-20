<!-- 특허 확인 (FR-14, 15) — 각 특허는 독립적으로 재시도, 확인 (NFR-16) -->
<script setup>
import { ref } from 'vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import PatentCard from './PatentCard.vue'

const { result, retryPatent, confirmPatent } = useReviewDetail()
const error = ref(null)

async function onConfirm(patentId, number) {
  error.value = null
  try {
    await confirmPatent(patentId, number)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <BaseCard tag="section" class="patents" aria-labelledby="patents-title">
    <BaseSectionHeader
      title="특허 확인"
      heading-id="patents-title"
      size="md"
    />
    <BaseAlert v-if="error" variant="danger" aria-live="assertive">{{ error }}</BaseAlert>
    <p v-if="!result.patents.length" class="patents__empty">추출된 특허번호가 없습니다.</p>
    <PatentCard
      v-for="patent in result.patents"
      :key="patent.id"
      :patent="patent"
      @retry="retryPatent(patent.id)"
      @confirm="onConfirm(patent.id, $event)"
    />
  </BaseCard>
</template>

<style scoped>
.patents {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.patents__empty {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
</style>
