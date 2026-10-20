<script setup>
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import PageHeading from '@/shared/components/layout/PageHeading.vue'
import ApprovalQueue from './features/approval-queue/ApprovalQueue.vue'
</script>

<template>
  <div class="approvals-page">
    <PageHeading
      boxed
      badge="법무, 허가 담당자 전용"
      title="승인 대기"
      description="법무, 허가 담당자가 AI 사전 진단 결과를 확인하고 승인, 반려, 수정 요청을 결정합니다."
      :breadcrumbs="[{ label: '승인 대기' }]"
    />
    <BaseAlert variant="warning" icon="gavel">
      AI 결과는 참고용이며, 게재 여부에 대한 최종 책임은 승인 담당자에게 있습니다.
    </BaseAlert>
    <ApprovalQueue />
  </div>
</template>

<style scoped>
.approvals-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
