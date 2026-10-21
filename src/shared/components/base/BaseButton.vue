<!--
  버튼 (KRDS 액션 / 버튼)
  - 한 화면에 최상위 강조(primary) 버튼은 한 번만 사용한다
  - 레이블은 실행 기능을 예측할 수 있는 동사형으로 작성한다
  - 아이콘은 반드시 필요한 경우에만 사용한다
  - busy 상태로 중복 실행(연속 클릭)을 막는다
-->
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | outline | ghost | danger | inverse | inverse-outline
  size: { type: String, default: 'md' }, // sm(40) | md(48)
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  external: { type: Boolean, default: false }, // 외부 서비스 이동 — 새 창 + 표시 아이콘
  type: { type: String, default: 'button' },
  icon: { type: String, default: null },
  iconRight: { type: String, default: null },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
})

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))
const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return props.external ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : { href: props.href }
  }
  return { type: props.type, disabled: props.disabled || props.busy, 'aria-busy': props.busy || undefined }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`, { 'base-button--block': block }]"
  >
    <BaseIcon v-if="icon" :name="icon" size="sm" />
    <span><slot /></span>
    <BaseIcon v-if="iconRight" :name="iconRight" size="sm" />
    <template v-if="external">
      <BaseIcon name="open_in_new" size="xs" />
      <span class="sr-only">{{ $t('ui.newWindow') }}</span>
    </template>
  </component>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  height: var(--control-height);
  padding: 0 var(--space-lg);
  border-radius: var(--radius-md);
  border: var(--border-width-strong) solid transparent;
  font-size: var(--font-size-label-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  transition: background-color var(--transition-fast), border-color var(--transition-fast),
    color var(--transition-fast);
}
.base-button--sm {
  height: var(--control-height-sm);
  border-radius: var(--radius-sm-2);
  padding: 0 var(--space-md);
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
}
.base-button--block {
  display: flex;
  width: 100%;
}
.base-button:disabled {
  cursor: not-allowed;
  background: var(--color-bg-muted);
  border-color: var(--color-border);
  color: var(--color-text-disabled);
}

.base-button--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.base-button--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.base-button--primary:active:not(:disabled) { background: var(--color-primary-active); }

.base-button--secondary {
  background: transparent;
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}
.base-button--secondary:hover:not(:disabled) { background: var(--color-secondary-subtle); }

.base-button--outline {
  background: var(--color-bg-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}
.base-button--outline:hover:not(:disabled) { background: var(--color-bg-muted); }

.base-button--ghost {
  background: transparent;
  color: var(--color-text);
}
.base-button--ghost:hover:not(:disabled) { background: var(--color-bg-muted); }

.base-button--danger {
  background: var(--color-danger-text);
  color: var(--color-on-primary);
}
.base-button--danger:hover:not(:disabled) { filter: brightness(0.9); }

.base-button--inverse {
  background: var(--color-bg-surface);
  border-color: var(--color-bg-surface);
  color: var(--color-secondary);
}
.base-button--inverse:hover:not(:disabled) { background: var(--color-secondary-subtle); }

.base-button--inverse-outline {
  background: transparent;
  border-color: var(--color-on-secondary);
  color: var(--color-on-secondary);
}
.base-button--inverse-outline:hover:not(:disabled) { background: var(--color-secondary-light); }
</style>
