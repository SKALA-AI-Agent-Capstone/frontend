<!-- 1. 신청인 정보 — 로그인 계정에서 가져와 표시 (FR-8: 사용자 유형 구분 없는 단일 입력 흐름) -->
<script setup>
import { ROLE_LABEL } from '@/shared/constants/roles'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import { useSessionStore } from '@/shared/stores/session'

const session = useSessionStore()
</script>

<template>
  <FormSection :title="$t('reviewNew.applicant.title')" :aside="$t('reviewNew.applicant.aside')" :columns="3">
    <BaseFormField :label="$t('reviewNew.applicant.company')" for-id="applicant-company" :hint="$t('reviewNew.applicant.companyHint')">
      <BaseInput id="applicant-company" :model-value="session.tenant?.name" disabled />
    </BaseFormField>
    <BaseFormField :label="$t('reviewNew.applicant.name')" for-id="applicant-name">
      <BaseInput id="applicant-name" :model-value="`${session.user?.name} (${ROLE_LABEL[session.user?.role]})`" disabled />
    </BaseFormField>
    <BaseFormField :label="$t('reviewNew.applicant.email')" for-id="applicant-email" :hint="$t('reviewNew.applicant.emailHint')">
      <BaseInput id="applicant-email" :model-value="session.user?.email" disabled />
    </BaseFormField>
  </FormSection>
</template>
