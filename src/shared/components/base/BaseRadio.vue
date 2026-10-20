<script setup>
const model = defineModel({ type: [String, Boolean, Number], default: null })

defineProps({
  name: { type: String, required: true },
  value: { type: [String, Boolean, Number], required: true },
  label: { type: String, required: true },
})
</script>

<template>
  <label class="base-radio">
    <input v-model="model" class="base-radio__input" type="radio" :name="name" :value="value" />
    <span class="base-radio__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: var(--touch-target);
  cursor: pointer;
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
}
.base-radio__input {
  width: var(--control-check-size);
  height: var(--control-check-size);
  margin: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}
</style>
