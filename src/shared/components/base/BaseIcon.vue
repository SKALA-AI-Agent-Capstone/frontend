<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' }, // xs | sm | md | lg | xl
  filled: { type: Boolean, default: false },
})
</script>

<template>
  <span
    class="base-icon"
    :class="[`base-icon--${size}`, { 'base-icon--filled': filled }]"
    aria-hidden="true"
    >{{ name }}</span
  >
</template>

<style scoped>
.base-icon {
  font-family: var(--font-family-icon);
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  white-space: nowrap;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  -webkit-font-smoothing: antialiased;
}
.base-icon--filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.base-icon--xs { font-size: var(--icon-size-xs); }
.base-icon--sm { font-size: var(--icon-size-sm); }
.base-icon--md { font-size: var(--icon-size-md); }
.base-icon--lg { font-size: var(--icon-size-lg); }
.base-icon--xl { font-size: var(--icon-size-xl); }
</style>
