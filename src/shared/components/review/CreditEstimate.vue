<!-- 예상 크레딧 ,  잔액 사전 확인 (FR-11) — 부족하면 충전 유도 -->
<script setup>
import { computed } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { formatNumber } from '@/shared/utils/format'

const props = defineProps({
  required: { type: Number, required: true },
  label: { type: String, default: '' },
  breakdown: { type: String, default: '' },
  note: { type: String, default: '' },
  showRemaining: { type: Boolean, default: false },
})

const credits = useCreditsStore()
const check = computed(() => credits.precheck(props.required))
</script>

<template>
  <div class="estimate">
    <dl class="estimate__list">
      <div><dt>{{ label || $t('common.creditEstimate.expected') }}</dt><dd>{{ $t('credits.amount', { count: formatNumber(required) }) }}</dd></div>
      <div><dt>{{ $t('common.creditEstimate.balance') }}</dt><dd>{{ $t('credits.amount', { count: formatNumber(check.balance) }) }}</dd></div>
      <div v-if="showRemaining"><dt>{{ $t('common.creditEstimate.remaining') }}</dt><dd>{{ check.ok ? $t('credits.amount', { count: formatNumber(check.balance - required) }) : '—' }}</dd></div>
    </dl>
    <p v-if="breakdown" class="estimate__breakdown">{{ breakdown }}</p>
    <p class="estimate__note">{{ note || $t('common.creditEstimate.note') }}</p>
    <BaseAlert v-if="!check.ok" variant="danger" :title="$t('common.creditEstimate.shortageTitle')" aria-live="polite">
      <div class="estimate__shortfall">
        <span>{{ $t('common.creditEstimate.shortage', { count: formatNumber(check.shortfall) }) }}</span>
        <BaseButton variant="outline" size="sm" icon="add" :to="{ name: ROUTE_NAMES.CREDITS }">
          {{ $t('common.creditEstimate.topUp') }}
        </BaseButton>
      </div>
    </BaseAlert>
  </div>
</template>

<style scoped>
.estimate {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.estimate__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  margin: 0;
}
.estimate__list div {
  display: flex;
  flex-direction: column;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-bg-page);
  border: var(--border-width) solid var(--color-border);
}
.estimate__list dt {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.estimate__list dd {
  margin: 0;
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.estimate__breakdown,
.estimate__note {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.estimate__shortfall {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}
</style>
