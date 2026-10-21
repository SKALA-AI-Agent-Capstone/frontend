<template>
  <a href="#main-content" class="skip-nav">{{ $t('ui.skipNav') }}</a>
</template>

<style scoped>
.skip-nav {
  position: absolute;
  top: calc(var(--space-4xl) * -1);
  left: var(--space-md);
  z-index: var(--z-modal);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: var(--font-weight-bold);
  transition: top var(--transition-fast);
}
.skip-nav:focus {
  top: var(--space-sm);
}
</style>
