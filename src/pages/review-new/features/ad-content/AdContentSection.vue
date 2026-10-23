<!-- 광고물 파일 입력 (FR-1) -->
<script setup>
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import AttachmentList from '@/shared/components/form/AttachmentList.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import { useReviewDraft } from '../../composables/useReviewDraft'

const { draft, addFiles } = useReviewDraft()
</script>

<template>
  <FormSection :title="$t('reviewNew.ad.title')">
    <BaseFormField
      class="span-full"
      :label="$t('reviewNew.ad.fileLabel')"
      :hint="$t('reviewNew.ad.fileHint')"
    >
      <BaseFileDropzone
        :title="$t('reviewNew.ad.dropTitle')"
        :description="$t('reviewNew.ad.dropDescription')"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        multiple
        :count="draft.files.length"
        :filled-title="$t('reviewNew.ad.filled', { count: draft.files.length })"
        @select="addFiles"
      />
      <AttachmentList :files="draft.files" @remove="draft.files.splice($event, 1)" />
    </BaseFormField>
  </FormSection>
</template>

<style scoped>
.copy-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-bg-page);
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}

</style>
