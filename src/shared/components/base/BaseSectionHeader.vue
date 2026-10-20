<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  title: { type: String, required: true },
  headingId: { type: String, default: null }, // aria-labelledby 연결용
  description: { type: String, default: null },
  icon: { type: String, default: null },
  level: { type: String, default: 'h2' },
  size: { type: String, default: 'lg' }, // lg | md
  accent: { type: Boolean, default: false }, // 좌측 강조 바 (폼 섹션 제목)
})
</script>

<template>
  <div class="section-header">
    <div class="section-header__text">
      <component
        :is="level"
        :id="headingId"
        class="section-header__title"
        :class="[`section-header__title--${size}`, { 'section-header__title--accent': accent }]"
      >
        <BaseIcon v-if="icon" :name="icon" size="md" class="section-header__icon" />
        {{ title }}
        <slot name="title-suffix" />
      </component>
      <p v-if="description" class="section-header__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="section-header__aside"><slot /></div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-md);
}
.section-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.section-header__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text);
}
.section-header__title--lg {
  font-size: var(--font-size-title-xl);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.section-header__title--md {
  font-size: var(--font-size-title-l);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.section-header__title--accent {
  padding-left: var(--space-sm);
  border-left: var(--space-xs) solid var(--color-primary);
}
.section-header__icon {
  color: var(--color-primary);
}
.section-header__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.section-header__aside {
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
</style>
