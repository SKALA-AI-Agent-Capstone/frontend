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
  cancelled: {variant:'warning',icon:'info',title:'취하 정보가 있는 보고품목입니다. 담당자 확인이 필요합니다'},
  ambiguous: {variant:'warning',icon:'help',title:'제품과 보고번호의 정확한 대응을 확인해야 합니다'},
  [PUBLIC_DATA_STATUS.FOUND]: { variant: 'success', icon: 'verified', title: '식약처 보고품목에서 확인되었습니다' },
  [PUBLIC_DATA_STATUS.NOT_FOUND]: {
    variant: 'warning',
    icon: 'search_off',
    title: '조회 결과 없음 — 번호를 다시 확인해 주세요',
  },
  [PUBLIC_DATA_STATUS.ERROR]: { variant: 'danger', icon: 'cloud_off', title: '공공데이터 연동 실패 — 잠시 후 다시 조회해 주세요' },
  [PUBLIC_DATA_STATUS.SKIPPED]: { variant: 'neutral', icon: 'info', title: '심사,보고번호 미입력 — 교차검증을 하지 않았습니다' },
}
const view = computed(() => VIEW[props.result.status] || {variant:'warning',icon:'info',title:'공식 정보 확인 필요'})
</script>

<template>
  <BaseAlert :variant="view.variant" :icon="view.icon" :title="view.title" aria-live="polite">
    <div class="public-data">
      <dl v-if="result.status === PUBLIC_DATA_STATUS.FOUND" class="public-data__list">
        <div><dt>보고번호</dt><dd>{{ result.reportNo }}</dd></div>
        <div><dt>제품명</dt><dd>{{ result.data.productName }}</dd></div>
        <div><dt>보고 기능</dt><dd>{{ result.data.functions?.join(', ') || '효능 범위 미확인' }}</dd></div>
        <div><dt>보고일</dt><dd>{{ formatDate(result.data.reportedAt) }}</dd></div>
      </dl>
      <p v-else-if="result.status === PUBLIC_DATA_STATUS.NOT_FOUND">
        정상적으로 조회했지만 '{{ result.reportNo }}'에 해당하는 보고품목이 없습니다. 번호 오타를 확인하거나, 심사,보고서 사본을 증빙으로 제출해 주세요.
      </p>
      <p v-else-if="result.status === PUBLIC_DATA_STATUS.ERROR">
        외부 시스템과 연결하지 못했습니다({{ result.error }}). 제품에 문제가 있다는 뜻이 아니며, 다른 검토는 계속 진행됩니다.
      </p>
      <p v-else-if="result.status === 'cancelled'">조회한 품목에 취하 정보가 있습니다. 현재 등록 상태와 제품 자료를 직접 확인해 주세요.</p>
      <p v-else-if="result.status === 'ambiguous'">번호 형식이나 제품명 대응이 명확하지 않거나 전체 페이지를 확인하지 못했습니다. 제품이 없다는 뜻은 아닙니다.</p>
      <p class="public-data__meta">
        보조 교차검증 , {{ result.source }}<template v-if="result.checkedAt"> , {{ formatDateTime(result.checkedAt) }} 조회</template>
      </p>
      <p v-if="result.status === PUBLIC_DATA_STATUS.ERROR">설정 확인 후 원본 파일로 새 버전을 신청해 주세요. 결과 항목만 재조회하는 기능은 아직 연결하지 않았습니다.</p>
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
