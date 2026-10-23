<!-- 헤더 유틸리티 (우측 상단). 연결된 곳이 없던 누리집 안내와 원격지원 링크는 2026-10-23에 뺐다. -->
<script setup>
import LanguageMenu from './LanguageMenu.vue'
</script>

<template>
  <ul class="header-utility">
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
</style>
