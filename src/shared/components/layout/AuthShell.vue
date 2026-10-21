<!--
  로그인과 회원가입이 함께 쓰는 화면 틀.
  왼쪽은 서비스 이름과 공개 도메인 옛 화장품 광고 한 점, 오른쪽은 각 화면의 양식이다.
-->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { ARCHIVE_ADS } from '@/pages/landing/archive'
import LanguageMenu from './header/LanguageMenu.vue'

const props = defineProps<{
  title: string
  lead: string
  adId: string
  statement: string
}>()

const ad = ARCHIVE_ADS.find((item) => item.id === props.adId) ?? ARCHIVE_ADS[0]
</script>

<template>
  <div class="auth">
    <aside class="auth__side">
      <div class="auth__top">
        <RouterLink :to="{ name: ROUTE_NAMES.LANDING }" class="auth__wordmark">Beauty Review</RouterLink>
        <LanguageMenu class="auth__lang" />
      </div>
      <div class="auth__intro">
        <figure class="auth__figure">
          <img :src="ad.src" :alt="ad.alt" :width="ad.width" :height="ad.height" class="auth__img" />
          <figcaption>
            <a :href="ad.page" target="_blank" rel="noopener noreferrer">{{ ad.caption }}</a>, {{ $t('ui.publicDomain') }}
          </figcaption>
        </figure>
        <p class="auth__statement">{{ statement }}</p>
      </div>
    </aside>

    <div class="auth__main">
      <div class="auth__panel">
        <h1 class="auth__title">{{ title }}</h1>
        <p class="auth__lead">{{ lead }}</p>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(360px, 5fr) 7fr;
  background: var(--krds-gray-0);
  color: var(--krds-gray-90);
  font-size: 17px;
}
.auth__side {
  background: var(--krds-secondary-70);
  color: var(--krds-gray-0);
  padding: 40px clamp(20px, 3vw, 40px);
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 32px;
}
/* 그림, 캡션, 문장을 한 묶음으로 패널 가운데에 둔다(오른쪽 양식과 같은 중심선) */
.auth__intro {
  align-self: center;
  justify-self: center;
  display: grid;
  justify-items: center;
  gap: 32px;
  text-align: center;
  padding-bottom: 72px;
}
.auth :is(h1, p, figcaption) {
  text-wrap: balance;
}
.auth__top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.auth__lang :deep(.lang-menu__trigger) { color: var(--krds-gray-0); }
.auth__wordmark {
  color: var(--krds-gray-0);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  justify-self: start;
}
.auth__wordmark:hover { text-decoration: underline; text-underline-offset: 4px; }
.auth__wordmark:focus-visible { outline: 2px solid var(--krds-gray-0); outline-offset: 3px; }
.auth__figure {
  margin: 0;
  display: grid;
  gap: 12px;
  justify-items: center;
}
.auth__img {
  width: min(100%, 360px);
  height: auto;
  max-height: 52svh;
  object-fit: contain;
  display: block;
}
@media (prefers-reduced-motion: no-preference) {
  .auth__img { animation: auth-arrive 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
}
@keyframes auth-arrive { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
.auth__figure figcaption { font-size: 14px; color: var(--krds-primary-10); }
.auth__figure figcaption a { color: inherit; }
.auth__statement {
  font-size: clamp(19px, 1.5vw, 22px);
  line-height: 1.45;
  letter-spacing: -0.02em;
  /* 문장 안의 줄바꿈 문자로 의미 단위에서 줄을 나눈다 */
  white-space: pre-line;
  text-wrap: pretty;
}
.auth__main {
  display: grid;
  align-items: center;
  justify-items: center;
  padding: 64px clamp(20px, 5vw, 96px);
}
.auth__panel {
  width: 100%;
  max-width: 440px;
  display: grid;
  gap: 12px;
}
.auth__title {
  font-size: clamp(24px, 2.2vw, 32px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.auth__lead { color: var(--krds-gray-70); margin-bottom: 20px; }

@media (max-width: 1024px) {
  .auth { grid-template-columns: 1fr; }
  .auth__side {
    grid-template-rows: auto;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 20px;
    gap: 16px;
  }
  .auth__intro { display: contents; text-align: left; }
  .auth__figure { grid-row: 1 / span 2; grid-column: 2; }
  .auth__img { width: 72px; max-height: none; }
  .auth__figure figcaption { display: none; }
  .auth__statement { font-size: 17px; grid-column: 1; }
  .auth__main { align-items: start; padding: 40px 20px 64px; }
  .auth__panel { margin-inline: auto; }
}
</style>
