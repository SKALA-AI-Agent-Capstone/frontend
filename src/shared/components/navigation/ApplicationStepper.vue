<script setup>
import { APPLICATION_STEPS } from '@/shared/constants/applicationSteps'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  current: { type: Number, required: true },
  steps: { type: Array, default: () => APPLICATION_STEPS },
})

function stateOf(no) {
  if (no < props.current) return 'done'
  if (no === props.current) return 'active'
  return 'upcoming'
}
</script>

<template>
  <nav :aria-label="$t('ui.stepper.label')">
    <ol class="stepper">
      <li
        v-for="step in steps"
        :key="step.no"
        class="stepper__item"
        :class="`stepper__item--${stateOf(step.no)}`"
        :aria-current="stateOf(step.no) === 'active' ? 'step' : undefined"
      >
        <span class="stepper__no">
          <BaseIcon v-if="stateOf(step.no) === 'done'" name="check" size="sm" />
          <template v-else>{{ String(step.no).padStart(2, '0') }}</template>
        </span>
        <span class="stepper__text">
          <span class="stepper__caption">
            {{ $t('ui.stepper.step', { no: step.no }) }}{{ stateOf(step.no) === 'active' ? ` ${$t('ui.stepper.current')}` : '' }}
          </span>
          <strong class="stepper__title">{{ step.title }}</strong>
        </span>
        <BaseIcon :name="step.icon" class="stepper__icon" />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.stepper {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}
.stepper__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}
.stepper__item--active {
  border: var(--border-width-strong) solid var(--color-primary);
  background: var(--color-bg-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-level-1);
}
.stepper__item--done {
  background: var(--color-bg-surface);
}
.stepper__no {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-xl);
  height: var(--space-xl);
  border-radius: var(--radius-full);
  background: var(--color-border);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
}
.stepper__item--active .stepper__no {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.stepper__item--done .stepper__no {
  background: var(--color-success);
  color: var(--color-on-primary);
}
.stepper__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.stepper__caption {
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
}
.stepper__item--active .stepper__caption {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}
.stepper__title {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
}
.stepper__item--upcoming .stepper__title {
  font-weight: var(--font-weight-regular);
}
.stepper__icon {
  color: inherit;
}
.stepper__item--active .stepper__icon {
  color: var(--color-primary);
}

/* 태블릿 폭에서는 네 칸이 좁아 영어 단계 이름이 칸을 넘친다 */
@media (max-width: 900px) {
  .stepper {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-sm);
  }
  .stepper__icon {
    display: none;
  }
}
</style>
