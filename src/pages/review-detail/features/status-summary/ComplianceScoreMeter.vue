<script setup>
import { computed } from 'vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseProgressBar from '@/shared/components/base/BaseProgressBar.vue'

const props = defineProps({
  score: { type: Number, required: true },
  threshold: { type: Number, required: true },
  expected: { type: Number, required: true },
  max: { type: Number, default: 100 },
})

const passed = computed(() => props.score >= props.threshold)
</script>

<template>
  <div class="score-meter">
    <div class="score-meter__head">
      <span class="score-meter__label">자율심의 적합성 평가 지수 <span class="score-meter__ref">(자동 산출 참고값)</span></span>
      <p class="score-meter__value">
        <strong :class="passed ? 'tone-success' : 'tone-danger'">{{ score }}</strong>
        <span>/ {{ max }}점</span>
        <span class="score-meter__criteria">(승인 권장: <strong>{{ threshold }}점 이상</strong>)</span>
      </p>
    </div>
    <BaseProgressBar
      :value="score"
      :max="max"
      :marker="threshold"
      :variant="passed ? 'success' : 'danger'"
      label="자율심의 적합성 평가 지수"
    />
    <div class="score-meter__foot">
      <span v-if="!passed" class="tone-danger">
        <BaseIcon name="warning" size="xs" /> 기준 미달 (수정 필요)
      </span>
      <span v-else class="tone-success">
        <BaseIcon name="check_circle" size="xs" /> 권장 기준 충족
      </span>
      <span>수정안 반영 시 예상 지수: <strong class="tone-primary">{{ expected }}점</strong></span>
    </div>
  </div>
</template>

<style scoped>
.score-meter {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.score-meter__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.score-meter__label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.score-meter__ref {
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-secondary);
}
.score-meter__value {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.score-meter__value > strong {
  font-size: var(--font-size-title-xl);
}
.score-meter__criteria {
  font-size: var(--font-size-detail-s);
}
.score-meter__foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-xs) var(--space-md);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.score-meter__foot span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
}
.tone-danger { color: var(--color-danger-text); }
.tone-success { color: var(--color-success-text); }
.tone-primary { color: var(--color-primary); }
</style>
