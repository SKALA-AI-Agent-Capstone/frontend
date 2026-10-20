<!-- 예상 크레딧 ,  잔액 사전 확인 (FR-11) — 부족하면 충전 유도 -->
<script setup>
import { computed } from 'vue'
import { PRICING } from '@/shared/constants/pricing'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { formatNumber } from '@/shared/utils/format'

const props = defineProps({
  required: { type: Number, required: true },
  breakdown: { type: String, default: '' },
})

const credits = useCreditsStore()
const check = computed(() => credits.precheck(props.required))
</script>

<template>
  <div class="estimate">
    <dl class="estimate__list">
      <div><dt>예상 사용</dt><dd>{{ formatNumber(required) }} 크레딧</dd></div>
      <div><dt>현재 잔액</dt><dd>{{ formatNumber(check.balance) }} 크레딧</dd></div>
    </dl>
    <p v-if="breakdown" class="estimate__breakdown">{{ breakdown }}</p>
    <p class="estimate__note">처리 완료 후 실제 사용량(텍스트 분량, 이미지 수)으로 확정 차감됩니다.</p>
    <BaseAlert v-if="!check.ok" variant="danger" title="크레딧이 부족합니다" aria-live="polite">
      <div class="estimate__shortfall">
        <span>{{ formatNumber(check.shortfall) }} 크레딧이 더 필요합니다.</span>
        <BaseButton variant="outline" size="sm" icon="add" @click="credits.charge()">
          {{ PRICING.MOCK_CHARGE_AMOUNT }} 크레딧 충전 (결제 목업)
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
