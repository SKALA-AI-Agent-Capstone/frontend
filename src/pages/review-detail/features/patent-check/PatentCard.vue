<!--
  특허 1건 확인 결과
  FR-14 등록 여부 ,  FR-15 청구항 대조 ,  NFR-12 저신뢰 번호 사용자 확인 ,  NFR-13 '확인 불가' 표시
  NFR-14 조회 번호, 출처, 시각, 원문 위치, 광고 문구 표시 ,  NFR-16 조회 실패 시 재시도
-->
<script setup>
import { computed, ref } from 'vue'
import { PATENT_MATCH_LABEL, PATENT_STATUS, PATENT_STATUS_LABEL } from '@/shared/constants/review'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import InputWithAction from '@/shared/components/form/InputWithAction.vue'
import { formatDate, formatDateTime } from '@/shared/utils/format'

const props = defineProps({
  patent: { type: Object, required: true },
})
const emit = defineEmits(['retry', 'confirm'])

const status = computed(() => PATENT_STATUS_LABEL[props.patent.status] || {label:'확인 필요',variant:'warning'})
const match = computed(() => (props.patent.match ? PATENT_MATCH_LABEL[props.patent.match.verdict] : null))
const number = ref(props.patent.number)
const inputId = `patent-${props.patent.id}`
</script>

<template>
  <article class="patent" :aria-labelledby="`${inputId}-title`">
    <header class="patent__head">
      <h3 :id="`${inputId}-title`" class="patent__number">
        {{ patent.confirmedNumber ?? patent.number }}
      </h3>
      <BaseBadge :variant="status.variant">{{ status.label }}</BaseBadge>
    </header>
    <p class="patent__origin">
      추출 위치: {{ patent.origins?.join(', ') || '광고와 증빙에서 추출한 번호 후보' }}. 번호는 원본과 직접 확인해 주세요. OCR 정답 확률을 제공하지 않습니다.
    </p>

    <!-- NFR-12: 자동 확정하지 않고 사용자 확인 요청 -->
    <div v-if="patent.status === PATENT_STATUS.NEEDS_CONFIRM" class="patent__confirm">
      <BaseAlert variant="warning" title="특허번호를 확인해 주세요">
        <ul>
          <li v-for="note in patent.notes" :key="note">{{ note }}</li>
        </ul>
      </BaseAlert>
      <BaseFormField label="확인한 특허 등록번호" :for-id="inputId" hint="형식: 10-0000000">
        <InputWithAction>
          <BaseInput :id="inputId" v-model="number" placeholder="10-0000000" />
          <template #action>
            <BaseButton size="sm" variant="secondary" :busy="patent.retrying" @click="emit('confirm', number)">확인 후 조회</BaseButton>
          </template>
        </InputWithAction>
      </BaseFormField>
    </div>

    <!-- NFR-16: 조회 실패 — 다른 기능은 정상, 이 항목만 재시도 -->
    <BaseAlert v-else-if="patent.status === PATENT_STATUS.ERROR" variant="danger" icon="cloud_off" title="특허 조회 실패">
      <div class="patent__retry">
        <span>{{ patent.error }} — 특허 확인 결과만 보류되며, 다른 검토 결과는 정상입니다.</span>
        <p>공식 API 설정 확인 후 원본 파일로 새 버전을 신청해 주세요.</p>
      </div>
    </BaseAlert>

    <!-- NFR-13: 결과 없음 → 단정하지 않음 -->
    <BaseAlert v-else-if="patent.status === PATENT_STATUS.UNAVAILABLE" variant="neutral" icon="help" title="확인 불가">
      조회 결과를 찾지 못했습니다. '특허 없음'이나 '광고와 불일치'로 판단하지 않으며, 특허등록증 사본으로 확인해 주세요.
    </BaseAlert>

    <template v-else-if="patent.status === PATENT_STATUS.REGISTERED">
      <dl class="patent__info">
        <div><dt>발명 명칭</dt><dd>{{ patent.data.title }}</dd></div>
        <div><dt>특허권자</dt><dd>{{ patent.data.applicant || '미확인' }}</dd></div>
        <div><dt>등록일</dt><dd>{{ formatDate(patent.data.registerDate) }}</dd></div>
      </dl>
      <div class="patent__match">
        <p class="patent__match-head">
          청구항 대조
          <BaseBadge :variant="match.variant">{{ match.label }}</BaseBadge>
        </p>
        <p class="patent__summary">{{ patent.match.summary }}</p>
        <table v-if="patent.match.reasons?.length" class="patent__table">
          <thead>
            <tr><th scope="col">광고 주장</th><th scope="col">특허 원문 위치</th><th scope="col">대조 근거</th></tr>
          </thead>
          <tbody>
            <tr v-for="reason in patent.match.reasons" :key="reason.adTerm">
              <td><strong>{{ reason.adTerm }}</strong><br /><span class="muted">{{ reason.adExcerpt }}</span></td>
              <td>{{ reason.location ?? '-' }}</td>
              <td :class="{ muted: !reason.found }">{{ reason.patentExcerpt ?? '청구항, 명세서에서 확인되지 않음' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <p v-if="patent.checkedAt" class="patent__trace">
      조회 번호 {{ patent.confirmedNumber ?? patent.number }} ,  출처 {{ patent.source ?? '-' }} ,  조회 {{ formatDateTime(patent.checkedAt) }}
      <template v-if="patent.confirmedBy"> ,  번호 확인 {{ patent.confirmedBy }}</template>
    </p>
  </article>
</template>

<style scoped>
.patent {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.patent__head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.patent__number {
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.patent__origin,
.patent__trace {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  word-break: break-all;
}
.patent__confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.patent__retry {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}
.patent__info {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-sm);
  margin: 0;
  font-size: var(--font-size-detail-m);
}
.patent__info dt {
  color: var(--color-text-secondary);
}
.patent__info dd {
  margin: 0;
  font-weight: var(--font-weight-bold);
}
.patent__match {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.patent__match-head {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.patent__summary {
  font-size: var(--font-size-body-s);
}
.patent__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-detail-m);
}
.patent__table th,
.patent__table td {
  padding: var(--space-xs) var(--space-sm);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
  vertical-align: top;
}
.patent__table th {
  background: var(--color-bg-page);
  font-weight: var(--font-weight-bold);
}
.muted {
  color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .patent__info {
    grid-template-columns: 1fr;
  }
}
</style>
