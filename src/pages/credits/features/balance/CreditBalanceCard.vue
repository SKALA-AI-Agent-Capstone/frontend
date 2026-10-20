<!-- 크레딧 잔액 ,  과금 기준 ,  충전 목업 (FR-11) -->
<script setup>
import { PRICING } from '@/shared/constants/pricing'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/roles'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { useSessionStore } from '@/shared/stores/session'
import { formatNumber } from '@/shared/utils/format'

const credits = useCreditsStore()
const session = useSessionStore()
</script>

<template>
  <BaseCard tag="section" class="balance" aria-label="크레딧 잔액">
    <div>
      <p class="balance__label">{{ session.tenant?.name }} 잔액</p>
      <p class="balance__value">{{ formatNumber(credits.balance) }}<span> 크레딧</span></p>
    </div>
    <ul class="balance__pricing">
      <li>텍스트 {{ PRICING.TEXT_UNIT_CHARS }}자당 {{ PRICING.CREDITS_PER_TEXT_UNIT }}크레딧</li>
      <li>이미지, 상세페이지 1건당 {{ PRICING.CREDITS_PER_IMAGE }}크레딧</li>
      <li>요청 전 잔액 확인 → 처리 완료 후 실제 사용량으로 차감</li>
    </ul>
    <BaseButton v-if="session.can(PERMISSIONS.CREDITS_CHARGE)" icon="add" :to="{ name: ROUTE_NAMES.CREDITS }">
      크레딧 충전
    </BaseButton>
    <p class="balance__note">결제 서비스 연결 전에는 크레딧이 충전되지 않습니다.</p>
  </BaseCard>
</template>

<style scoped>
.balance {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
}
.balance__label {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.balance__value {
  font-size: var(--font-size-heading-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
}
.balance__value span {
  font-size: var(--font-size-body-m);
  color: var(--color-text-secondary);
}
.balance__pricing {
  padding-left: var(--space-lg);
  list-style: disc;
  font-size: var(--font-size-body-s);
}
.balance__note {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
