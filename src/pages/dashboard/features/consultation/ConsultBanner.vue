<script setup>
import { SITE } from '@/shared/constants/site'
import BaseButton from '@/shared/components/base/BaseButton.vue'
</script>

<template>
  <section class="consult" aria-labelledby="consult-title">
    <div class="consult__text">
      <span class="consult__tag">신속 행정 상담 창구</span>
      <h2 id="consult-title" class="consult__title">화장품 표시, 광고 표현이 고민되시나요?</h2>
      <p class="consult__desc">
        식품의약품안전처 및 한국화장품협회 전문 자율심의 전문관이 사전 검토 및 실증자료 요건을 1:1로
        신속히 컨설팅해 드립니다.
      </p>
    </div>
    <div class="consult__actions">
      <BaseButton variant="inverse" href="#">온라인 1:1 심의 상담신청</BaseButton>
      <BaseButton variant="inverse-outline" icon="phone_in_talk" :href="`tel:${SITE.helpdeskPhone}`">
        헬프데스크 ({{ SITE.helpdeskPhone }})
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.consult {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  background: var(--color-secondary);
  color: var(--color-on-secondary);
}
.consult__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-sm);
  max-width: var(--readable-width);
}
.consult__tag {
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--color-secondary-dark);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.consult__title {
  font-size: var(--font-size-title-xl);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.consult__desc {
  font-size: var(--font-size-body-s);
  line-height: var(--line-height-base);
  opacity: 0.85;
}
.consult__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .consult {
    padding: var(--space-lg);
  }
  .consult__actions,
  .consult__actions > * {
    width: 100%;
  }
}
</style>
