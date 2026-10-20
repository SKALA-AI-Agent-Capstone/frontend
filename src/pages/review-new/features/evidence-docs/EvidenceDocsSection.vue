<!-- 4. 증빙 서류 사전 체크리스트 — 업로드, 유형 지정(FR-3) + 주장별 필요 서류 안내(FR-10) -->
<script setup>
import { DOC_TYPE_OPTIONS } from '@/shared/constants/review'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import { formatFileSize } from '@/shared/utils/format'
import { useReviewDraft } from '../../composables/useReviewDraft'
import EvidenceRequirementRow from './EvidenceRequirementRow.vue'

const { draft, requirements, addEvidence } = useReviewDraft()
</script>

<template>
  <FormSection title="4. 증빙 서류 사전 체크리스트" aside="선택 제출, 원문 추출 결과를 확인합니다" :columns="1">
    <p class="evidence-intro">
      보유한 시험자료나 제품 관련 자료를 선택 제출하세요. 이번 최소 기능은 증빙 본문을 추출하며, 제품과 시험 조건의 의미 대조 및 주장별 필요 서류 자동 추천은 후속 단계입니다.
    </p>
    <div v-if="requirements.length" class="requirement-list">
      <EvidenceRequirementRow v-for="req in requirements" :key="req.claimType" :requirement="req" />
    </div>

    <BaseFileDropzone
      title="증빙서류를 끌어다 놓거나 선택하세요"
      description="심사, 보고서, 전성분표, 인체적용, 인체외시험 결과서, 인증서, 특허, 상표등록증, 원산지증명서 (PDF, JPG, PNG)"
      accept=".pdf,.jpg,.jpeg,.png"
      multiple
      @select="addEvidence"
    />

    <ul v-if="draft.evidence.length" class="evidence-list" aria-label="제출 증빙서류">
      <li v-for="(doc, index) in draft.evidence" :key="doc.id" class="evidence-item">
        <BaseIcon name="description" size="sm" class="evidence-item__icon" />
        <span class="evidence-item__name">
          {{ doc.name }}
          <span class="evidence-item__size">{{ formatFileSize(doc.size) }}</span>
          <BaseBadge v-if="doc.carried">이전 버전 제출</BaseBadge>
        </span>
        <label class="sr-only" :for="`doc-type-${doc.id}`">{{ doc.name }} 서류 유형</label>
        <BaseSelect :id="`doc-type-${doc.id}`" v-model="doc.docType" :options="DOC_TYPE_OPTIONS" placeholder="서류 유형 선택" class="evidence-item__type" />
        <button type="button" class="evidence-item__remove" @click="draft.evidence.splice(index, 1)">
          <BaseIcon name="close" size="sm" />
          <span class="sr-only">{{ doc.name }} 삭제</span>
        </button>
      </li>
    </ul>

    <BaseAlert variant="neutral">
      <strong>자료 확인:</strong> 법령 검색이 연결되기 전에는 제출 자료만으로 광고의 적법 여부나 실증 충족 여부를 확정하지 않습니다.
    </BaseAlert>
  </FormSection>
</template>

<style scoped>
.evidence-intro {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.requirement-list {
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.evidence-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.evidence-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.evidence-item__icon {
  color: var(--color-primary);
}
.evidence-item__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-body-s);
  word-break: break-all;
}
.evidence-item__size {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.evidence-item__type {
  width: 24rem;
  flex-shrink: 0;
}
.evidence-item__remove {
  display: grid;
  place-items: center;
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: var(--radius-sm-2);
  color: var(--color-text-secondary);
}
.evidence-item__remove:hover {
  background: var(--color-bg-muted);
  color: var(--color-danger-text);
}

@media (max-width: 600px) {
  .evidence-item {
    flex-wrap: wrap;
  }
  .evidence-item__type {
    width: 100%;
    order: 3;
  }
}
</style>
