<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { safeRedirect } from '@/shared/utils/redirect'
import AuthShell from '@/shared/components/layout/AuthShell.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import './auth-form.css'

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
    error.value = e instanceof Error ? e.message : '로그인하지 못했습니다.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthShell
    title="로그인"
    lead="기업 작업공간 계정으로 들어가 광고 검토를 이어 갑니다."
    ad-id="elida"
    statement="올린 광고는 문구와 사진으로 나눠 읽고&#10;AI 파이프라인을 통해 판단을 내립니다"
  >
    <form class="auth-form" @submit.prevent="submit">
      <label class="auth-field">
        이메일
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label class="auth-field">
        비밀번호
        <input v-model="password" type="password" required minlength="10" maxlength="72" autocomplete="current-password" />
      </label>
      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
      <button type="submit" class="auth-submit" :disabled="busy" :aria-busy="busy || undefined">
        {{ busy ? '로그인하는 중' : '로그인' }}
      </button>
    </form>
    <p class="auth-switch">
      처음이라면
      <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP, query: route.query.redirect ? { redirect: route.query.redirect } : {} }">기업 작업공간 만들기</RouterLink>
    </p>
  </AuthShell>
</template>
