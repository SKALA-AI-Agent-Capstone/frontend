<script setup>
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  // [{ label, to? }] — 마지막 항목이 현재 페이지
  items: { type: Array, required: true },
})
</script>

<template>
  <nav class="breadcrumb" aria-label="현재 위치">
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item">
        <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="breadcrumb__link">
          <BaseIcon name="home" size="xs" />
          <span>대시보드</span>
        </RouterLink>
      </li>
      <li v-for="(item, index) in items" :key="item.label" class="breadcrumb__item">
        <BaseIcon name="chevron_right" size="xs" class="breadcrumb__sep" />
        <RouterLink v-if="item.to && index < items.length - 1" :to="item.to" class="breadcrumb__link">
          {{ item.label }}
        </RouterLink>
        <span v-else :aria-current="index === items.length - 1 ? 'page' : undefined"
          :class="{ 'breadcrumb__current': index === items.length - 1 }">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
.breadcrumb__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
.breadcrumb__link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
.breadcrumb__sep {
  color: var(--color-text-disabled);
}
.breadcrumb__current {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}
</style>
