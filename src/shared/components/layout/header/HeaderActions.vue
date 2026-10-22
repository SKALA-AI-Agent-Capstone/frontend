<!-- 헤더 우측: 배치 진행 , 크레딧 잔액 , 사용자 메뉴 -->
<script setup>
import { watch } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { PERMISSIONS } from '@/shared/constants/roles'
import { useSessionStore } from '@/shared/stores/session'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { formatNumber } from '@/shared/utils/format'
import UserMenu from './UserMenu.vue'

const credits = useCreditsStore()
const session = useSessionStore()
watch(() => session.user?.id, async (id) => {
  credits.resetBalance()
  if (id) {
    try { await credits.loadBalance() } catch { /* The credits page reports balance errors. */ }
  }
}, { immediate: true })
</script>

<template>
  <div class="header-actions">
    <RouterLink v-if="session.can(PERMISSIONS.CREDITS_CHARGE)" :to="{ name: ROUTE_NAMES.CREDITS }" class="header-action">
      <BaseIcon name="add_circle" />
      <span class="header-action__label">{{ $t('ui.header.charge') }}</span>
    </RouterLink>
    <RouterLink v-if="session.user" :to="{ name: ROUTE_NAMES.CREDITS }" class="header-action" :aria-label="$t('ui.header.balance')">
      <BaseIcon name="toll" />
      <span class="header-action__label">{{ $t('ui.header.credits', { count: formatNumber(credits.balance) }) }}</span>
    </RouterLink>
    <UserMenu />
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
@keyframes spin {
  to {
    transform: rotate(360deg);
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
