<!--
  문구별 공식 기록 대조 결과 (FR-3, FR-4, FR-10, FR-14) — 규칙이 지정한 대조만 Agent가 실행한다.
  기능성 보고 대조, 실증자료 제출 여부, 성분 국내 금지, 제한 목록, GMP 업체 목록, 특허 번호.
  attention 이 true 면 담당자가 확인할 항목이다. 어떤 결과도 자동 위반 판정이 아니다.
-->
<script setup>
defineProps({
  checks: { type: Array, required: true },
  rules: { type: Array, default: () => [] },
})
const VARIANT = { consistent: 'success', gmp_listed: 'success', not_listed: 'info', evidence_submitted: 'info',
  prohibited: 'danger', mismatch: 'danger' }
</script>

<template>
  <section class="checks" :aria-label="$t('checks.title')">
    <p v-if="rules.length" class="checks__rules">
      {{ $t('checks.rules') }}
      <span v-for="rule in rules" :key="rule.id" class="checks__rule">
        {{ rule.label }} ({{ rule.matchedBy === 'claim_type' ? $t('checks.byType') : $t('checks.byPhrase', { text: rule.matchedText }) }})
      </span>
    </p>
    <template v-if="checks.length">
      <p class="checks__title">{{ $t('checks.title') }}</p>
      <ul class="checks__list">
        <li v-for="(check, i) in checks" :key="`${check.type}-${i}`" class="checks__item" :class="{ 'checks__item--attention': check.attention }">
          <span class="checks__type">{{ $t(`checks.type.${check.type}`) }}</span>
          <span class="checks__status" :class="`checks__status--${VARIANT[check.status] ?? 'warning'}`">{{ $t(`checks.status.${check.status}`) }}</span>
          <p class="checks__summary">{{ check.summary }}</p>
          <p v-if="check.source" class="checks__source">{{ $t('checks.source', { source: check.source }) }}</p>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.checks { display: flex; flex-direction: column; gap: var(--space-xs); }
.checks__rules { font-size: var(--font-size-sm, 14px); color: var(--color-text-subtle, #555); }
.checks__rule { display: inline-block; margin: 0 var(--space-xs, 4px); padding: 0 6px; border: 1px solid var(--color-border, #ddd); border-radius: 4px; }
.checks__title { font-weight: 600; }
.checks__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-xs, 6px); }
.checks__item { border: 1px solid var(--color-border, #ddd); border-radius: 6px; padding: 8px 10px; }
.checks__item--attention { border-color: var(--color-warning, #c77c02); }
.checks__type { font-weight: 600; margin-right: 8px; }
.checks__status { font-size: 13px; padding: 1px 6px; border-radius: 4px; background: var(--color-surface-muted, #f2f2f2); }
.checks__status--danger { color: var(--color-danger, #b3261e); }
.checks__status--warning { color: var(--color-warning, #8a5300); }
.checks__status--success { color: var(--color-success, #1e7a3d); }
.checks__status--info { color: var(--color-info, #1a5fb4); }
.checks__summary { margin: 4px 0 0; }
.checks__source { margin: 2px 0 0; font-size: 13px; color: var(--color-text-subtle, #666); }
</style>
