<!-- 배치 작업 1건 — 진행률, 실패 시 해당 건만 재시도 (NFR-4) -->
<script setup>
import { computed } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseProgressBar from '@/shared/components/base/BaseProgressBar.vue'
import { JOB_STATUS, useBatchStore } from '@/shared/stores/batch'

const props = defineProps({
  job: { type: Object, required: true },
})
const batch = useBatchStore()

const VIEW = {
  [JOB_STATUS.QUEUED]: { label: '대기', variant: 'neutral' },
  [JOB_STATUS.RUNNING]: { label: '처리 중', variant: 'info' },
  [JOB_STATUS.DONE]: { label: '완료', variant: 'success' },
  [JOB_STATUS.FAILED]: { label: '실패', variant: 'danger' },
}
const view = computed(() => VIEW[props.job.status])
</script>

<template>
  <li class="job">
    <div class="job__main">
      <p class="job__name">
        {{ job.fileName }}
        <BaseBadge :variant="view.variant">{{ view.label }}</BaseBadge>
        <span v-if="job.attempts > 1" class="job__attempts">시도 {{ job.attempts }}회</span>
      </p>
      <BaseProgressBar
        :value="job.progress"
        :variant="job.status === JOB_STATUS.FAILED ? 'danger' : job.status === JOB_STATUS.DONE ? 'success' : 'primary'"
        :label="`${job.fileName} 처리 진행률`"
      />
      <p v-if="job.error" class="job__error">{{ job.error }}</p>
    </div>
    <div class="job__actions">
      <BaseButton v-if="job.status === JOB_STATUS.FAILED" variant="outline" size="sm" icon="refresh" @click="batch.retry(job.id)">
        이 건만 재시도
      </BaseButton>
      <BaseButton
        v-if="job.reviewId && job.status === JOB_STATUS.DONE"
        variant="ghost"
        size="sm"
        icon-right="chevron_right"
        :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: job.reviewId } }"
      >
        결과 보기
      </BaseButton>
    </div>
  </li>
</template>

<style scoped>
.job {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.job__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}
.job__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
  word-break: break-all;
}
.job__attempts,
.job__error {
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}
.job__error {
  color: var(--color-danger-text);
}
.job__actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-xs);
}

@media (max-width: 600px) {
  .job {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
