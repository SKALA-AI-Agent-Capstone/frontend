<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import StatCard from './StatCard.vue'
import { STATISTICS_SECTION } from './statistics.data'
import { useDashboardStats } from './useDashboardStats'

const { stats, legend } = useDashboardStats()
</script>

<template>
  <BaseCard tag="section" variant="muted" class="statistics">
    <BaseSectionHeader
      :title="STATISTICS_SECTION.title"
      :description="STATISTICS_SECTION.description"
      icon="monitoring"
      size="md"
    >
      <ul class="legend">
        <li v-for="item in legend" :key="item.label">
          <span class="legend__dot" :class="`legend__dot--${item.variant}`" />
          {{ item.label }}
        </li>
      </ul>
    </BaseSectionHeader>
    <div class="statistics__grid">
      <StatCard v-for="stat in stats" :key="stat.id" :stat="stat" />
    </div>
  </BaseCard>
</template>

<style scoped>
.statistics {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.statistics__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  font-weight: var(--font-weight-regular);
}
.legend li {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}
.legend__dot {
  width: var(--space-sm);
  height: var(--space-sm);
  border-radius: var(--radius-full);
}
.legend__dot--success { background: var(--color-success); }
.legend__dot--warning { background: var(--color-warning); }
.legend__dot--danger { background: var(--color-danger); }

@media (max-width: 1024px) {
  .statistics__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .statistics__grid {
    grid-template-columns: 1fr;
  }
}
</style>
