<!--
  헤더 (KRDS 아이덴티티 / 헤더) — 시안 krds_1 구성
  순서: (건너뛰기 링크 ,  공식 배너는 레이아웃에서 먼저 렌더) → 서비스 아이덴티티 → 유틸리티 → 크레딧, 사용자.
  주 메뉴 줄은 두지 않는다. 화면 이동은 대시보드 카드와 사용자 메뉴가 맡는다.
  스크롤을 내릴 때는 고정하지 않고, 올릴 때 공식 배너를 제외한 헤더 전체를 상단에 고정한다.
-->
<script setup>
import { computed } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { SITE } from '@/shared/constants/site'
import { useScrollDirection } from '@/shared/composables/useScrollDirection'
import PageContainer from './PageContainer.vue'
import HeaderActions from './header/HeaderActions.vue'
import HeaderUtility from './header/HeaderUtility.vue'

const { isScrollingUp, isAtTop } = useScrollDirection()

const hidden = computed(() => !isAtTop.value && !isScrollingUp.value)
</script>

<template>
  <header class="app-header" :class="{ 'app-header--hidden': hidden }">
    <PageContainer class="app-header__top">
      <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="brand">
        <span class="brand__gov">
          <span class="brand__code">{{ SITE.orgCode }}</span>
          {{ SITE.govLabel }}
        </span>
        <span class="brand__name">
          <span class="brand__org">{{ SITE.orgName }}</span>
          <span class="brand__divider" aria-hidden="true" />
          <span class="brand__service">{{ SITE.serviceName }}</span>
        </span>
      </RouterLink>

      <div class="app-header__right">
        <HeaderUtility class="app-header__utility" />
        <HeaderActions />
      </div>
    </PageContainer>

  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--color-bg-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  transition: transform var(--transition-base);
}
.app-header--hidden {
  transform: translateY(-100%);
}
.app-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
}
.app-header__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-xs);
}

/* 서비스 아이덴티티 — 항상 좌측 상단 */
.brand {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.brand__gov {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.brand__code {
  padding: 0 var(--space-xs);
  border-radius: var(--radius-xs);
  background: var(--color-secondary-subtle);
  color: var(--color-secondary);
  font-weight: var(--font-weight-bold);
}
.brand__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-title-l);
  font-weight: var(--font-weight-bold);
}
.brand__divider {
  width: var(--border-width);
  height: var(--space-md);
  background: var(--color-border-strong);
}
.brand__service {
  color: var(--color-primary);
}


@media (max-width: 1024px) {
  .app-header__utility {
    display: none;
  }
}
@media (max-width: 600px) {
  .brand__gov {
    display: none;
  }
  .brand__name {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    font-size: var(--font-size-title-xs);
  }
  .brand__divider {
    display: none;
  }
}
</style>
