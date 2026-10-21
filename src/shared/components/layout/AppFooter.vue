<!--
  푸터: 서비스 이름과 운영 정보 → 안내 문장 → 저작권과 비공식 서비스 안내.
  안내 문장은 한 줄에 한 문장씩 두어 넓은 화면에서도 문장 중간에서 꺾이지 않게 한다.
-->
<script setup>
import { RouterLink } from 'vue-router'
import { FOOTER, FOOTER_LINKS, SITE } from '@/shared/constants/site'
import PageContainer from './PageContainer.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <PageContainer>
      <div class="app-footer__top">
        <p class="brand">
          <strong class="brand__name">{{ SITE.orgName }}</strong>
          <span class="brand__service">{{ SITE.serviceName }}</span>
        </p>
        <dl class="contact">
          <div v-for="item in FOOTER.contacts" :key="item.term" class="contact__item">
            <dt>{{ item.term }}</dt>
            <dd>{{ item.desc }}</dd>
          </div>
        </dl>
      </div>

      <ul class="notices">
        <li v-for="text in FOOTER.notices" :key="text">{{ text }}</li>
      </ul>

      <nav class="legal-links" aria-label="법적 고지">
        <RouterLink v-for="link in FOOTER_LINKS" :key="link.label" :to="link.to">{{ link.label }}</RouterLink>
      </nav>

      <div class="app-footer__bottom">
        <p>&copy; {{ year }} {{ FOOTER.copyright }}</p>
        <p>{{ FOOTER.identifier }}</p>
      </div>
    </PageContainer>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--space-body-footer);
  padding: 40px 0 32px;
  background: var(--color-bg-muted);
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}

.app-footer__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 40px;
}
.brand {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.brand__name {
  font-size: var(--font-size-body-m);
  color: var(--color-text);
  white-space: nowrap;
}
.brand__service { white-space: nowrap; }
.contact { margin: 0; }
.contact__item { display: flex; gap: 10px; }
.contact__item dt { color: var(--color-text); font-weight: var(--font-weight-bold); white-space: nowrap; }
.contact__item dd { margin: 0; }

.notices {
  display: grid;
  gap: 4px;
  margin: 24px 0;
  padding: 20px 0;
  border-block: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-s);
  line-height: 1.6;
}

.legal-links {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: var(--font-size-detail-s);
}
.legal-links a {
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.app-footer__bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 24px;
  font-size: var(--font-size-detail-s);
}

@media (max-width: 760px) {
  .app-footer { padding: 32px 0 28px; }
  .app-footer__top,
  .app-footer__bottom { flex-direction: column; }
}
</style>
