<!-- 운영기관 식별자 — 푸터 내부의 가장 마지막 구획 (상위 기관 로고 + 안내 텍스트) -->
<script setup>
import { FOOTER, SITE } from '@/shared/constants/site'
import TaegeukMark from '../TaegeukMark.vue'
</script>

<template>
  <section class="identifier" :aria-label="$t('ui.footer.operator')">
    <span class="identifier__logo" role="img" :aria-label="SITE.orgName">
      <TaegeukMark />
      <span aria-hidden="true">{{ SITE.orgName }}</span>
    </span>
    <p class="identifier__text">{{ FOOTER.identifier }}</p>
  </section>
</template>

<style scoped>
.identifier {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-lg);
  padding: var(--space-md) 0;
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.identifier__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}
</style>
