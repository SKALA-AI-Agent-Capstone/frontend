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
  <FormSection :title="$t('reviewNew.product.title')" :aside="$t('reviewNew.product.aside')">
    <BaseFormField :label="$t('reviewNew.product.name')" for-id="product-name" required>
      <BaseInput id="product-name" v-model="product.name" :placeholder="$t('reviewNew.product.namePlaceholder')" required />
    </BaseFormField>
    <BaseFormField :label="$t('reviewNew.product.category')" for-id="product-category" required>
      <BaseSelect id="product-category" v-model="product.category" :options="PRODUCT_CATEGORIES" required />
    </BaseFormField>
    <BaseFormField class="span-full" :label="$t('reviewNew.product.reportNo')" for-id="functional-report-no" optional
      :hint="$t('reviewNew.product.reportNoHint')">
      <BaseInput id="functional-report-no" v-model="product.functionalReportNo" :placeholder="$t('reviewNew.product.reportNoPlaceholder')" />
    </BaseFormField>
  </FormSection>
</template>
