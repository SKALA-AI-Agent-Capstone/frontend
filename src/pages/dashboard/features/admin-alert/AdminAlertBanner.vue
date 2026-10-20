<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { ADMIN_ALERT } from './adminAlert.data'
</script>

<template>
  <section class="admin-alert" aria-label="행정 알림">
    <span class="admin-alert__icon"><BaseIcon name="campaign" size="md" /></span>
    <div class="admin-alert__body">
      <p class="admin-alert__title">
        <BaseBadge variant="info">{{ ADMIN_ALERT.tag }}</BaseBadge>
        {{ ADMIN_ALERT.title }}
      </p>
      <p class="admin-alert__desc">{{ ADMIN_ALERT.description }}</p>
    </div>
    <a :href="ADMIN_ALERT.href" class="admin-alert__link">
      {{ ADMIN_ALERT.linkLabel }}
      <BaseIcon name="arrow_forward" size="sm" />
    </a>
  </section>
</template>

<style scoped>
.admin-alert {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-info-border);
  background: var(--color-info-surface);
}
.admin-alert__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-2xl);
  height: var(--space-2xl);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  color: var(--color-primary);
}
.admin-alert__body {
  flex: 1;
  min-width: 0;
}
.admin-alert__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-label-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-active);
}
.admin-alert__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.admin-alert__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.admin-alert__link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .admin-alert {
    flex-wrap: wrap;
    padding: var(--space-md);
  }
  .admin-alert__icon {
    display: none;
  }
  .admin-alert__body {
    flex-basis: 100%;
  }
}
</style>
