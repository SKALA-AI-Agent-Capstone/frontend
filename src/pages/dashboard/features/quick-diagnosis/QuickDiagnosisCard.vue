<script setup>
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseTextarea from '@/shared/components/base/BaseTextarea.vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import QuickDiagnosisResult from './QuickDiagnosisResult.vue'
import { useQuickDiagnosis } from './useQuickDiagnosis'

const { text, result, canDiagnose, diagnose } = useQuickDiagnosis()
</script>

<template>
  <BaseCard tag="aside" variant="muted" class="quick-diagnosis" aria-labelledby="quick-diagnosis-title">
    <div class="quick-diagnosis__head">
      <h2 id="quick-diagnosis-title" class="quick-diagnosis__title">
        <BaseIcon name="fact_check" size="md" />
        신속 자율 진단기
      </h2>
      <BaseBadge icon="help">간이진단</BaseBadge>
    </div>
    <p class="quick-diagnosis__desc">
      광고 게재 전 주요 문구를 입력하여 법령 및 심의 기준 위반 여부를 1차 검토할 수 있습니다.
    </p>

    <form class="quick-diagnosis__form" @submit.prevent="diagnose">
      <BaseFormField label="검토할 광고 문구" for-id="quick-text">
        <BaseTextarea
          id="quick-text"
          v-model="text"
          placeholder="검토할 문구를 입력하세요 (예: 손상된 피부 세포 즉각 재생)"
        />
      </BaseFormField>
      <BaseButton type="submit" variant="secondary" block :disabled="!canDiagnose">
        문구 위반 위험도 검토
      </BaseButton>
      <QuickDiagnosisResult v-if="result" :result="result" />
      <BaseButton
        v-if="result"
        variant="outline"
        icon-right="arrow_forward"
        block
        :to="{ name: ROUTE_NAMES.REVIEW_NEW, query: { copy: text } }"
      >
        이 문구로 정식 심의 신청
      </BaseButton>
    </form>

    <div class="quick-diagnosis__foot">
      <span>평균 소요 시간: 10초 이내</span>
      <span>기능성/일반 화장품 기준</span>
    </div>
  </BaseCard>
</template>

<style scoped>
.quick-diagnosis {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.quick-diagnosis__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
}
.quick-diagnosis__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-title-m);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.quick-diagnosis__title :deep(.base-icon) {
  color: var(--color-primary);
}
.quick-diagnosis__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.quick-diagnosis__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex: 1;
}
.quick-diagnosis__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
</style>
