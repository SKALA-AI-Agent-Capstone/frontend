<!-- 사전 체크리스트 1행 (시안 krds_2 증빙 체크리스트 행 스타일) — 주장별 필요 서류 제출 여부 (FR-10) -->
<script setup>
import { t } from '@/shared/i18n'
import { computed } from 'vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  requirement: { type: Object, required: true },
})

const status = computed(() => {
  if (props.requirement.prohibited) return { label: t('reviewNew.requirement.prohibited'), variant: 'danger' }
  return props.requirement.docs.every((d) => d.provided)
    ? { label: t('reviewNew.requirement.provided'), variant: 'success' }
    : { label: t('reviewNew.requirement.missing'), variant: 'warning' }
})
</script>

<template>
  <div class="row">
    <div class="row__text">
      <p class="row__title">
        <BaseIcon :name="requirement.prohibited ? 'block' : 'description'" size="sm" />
        {{ requirement.claimLabel }}
      </p>
      <p class="row__desc">
        <template v-if="requirement.prohibited">{{ $t('reviewNew.requirement.prohibitedText') }}</template>
        <template v-else>{{ $t('reviewNew.requirement.needed', { docs: requirement.docs.map((d) => d.label).join(', ') }) }}</template>
      </p>
    </div>
    <BaseBadge :variant="status.variant">{{ status.label }}</BaseBadge>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-lg);
  padding: var(--space-md) var(--space-lg);
}
.row + .row {
  border-top: var(--border-width) solid var(--color-border);
}
.row__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}
.row__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-label-m);
  font-weight: var(--font-weight-bold);
}
.row__title :deep(.base-icon) {
  color: var(--color-primary);
}
.row__desc {
  padding-left: calc(var(--icon-size-sm) + var(--space-sm));
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
