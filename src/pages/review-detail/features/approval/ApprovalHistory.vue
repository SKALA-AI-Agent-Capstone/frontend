<!-- 버전별 승인 이력 (FR-13: 버전 간 이력 분리) -->
<script setup>
import { APPROVAL_LABEL } from '@/shared/constants/review'
import { ROLE_LABEL } from '@/shared/constants/roles'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import { formatDateTime } from '@/shared/utils/format'

defineProps({
  history: { type: Array, required: true },
  versionNo: { type: Number, required: true },
})
</script>

<template>
  <div class="history">
    <p class="history__title">v{{ versionNo }} 승인 이력</p>
    <p v-if="!history.length" class="history__empty">아직 처리 이력이 없습니다.</p>
    <ol v-else class="history__list">
      <li v-for="(item, i) in [...history].reverse()" :key="i" class="history__item">
        <p class="history__head">
          <BaseBadge :variant="APPROVAL_LABEL[item.action].variant">{{ APPROVAL_LABEL[item.action].label }}</BaseBadge>
          <strong>{{ item.by }}</strong>
          <span>({{ ROLE_LABEL[item.role] }}) ,  {{ formatDateTime(item.at) }}</span>
        </p>
        <p v-if="item.comment" class="history__comment">{{ item.comment }}</p>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.history__title {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.history__empty {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.history__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.history__item {
  padding-left: var(--space-md);
  border-left: var(--space-2xs) solid var(--color-border-strong);
}
.history__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  font-size: var(--font-size-detail-m);
}
.history__head span {
  color: var(--color-text-secondary);
}
.history__comment {
  font-size: var(--font-size-body-s);
}
</style>
