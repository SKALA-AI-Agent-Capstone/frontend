<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import IntegratedSearch from './IntegratedSearch.vue'
import { HERO } from './hero.data'

defineEmits(['search'])
</script>

<template>
  <BaseCard tag="section" padding="xl" class="hero" aria-labelledby="hero-title">
    <div class="hero__intro">
      <BaseBadge variant="secondary" dot>{{ HERO.lawBadge }}</BaseBadge>
      <h1 id="hero-title" class="hero__title">
        {{ HERO.titleLead }}<br />
        <span class="hero__emphasis">{{ HERO.titleEmphasis }}</span> {{ HERO.titleTail }}
      </h1>
      <p class="hero__desc">{{ HERO.description }}</p>
    </div>
    <IntegratedSearch @search="$emit('search', $event)" />
  </BaseCard>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-xl);
}
.hero__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
}
.hero__title {
  font-size: var(--font-size-heading-m);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-heading);
  font-weight: var(--font-weight-bold);
}
.hero__emphasis {
  color: var(--color-primary);
}
.hero__desc {
  max-width: var(--readable-width);
  font-size: var(--font-size-body-m);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
</style>
