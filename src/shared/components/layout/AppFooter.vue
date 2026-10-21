<!--
  푸터 (KRDS 아이덴티티 / 푸터)
  순서: 서비스 로고 ,  연락처 ,  유틸리티 링크(한 그룹) → 정책 링크 → 저작권 → 운영기관 식별자
  작은 화면에서도 같은 순서로 세로 배치한다.
-->
<script setup>
import { FOOTER, SITE } from '@/shared/constants/site'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import PageContainer from './PageContainer.vue'
import OperatorIdentifier from './footer/OperatorIdentifier.vue'
</script>

<template>
  <footer class="app-footer">
    <PageContainer>
      <div class="app-footer__info">
        <div class="org">
          <span class="org__emblem" aria-hidden="true">{{ SITE.orgName.charAt(0) }}</span>
          <span class="org__names">
            <strong class="org__name">{{ SITE.orgName }} {{ SITE.serviceName }}</strong>
            <span class="org__name-en">{{ SITE.orgNameEn }}</span>
          </span>
        </div>

        <dl class="contact">
          <div v-for="item in FOOTER.contacts" :key="item.term" class="contact__item">
            <dt>{{ item.term }}</dt>
            <dd>
              <a v-if="item.href" :href="item.href" class="contact__link">{{ item.desc }}</a>
              <template v-else>{{ item.desc }}</template>
              <span v-if="item.note"> {{ item.note }}</span>
            </dd>
          </div>
        </dl>

        <ul class="utility">
          <li v-for="link in FOOTER.utilityLinks" :key="link.label">
            <a
              :href="link.href"
              class="utility__link"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
            >
              {{ link.label }}
              <template v-if="link.external">
                <BaseIcon name="open_in_new" size="xs" />
                <span class="sr-only">{{ $t('ui.newWindow') }}</span>
              </template>
            </a>
          </li>
        </ul>
      </div>

      <nav :aria-label="$t('ui.footer.policyLinks')">
        <ul class="policy">
          <li v-for="link in FOOTER.policyLinks" :key="link.label">
            <a :href="link.href" class="policy__link" :class="{ 'policy__link--emphasis': link.emphasis }">
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>

      <p class="app-footer__retention">{{ FOOTER.retentionNotice }} {{ SITE.demoNotice }}</p>
      <div class="app-footer__copyright">
        <p>{{ FOOTER.copyright }}</p>
        <span class="kogl">{{ FOOTER.kogl }}</span>
      </div>

      <OperatorIdentifier />
    </PageContainer>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: var(--space-body-footer);
  padding-top: var(--space-xl);
  background: var(--color-bg-muted);
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}

/* 서비스 로고 ,  연락처 ,  유틸리티 링크 — 하나의 그룹 */
.app-footer__info {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 6fr) minmax(0, 3fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-lg);
}
.org {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}
.org__emblem {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-2xl);
  height: var(--space-2xl);
  border-radius: var(--radius-sm-2);
  background: var(--color-secondary);
  color: var(--color-on-secondary);
  font-weight: var(--font-weight-bold);
}
.org__names {
  display: flex;
  flex-direction: column;
}
.org__name {
  font-size: var(--font-size-title-s);
  color: var(--color-text);
}
.org__name-en {
  font-size: var(--font-size-detail-s);
}
.contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  margin: 0;
}
.contact__item {
  display: flex;
  gap: var(--space-sm);
}
.contact__item dt {
  flex-shrink: 0;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}
.contact__item dd {
  margin: 0;
}
.contact__link,
.utility__link {
  text-decoration: underline;
  color: var(--color-text);
}
.utility {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}
.utility__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
}

.policy {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs) var(--space-lg);
  padding: var(--space-md) 0;
  border-top: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-label-s);
}
.policy__link:hover {
  color: var(--color-text);
  text-decoration: underline;
}
/* 개인정보처리방침 강조 */
.policy__link--emphasis {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.app-footer__retention {
  padding-bottom: var(--space-xs);
  font-size: var(--font-size-detail-s);
}
.app-footer__copyright {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding-bottom: var(--space-md);
  font-size: var(--font-size-detail-s);
}
.kogl {
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border-strong);
  background: var(--color-bg-surface);
  color: var(--color-text);
}

@media (max-width: 1024px) {
  .app-footer__info {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .contact__item {
    flex-direction: column;
    gap: 0;
  }
}
</style>
