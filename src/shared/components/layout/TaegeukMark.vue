<!-- 태극 문양 (정부 누리집 마스트헤드용 24px 이하 심볼) -->
<template>
  <svg class="taegeuk" viewBox="0 0 36 36" aria-hidden="true">
    <circle cx="18" cy="18" r="17" fill="var(--color-bg-surface)" stroke="var(--color-border)" />
    <path d="M6 18a12 12 0 0 1 24 0a6 6 0 0 1-12 0a6 6 0 0 0-12 0z" fill="var(--color-danger)" />
    <path d="M30 18a12 12 0 0 1-24 0a6 6 0 0 1 12 0a6 6 0 0 0 12 0z" fill="var(--color-secondary)" />
  </svg>
</template>

<style scoped>
.taegeuk {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  flex-shrink: 0;
}
</style>
