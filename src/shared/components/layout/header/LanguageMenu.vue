<!-- 언어 선택 드롭다운 — 국기 없이 해당 언어로 언어명 표기 -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { LANGUAGES } from '@/shared/constants/site'
import { currentLocale, setLocale } from '@/shared/i18n'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const open = ref(false)
// 고른 언어는 브라우저에 저장되어 다음 방문에도 유지된다
const current = computed(() => currentLocale())
const rootRef = ref(null)

function select(code) {
  setLocale(code)
  open.value = false
}

function onClickOutside(event) {
  if (!rootRef.value?.contains(event.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootRef" class="lang-menu" @keydown.esc="open = false">
    <button
      type="button"
      class="lang-menu__trigger"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-controls="lang-menu-list"
      @click="open = !open"
    >
      <BaseIcon name="language" size="sm" />
      Language
      <BaseIcon :name="open ? 'expand_less' : 'expand_more'" size="xs" />
    </button>
    <ul v-show="open" id="lang-menu-list" class="lang-menu__list">
      <li v-for="lang in LANGUAGES" :key="lang.code">
        <button
          type="button"
          class="lang-menu__item"
          :lang="lang.code"
          :aria-current="current === lang.code ? 'true' : undefined"
          @click="select(lang.code)"
        >
          {{ lang.label }}
          <BaseIcon v-if="current === lang.code" name="check" size="xs" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.lang-menu {
  position: relative;
}
.lang-menu__trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  color: inherit;
}
.lang-menu__trigger:hover {
  color: var(--color-text);
}
.lang-menu__list {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  z-index: var(--z-header);
  min-width: 14rem;
  padding: var(--space-xs);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-level-2);
}
.lang-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: var(--touch-target);
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--font-size-label-s);
}
.lang-menu__item:hover {
  background: var(--color-bg-muted);
}
.lang-menu__item[aria-current] {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}
</style>
