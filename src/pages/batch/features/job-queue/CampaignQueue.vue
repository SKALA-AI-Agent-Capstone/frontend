<!-- 캠페인별 처리 대기열 -->
<script setup>
import { computed } from 'vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { JOB_STATUS, useBatchStore } from '@/shared/stores/batch'
import { formatDateTime } from '@/shared/utils/format'
import JobRow from './JobRow.vue'

const batch = useBatchStore()

const groups = computed(() =>
  batch.campaigns.map((c) => {
    const jobs = batch.jobsOf(c.id)
    return {
      ...c,
      jobs,
      done: jobs.filter((j) => j.status === JOB_STATUS.DONE).length,
      failed: jobs.filter((j) => j.status === JOB_STATUS.FAILED).length,
    }
  }),
)
</script>

<template>
  <section class="queue" aria-labelledby="queue-title">
    <BaseSectionHeader title="처리 현황" heading-id="queue-title" size="md" />
    <BaseEmptyState
      v-if="!groups.length"
      icon="inventory_2"
      title="진행 중인 배치가 없습니다"
      description="이 세션에서 등록한 캠페인의 처리 현황이 여기에 표시됩니다."
    />
    <BaseCard v-for="group in groups" :key="group.id" tag="article" class="queue__group" :aria-label="group.name">
      <header class="queue__head">
        <p class="queue__name">{{ group.name }}</p>
        <p class="queue__stat" aria-live="polite">
          완료 {{ group.done }} / {{ group.jobs.length }}<template v-if="group.failed"> ,  실패 {{ group.failed }}</template>
          ,  등록 {{ formatDateTime(group.createdAt) }}
        </p>
      </header>
      <ul>
        <JobRow v-for="job in group.jobs" :key="job.id" :job="job" />
      </ul>
    </BaseCard>
  </section>
</template>

<style scoped>
.queue {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.queue__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.queue__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.queue__name {
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
}
.queue__stat {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
</style>
