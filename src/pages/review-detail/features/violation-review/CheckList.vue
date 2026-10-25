<!--
  문구별 공식 기록 대조 결과 (FR-3, FR-4, FR-10, FR-14) — 규칙이 지정한 대조만 Agent가 실행한다.
  기능성 보고 대조, 실증자료 제출 여부, 성분 국내 금지, 제한 목록, GMP 업체 목록, 특허 번호.
  카드에서는 담당자가 확인할 항목(attention)을 결론 한 줄로 먼저 보여 주고, 나머지는 근거 펼침 안에 둔다.
  어떤 결과도 자동 위반 판정이 아니다.
-->
<script setup>
defineProps({
  checks: { type: Array, required: true },
  // 'attention': 카드 본문의 확인 필요 목록, 'detail': 근거 펼침 안의 전체 목록
  tone: { type: String, default: 'detail' },
})
const VARIANT = { consistent: 'success', gmp_listed: 'success', in_attachments: 'success', not_listed: 'info', evidence_submitted: 'info',
  prohibited: 'danger', mismatch: 'danger' }
</script>

<template>
  <ul class="checks" :class="`checks--${tone}`" :aria-label="$t('checks.title')">
    <li v-for="(check, i) in checks" :key="`${check.type}-${i}`" class="checks__item">
      <span class="checks__dot" :class="`checks__dot--${VARIANT[check.status] ?? 'warning'}`" aria-hidden="true" />
      <p class="checks__text">
        <strong>{{ $t(`checks.type.${check.type}`) }}, {{ $t(`checks.status.${check.status}`) }}.</strong>
        {{ check.summary }}
        <span v-if="check.source && tone === 'detail'" class="checks__source">{{ $t('checks.source', { source: check.source }) }}</span>
      </p>
    </li>
  </ul>
</template>

<style scoped>
.checks {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--font-size-body-s);
}
.checks--attention {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-warning-surface, #fff7e6);
}
.checks__item {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}
.checks__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-warning-text, #8a5300);
}
.checks__dot--danger { background: var(--color-danger-text, #b3261e); }
.checks__dot--success { background: var(--color-success, #1e7a3d); }
.checks__dot--info { background: var(--color-info-text, #1a5fb4); }
.checks__text { overflow-wrap: anywhere; }
.checks__source {
  display: block;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
