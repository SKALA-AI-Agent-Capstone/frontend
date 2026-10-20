<script setup>
const model = defineModel({ type: String, default: '' })

defineProps({
  id: { type: String, default: null },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 3 },
})
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    class="control base-textarea"
    :placeholder="placeholder"
    :rows="rows"
  />
</template>

<style scoped src="@/shared/styles/control.css"></style>
<style scoped>
.base-textarea {
  padding: var(--space-sm) var(--space-md);
  resize: vertical;
}
</style>
