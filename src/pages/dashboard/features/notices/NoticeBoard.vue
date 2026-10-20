<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import NoticeItem from './NoticeItem.vue'
import { NOTICES } from './notices.data'
</script>

<template>
  <BaseCard tag="section" class="notice-board">
    <BaseSectionHeader title="공지사항 및 제도 안내" size="md">
      <template #title-suffix>
        <BaseBadge variant="secondary">공식알림</BaseBadge>
      </template>
      <a href="#" class="notice-board__more">
        전체보기 <BaseIcon name="chevron_right" size="sm" />
      </a>
    </BaseSectionHeader>
    <ul>
      <NoticeItem v-for="notice in NOTICES" :key="notice.id" :notice="notice" />
    </ul>
  </BaseCard>
</template>

<style scoped>
.notice-board {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.notice-board__more {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.notice-board__more:hover {
  text-decoration: underline;
}
</style>
