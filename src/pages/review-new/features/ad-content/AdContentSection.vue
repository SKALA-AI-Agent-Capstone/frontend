<!-- 3. 광고 매체 및 광고물 (FR-1) — 매체 체크카드 , 광고 카피 , 이미지/상세페이지 -->
<script setup>
import { PRICING } from '@/shared/constants/pricing'
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseTextarea from '@/shared/components/base/BaseTextarea.vue'
import AttachmentList from '@/shared/components/form/AttachmentList.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import SeveritySummary from '@/shared/components/review/SeveritySummary.vue'
import { MEDIA_CHANNELS } from '@/shared/data/requiredDocs.data'
import { formatNumber } from '@/shared/utils/format'
import { useReviewDraft } from '../../composables/useReviewDraft'
import MediaChannelOption from '../media-channels/MediaChannelOption.vue'

const { draft, liveFindings, addFiles } = useReviewDraft()
</script>

<template>
  <FormSection title="3. 광고 매체 및 광고물" aside="게시 예정 채널 복수 선택 가능">
    <fieldset class="channels span-full">
      <legend class="channels__legend">광고 매체 구분 (복수 선택)</legend>
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
      label="광고 PDF 또는 이미지 파일"
      hint="파일당 최대 10 MiB, 광고 파일 최대 5개. 분석 중 원본은 임시 보관됩니다."
    >
      <BaseFileDropzone
        title="광고물 파일을 드래그하여 놓으세요"
        description="인쇄 포스터,온라인 배너,상세페이지 (JPG, PNG, WebP, PDF) — 문구와 사진을 별도 분석합니다. 선택한 광고는 분석 시 OpenAI API로 전송됩니다."
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        multiple
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
