<!-- 데모 계정 선택 — ⚠ 실제 서비스는 SSO/아이디, 비밀번호 로그인으로 교체 -->
<script setup>
import { ROLE_LABEL } from '@/shared/constants/roles'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { DEMO_ACCOUNTS, TENANTS } from '@/shared/data/accounts.data'

defineEmits(['select'])

const tenantName = (id) => TENANTS.find((t) => t.id === id)?.name
</script>

<template>
  <ul class="accounts" aria-label="데모 계정">
    <li v-for="account in DEMO_ACCOUNTS" :key="account.id">
      <button type="button" class="account" @click="$emit('select', account.id)">
        <BaseIcon name="account_circle" size="lg" class="account__icon" />
        <span class="account__text">
          <span class="account__name">
            {{ account.name }}
            <BaseBadge variant="secondary">{{ ROLE_LABEL[account.role] }}</BaseBadge>
          </span>
          <span class="account__meta">{{ tenantName(account.tenantId) }} ,  {{ account.email }}</span>
        </span>
        <BaseIcon name="chevron_right" class="account__arrow" />
      </button>
    </li>
  </ul>
</template>

<style scoped>
.accounts {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.account {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  width: 100%;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border-strong);
  background: var(--color-bg-surface);
  text-align: left;
}
.account:hover {
  border-color: var(--color-primary);
  background: var(--color-info-surface);
}
.account__icon {
  color: var(--color-secondary);
}
.account__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.account__name {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-label-m);
  font-weight: var(--font-weight-bold);
}
.account__meta {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.account__arrow {
  color: var(--color-text-secondary);
}
</style>
