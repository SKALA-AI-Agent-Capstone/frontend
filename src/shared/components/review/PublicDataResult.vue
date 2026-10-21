<!--
  식약처 공공데이터 교차검증 결과 (FR-4, NFR-10)
  '제품 미조회(정상 응답,데이터 없음)'와 'API 오류(연동 실패)'를 서로 다른 안내로 표시한다.
-->
<script setup>
import { computed } from 'vue'
import { PUBLIC_DATA_STATUS } from '@/shared/constants/review'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import { formatDate, formatDateTime } from '@/shared/utils/format'

const props = defineProps({
  result: { type: Object, required: true },
  retrying: { type: Boolean, default: false },
})
defineEmits(['retry'])

const VIEW = {
  cancelled: {variant:'warning',icon:'info',title:'ui.publicData.cancelledTitle'},
  ambiguous: {variant:'warning',icon:'help',title:'ui.publicData.ambiguousTitle'},
  [PUBLIC_DATA_STATUS.FOUND]: { variant: 'success', icon: 'verified', title: 'ui.publicData.foundTitle' },
  [PUBLIC_DATA_STATUS.NOT_FOUND]: {
    variant: 'warning',
    icon: 'search_off',
    title: 'ui.publicData.notFoundTitle',
  },
  [PUBLIC_DATA_STATUS.ERROR]: { variant: 'danger', icon: 'cloud_off', title: 'ui.publicData.errorTitle' },
  [PUBLIC_DATA_STATUS.SKIPPED]: { variant: 'neutral', icon: 'info', title: 'ui.publicData.skippedTitle' },
}
const view = computed(() => VIEW[props.result.status] || {variant:'warning',icon:'info',title:'ui.publicData.unknownTitle'})
</script>

<template>
  <BaseAlert :variant="view.variant" :icon="view.icon" :title="$t(view.title)" aria-live="polite">
    <div class="public-data">
      <dl v-if="result.status === PUBLIC_DATA_STATUS.FOUND" class="public-data__list">
        <div><dt>{{ $t('ui.publicData.reportNo') }}</dt><dd>{{ result.reportNo }}</dd></div>
        <div><dt>{{ $t('ui.publicData.productName') }}</dt><dd>{{ result.data.productName }}</dd></div>
        <div><dt>{{ $t('ui.publicData.functions') }}</dt><dd>{{ result.data.functions?.join(', ') || $t('ui.publicData.functionsUnknown') }}</dd></div>
        <div><dt>{{ $t('ui.publicData.reportedAt') }}</dt><dd>{{ formatDate(result.data.reportedAt) }}</dd></div>
      </dl>
      <p v-else-if="result.status === PUBLIC_DATA_STATUS.NOT_FOUND">
        {{ $t('ui.publicData.notFoundText', { no: result.reportNo }) }}
      </p>
      <p v-else-if="result.status === PUBLIC_DATA_STATUS.ERROR">
        {{ $t('ui.publicData.errorText', { error: result.error }) }}
      </p>
      <p v-else-if="result.status === 'cancelled'">{{ $t('ui.publicData.cancelledText') }}</p>
      <p v-else-if="result.status === 'ambiguous'">{{ $t('ui.publicData.ambiguousText') }}</p>
      <p class="public-data__meta">
        {{ $t('ui.publicData.meta', { source: result.source }) }}<template v-if="result.checkedAt">, {{ $t('ui.publicData.checkedAt', { at: formatDateTime(result.checkedAt) }) }}</template>
      </p>
      <p v-if="result.status === PUBLIC_DATA_STATUS.ERROR">{{ $t('ui.publicData.errorHint') }}</p>
    </div>
  </BaseAlert>
</template>

<style scoped>
.public-data {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}
.public-data__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2xs) var(--space-md);
  margin: 0;
}
.public-data__list div {
  display: flex;
  gap: var(--space-xs);
}
.public-data__list dt {
  color: var(--color-text-secondary);
}
.public-data__list dd {
  margin: 0;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}
.public-data__meta {
  font-size: var(--font-size-detail-s);
}

@media (max-width: 600px) {
  .public-data__list {
    grid-template-columns: 1fr;
  }
}
</style>
