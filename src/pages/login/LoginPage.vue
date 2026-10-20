<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/shared/stores/session'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
const session = useSessionStore(), router = useRouter(), route = useRoute()
const mode = ref('login'), email = ref(''), password = ref(''), name = ref(''), tenantName = ref(''), busy = ref(false), error = ref('')
async function submit() {
 busy.value = true; error.value = ''
 try {
  if (mode.value === 'signup') await session.signup({ email: email.value, password: password.value, name: name.value, tenantName: tenantName.value })
  else await session.login(email.value, password.value)
  const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//') ? route.query.redirect : '/'
  await router.replace(redirect)
 } catch (e) { error.value = e.message } finally { busy.value = false }
}
</script>
<template>
 <main class="login-page"><BaseCard padding="xl" class="login-card">
  <p>BEAUTY REVIEW / LOCAL MVP</p><h1>화장품 광고 사전검토</h1>
  <p>기업별 작업공간에서 PDF와 이미지를 등록하고 문구와 사진을 각각 검토합니다.</p>
  <BaseAlert variant="info" title="로컬 서버 연결">법령 조문 후보는 적재된 자료에서 검색하며, 검토 사용량 과금은 아직 연결되지 않았습니다. AI 결과는 내부 검토 초안입니다.</BaseAlert>
  <form @submit.prevent="submit" class="login-form">
   <template v-if="mode === 'signup'">
    <label>기업명<input v-model="tenantName" required maxlength="120" autocomplete="organization"></label>
    <label>이름<input v-model="name" required maxlength="80" autocomplete="name"></label>
   </template>
   <label>이메일<input v-model="email" type="email" required autocomplete="username"></label>
   <label>비밀번호<input v-model="password" type="password" required minlength="10" maxlength="72" :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"></label>
   <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
   <BaseButton type="submit" :busy="busy">{{ mode === 'signup' ? '새 기업 작업공간 만들기' : '로그인' }}</BaseButton>
  </form>
  <button type="button" @click="mode = mode === 'login' ? 'signup' : 'login'; error = ''">{{ mode === 'login' ? '처음이라면 기업 작업공간 만들기' : '기존 계정으로 로그인' }}</button>
  <small>기업 작업공간을 만든 계정에는 관리자 역할이 부여됩니다. 다른 기업의 자료에는 접근할 수 없습니다.</small>
 </BaseCard></main>
</template>
<style scoped>
.login-page{min-height:100vh;display:grid;place-items:center;background:var(--color-bg-page);padding:32px}.login-card{max-width:560px;width:100%;display:grid;gap:20px}.login-form{display:grid;gap:16px}label{display:grid;gap:6px}input{border:1px solid var(--color-border);border-radius:8px;padding:12px;font:inherit}small{color:var(--color-text-secondary)}
</style>
