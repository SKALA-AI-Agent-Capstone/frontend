<!-- 이용약관 — 직접 링크로 들어온 경우를 위한 전용 페이지. 본문은 LegalDocumentModal과 공유. -->
<script setup>
import { RouterLink } from 'vue-router'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import PageContainer from '@/shared/components/layout/PageContainer.vue'
import TermsContent from '@/shared/components/legal/TermsContent.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { SITE } from '@/shared/constants/site'
</script>

<template>
  <PageContainer tag="main" class="legal-page">
    <RouterLink :to="{ name: ROUTE_NAMES.LANDING }" class="legal-page__back">
      <BaseIcon name="arrow_back" size="sm" /> {{ SITE.orgName }}
    </RouterLink>
    <BaseCard tag="article" padding="xl">
      <h1 class="legal-page__title">이용약관</h1>
      <TermsContent />
    </BaseCard>
  </PageContainer>
</template>

<style scoped>
.legal-page {
  max-width: 48rem;
  padding-block: var(--space-2xl) var(--space-2xl);
}
.legal-page__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-bold);
}
.legal-page__title {
  font-size: var(--font-size-title-l);
  margin-bottom: var(--space-md);
}
</style>
