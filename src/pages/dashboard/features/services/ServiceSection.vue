<script setup>
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import ServiceCard from './ServiceCard.vue'
import { SERVICES, SERVICES_SECTION } from './services.data'
</script>

<template>
  <section class="service-section">
    <BaseSectionHeader :title="SERVICES_SECTION.title" :description="SERVICES_SECTION.description" />
    <div class="service-section__grid">
      <ServiceCard v-for="service in SERVICES" :key="service.id" :service="service" />
    </div>
  </section>
</template>

<style scoped>
.service-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-title-h2);
}
.service-section__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--layout-gutter);
}

@media (max-width: 1024px) {
  .service-section__grid {
    grid-template-columns: 1fr;
  }
}
</style>
