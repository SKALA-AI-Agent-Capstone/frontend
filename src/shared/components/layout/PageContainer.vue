<script setup>
defineProps({
  tag: { type: String, default: 'div' },
})
</script>

<template>
  <component :is="tag" class="page-container"><slot /></component>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: calc(var(--layout-max-width) + var(--layout-margin) * 2);
  margin: 0 auto;
  padding: 0 var(--layout-margin);
}
</style>
