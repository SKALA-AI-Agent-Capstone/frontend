<!-- 입력 필드 + 우측 보조 버튼 (등록 검증, 원장 대조 등) -->
<template>
  <div class="input-with-action">
    <slot />
    <slot name="action" />
  </div>
</template>

<style scoped>
.input-with-action {
  display: flex;
  gap: var(--space-sm);
}
.input-with-action :deep(.base-button) {
  flex-shrink: 0;
  height: var(--control-height);
}
</style>
