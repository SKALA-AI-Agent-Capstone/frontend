<!-- 헤더 유틸리티 링크 그룹 (우측 상단, 디바이더로 구분) -->
<script setup>
import { UTILITY_LINKS } from '@/shared/constants/site'
import LanguageMenu from './LanguageMenu.vue'
</script>

<template>
  <ul class="header-utility">
    <li v-for="link in UTILITY_LINKS" :key="link.label" class="header-utility__item">
      <a :href="link.href">{{ link.label }}</a>
    </li>
    <li class="header-utility__item">
      <LanguageMenu />
    </li>
  </ul>
</template>

<style scoped>
.header-utility {
  display: flex;
  align-items: center;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.header-utility__item {
  display: flex;
  align-items: center;
}
.header-utility__item + .header-utility__item::before {
  content: '';
  width: var(--border-width);
  height: var(--space-sm);
  margin: 0 var(--space-sm);
  background: var(--color-border-strong);
}
.header-utility a:hover {
  color: var(--color-text);
  text-decoration: underline;
}
</style>
