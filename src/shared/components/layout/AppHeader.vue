<!--
  헤더 (KRDS 아이덴티티 / 헤더) — 시안 krds_1 구성
  순서: (건너뛰기 링크 ,  공식 배너는 레이아웃에서 먼저 렌더) → 서비스 아이덴티티 → 유틸리티 → 크레딧, 사용자.
  주 메뉴 줄은 두지 않는다. 화면 이동은 대시보드 카드와 사용자 메뉴가 맡는다.
  스크롤을 내릴 때는 고정하지 않고, 올릴 때 공식 배너를 제외한 헤더 전체를 상단에 고정한다.
-->
<script setup>
import { computed } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { SITE, brandAsset } from '@/shared/constants/site'
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
        <img :src="brandAsset('vero-head.png')" alt="" class="brand__logo" width="48" height="48" />
        <span class="brand__text">
          <span class="brand__gov">{{ SITE.serviceName }}</span>
          <span class="brand__name">{{ SITE.orgName }}</span>
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

/* 서비스 아이덴티티 — 항상 좌측 상단. 마스코트 얼굴 로고 옆에 작업공간 표시와 서비스 이름 */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}
.brand__logo {
  flex: none;
  width: 48px;
  height: 48px;
}
.brand__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.brand__gov {
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.brand__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-title-l);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}


@media (max-width: 1024px) {
  .app-header__utility {
    display: none;
  }
}
@media (max-width: 600px) {
  .brand__logo { width: 36px; height: 36px; }
  .brand__gov { font-size: 1.1rem; white-space: nowrap; }
  .brand__name {
    font-size: var(--font-size-title-xs);
  }
}
</style>
