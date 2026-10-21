<!-- 로그인 사용자 메뉴 — 이름, 역할, 소속 테넌트, 로그아웃 (NFR-9) -->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PERMISSIONS, ROLE_LABEL } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import { useSessionStore } from '@/shared/stores/session'
import { LANGUAGES } from '@/shared/constants/site'
import { currentLocale, setLocale } from '@/shared/i18n'
import { useReviewsStore } from '@/shared/stores/reviews'

const session = useSessionStore()
const reviews = useReviewsStore()
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
        <div><dt>{{ $t('ui.user.role') }}</dt><dd>{{ ROLE_LABEL[session.user.role] }}</dd></div>
        <div><dt>{{ $t('ui.user.tenant') }}</dt><dd>{{ session.tenant?.name }}</dd></div>
        <div><dt>{{ $t('ui.user.account') }}</dt><dd>{{ session.user.email }}</dd></div>
      </dl>
      <!-- 주 메뉴 줄 대신, 대시보드 밖의 화면은 이곳에서 연다 -->
      <ul class="user-menu__links">
        <li>
          <RouterLink :to="{ name: ROUTE_NAMES.STANDARDS }" class="user-menu__link" @click="open = false">
            <BaseIcon name="menu_book" size="sm" /> {{ $t('common.nav.standards') }}
          </RouterLink>
        </li>
        <li v-if="session.can(PERMISSIONS.REVIEW_APPROVE)">
          <RouterLink :to="{ name: ROUTE_NAMES.APPROVALS }" class="user-menu__link" @click="open = false">
            <BaseIcon name="fact_check" size="sm" /> {{ $t('common.nav.approvals') }}
            <span v-if="reviews.pendingApprovals.length" class="user-menu__count">{{ reviews.pendingApprovals.length }}</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: ROUTE_NAMES.HISTORY }" class="user-menu__link" @click="open = false">
            <BaseIcon name="history" size="sm" /> {{ $t('common.nav.history') }}
          </RouterLink>
        </li>
      </ul>
      <!-- 좁은 화면에서는 머리글의 언어 메뉴가 숨으므로 여기서도 언어를 바꿀 수 있다 -->
      <div class="user-menu__lang" role="group" aria-label="Language">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.code"
          type="button"
          :lang="lang.code"
          :aria-pressed="currentLocale() === lang.code"
          :class="{ 'is-on': currentLocale() === lang.code }"
          @click="setLocale(lang.code)"
        >
          {{ lang.label }}
        </button>
      </div>
      <button type="button" class="user-menu__logout" @click="logout">
        <BaseIcon name="logout" size="sm" /> {{ $t('ui.user.logout') }}
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
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: var(--space-xs) var(--space-md);
  margin: 0 0 var(--space-md);
  font-size: var(--font-size-detail-m);
}
.user-menu__info div {
  display: contents;
}
.user-menu__info dt {
  color: var(--color-text-secondary);
}
.user-menu__info dd {
  margin: 0;
  font-weight: var(--font-weight-bold);
  overflow-wrap: anywhere; /* break-all은 영어 단어를 중간에서 자른다 */
}
.user-menu__links {
  display: grid;
  gap: 2px;
  margin: 0 0 var(--space-md);
  padding-top: var(--space-sm);
  border-top: var(--border-width) solid var(--color-border);
}
.user-menu__link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: 40px;
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm-2);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-decoration: none;
}
.user-menu__link:hover { background: var(--color-bg-muted); }
.user-menu__count {
  margin-left: auto;
  min-width: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  background: var(--color-danger-text);
  color: var(--color-on-primary);
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}
.user-menu__lang {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: var(--space-md);
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}
.user-menu__lang button {
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm-2);
  background: none;
  font: inherit;
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.user-menu__lang button.is-on { background: var(--color-bg-surface); color: var(--color-text); font-weight: var(--font-weight-bold); }
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
