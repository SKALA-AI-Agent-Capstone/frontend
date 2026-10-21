<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  label: { type: String, required: true },
  forId: { type: String, default: null },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
  hint: { type: String, default: null },
  hintVariant: { type: String, default: 'default' }, // default | success | danger
  hintIcon: { type: String, default: null },
})
</script>

<template>
  <div class="form-field">
    <div class="form-field__label-row">
      <label class="form-field__label" :for="forId">
        {{ label }}
        <span v-if="required" class="form-field__required" :aria-label="$t('ui.form.required')">*</span>
        <span v-if="optional" class="form-field__optional">{{ $t('ui.form.optional') }}</span>
      </label>
      <slot name="label-action" />
    </div>
    <slot />
    <p v-if="hint" class="form-field__hint" :class="`form-field__hint--${hintVariant}`">
      <BaseIcon v-if="hintIcon" :name="hintIcon" size="xs" filled />
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
}
.form-field__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}
.form-field__label {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.form-field__required {
  color: var(--color-danger-text);
}
.form-field__optional {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-regular);
}
.form-field__hint {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.form-field__hint--success { color: var(--color-success-text); }
.form-field__hint--danger { color: var(--color-danger-text); }
</style>
