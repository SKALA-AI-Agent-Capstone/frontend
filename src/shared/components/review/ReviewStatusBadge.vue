<!-- 검토 버전 상태 배지 — 분석이 끝난 건은 승인 상태를, 그 외는 처리 상태를 표시 (요소당 배지 1개) -->
<script setup>
import { computed } from 'vue'
import { APPROVAL_LABEL, REVIEW_STATUS, REVIEW_STATUS_LABEL } from '@/shared/constants/review'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'

const props = defineProps({
  version: { type: Object, required: true },
})

const view = computed(() =>
  props.version.status === REVIEW_STATUS.DONE
    ? APPROVAL_LABEL[props.version.approval.state]
    : REVIEW_STATUS_LABEL[props.version.status],
)
</script>

<template>
  <BaseBadge :variant="view.variant" dot>{{ view.label }}</BaseBadge>
</template>
