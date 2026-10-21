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
  <FormSection :title="$t('reviewNew.evidence.title')" :aside="$t('reviewNew.evidence.aside')" :columns="1">
    <p class="evidence-intro">
      {{ $t('reviewNew.evidence.intro') }}
    </p>
    <div v-if="requirements.length" class="requirement-list">
      <EvidenceRequirementRow v-for="req in requirements" :key="req.claimType" :requirement="req" />
    </div>

    <BaseFileDropzone
      :title="$t('reviewNew.evidence.dropTitle')"
      :description="$t('reviewNew.evidence.dropDescription')"
      accept=".pdf,.jpg,.jpeg,.png"
      multiple
      :count="draft.evidence.length"
      :filled-title="$t('reviewNew.evidence.filled', { count: draft.evidence.length })"
      @select="addEvidence"
    />

    <ul v-if="draft.evidence.length" class="evidence-list" :aria-label="$t('reviewNew.evidence.listLabel')">
      <li v-for="(doc, index) in draft.evidence" :key="doc.id" class="evidence-item">
        <BaseIcon name="description" size="sm" class="evidence-item__icon" />
        <span class="evidence-item__name">
          {{ doc.name }}
          <span class="evidence-item__size">{{ formatFileSize(doc.size) }}</span>
          <BaseBadge v-if="doc.carried">{{ $t('reviewNew.evidence.carried') }}</BaseBadge>
        </span>
        <label class="sr-only" :for="`doc-type-${doc.id}`">{{ $t('reviewNew.evidence.typeLabel', { name: doc.name }) }}</label>
        <BaseSelect :id="`doc-type-${doc.id}`" v-model="doc.docType" :options="DOC_TYPE_OPTIONS" :placeholder="$t('reviewNew.evidence.typePlaceholder')" class="evidence-item__type" />
        <button type="button" class="evidence-item__remove" @click="draft.evidence.splice(index, 1)">
          <BaseIcon name="close" size="sm" />
          <span class="sr-only">{{ $t('ui.attachments.remove', { name: doc.name }) }}</span>
        </button>
      </li>
    </ul>

    <BaseAlert variant="neutral">
      <strong>{{ $t('reviewNew.evidence.noteLabel') }}</strong> {{ $t('reviewNew.evidence.note') }}
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
  overflow-wrap: anywhere; /* break-all은 영어 단어를 중간에서 자른다 */
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
