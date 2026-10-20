<script setup>
import { useRoute } from 'vue-router'
import AppFooter from '@/shared/components/layout/AppFooter.vue'
import AppHeader from '@/shared/components/layout/AppHeader.vue'
import GovMasthead from '@/shared/components/layout/GovMasthead.vue'
import PageContainer from '@/shared/components/layout/PageContainer.vue'
import SkipNav from '@/shared/components/layout/SkipNav.vue'

const route = useRoute()
</script>

<template>
  <SkipNav />
  <GovMasthead />
  <AppHeader />
  <PageContainer
    tag="main"
    id="main-content"
    class="layout-main"
    :class="{ 'layout-main--compact': route.meta.compactTop }"
    tabindex="-1"
  >
    <slot />
  </PageContainer>
  <AppFooter />
</template>

<style scoped>
/* KRDS 배치: GNB - Body 간격 */
.layout-main {
  padding-top: var(--space-title-h2);
}
.layout-main--compact {
  padding-top: var(--space-xl);
}
.layout-main:focus {
  outline: none;
}
</style>
