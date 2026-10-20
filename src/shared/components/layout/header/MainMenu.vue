<!-- 메인 메뉴 — 권한별 노출 (NFR-9), 승인 대기 건수 표시 -->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_KEYS } from '@/shared/constants/routes'
import { GNB_MENUS } from '@/shared/constants/site'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'

defineProps({
  vertical: { type: Boolean, default: false },
})
defineEmits(['navigate'])

const route = useRoute()
const session = useSessionStore()
const reviews = useReviewsStore()

const activeNavKey = computed(() => route.meta.navKey ?? null)
const menus = computed(() => GNB_MENUS.filter((m) => !m.permission || session.can(m.permission)))
const counts = computed(() => ({ [NAV_KEYS.APPROVALS]: reviews.pendingApprovals.length }))
</script>

<template>
  <ul class="main-menu" :class="{ 'main-menu--vertical': vertical }">
    <li v-for="menu in menus" :key="menu.key">
      <RouterLink
        :to="menu.to"
        class="main-menu__link"
        :class="{ 'main-menu__link--active': activeNavKey === menu.key }"
        :aria-current="activeNavKey === menu.key ? 'page' : undefined"
        @click="$emit('navigate')"
      >
        {{ menu.label }}
        <span v-if="counts[menu.key]" class="main-menu__count">
          {{ counts[menu.key] }}<span class="sr-only">건</span>
        </span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.main-menu {
  display: flex;
  gap: var(--space-2xl);
  overflow-x: auto;
}
.main-menu__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) 0;
  border-bottom: var(--space-xs) solid transparent;
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}
.main-menu__link:hover {
  color: var(--color-primary);
}
/* 선택 상태는 색상 외에 하단 바로도 구분 */
.main-menu__link--active {
  border-bottom-color: var(--color-primary);
  color: var(--color-primary);
}
.main-menu__count {
  min-width: var(--icon-size-sm);
  padding: 0 var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-danger-text);
  color: var(--color-on-primary);
  font-size: var(--font-size-label-xs);
  text-align: center;
}

.main-menu--vertical {
  flex-direction: column;
  gap: 0;
}
.main-menu--vertical .main-menu__link {
  display: flex;
  padding: var(--space-md) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.main-menu--vertical .main-menu__link--active {
  border-bottom-color: var(--color-border);
  box-shadow: inset var(--space-xs) 0 0 var(--color-primary);
  padding-left: var(--space-md);
}
</style>
