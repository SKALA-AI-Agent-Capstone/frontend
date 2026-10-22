<!-- 3. 광고 매체 및 광고물 (FR-1) — 매체 체크카드 , 광고 카피 , 이미지/상세페이지 -->
<script setup>
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import AttachmentList from '@/shared/components/form/AttachmentList.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import { MEDIA_CHANNELS } from '@/shared/data/requiredDocs.data'
import { useReviewDraft } from '../../composables/useReviewDraft'
import MediaChannelOption from '../media-channels/MediaChannelOption.vue'

const { draft, addFiles } = useReviewDraft()
</script>

<template>
  <FormSection :title="$t('reviewNew.ad.title')" :aside="$t('reviewNew.ad.aside')">
    <fieldset class="channels span-full">
      <legend class="channels__legend">{{ $t('reviewNew.ad.channels') }}</legend>
      <div class="channels__grid">
        <MediaChannelOption
          v-for="channel in MEDIA_CHANNELS"
          :key="channel.value"
          v-model="draft.media"
          :channel="channel"
        />
      </div>
    </fieldset>

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
.channels {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.channels__legend {
  margin-bottom: var(--space-sm);
  padding: 0;
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.channels__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-sm);
}
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

@media (max-width: 1024px) {
  .channels__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .channels__grid {
    grid-template-columns: 1fr;
  }
}
</style>
