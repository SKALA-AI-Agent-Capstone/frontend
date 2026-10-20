<script setup>
const model = defineModel({ type: Boolean, default: false })

defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <label class="base-checkbox">
    <input v-model="model" class="base-checkbox__input" type="checkbox" />
    <span>{{ label }}</span>
  </label>
</template>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--space-sm);
  min-height: var(--touch-target);
  padding-top: var(--space-sm);
  cursor: pointer;
  font-size: var(--font-size-body-s);
}
.base-checkbox__input {
  flex-shrink: 0;
  width: var(--control-check-size);
  height: var(--control-check-size);
  margin: var(--space-2xs) 0 0;
  accent-color: var(--color-primary);
}
</style>
