<!--
  4. 증빙 서류 제출: 업로드와 유형 지정(FR-3). 주장별 필요 서류 안내(FR-10)는 후속.
  고른 제품에 올려 둔 증빙(제품 상세의 "증빙 서류")은 서버가 검토마다 자동으로 쓰므로, 여기서는 이미 들어간 것으로 보여 주기만 한다.
  이 광고에만 쓸 서류는 아래에서 더 올린다.
-->
<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { useProductEvidenceStore } from '@/shared/stores/productEvidence'
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

const productEvidence = useProductEvidenceStore()
watch(() => draft.productId, (id, before) => {
  if (before) productEvidence.clear(before)
  if (id) productEvidence.load(id).catch(() => { /* 제품 증빙을 못 받으면 이 칸만 비워 둔다 */ })
}, { immediate: true })
onBeforeUnmount(() => { if (draft.productId) productEvidence.clear(draft.productId) })
// 이전 판으로 밀려난 것은 검토에 쓰이지 않는다
const productDocs = computed(() => (draft.productId ? productEvidence.list(draft.productId).filter(item => item.isCurrent) : []))
const totalCount = computed(() => productDocs.value.length + draft.evidence.length)
const docLabel = value => DOC_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value
const statusOf = item => (item.status === 'reading' ? { variant: 'info', key: 'reading' }
  : item.status === 'failed' ? { variant: 'danger', key: 'failed' }
    : item.unreadPages?.length ? { variant: 'warning', key: 'partial' }
      : item.productMatch?.checkPages?.length ? { variant: 'warning', key: 'check' } : { variant: 'success', key: 'done' })
</script>

<template>
  <FormSection :title="$t('reviewNew.evidence.title')" :aside="$t('reviewNew.evidence.aside')" :columns="1">
    <p class="evidence-intro">
      {{ $t('reviewNew.evidence.intro') }}
    </p>
    <div v-if="requirements.length" class="requirement-list">
      <EvidenceRequirementRow v-for="req in requirements" :key="req.claimType" :requirement="req" />
    </div>

    <div v-if="productDocs.length" class="product-docs">
      <p class="product-docs__head">
        <strong>{{ $t('reviewNew.evidence.productTitle', { count: productDocs.length }) }}</strong>
        <span>{{ $t('reviewNew.evidence.productHint') }}</span>
      </p>
      <ul class="evidence-list" :aria-label="$t('reviewNew.evidence.productListLabel')">
        <li v-for="item in productDocs" :key="item.id" class="evidence-item evidence-item--product">
          <BaseIcon name="inventory_2" size="sm" class="evidence-item__icon" />
          <span class="evidence-item__name">
            {{ item.fileName }}
            <span class="evidence-item__size">{{ docLabel(item.docType) }}, {{ formatFileSize(item.fileSize) }}</span>
          </span>
          <BaseBadge :variant="statusOf(item).variant" :dot="item.status === 'reading'">{{ $t(`products.evidence.status.${statusOf(item).key}`) }}</BaseBadge>
          <BaseBadge variant="secondary">{{ $t('reviewNew.evidence.fromProduct') }}</BaseBadge>
        </li>
      </ul>
    </div>

    <BaseFileDropzone
      :title="$t('reviewNew.evidence.dropTitle')"
      :description="$t('reviewNew.evidence.dropDescription')"
      accept=".pdf,.jpg,.jpeg,.png"
      multiple
      :count="totalCount"
      :filled-title="$t('reviewNew.evidence.filled', { count: totalCount })"
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
.product-docs {
  display: grid;
  gap: var(--space-sm);
}
.product-docs__head {
  display: grid;
  gap: 2px;
  font-size: var(--font-size-body-s);
}
.product-docs__head span {
  color: var(--color-text-secondary);
}
.evidence-item--product {
  padding-block: var(--space-sm);
  padding-right: var(--space-md);
  background: var(--color-bg-page);
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
  /* 좁은 화면에서는 배지를 파일 이름 아래 줄로 내린다 */
  .evidence-item--product .evidence-item__name {
    flex-basis: calc(100% - var(--icon-size-sm) - var(--space-sm));
  }
  .evidence-item--product :deep(.base-badge:first-of-type) {
    margin-left: calc(var(--icon-size-sm) + var(--space-sm));
  }
}
</style>
