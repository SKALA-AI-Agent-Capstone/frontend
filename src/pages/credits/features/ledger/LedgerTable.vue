<!-- 크레딧 원장 (ledger) — 충전, 차감 기록 -->
<script setup>
import { LEDGER_TYPE, LEDGER_TYPE_LABEL } from '@/shared/constants/pricing'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import { useCreditsStore } from '@/shared/stores/credits'
import { formatDateTime, formatNumber } from '@/shared/utils/format'

const credits = useCreditsStore()
</script>

<template>
  <BaseEmptyState v-if="!credits.ledger.length" icon="receipt_long" title="크레딧 사용 기록이 없습니다" />
  <div v-else class="table-wrap">
    <table class="ledger">
      <caption class="sr-only">크레딧 원장</caption>
      <thead>
        <tr>
          <th scope="col">일시</th>
          <th scope="col">구분</th>
          <th scope="col">내용</th>
          <th scope="col" class="ledger__num">변동</th>
          <th scope="col" class="ledger__num">잔액</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in credits.ledger" :key="entry.id">
          <td>{{ formatDateTime(entry.at) }}</td>
          <td>
            <BaseBadge :variant="entry.type === LEDGER_TYPE.CHARGE ? 'success' : 'neutral'">{{ LEDGER_TYPE_LABEL[entry.type] }}</BaseBadge>
          </td>
          <td>
            <RouterLink
              v-if="entry.reviewId"
              :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: entry.reviewId }, query: { v: entry.versionNo } }"
              class="ledger__link"
            >
              {{ entry.memo }}
            </RouterLink>
            <template v-else>{{ entry.memo }}</template>
            <p v-if="entry.usage" class="ledger__usage">텍스트 {{ entry.usage.textUnits }}단위 ,  이미지 {{ entry.usage.images }}장</p>
          </td>
          <td class="ledger__num" :class="entry.amount > 0 ? 'ledger__plus' : 'ledger__minus'">
            {{ entry.amount > 0 ? '+' : '' }}{{ formatNumber(entry.amount) }}
          </td>
          <td class="ledger__num">{{ formatNumber(entry.balanceAfter) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.ledger {
  width: 100%;
  min-width: 64rem;
  border-collapse: collapse;
  font-size: var(--font-size-body-s);
}
.ledger th,
.ledger td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
}
.ledger th {
  background: var(--color-bg-page);
  font-size: var(--font-size-label-s);
}
.ledger .ledger__num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.ledger__plus { color: var(--color-success-text); font-weight: var(--font-weight-bold); }
.ledger__minus { color: var(--color-danger-text); font-weight: var(--font-weight-bold); }
.ledger__link {
  text-decoration: underline;
}
.ledger__usage {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
