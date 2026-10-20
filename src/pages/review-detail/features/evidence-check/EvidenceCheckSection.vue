<!-- 광고 주장 ↔ 증빙 대조 (FR-3), 필요 서류 (FR-10), 공공데이터 교차검증 (FR-4,NFR-10) -->
<script setup>
import { DOC_TYPE_LABEL } from '@/shared/constants/review'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import PublicDataResult from '@/shared/components/review/PublicDataResult.vue'
import RequirementChecklist from '@/shared/components/review/RequirementChecklist.vue'
import SeverityBadge from '@/shared/components/review/SeverityBadge.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'

const { version, result } = useReviewDetail()
</script>

<template>
  <BaseCard tag="section" class="evidence" aria-labelledby="evidence-title">
    <BaseSectionHeader
      title="증빙 대조"
      heading-id="evidence-title"
      size="md"
    />

    <ul v-if="result.evidence.flags.length" class="flags" aria-label="대조 결과">
      <li v-for="(flag, i) in result.evidence.flags" :key="i" class="flag">
        <SeverityBadge :severity="flag.severity" short />
        <span>{{ flag.message }}</span>
      </li>
    </ul>
    <p v-else class="evidence__ok"><BaseIcon name="check_circle" size="sm" /> 증빙 자동 대조는 미완료입니다. 추출 본문과 판독 상태를 확인하세요.</p>

    <p>추출 상태: {{result.evidence.status}}</p>
    <p v-for="failure in result.evidence.failures" :key="`${failure.documentId}:${failure.page}`">{{failure.code}} / {{failure.documentId}}</p>
    <details v-if="result.evidence.text"><summary>증빙 추출 본문</summary><pre style="white-space:pre-wrap">{{result.evidence.text}}</pre></details>
    <div class="evidence__grid">
      <div class="evidence__col">
        <p class="evidence__label">주장별 필요 서류</p>
        <RequirementChecklist v-if="result.evidence.requirements.length" :requirements="result.evidence.requirements" />
        <p v-else class="evidence__muted">필요 서류 자동 판정은 아직 연결되지 않았습니다.</p>
      </div>
      <div class="evidence__col">
        <p class="evidence__label">제출 서류</p>
        <ul v-if="version.input.evidence.length" class="docs">
          <li v-for="doc in version.input.evidence" :key="doc.id">
            <BaseIcon name="description" size="xs" />
            <span><strong>{{ DOC_TYPE_LABEL[doc.docType] }}</strong> , {{ doc.name }}</span>
          </li>
        </ul>
        <p v-else class="evidence__muted">제출된 증빙서류가 없습니다.</p>
        <p class="evidence__label">공공데이터 교차검증 (보조)</p>
        <PublicDataResult :result="result.publicData" />
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.evidence {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.flags {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.flag {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: var(--font-size-body-s);
}
.evidence__ok {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-success-text);
}
.evidence__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}
.evidence__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.evidence__label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.evidence__muted {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.docs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  font-size: var(--font-size-body-s);
}
.docs li {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  word-break: break-all;
}

@media (max-width: 1024px) {
  .evidence__grid {
    grid-template-columns: 1fr;
  }
}
</style>
