<!-- 선택한 위반 지점의 확대 정밀 분석 카드 (시안 krds_3) -->
<script setup>
import { computed } from 'vue'
import { emptyBasisText } from '@/shared/constants/legal'
import { SEVERITY_LABEL } from '@/shared/constants/review'
import { useReviewDetail } from '../../composables/useReviewDetail'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'

const props = defineProps({
  finding: { type: Object, required: true },
  number: { type: Number, required: true },
  revised: { type: Boolean, default: false },
})

const severity = computed(() => SEVERITY_LABEL[props.finding.severity])
const { result } = useReviewDetail()
const basis = computed(() => props.finding.basis?.[0] ?? null)
</script>

<template>
  <div class="zoom-card" :class="revised ? 'zoom-card--success' : `zoom-card--${severity.variant}`" aria-live="polite">
    <div class="zoom-card__head">
      <p class="zoom-card__title">{{ $t('reviewDetail.zoom.title', { number }) }}</p>
      <BaseBadge :variant="revised ? 'success' : severity.variant">{{ revised ? $t('reviewDetail.zoom.revised') : severity.label }}</BaseBadge>
    </div>
    <p class="zoom-card__detected">
      {{ $t('reviewDetail.zoom.detected') }} <mark>"{{ finding.phrase }}"</mark>
    </p>
    <p class="zoom-card__summary">
      <template v-if="basis">
        <strong>{{ finding.category }}</strong>, {{ $t('reviewDetail.zoom.basis') }} {{ basis.sourceName }} {{ basis.article }}.
        {{ basis.plain }}
      </template>
      <template v-else><strong>{{ finding.category }}</strong>. {{ emptyBasisText(finding, result) }}</template>
    </p>
  </div>
</template>

<style scoped>
.zoom-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  border-left: var(--space-xs) solid var(--color-danger);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-level-2);
}
.zoom-card--warning { border-left-color: var(--color-warning); }
.zoom-card--info { border-left-color: var(--color-info); }
.zoom-card--success { border-left-color: var(--color-success); }
.zoom-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.zoom-card__title {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.zoom-card__detected {
  font-size: var(--font-size-body-s);
  font-weight: var(--font-weight-bold);
}
.zoom-card__detected mark {
  background: var(--color-warning-surface);
  color: var(--color-danger-text);
}
.zoom-card__summary {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.zoom-card__summary strong {
  color: var(--color-text);
}
</style>
