<!-- 작업 화면 맨 위 제목 줄: 제목, 한 줄 설명, 오른쪽 행동. 대시보드, 심의 이력, 승인 대기, 법령 자료실이 함께 쓴다. -->
<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: null },
  count: { type: Number, default: null },
})
</script>

<template>
  <header class="screen-title">
    <div class="screen-title__text">
      <h1>
        {{ title }}
        <span v-if="count !== null" class="screen-title__count">{{ count }}<span class="sr-only">{{ $t('ui.countUnit') }}</span></span>
      </h1>
      <p v-if="description" class="screen-title__desc">{{ description }}</p>
      <slot name="note" />
    </div>
    <div v-if="$slots.default" class="screen-title__actions"><slot /></div>
  </header>
</template>

<style scoped>
.screen-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
}
.screen-title h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 2.8rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.25;
}
.screen-title__count {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary-active);
  font-size: var(--font-size-body-s);
  font-variant-numeric: tabular-nums;
}
.screen-title__desc { margin-top: 6px; color: var(--color-text-secondary); }
.screen-title__actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

@media (max-width: 760px) {
  .screen-title { flex-direction: column; align-items: stretch; }
  .screen-title h1 { font-size: 2.4rem; }
}
</style>
