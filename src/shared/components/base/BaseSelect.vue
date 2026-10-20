<script setup>
import BaseIcon from './BaseIcon.vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  id: { type: String, default: null },
  options: { type: Array, required: true }, // [{ value, label }]
  placeholder: { type: String, default: '선택해주세요' },
  required: { type: Boolean, default: false },
})
</script>

<template>
  <div class="base-select">
    <select :id="id" v-model="model" class="control base-select__control" :required="required">
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <BaseIcon name="unfold_more" class="base-select__icon" />
  </div>
</template>

<style scoped src="@/shared/styles/control.css"></style>
<style scoped>
.base-select {
  position: relative;
}
.base-select__control {
  appearance: none;
  padding-right: calc(var(--space-md) * 2 + var(--icon-size-md));
  cursor: pointer;
}
.base-select__icon {
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  pointer-events: none;
}
</style>
