<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import ViolationCaseItem from './ViolationCaseItem.vue'
import { VIOLATION_CASES } from './violationCases.data'
</script>

<template>
  <BaseCard tag="section" class="case-board">
    <BaseSectionHeader title="주요 부당표현 적발사례" size="md">
      <template #title-suffix>
        <BaseBadge variant="danger">유의사례</BaseBadge>
      </template>
      최신 갱신
    </BaseSectionHeader>
    <div class="case-board__list">
      <ViolationCaseItem v-for="item in VIOLATION_CASES" :key="item.id" :item="item" />
    </div>
  </BaseCard>
</template>

<style scoped>
.case-board {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.case-board__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
