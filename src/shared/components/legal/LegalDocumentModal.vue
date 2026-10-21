<!-- 어디서든(가입/로그인/푸터) 같은 모달로 개인정보처리방침·이용약관을 띄운다. App.vue에 한 번만 마운트. -->
<script setup>
import { computed } from 'vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import { useLegalDocument } from '@/shared/composables/useLegalDocument'
import PrivacyPolicyContent from './PrivacyPolicyContent.vue'
import TermsContent from './TermsContent.vue'

const { open, close } = useLegalDocument()
const isOpen = computed({ get: () => open.value !== null, set: (value) => { if (!value) close() } })
const title = computed(() => (open.value === 'terms' ? '이용약관' : '개인정보 처리방침'))
</script>

<template>
  <BaseModal v-model:open="isOpen" labelledby="legal-document-title" width="lg">
    <template #header>
      <div class="legal-modal__head">
        <h2 id="legal-document-title">{{ title }}</h2>
        <button type="button" class="legal-modal__close" :aria-label="$t('ui.close')" @click="close">
          <BaseIcon name="close" />
        </button>
      </div>
    </template>
    <TermsContent v-if="open === 'terms'" />
    <PrivacyPolicyContent v-else-if="open === 'privacy'" />
    <template #footer>
      <BaseButton variant="outline" @click="close">{{ $t('ui.close') }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.legal-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}
.legal-modal__head h2 {
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.legal-modal__close {
  display: grid;
  place-items: center;
  width: var(--space-xl);
  height: var(--space-xl);
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.legal-modal__close:hover {
  background: var(--color-bg-muted);
}
</style>
