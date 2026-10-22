<!--
  대시보드 '새로 시작하기' — 자주 하는 일을 점선 카드로 바로 시작한다.
  카드는 실제 화면으로만 연결한다. 그림은 Open Doodles(CC0, public/doodles/CREDITS.md)이며 꾸밈용이다.
-->
<script setup>
import { computed } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'

const props = defineProps({
  canCreate: { type: Boolean, default: false },
})

const cards = computed(() => [
  props.canCreate && {
    key: 'new',
    title: 'dashboard.start.new.title',
    action: 'dashboard.start.new.action',
    art: '/doodles/unboxing.svg',
    to: { name: ROUTE_NAMES.REVIEW_NEW },
  },
  {
    key: 'todo',
    title: 'dashboard.start.todo.title',
    action: 'dashboard.start.todo.action',
    art: '/doodles/sitting-reading.svg',
    // 결정할 문구가 남은 검토 목록(대시보드 탭)으로 간다
    to: { name: ROUTE_NAMES.DASHBOARD, query: { tab: 'todo' } },
  },
  {
    key: 'history',
    title: 'dashboard.start.history.title',
    action: 'dashboard.start.history.action',
    art: '/doodles/reading-side.svg',
    to: { name: ROUTE_NAMES.HISTORY },
  },
].filter(Boolean))
</script>

<template>
  <section class="start" aria-labelledby="start-title">
    <h2 id="start-title" class="start__title">{{ $t('dashboard.start.title') }}</h2>
    <ul class="start__grid">
      <li v-for="(card, index) in cards" :key="card.key">
        <RouterLink :to="card.to" class="card">
          <span class="card__title">{{ $t(card.title) }}</span>
          <span class="card__action"><span aria-hidden="true">+</span> {{ $t(card.action) }}</span>
          <!-- 첫 화면에서 가장 큰 그림이라 늦추지 않고, 첫 그림은 먼저 받는다 -->
          <img :src="card.art" alt="" class="card__art" width="1024" height="768" :fetchpriority="index === 0 ? 'high' : 'auto'" />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.start { display: grid; gap: 14px; }
.start__title { font-size: var(--font-size-title-s); font-weight: var(--font-weight-bold); }
.start__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.card {
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 22px 16px 10px;
  border: 1.5px dashed var(--color-border-strong);
  border-radius: 16px;
  background: var(--color-bg-surface);
  color: var(--color-text);
  text-decoration: none;
  text-align: center;
  transition: border-color var(--transition-fast), translate 200ms ease;
}
.card:hover { border-color: var(--color-primary); translate: 0 -3px; }
.card:focus-visible { outline: var(--focus-ring); outline-offset: 3px; }
.card__title { font-size: var(--font-size-body-m); font-weight: var(--font-weight-bold); }
.card__action { font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); color: var(--color-primary); }
.card__action span { font-weight: var(--font-weight-regular); font-size: 1.2em; margin-right: 2px; }
.card__art { width: 180px; height: auto; margin-top: 4px; }

@media (max-width: 760px) {
  .start__grid { grid-template-columns: 1fr; gap: 10px; }
  .card { grid-template-columns: 1fr auto; justify-items: start; text-align: left; align-items: center; padding: 12px 16px; }
  .card__title, .card__action { grid-column: 1; }
  .card__art { grid-column: 2; grid-row: 1 / span 2; width: 110px; margin: 0; }
}
</style>
