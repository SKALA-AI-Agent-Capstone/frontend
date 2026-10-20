<!-- 로그인 사용자 메뉴 — 이름, 역할, 소속 테넌트, 로그아웃 (NFR-9) -->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROLE_LABEL } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { useSessionStore } from '@/shared/stores/session'

const session = useSessionStore()
const router = useRouter()
const open = ref(false)
const rootRef = ref(null)

function logout() {
  open.value = false
  session.logout()
  router.push({ name: ROUTE_NAMES.LOGIN })
}

function onClickOutside(event) {
  if (!rootRef.value?.contains(event.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div v-if="session.user" ref="rootRef" class="user-menu" @keydown.esc="open = false">
    <button
      type="button"
      class="user-menu__trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-controls="user-menu-panel"
      @click="open = !open"
    >
      <BaseIcon name="account_circle" />
      <span class="user-menu__label">{{ session.user.name }}</span>
      <BaseIcon :name="open ? 'expand_less' : 'expand_more'" size="xs" />
    </button>
    <div v-show="open" id="user-menu-panel" class="user-menu__panel">
      <dl class="user-menu__info">
        <div><dt>역할</dt><dd>{{ ROLE_LABEL[session.user.role] }}</dd></div>
        <div><dt>소속</dt><dd>{{ session.tenant?.name }}</dd></div>
        <div><dt>계정</dt><dd>{{ session.user.email }}</dd></div>
      </dl>
      <button type="button" class="user-menu__logout" @click="logout">
        <BaseIcon name="logout" size="sm" /> 로그아웃
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}
.user-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-height: var(--touch-target);
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm-2);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.user-menu__trigger:hover {
  background: var(--color-bg-muted);
}
.user-menu__panel {
  position: absolute;
  top: calc(100% + var(--space-xs));
  right: 0;
  z-index: var(--z-header);
  min-width: 26rem;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-level-2);
}
.user-menu__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin: 0 0 var(--space-md);
  font-size: var(--font-size-detail-m);
}
.user-menu__info div {
  display: flex;
  gap: var(--space-sm);
}
.user-menu__info dt {
  flex-shrink: 0;
  width: 4rem;
  color: var(--color-text-secondary);
}
.user-menu__info dd {
  margin: 0;
  font-weight: var(--font-weight-bold);
  word-break: break-all;
}
.user-menu__logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  width: 100%;
  min-height: var(--touch-target);
  border-radius: var(--radius-sm-2);
  border: var(--border-width) solid var(--color-border-strong);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.user-menu__logout:hover {
  background: var(--color-bg-muted);
}

@media (max-width: 600px) {
  .user-menu__label {
    display: none;
  }
}
</style>
