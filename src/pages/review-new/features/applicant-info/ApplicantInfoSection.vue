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
  <FormSection title="1. 신청인 정보" aside="* 표시는 필수 입력 항목입니다." :columns="3">
    <BaseFormField label="업체명 (상호)" for-id="applicant-company" hint="로그인 계정의 소속 기업으로 자동 입력됩니다.">
      <BaseInput id="applicant-company" :model-value="session.tenant?.name" disabled />
    </BaseFormField>
    <BaseFormField label="담당자" for-id="applicant-name">
      <BaseInput id="applicant-name" :model-value="`${session.user?.name} (${ROLE_LABEL[session.user?.role]})`" disabled />
    </BaseFormField>
    <BaseFormField label="담당자 이메일" for-id="applicant-email" hint="로그인 계정 정보, 이메일 발송은 미구현">
      <BaseInput id="applicant-email" :model-value="session.user?.email" disabled />
    </BaseFormField>
  </FormSection>
</template>
