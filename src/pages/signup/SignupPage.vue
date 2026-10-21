<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { safeRedirect } from '@/shared/utils/redirect'
import AuthShell from '@/shared/components/layout/AuthShell.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import { useLegalDocument } from '@/shared/composables/useLegalDocument'
import '@/pages/login/auth-form.css'
import { t } from '@/shared/i18n'

const { openPrivacyPolicy, openTerms } = useLegalDocument()

const session = useSessionStore()
const router = useRouter()
const route = useRoute()
// 랜딩의 작업공간 대화상자에서 입력한 기업명은 주소가 아닌 history state로 넘어온다.
const passedTenant = typeof window.history.state?.tenantName === 'string' ? window.history.state.tenantName : ''
const tenantName = ref(passedTenant)
const name = ref('')
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

// 개인정보 보호법 제15조,제22조 — 가입에 필요한 최소 동의. 마케팅 동의 항목은 없다(마케팅 발송 기능 없음).
const consentTerms = ref(false)
const consentPrivacy = ref(false)
const consentAll = computed({
  get: () => consentTerms.value && consentPrivacy.value,
  set: (checked) => { consentTerms.value = checked; consentPrivacy.value = checked },
})
const canSubmit = computed(() => consentTerms.value && consentPrivacy.value)

async function submit() {
  if (!canSubmit.value) { error.value = t('auth.signup.consent.required'); return }
  busy.value = true
  error.value = ''
  try {
    await session.signup({ email: email.value, password: password.value, name: name.value, tenantName: tenantName.value })
    await router.replace(safeRedirect(route.query.redirect))
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('auth.signup.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthShell
    :title="$t('auth.signup.title')"
    :lead="$t('auth.signup.lead')"
    :statement="$t('auth.signup.statement')"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="auth-field">
        {{ $t('auth.signup.tenant') }}
        <input v-model="tenantName" required maxlength="120" autocomplete="organization" />
      </label>
      <label class="auth-field">
        {{ $t('auth.signup.name') }}
        <input v-model="name" required maxlength="80" autocomplete="name" />
      </label>
      <label class="auth-field">
        {{ $t('auth.email') }}
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label class="auth-field">
        {{ $t('auth.password') }}
        <input
          v-model="password"
          type="password"
          required
          minlength="10"
          maxlength="72"
          autocomplete="new-password"
          aria-describedby="signup-password-hint"
        />
        <span id="signup-password-hint" class="auth-field__hint">{{ $t('auth.signup.passwordHint') }}</span>
      </label>

      <fieldset class="auth-consent">
        <label class="auth-consent__item">
          <input type="checkbox" v-model="consentAll" />
          {{ $t('auth.signup.consent.all') }}
        </label>
        <label class="auth-consent__item">
          <input type="checkbox" v-model="consentTerms" required />
          {{ $t('auth.signup.consent.terms') }}
          <button type="button" @click="openTerms">{{ $t('auth.signup.consent.view') }}</button>
        </label>
        <label class="auth-consent__item">
          <input type="checkbox" v-model="consentPrivacy" required />
          {{ $t('auth.signup.consent.privacy') }} ({{ $t('auth.signup.consent.privacyItems') }})
          <button type="button" @click="openPrivacyPolicy">{{ $t('auth.signup.consent.view') }}</button>
        </label>
      </fieldset>

      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <button type="submit" class="auth-submit" :disabled="busy || !canSubmit" :aria-busy="busy || undefined">
        {{ busy ? $t('auth.signup.busy') : $t('auth.signup.submit') }}
      </button>
    </form>
    <p class="auth-switch">
      {{ $t('auth.signup.switchLead') }}
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN, query: route.query.redirect ? { redirect: route.query.redirect } : {} }">{{ $t('auth.signup.switch') }}</RouterLink>
    </p>
  </AuthShell>
</template>
