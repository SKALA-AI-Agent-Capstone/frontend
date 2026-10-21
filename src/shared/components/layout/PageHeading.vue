<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import AppBreadcrumb from '@/shared/components/navigation/AppBreadcrumb.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  breadcrumbs: { type: Array, default: () => [] },
  badge: { type: String, default: null },
  boxed: { type: Boolean, default: false }, // 시안 krds_2 처럼 카드 안에 표시
})
</script>

<template>
  <div class="page-heading" :class="{ 'page-heading--boxed': boxed }">
    <div class="page-heading__top">
      <AppBreadcrumb v-if="breadcrumbs.length" :items="breadcrumbs" />
      <slot name="top-aside" />
    </div>
    <div class="page-heading__main">
      <div class="page-heading__text">
        <BaseBadge v-if="badge" variant="secondary" dot>{{ badge }}</BaseBadge>
        <h1 class="page-heading__title">{{ title }}</h1>
        <p v-if="description" class="page-heading__desc">{{ description }}</p>
      </div>
      <div v-if="$slots.aside" class="page-heading__aside"><slot name="aside" /></div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page-heading {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.page-heading--boxed {
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-level-1);
}
@media (max-width: 600px) {
  .page-heading--boxed {
    padding: var(--space-lg) var(--space-md);
  }
}
.page-heading__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.page-heading__main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}
.page-heading__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  max-width: var(--readable-width);
}
.page-heading__title {
  font-size: var(--font-size-heading-s);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-heading);
  font-weight: var(--font-weight-bold);
}
.page-heading__desc {
  /* 설명 문자열의 줄바꿈 문자를 그대로 줄바꿈으로 보여 준다 */
  white-space: pre-line;
  font-size: var(--font-size-body-m);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
</style>
