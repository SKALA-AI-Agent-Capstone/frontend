<!-- 사진 독립 검토 항목 하나. 타일 단위 관찰이므로 정밀 위치나 효능을 확정한 결과로 표시하지 않는다. -->
<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'

defineProps({
  item: { type: Object, required: true },
})
</script>

<template>
  <BaseCard tag="article" class="visual-item">
    <p class="visual-item__meta"><BaseBadge variant="warning">{{ $t('reviewDetail.tiles.visualBadge') }}</BaseBadge></p>
    <p class="visual-item__observation">{{ item.observation }}</p>
    <p>{{ $t('reviewDetail.visual.concern', { concern: item.concern }) }}</p>
    <ul v-if="item.comparisonLimitations?.length" class="visual-item__limits">
      <li v-for="limit in item.comparisonLimitations" :key="limit">{{ limit }}</li>
    </ul>
    <p v-if="item.needsAdjacentContext" class="visual-item__note">{{ $t('reviewDetail.visual.adjacent') }}</p>
  </BaseCard>
</template>

<style scoped>
.visual-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.visual-item__observation {
  font-weight: var(--font-weight-bold);
}
.visual-item__limits {
  padding-left: var(--space-lg);
  list-style: disc;
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.visual-item__note {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
</style>
