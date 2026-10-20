<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { safeRedirect } from '@/shared/utils/redirect'
import AuthShell from '@/shared/components/layout/AuthShell.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import '@/pages/login/auth-form.css'

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
    error.value = e instanceof Error ? e.message : '작업공간을 만들지 못했습니다.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthShell
    title="기업 작업공간 만들기"
    lead="회사 이름으로 작업공간을 만들고 첫 광고 검토를 신청합니다."
    ad-id="lundborg"
    statement="작업공간마다 광고와&#10;검토 이력이 따로 보관됩니다."
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="auth-field">
        기업명
        <input v-model="tenantName" required maxlength="120" autocomplete="organization" />
      </label>
      <label class="auth-field">
        이름
        <input v-model="name" required maxlength="80" autocomplete="name" />
      </label>
      <label class="auth-field">
        이메일
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label class="auth-field">
        비밀번호
        <input
          v-model="password"
          type="password"
          required
          minlength="10"
          maxlength="72"
          autocomplete="new-password"
          aria-describedby="signup-password-hint"
        />
        <span id="signup-password-hint" class="auth-field__hint">10자 이상 72자 이하</span>
      </label>
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <button type="submit" class="auth-submit" :disabled="busy" :aria-busy="busy || undefined">
        {{ busy ? '작업공간을 만드는 중' : '작업공간 만들기' }}
      </button>
    </form>
    <p class="auth-switch">
      이미 계정이 있다면
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN, query: route.query.redirect ? { redirect: route.query.redirect } : {} }">로그인</RouterLink>
    </p>
  </AuthShell>
</template>
