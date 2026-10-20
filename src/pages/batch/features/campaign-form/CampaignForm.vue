<!-- 캠페인 단위 다건 업로드 (FR-7) — 공통 제품정보 + 여러 상세페이지, 전체 크레딧 사전 확인 -->
<script setup>
import { computed, reactive, ref } from 'vue'
import { calcUsage } from '@/shared/constants/pricing'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'
import AttachmentList from '@/shared/components/form/AttachmentList.vue'
import CreditEstimate from '@/shared/components/review/CreditEstimate.vue'
import { PRODUCT_CATEGORIES } from '@/shared/data/requiredDocs.data'
import { useBatchStore } from '@/shared/stores/batch'
import { useCreditsStore } from '@/shared/stores/credits'

const batch = useBatchStore()
const credits = useCreditsStore()

const form = reactive({ name: '', product: { name: '', category: 'functional', functionalReportNo: '' } })
const files = ref([])
const estimate = computed(() => calcUsage({ images: files.value.length }))
const canStart = computed(
  () => form.name.trim() && form.product.name.trim() && files.value.length && credits.precheck(estimate.value.credits).ok,
)

function start() {
  if (!canStart.value) return
  batch.startCampaign({
    name: form.name.trim(),
    product: { ...form.product },
    media: ['detail-page'],
    evidence: [],
    files: files.value.map((f) => ({ name: f.name, size: f.size })),
  })
  files.value = []
  form.name = ''
}
</script>

<template>
  <BaseCard tag="section" class="campaign-form" aria-labelledby="campaign-form-title">
    <BaseSectionHeader
      title="캠페인 일괄 등록"
      heading-id="campaign-form-title"
      size="md"
    />
    <form class="campaign-form__body" @submit.prevent="start">
      <div class="campaign-form__fields">
        <BaseFormField label="캠페인명" for-id="campaign-name" required>
          <BaseInput id="campaign-name" v-model="form.name" placeholder="예: 2025 봄 신제품 런칭" required />
        </BaseFormField>
        <BaseFormField label="제품명" for-id="campaign-product" required>
          <BaseInput id="campaign-product" v-model="form.product.name" required />
        </BaseFormField>
        <BaseFormField label="품목 유형" for-id="campaign-category" required>
          <BaseSelect id="campaign-category" v-model="form.product.category" :options="PRODUCT_CATEGORIES" required />
        </BaseFormField>
        <BaseFormField label="기능성 심사, 보고번호" for-id="campaign-report" optional>
          <BaseInput id="campaign-report" v-model="form.product.functionalReportNo" />
        </BaseFormField>
      </div>
      <BaseFormField label="상세페이지 파일" required hint="데모: 파일명에 'fail'이 있으면 첫 처리에서 실패합니다 (재시도 확인용).">
        <BaseFileDropzone
          title="상세페이지 파일을 여러 개 끌어다 놓거나 선택하세요"
          description="JPG, PNG, PDF"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          @select="files.push(...$event)"
        />
        <AttachmentList :files="files" @remove="files.splice($event, 1)" />
      </BaseFormField>
      <CreditEstimate :required="estimate.credits" :breakdown="`상세페이지 ${estimate.images}건`" />
      <BaseButton type="submit" icon-right="arrow_forward" :disabled="!canStart">일괄 검토 시작</BaseButton>
    </form>
  </BaseCard>
</template>

<style scoped>
.campaign-form,
.campaign-form__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.campaign-form__body > .base-button {
  align-self: flex-end;
}
.campaign-form__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md) var(--layout-gutter);
}

@media (max-width: 600px) {
  .campaign-form__fields {
    grid-template-columns: 1fr;
  }
}
</style>
