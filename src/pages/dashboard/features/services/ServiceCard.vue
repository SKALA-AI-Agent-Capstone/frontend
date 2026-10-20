<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  service: { type: Object, required: true },
})
</script>

<template>
  <BaseCard tag="article" class="service-card">
    <div class="service-card__body">
      <span class="service-card__icon" :class="{ 'service-card__icon--muted': service.muted }">
        <BaseIcon :name="service.icon" size="md" />
      </span>
      <BaseBadge :variant="service.muted ? 'neutral' : 'secondary'">{{ service.tag }}</BaseBadge>
      <h3 class="service-card__title">{{ service.title }}</h3>
      <p class="service-card__desc">{{ service.description }}</p>
      <ul class="service-card__features">
        <li v-for="feature in service.features" :key="feature">
          <BaseIcon name="check_circle" size="sm" />
          {{ feature }}
        </li>
      </ul>
    </div>
    <BaseButton
      :variant="service.action.variant"
      :to="service.action.to"
      :href="service.action.href"
      :icon-right="service.action.icon"
      block
    >
      {{ service.action.label }}
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.service-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-lg);
}
.service-card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
}
.service-card__icon {
  display: grid;
  place-items: center;
  width: var(--space-3xl);
  height: var(--space-3xl);
  margin-bottom: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}
.service-card__icon--muted {
  background: var(--color-bg-muted);
  color: var(--color-text);
}
.service-card__title {
  font-size: var(--font-size-title-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.service-card__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.service-card__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
  margin-top: var(--space-sm);
  padding-top: var(--space-md);
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
}
.service-card__features li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.service-card__features :deep(.base-icon) {
  color: var(--color-primary);
}
</style>
