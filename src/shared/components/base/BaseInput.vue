<script setup>
import BaseIcon from './BaseIcon.vue'

const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  id: { type: String, default: null },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  leadingIcon: { type: String, default: null },
  invalid: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <div class="base-input" :class="{ 'base-input--with-icon': leadingIcon }">
    <BaseIcon v-if="leadingIcon" :name="leadingIcon" class="base-input__icon" />
    <input
      :id="id"
      v-model="model"
      class="control"
      :class="{ 'control--invalid': invalid }"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
    />
  </div>
</template>

<style scoped src="@/shared/styles/control.css"></style>
<style scoped>
.base-input {
  position: relative;
  flex: 1;
  min-width: 0;
}
.base-input__icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}
.base-input--with-icon .control {
  padding-left: calc(var(--space-md) + var(--icon-size-md) + var(--space-sm));
}
</style>
