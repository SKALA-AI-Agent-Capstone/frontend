<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { safeRedirect } from '@/shared/utils/redirect'
import AuthShell from '@/shared/components/layout/AuthShell.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import { useLegalDocument } from '@/shared/composables/useLegalDocument'
import './auth-form.css'
import { t } from '@/shared/i18n'

const { openPrivacyPolicy, openTerms } = useLegalDocument()
const session = useSessionStore()
const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await session.login(email.value, password.value)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('auth.login.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthShell
    :title="$t('auth.login.title')"
    :lead="$t('auth.login.lead')"
    :statement="$t('auth.login.statement')"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="auth-field">
        {{ $t('auth.email') }}
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label class="auth-field">
        {{ $t('auth.password') }}
        <input v-model="password" type="password" required minlength="10" maxlength="72" autocomplete="current-password" />
      </label>
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <button type="submit" class="auth-submit" :disabled="busy" :aria-busy="busy || undefined">
        {{ busy ? $t('auth.login.busy') : $t('auth.login.submit') }}
      </button>
    </form>
    <p class="auth-privacy-notice">
      <i18n-t keypath="auth.login.privacyNotice" scope="global">
        <template #terms><button type="button" @click="openTerms">{{ $t('ui.titles.terms') }}</button></template>
        <template #privacy><button type="button" @click="openPrivacyPolicy">{{ $t('ui.titles.privacyPolicy') }}</button></template>
      </i18n-t>
    </p>
    <p class="auth-switch">
      {{ $t('auth.login.switchLead') }}
      <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP, query: route.query.redirect ? { redirect: route.query.redirect } : {} }">{{ $t('auth.login.switch') }}</RouterLink>
    </p>
  </AuthShell>
</template>
