<!-- 제품 메타데이터, 공식 API 조회는 서버의 검토 단계에서 실행한다. -->
<script setup>
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import { PRODUCT_CATEGORIES } from '@/shared/data/requiredDocs.data'
import { useReviewDraft } from '../../composables/useReviewDraft'
const { draft } = useReviewDraft()
const product = draft.product
</script>

<template>
  <FormSection title="2. 제품 기본정보" aside="광고 대상 제품과 공식 조회에 사용할 정보">
    <BaseFormField label="제품명" for-id="product-name" required>
      <BaseInput id="product-name" v-model="product.name" placeholder="용기와 포장에 기재된 제품명" required />
    </BaseFormField>
    <BaseFormField label="품목 유형" for-id="product-category" required>
      <BaseSelect id="product-category" v-model="product.category" :options="PRODUCT_CATEGORIES" required />
    </BaseFormField>
    <BaseFormField class="span-full" label="기능성화장품 심사 또는 보고번호" for-id="functional-report-no" optional
      hint="입력한 번호와 제품명은 검토 실행 시 서버에서 대조합니다. 공식 API 키와 조회 경로가 없으면 미확인으로 표시하며, 적합 판정으로 처리하지 않습니다.">
      <BaseInput id="functional-report-no" v-model="product.functionalReportNo" placeholder="보유 자료의 심사 또는 보고번호" />
    </BaseFormField>
  </FormSection>
</template>
