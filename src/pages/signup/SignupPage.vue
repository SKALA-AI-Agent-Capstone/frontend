<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { safeRedirect } from '@/shared/utils/redirect'
import AuthShell from '@/shared/components/layout/AuthShell.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import '@/pages/login/auth-form.css'
import { t } from '@/shared/i18n'

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

async function submit() {
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
    ad-id="lundborg"
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
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <button type="submit" class="auth-submit" :disabled="busy" :aria-busy="busy || undefined">
        {{ busy ? $t('auth.signup.busy') : $t('auth.signup.submit') }}
      </button>
    </form>
    <p class="auth-switch">
      {{ $t('auth.signup.switchLead') }}
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN, query: route.query.redirect ? { redirect: route.query.redirect } : {} }">{{ $t('auth.signup.switch') }}</RouterLink>
    </p>
  </AuthShell>
</template>
