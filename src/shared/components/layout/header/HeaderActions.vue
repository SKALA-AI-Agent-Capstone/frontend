<!-- 헤더 우측: 배치 진행 , 크레딧 잔액 , 사용자 메뉴 , 전체메뉴 -->
<script setup>
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { useBatchStore } from '@/shared/stores/batch'
import { useCreditsStore } from '@/shared/stores/credits'
import { formatNumber } from '@/shared/utils/format'
import UserMenu from './UserMenu.vue'

defineProps({
  menuOpen: { type: Boolean, default: false },
})
defineEmits(['toggle-menu'])

const credits = useCreditsStore()
const batch = useBatchStore()
</script>

<template>
  <div class="header-actions">
    <RouterLink
      v-if="batch.summary.active"
      :to="{ name: ROUTE_NAMES.BATCH }"
      class="header-action header-action--batch"
      aria-live="polite"
    >
      <BaseIcon name="progress_activity" class="spin" />
      <span class="header-action__label">배치 {{ batch.summary.done }}/{{ batch.summary.total }}</span>
    </RouterLink>
    <RouterLink v-if="credits.enabled" :to="{ name: ROUTE_NAMES.CREDITS }" class="header-action">
      <BaseIcon name="toll" />
      <span class="header-action__label">
        <span class="sr-only">크레딧 잔액</span>{{ formatNumber(credits.balance) }} 크레딧
      </span>
    </RouterLink>
    <UserMenu />
    <button
      type="button"
      class="header-action header-action--mobile"
      :aria-expanded="menuOpen"
      aria-controls="mobile-menu"
      @click="$emit('toggle-menu')"
    >
      <BaseIcon :name="menuOpen ? 'close' : 'menu'" />
      <span class="header-action__label">전체메뉴</span>
    </button>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
.header-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: var(--touch-target);
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm-2);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  white-space: nowrap;
}
.header-action:hover {
  background: var(--color-bg-muted);
}
.header-action--batch {
  color: var(--color-primary);
}
.header-action--mobile {
  display: none;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .header-action--mobile {
    display: inline-flex;
  }
}
@media (max-width: 600px) {
  .header-action {
    flex-direction: column;
    gap: 0;
    padding: 0 var(--space-xs);
  }
  .header-action__label {
    font-size: var(--font-size-label-xs);
  }
}
</style>
