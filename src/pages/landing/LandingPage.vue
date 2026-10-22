<!--
  서비스 소개 랜딩. 비로그인 방문자가 첫 화면(/)으로 들어오면 이 화면을 본다.
  화면의 카드와 조각은 흐름 설명용 예시이며 실제 검토 결과, 법령 판정, 이용 수치를 보여 주지 않는다.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { FOOTER, SITE, brandAsset } from '@/shared/constants/site'
import {
  APPROVAL_ACTIONS,
  APPROVAL_LABEL,
  APPROVAL_STATE,
  REVIEW_STATUS,
  REVIEW_STATUS_LABEL,
  VIOLATION_RESOLUTION_LABEL,
} from '@/shared/constants/review'
import { ARCHIVE_ADS } from './archive'
import { useReveal } from './useReveal'
import { t } from '@/shared/i18n'
import LanguageMenu from '@/shared/components/layout/header/LanguageMenu.vue'

const router = useRouter()
const root = ref<HTMLElement | null>(null)
const { ready } = useReveal(root)
const anatomy = ['lesquendieu', 'elida', 'lundborg', 'klarybella']
  .map((id) => ({ id, note: `landing.anatomy.notes.${id}` })).map((item) => ({ ...item, ad: ARCHIVE_ADS.find((ad) => ad.id === item.id)! }))
const year = new Date().getFullYear()

// 단계 배지는 앱의 실제 상태 표기(REVIEW_STATUS_LABEL, APPROVAL_LABEL)를 그대로 쓴다.
// 표의 값은 번역 키(문자열)이거나, 이미 번역된 label을 가진 상태 상수다
const cell = (value: string | { label: string }) => (typeof value === 'string' ? t(value) : value.label)

type FlowRow = [string, string | { label: string }]
const flow: { key: string; status: { label: string; variant: string }; rows: FlowRow[] }[] = [
  {
    key: 'upload',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.QUEUED],
    rows: [['landing.flow.upload.rows.format', 'landing.flow.upload.rows.formatValue'], ['landing.flow.upload.rows.submit', 'common.roles.writer']],
  },
  {
    key: 'analyze',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.ANALYZING],
    rows: [['landing.flow.analyze.rows.copy', 'landing.flow.analyze.rows.copyValue'], ['landing.flow.analyze.rows.photo', 'landing.flow.analyze.rows.photoValue']],
  },
  {
    key: 'resolve',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.DONE],
    rows: Object.values(VIOLATION_RESOLUTION_LABEL).map((item, i) => [i === 0 ? 'landing.flow.resolve.rows.choose' : '', item]),
  },
  {
    key: 'approve',
    status: APPROVAL_LABEL[APPROVAL_STATE.PENDING],
    rows: APPROVAL_ACTIONS.map((action, i) => [i === 0 ? 'landing.flow.approve.rows.decide' : '', action]),
  },
]

// 질문과 답은 locales/*/landing.json의 faq 목록에 있다
const FAQ_KEYS = ['publish', 'files', 'originals', 'legal', 'privacy', 'cost']
const faqs = computed(() => FAQ_KEYS.map((key) => ({ q: t(`landing.faq.items.${key}.q`), a: t(`landing.faq.items.${key}.a`) })))
const activeFaq = ref(0)
const faqButtons: HTMLButtonElement[] = []

// 질문 목록에서 위아래 화살표로 다음 질문으로 옮겨 간다.
function onFaqKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const step = event.key === 'ArrowDown' ? 1 : -1
  activeFaq.value = (activeFaq.value + step + FAQ_KEYS.length) % FAQ_KEYS.length
  faqButtons[activeFaq.value]?.focus()
}

const startMode = ref<'new' | 'existing'>('new')
const tenantName = ref(t('landing.cta.sampleTenant'))
const startLabel = computed(() => t(startMode.value === 'new' ? 'landing.cta.startNew' : 'landing.cta.goLogin'))

function start() {
  if (startMode.value === 'existing') {
    router.push({ name: ROUTE_NAMES.LOGIN })
    return
  }
  // 기업명은 주소에 남기지 않고 history state로 넘긴다.
  router.push({ name: ROUTE_NAMES.SIGNUP, state: { tenantName: tenantName.value.trim() } })
}
</script>

<template>
  <div ref="root" class="landing" :class="{ 'reveal-ready': ready }">
    <!-- 첫 화면: 왼쪽은 제목과 행동, 오른쪽은 실제로 동작하는 파일 읽기 조각 -->
    <section class="hero" aria-labelledby="landing-title">
      <div class="hero__copy">
        <RouterLink :to="{ name: ROUTE_NAMES.LANDING }" class="wordmark">
          <img :src="brandAsset('vero-head-outline.webp')" alt="" width="36" height="36" class="wordmark__logo" />
          {{ SITE.orgName }}
        </RouterLink>
        <div class="hero__text">
          <h1 id="landing-title" class="hero__title lines">
            <span class="line"><span data-line style="--i: 0">{{ $t('landing.hero.title1') }}</span></span>
            <span class="line"><span data-line style="--i: 1">{{ $t('landing.hero.title2') }}</span></span>
          </h1>
          <p class="hero__lead fade-up">
            {{ $t('landing.hero.lead1') }}<br class="br-wide" /> {{ $t('landing.hero.lead2') }}
          </p>
          <div class="hero__actions fade-up">
            <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP }" class="btn btn--accent">{{ $t('landing.hero.cta') }}</RouterLink>
          </div>
        </div>
      </div>
      <div class="hero__stage">
        <div class="hero__top"><LanguageMenu class="hero__lang" /><RouterLink :to="{ name: ROUTE_NAMES.LOGIN }" class="hero__login">{{ $t('landing.login') }}</RouterLink></div>
        <!-- 로그인 화면 왼쪽과 같은 마스코트. 남색 위에서 묻히지 않게 흰 테두리 그림을 쓴다 -->
        <img :src="brandAsset('vero-body-outline.webp')" alt="" width="560" height="623" class="hero__mascot fade-up" />
      </div>
    </section>

    <!-- 광고 한 장의 구성: 공개 도메인 옛 광고로 문구와 그림이 섞이는 모습을 보여 준다 -->
    <section class="anatomy page-frame" aria-labelledby="anatomy-title">
      <div class="anatomy__head" data-reveal>
        <h2 id="anatomy-title" class="section-title">{{ $t('landing.anatomy.title') }}</h2>
      </div>
      <ul class="anatomy__row">
        <li v-for="item in anatomy" :key="item.id" class="anatomy__item" data-reveal>
          <figure>
            <div class="anatomy__frame">
              <img :src="item.ad.src" :alt="item.ad.alt" :width="item.ad.width" :height="item.ad.height" loading="lazy" />
            </div>
            <figcaption>
              <span class="anatomy__caption">{{ item.ad.caption }}</span>
              <span class="anatomy__note">{{ $t(item.note) }}</span>
            </figcaption>
          </figure>
        </li>
      </ul>
    </section>

    <!-- 흐름: 한 건이 신청부터 승인까지 거치는 상태. 배지는 앱의 실제 상태 표기다 -->
    <section class="flow" aria-labelledby="flow-title">
      <div class="flow__inner page-frame">
        <h2 id="flow-title" class="section-title" data-reveal>{{ $t('landing.flow.title') }}</h2>
        <ol class="flow__track">
          <li v-for="(step, i) in flow" :key="step.key" class="flow__step" data-reveal :style="{ '--i': i }">
            <p class="flow__badge" :class="`flow__badge--${step.status.variant}`">{{ step.status.label }}</p>
            <h3 class="flow__title">{{ $t(`landing.flow.${step.key}.title`) }}</h3>
            <p class="flow__text">{{ $t(`landing.flow.${step.key}.text`) }}</p>
            <dl data-ui class="flow__detail">
              <div v-for="(row, r) in step.rows" :key="r" :class="{ 'is-cont': !row[0] }"><dt>{{ row[0] ? $t(row[0]) : '' }}</dt><dd>{{ cell(row[1]) }}</dd></div>
            </dl>
          </li>
        </ol>
      </div>
    </section>

    <!-- 작업공간 기능: 문장과 실제 화면 조각이 엇갈려 놓인다 -->
    <section class="features page-frame" aria-labelledby="features-title">
      <h2 id="features-title" class="section-title" data-reveal>{{ $t('landing.features.title') }}</h2>
      <div class="features__grid">
        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>{{ $t('landing.features.roles.title') }}</h3>
            <p>{{ $t('landing.features.roles.text') }}</p>
          </div>
          <div data-ui class="frag frag--members frag--dock-bottom">
            <p class="frag__label">{{ $t('landing.features.roles.members') }}</p>
            <ul>
              <li><span>{{ $t('landing.sample.people.a') }}</span><span class="chip">{{ $t('common.roles.writer') }}</span></li>
              <li class="is-hover"><span>{{ $t('landing.sample.people.b') }}</span><span class="chip chip--blue">{{ $t('common.roles.reviewer') }}</span></li>
              <li><span>{{ $t('landing.sample.people.c') }}</span><span class="chip chip--navy">{{ $t('common.roles.admin') }}</span></li>
            </ul>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--search frag--dock-top">
            <p class="frag__label">{{ $t('landing.features.basis.scope') }}</p>
            <p class="frag__value">{{ $t('landing.features.basis.scopeValue') }}</p>
            <p class="frag__note">{{ $t('landing.features.basis.note') }}</p>
            <span class="chip chip--amber">{{ $t('landing.features.basis.chip') }}</span>
          </div>
          <div class="cell__text">
            <h3>{{ $t('landing.features.basis.title') }}</h3>
            <p>{{ $t('landing.features.basis.text') }}</p>
          </div>
        </article>

        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>{{ $t('landing.features.originals.title') }}</h3>
            <p>{{ $t('landing.features.originals.text') }}</p>
          </div>
          <div data-ui class="frag frag--table frag--dock-bottom">
            <table>
              <tbody>
                <tr><th scope="row">{{ $t('landing.features.originals.rows.ad') }}</th><td>{{ $t('landing.features.originals.rows.kept') }}</td></tr>
                <tr><th scope="row">{{ $t('landing.features.originals.rows.result') }}</th><td>{{ $t('landing.features.originals.rows.kept') }}</td></tr>
                <tr><th scope="row">{{ $t('landing.features.originals.rows.approvals') }}</th><td>{{ $t('landing.features.originals.rows.kept') }}</td></tr>
                <tr><th scope="row">{{ $t('landing.features.originals.rows.view') }}</th><td>{{ $t('landing.features.originals.rows.viewValue') }}</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--versions frag--dock-top">
            <p class="frag__label">{{ $t('landing.features.versions.label') }}</p>
            <ol>
              <li class="is-current"><span>v2</span><span>{{ $t('landing.features.versions.v2') }}</span><span class="chip chip--amber">{{ APPROVAL_LABEL[APPROVAL_STATE.PENDING].label }}</span></li>
              <li><span>v1</span><span>{{ $t('landing.features.versions.v1') }}</span><span class="chip chip--blue">{{ APPROVAL_LABEL[APPROVAL_STATE.CHANGES_REQUESTED].label }}</span></li>
            </ol>
          </div>
          <div class="cell__text">
            <h3>{{ $t('landing.features.versions.title') }}</h3>
            <p>{{ $t('landing.features.versions.text') }}</p>
          </div>
        </article>

        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>{{ $t('landing.features.report.title') }}</h3>
            <p>{{ $t('landing.features.report.text') }}</p>
          </div>
          <div data-ui class="frag frag--report frag--dock-bottom">
            <p class="frag__value">{{ $t('landing.features.report.name') }}</p>
            <p class="frag__note">{{ $t('landing.features.report.note') }}</p>
            <span class="frag__button">{{ $t('landing.features.report.button') }}</span>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--tenant frag--dock-top">
            <p class="frag__label">{{ $t('landing.features.tenant.label') }}</p>
            <p class="frag__value">{{ $t('landing.cta.sampleTenant') }}</p>
            <p class="frag__note">{{ $t('landing.features.tenant.note') }}</p>
          </div>
          <div class="cell__text">
            <h3>{{ $t('landing.features.tenant.title') }}</h3>
            <p>{{ $t('landing.features.tenant.text') }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 자주 묻는 질문: 왼쪽은 질문 목록, 오른쪽은 고른 질문의 답 -->
    <section class="faq" aria-labelledby="faq-title">
      <div class="faq__inner page-frame">
        <div class="faq__intro" data-reveal>
          <h2 id="faq-title" class="section-title">{{ $t('landing.faq.title') }}</h2>
          <p class="faq__lead">{{ $t('landing.faq.lead') }}</p>
        </div>
        <ul class="faq__list" data-reveal @keydown="onFaqKey">
          <li v-for="(item, i) in faqs" :key="item.q" class="faq__item" :class="{ 'is-active': activeFaq === i }">
            <button
              :ref="(el) => (faqButtons[i] = el as HTMLButtonElement)"
              type="button"
              class="faq__q"
              :aria-expanded="activeFaq === i"
              :aria-controls="`faq-answer-${i}`"
              @click="activeFaq = i"
            >
              <span>{{ item.q }}</span>
              <span class="faq__mark" aria-hidden="true"></span>
            </button>
            <div :id="`faq-answer-${i}`" class="faq__inline" :hidden="activeFaq !== i">
              <p>{{ item.a }}</p>
            </div>
          </li>
        </ul>
        <div class="faq__pane" aria-live="polite" data-reveal>
          <Transition name="faq-swap" mode="out-in">
            <div :key="activeFaq" class="faq__card">
              <h3 class="faq__card-q">{{ faqs[activeFaq].q }}</h3>
              <p class="faq__card-a">{{ faqs[activeFaq].a }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- 마지막 화면: 작업공간 만들기 대화상자가 이미 열려 있다 -->
    <section class="cta" aria-labelledby="cta-title">
      <div class="cta__copy page-frame">
        <div class="cta__text" data-reveal>
          <h2 id="cta-title" class="cta__title">{{ $t('landing.cta.title1') }}<br />{{ $t('landing.cta.title2') }}</h2>
          <p class="cta__lead">{{ $t('landing.cta.lead1') }}<br class="br-wide" /> {{ $t('landing.cta.lead2') }}</p>
        </div>
        <form data-ui class="dialog" data-reveal aria-labelledby="dialog-title" @submit.prevent="start">
          <p id="dialog-title" class="dialog__title">{{ $t('landing.hero.cta') }}</p>
          <div class="dialog__seg" role="radiogroup" :aria-label="$t('landing.cta.mode')">
            <button type="button" role="radio" :aria-checked="startMode === 'new'" :class="{ 'is-on': startMode === 'new' }" @click="startMode = 'new'">{{ $t('landing.cta.modeNew') }}</button>
            <button type="button" role="radio" :aria-checked="startMode === 'existing'" :class="{ 'is-on': startMode === 'existing' }" @click="startMode = 'existing'">{{ $t('landing.cta.modeExisting') }}</button>
          </div>
          <div class="dialog__slot">
          <label class="dialog__field" :class="{ 'is-off': startMode !== 'new' }" :aria-hidden="startMode !== 'new'">
            {{ $t('landing.cta.tenantLabel') }}
            <input v-model="tenantName" maxlength="120" autocomplete="organization" :required="startMode === 'new'" />
          </label>
          <p class="dialog__note" :class="{ 'is-off': startMode === 'new' }" :aria-hidden="startMode === 'new'">{{ $t('landing.cta.existingNote') }}</p>
          </div>
          <button type="submit" class="dialog__submit">{{ startLabel }}</button>
        </form>
      </div>
    </section>

    <footer class="foot page-frame">
      <p class="foot__what">{{ SITE.serviceName }}</p>
      <nav class="foot__links" :aria-label="$t('landing.foot.label')">
        <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }">{{ $t('landing.login') }}</RouterLink>
        <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP }">{{ $t('landing.foot.signup') }}</RouterLink>
        <details class="foot__credits">
          <summary>{{ $t('landing.foot.credits') }}</summary>
          <ul>
            <li v-for="ad in ARCHIVE_ADS" :key="ad.id">
              <a :href="ad.page" target="_blank" rel="noopener noreferrer">{{ ad.caption }}</a>, {{ $t('landing.foot.creditLine') }}
            </li>
          </ul>
        </details>
      </nav>
      <p class="foot__meta">{{ year }} {{ FOOTER.copyright }}. {{ $t('landing.foot.notOfficial') }}</p>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  --ground: var(--krds-gray-0);
  --ink: var(--krds-gray-90);
  --muted: var(--krds-gray-70);
  --navy-deep: var(--krds-secondary-70);
  --navy: var(--krds-secondary-50);
  --on-navy-soft: var(--krds-primary-10);
  --frame: clamp(16px, 3vw, 40px);
  --section-gap: clamp(120px, 14vw, 200px);
  --size-display: clamp(56px, 7vw, 112px);
  --size-heading: clamp(28px, 2.6vw, 40px);
  --size-statement: clamp(22px, 1.8vw, 28px);
  --size-body: 17px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--ground);
  color: var(--ink);
  font-size: var(--size-body);
  overflow-x: clip;
}
.page-frame {
  padding-inline: var(--frame);
}
.nb { white-space: nowrap; }
/* 의미 단위 줄바꿈: 넓은 화면에서만 지정한 위치에서 나누고, 좁은 화면은 자연스럽게 흐른다 */
@media (max-width: 1024px) {
  .br-wide { display: none; }
}
/* 두세 줄짜리 문장이 한 단어만 다음 줄로 넘어가지 않도록 줄 길이를 고르게 나눈다 */
.landing :is(h1, h2, h3, p, figcaption span) {
  text-wrap: balance;
}
.section-title {
  font-size: var(--size-heading);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

/* ───────── 첫 화면 ───────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100svh;
  color: var(--krds-gray-0);
}
.hero__copy {
  background: var(--navy-deep);
  padding: 40px var(--frame);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
}
.wordmark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--krds-gray-0);
  font-weight: 800;
  font-size: 2.2rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  align-self: flex-start;
}
.wordmark__logo { width: 36px; height: 36px; flex: none; }
.hero__text {
  display: grid;
  gap: 32px;
}
.hero__title {
  font-size: clamp(40px, 4.6vw, 72px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
/* 영어 제목은 한국어보다 길어서 같은 크기면 줄마다 두 번 꺾인다 */
:lang(en) .hero__title { font-size: clamp(36px, 3.7vw, 60px); }
.hero__title .line { text-wrap: balance; }
.hero__lead {
  color: var(--on-navy-soft);
  max-width: 38em;
  font-size: var(--size-body);
}
.hero__stage {
  position: relative;
  background: var(--navy);
  display: grid;
  place-items: center;
  padding: 96px var(--frame) 64px;
}
.hero__mascot {
  width: min(100%, 440px);
  height: auto;
  max-height: 68svh;
  object-fit: contain;
  display: block;
}
.hero__top {
  position: absolute;
  top: 32px;
  right: var(--frame);
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--krds-gray-0);
}
.hero__top :deep(.lang-menu__trigger) {
  color: var(--krds-gray-0);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  line-height: 1.4;
  padding: 8px 4px;
}
.hero__login {
  color: var(--krds-gray-0);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  line-height: 1.4;
  text-decoration: none;
  padding: 8px 4px;
}
.hero__login:hover { text-decoration: underline; text-underline-offset: 4px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  padding: 0 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-bold);
  font-size: var(--size-body);
  text-decoration: none;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}
.btn--accent { background: var(--color-primary); color: var(--color-on-primary); }
.btn--accent:hover { background: var(--color-primary-hover); }
.btn:active { transform: translateY(1px); }
.btn:focus-visible,
.hero__login:focus-visible,
.wordmark:focus-visible { outline: 2px solid var(--krds-gray-0); outline-offset: 3px; }

/* ───────── 광고 한 장의 구성 ───────── */
.anatomy {
  padding-block: var(--section-gap) clamp(80px, 8vw, 128px);
  display: grid;
  gap: 56px;
}
.anatomy__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: start;
}
.anatomy__item:nth-child(even) { margin-top: 64px; }
.anatomy__item figure { margin: 0; display: grid; gap: 16px; }
.anatomy__frame {
  aspect-ratio: 3 / 4;
  background: var(--krds-secondary-5);
  overflow: clip;
}
.anatomy__frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 600ms var(--ease-out);
}
.anatomy__item:hover .anatomy__frame img { transform: scale(1.04); }
.anatomy__item figcaption { display: grid; gap: 4px; }
.anatomy__caption { font-size: 15px; color: var(--muted); }
.anatomy__note { font-size: var(--size-body); }

/* ───────── 파이프라인 ───────── */
.flow {
  background: var(--navy-deep);
  color: var(--krds-gray-0);
  padding-block: clamp(96px, 10vw, 160px);
}
.flow__inner { display: grid; gap: 48px; }
.flow__track {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.flow__step {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px 28px 28px;
  border-radius: var(--radius-xl);
  background: var(--navy);
}
.flow__step:hover { background: var(--krds-secondary-40); }
.flow__badge {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
}
.flow__badge--neutral { background: var(--krds-gray-10); color: var(--krds-gray-70); }
.flow__badge--info { background: var(--color-info-surface); color: var(--color-info-text); }
.flow__badge--success { background: var(--color-success-surface); color: var(--color-success-text); }
.flow__badge--warning { background: var(--color-warning-surface); color: var(--color-warning-text); }
.flow__title {
  font-size: var(--size-statement);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin-top: 12px;
}
.flow__text { color: var(--on-navy-soft); flex: 1; }
[data-ui].flow__detail {
  margin: 12px 0 0;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--krds-gray-0);
  color: var(--krds-gray-90);
  font-size: 14px;
  display: grid;
  gap: 6px;
}
/* 이름 칸은 가장 긴 이름에 맞춘다. 영어 이름이 길어도 값과 겹치지 않는다 */
[data-ui].flow__detail { grid-template-columns: max-content minmax(0, 1fr); column-gap: 14px; }
[data-ui].flow__detail div { display: contents; }
[data-ui].flow__detail dt { color: var(--krds-gray-70); }
[data-ui].flow__detail dd { margin: 0; }

/* ───────── 기능 ───────── */
.features {
  padding-top: clamp(96px, 10vw, 160px);
}
.features .section-title { margin-bottom: 56px; }
.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.cell {
  background: var(--krds-secondary-5);
  border-radius: var(--radius-lg);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: clip;
}
.cell:hover { background: var(--krds-primary-10); }
.cell__text { padding: 28px; display: grid; gap: 10px; }
.cell__text h3 { font-size: var(--size-statement); font-weight: var(--font-weight-bold); letter-spacing: -0.02em; line-height: 1.25; }
.cell__text p { font-size: var(--size-body); max-width: 30em; }
.features__grid .cell:nth-child(n + 4).cell--text-top { flex-direction: column-reverse; }
.features__grid .cell:nth-child(n + 4).cell--frag-top { flex-direction: column-reverse; }

[data-ui].frag {
  background: var(--krds-gray-0);
  color: var(--krds-gray-90);
  font-size: 14px;
  padding: 16px;
  display: grid;
  gap: 8px;
  width: calc(100% - 28px);
}
[data-ui].frag--dock-bottom { margin-left: 28px; border-radius: 10px 0 0 0; }
[data-ui].frag--dock-top { margin-left: 28px; border-radius: 0 0 0 10px; }
.features__grid .cell:nth-child(n + 4) [data-ui].frag--dock-bottom { border-radius: 0 0 0 10px; }
.features__grid .cell:nth-child(n + 4) [data-ui].frag--dock-top { border-radius: 10px 0 0 0; }
[data-ui] .frag__label { color: var(--krds-gray-70); font-size: 13px; }
[data-ui] .frag__value { font-size: 15px; font-weight: 700; }
[data-ui] .frag__note { color: var(--krds-gray-70); }
[data-ui] .chip {
  justify-self: start;
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  background: var(--krds-gray-10);
  color: var(--krds-gray-70);
}
[data-ui] .chip--blue { background: var(--color-info-surface); color: var(--color-info-text); }
[data-ui] .chip--navy { background: var(--krds-secondary-5); color: var(--krds-secondary-50); }
[data-ui] .chip--amber { background: var(--color-warning-surface); color: var(--color-warning-text); }
[data-ui].frag--members ul,
[data-ui].frag--versions ol { display: grid; gap: 2px; }
[data-ui].frag--members li,
[data-ui].frag--versions li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
}
[data-ui].frag--members li.is-hover,
[data-ui].frag--versions li.is-current { background: var(--krds-gray-5); }
[data-ui].frag--versions li span:nth-child(2) { flex: 1; }
[data-ui].frag--table table { width: 100%; border-collapse: collapse; }
[data-ui].frag--table th,
[data-ui].frag--table td { text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--krds-gray-10); font-weight: 400; }
[data-ui].frag--table th { color: var(--krds-gray-70); width: 40%; }
[data-ui] .frag__button {
  justify-self: start;
  margin-top: 4px;
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--color-primary);
  color: var(--krds-gray-0);
  font-weight: 700;
}

/* ───────── 자주 묻는 질문 ───────── */
.faq {
  margin-top: var(--section-gap);
  background: var(--navy-deep);
  color: var(--krds-gray-0);
  padding-block: clamp(96px, 10vw, 160px);
}
.faq__inner {
  display: grid;
  grid-template-columns: 5fr 7fr;
  grid-template-rows: auto 1fr;
  column-gap: clamp(32px, 5vw, 96px);
  row-gap: 48px;
  align-items: start;
}
.faq__intro { grid-column: 1; display: grid; gap: 16px; }
.faq__lead { max-width: 30em; color: var(--on-navy-soft); }
.faq__list { grid-column: 1; grid-row: 2; display: grid; gap: 6px; }
.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 64px;
  padding: 14px 20px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--on-navy-soft);
  font: inherit;
  font-size: 19px;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.faq__q:hover { background: var(--navy); color: var(--krds-gray-0); }
.faq__item.is-active .faq__q {
  background: var(--navy);
  color: var(--krds-gray-0);
  font-weight: var(--font-weight-bold);
}
.faq__q:focus-visible { outline: 2px solid var(--krds-gray-0); outline-offset: 2px; }
/* 오른쪽을 가리키는 꺾쇠: 고른 질문에서 답 쪽으로 이어진다 */
.faq__mark {
  flex: none;
  width: 10px;
  height: 10px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-base);
}
.faq__q:hover .faq__mark { opacity: 0.4; }
.faq__item.is-active .faq__mark { opacity: 1; transform: rotate(45deg) translate(2px, -2px); }
.faq__inline { display: none; }
.faq__pane {
  grid-column: 2;
  grid-row: 2;
  align-self: stretch;
  padding: 14px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
}
.faq__card { display: grid; gap: 24px; }
.faq__card-q {
  font-size: var(--size-statement);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
  line-height: 1.3;
}
.faq__card-a,
.faq__inline p {
  /* 답 문자열의 줄바꿈 문자를 그대로 줄바꿈으로 보여 준다 */
  white-space: pre-line;
}
.faq__card-a {
  font-size: clamp(20px, 1.6vw, 24px);
  line-height: 1.65;
  max-width: 34em;
}
.faq-swap-enter-active,
.faq-swap-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.faq-swap-enter-from { opacity: 0; transform: translateY(8px); }
.faq-swap-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .faq-swap-enter-from { transform: none; }
}

/* ───────── 마지막 화면 ───────── */
.cta {
  background: var(--color-primary);
  color: var(--krds-gray-0);
}
.cta__copy {
  min-height: 72svh;
  display: grid;
  grid-template-columns: 5fr 1fr 6fr;
  align-items: end;
  padding-block: 120px 64px;
}
.cta__text {
  grid-column: 1;
  align-self: end;
  display: grid;
  gap: 24px;
}
.cta__title {
  font-size: var(--size-display);
  font-weight: var(--font-weight-bold);
  line-height: 1.02;
  letter-spacing: -0.04em;
}
.cta__lead { max-width: 30em; font-size: var(--size-body); }
[data-ui].dialog {
  grid-column: 3;
  justify-self: end;
  width: min(100%, 440px);
  background: var(--krds-gray-0);
  color: var(--krds-gray-90);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: grid;
  gap: 16px;
  font-size: 15px;
  box-shadow: 0 24px 48px -12px rgba(0, 32, 70, 0.45);
}
[data-ui] .dialog__title { font-size: 19px; font-weight: 700; }
[data-ui] .dialog__seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  gap: 4px;
  background: var(--krds-gray-10);
  border-radius: 8px;
}
[data-ui] .dialog__seg button {
  height: 40px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  font: inherit;
  color: var(--krds-gray-70);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
[data-ui] .dialog__seg button.is-on { background: var(--krds-gray-0); color: var(--krds-gray-90); font-weight: 700; }
[data-ui] .dialog__field { display: grid; gap: 6px; font-weight: 700; }
[data-ui] .dialog__field input {
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--krds-gray-40);
  border-radius: 8px;
  font: inherit;
  font-weight: 400;
}
[data-ui] .dialog__field input:focus { outline: var(--focus-ring); outline-offset: 0; border-color: var(--color-primary); }
/* 두 상태를 같은 칸에 겹쳐 두고 보이는 쪽만 바꿔, 토글해도 대화상자 높이가 그대로다 */
[data-ui] .dialog__slot { display: grid; }
[data-ui] .dialog__slot > * { grid-area: 1 / 1; }
[data-ui] .dialog__slot > .is-off { visibility: hidden; }
[data-ui] .dialog__note { color: var(--krds-gray-70); align-self: center; }
[data-ui] .dialog__submit {
  height: 52px;
  border: 0;
  border-radius: 8px;
  background: var(--color-primary);
  color: var(--krds-gray-0);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}
[data-ui] .dialog__submit:hover { background: var(--color-primary-hover); }
[data-ui] .dialog__submit:active { transform: translateY(1px); }
[data-ui] button:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }

/* ───────── 바닥글 ───────── */
.foot {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 24px;
  padding-top: 20svh;
  padding-bottom: 30px;
  font-size: 15px;
  color: var(--muted);
}
.foot__links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.foot__links a,
.foot__credits summary { color: var(--ink); text-decoration: none; cursor: pointer; }
.foot__links a:hover,
.foot__credits summary:hover { text-decoration: underline; text-underline-offset: 4px; }
.foot__credits ul { margin-top: 12px; display: grid; gap: 6px; max-width: 36em; }
.foot__credits li a { color: var(--ink); text-decoration: underline; }
.foot__meta { text-align: right; }

/* ───────── 움직임: 숨김 상태는 움직임을 허용한 경우에만 ───────── */
.lines .line { display: block; overflow: clip; padding-bottom: 0.08em; margin-bottom: -0.08em; }
.lines [data-line] { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .reveal-ready .lines [data-line] {
    animation: line-rise 900ms var(--ease-out) both;
    animation-delay: calc(var(--i) * 110ms + 80ms);
  }
  .reveal-ready .fade-up { animation: fade-up 700ms var(--ease-out) 420ms both; }
  .reveal-ready [data-reveal] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 700ms var(--ease-out), transform 700ms var(--ease-out);
  }
  .reveal-ready [data-reveal].is-in { opacity: 1; transform: none; }
  /* 등장(opacity, transform)은 순서대로 늦추고, hover 떠오름(translate)과 배경색은 바로 반응한다 */
  .reveal-ready .cell[data-reveal],
  .reveal-ready .flow__step[data-reveal] {
    transition:
      opacity 700ms var(--ease-out) var(--reveal-delay, 0ms),
      transform 700ms var(--ease-out) var(--reveal-delay, 0ms),
      translate 220ms var(--ease-out),
      background-color 220ms ease;
  }
  .reveal-ready .cell:nth-child(3n + 2)[data-reveal] { --reveal-delay: 80ms; }
  .reveal-ready .cell:nth-child(3n)[data-reveal] { --reveal-delay: 160ms; }
  .reveal-ready .flow__step[data-reveal] { --reveal-delay: calc(var(--i) * 90ms); }
  .cell,
  .flow__step { transition: translate 220ms var(--ease-out), background-color 220ms ease; }
  .cell:hover,
  .flow__step:hover { translate: 0 -6px; }
}
@keyframes line-rise { from { transform: translateY(105%); } to { transform: none; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

/* ───────── 태블릿 ───────── */
@media (max-width: 1024px) {
  .faq__inner { grid-template-columns: 1fr; row-gap: 32px; }
  .faq__pane { display: none; }
  .faq__q { min-height: 56px; padding: 12px 16px; font-size: 17px; }
  .faq__item.is-active .faq__q { border-radius: var(--radius-md) var(--radius-md) 0 0; }
  .faq__item.is-active .faq__mark { transform: rotate(135deg) translate(-2px, 2px); }
  .faq__inline:not([hidden]) {
    display: block;
    padding: 0 16px 20px;
    background: var(--navy);
    color: var(--krds-gray-0);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    font-size: 17px;
    line-height: 1.6;
  }
  .hero { grid-template-columns: 1fr; }
  .hero__stage { order: -1; min-height: 58svh; padding-top: 88px; }
  .hero__mascot { width: min(70%, 320px); max-height: 46svh; }
  .hero__copy { padding-top: 32px; }
  .hero__copy .wordmark { position: absolute; top: 40px; left: var(--frame); z-index: 1; }
  .hero { position: relative; }
  .flow__track { grid-template-columns: 1fr 1fr; }
  .anatomy__row { grid-template-columns: 1fr 1fr; }
  .features__grid { grid-template-columns: 1fr 1fr; }
  .features__grid .cell { flex-direction: column !important; }
  .cta__copy { grid-template-columns: 1fr; gap: 48px; align-items: start; }
  .cta__text,
  [data-ui].dialog { grid-column: 1; justify-self: stretch; }
  [data-ui].dialog { width: 100%; max-width: none; }
}

/* ───────── 휴대폰 ───────── */
@media (max-width: 600px) {
  .landing { --frame: 20px; --size-body: 16px; }
  /* 좁은 화면에서는 왼쪽 로고와 오른쪽 언어, 로그인 메뉴가 한 줄에 들어가도록 줄인다 */
  .hero__copy .wordmark { top: 34px; font-size: 1.5rem; gap: 8px; }
  .wordmark__logo { width: 28px; height: 28px; }
  .hero__top { gap: 8px; }
}
@media (max-width: 420px) {
  /* 언어 메뉴는 지구본 아이콘만 보인다. 글자는 화면 읽기 프로그램을 위해 남겨 둔다 */
  .hero__top :deep(.lang-menu__label) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
@media (max-width: 600px) {
  .hero__title { font-size: 7.6vw; }
  .hero__copy { padding-bottom: 40px; }
  .flow { padding-block: 72px; }
  .flow__inner { gap: 40px; }
  .flow__track { grid-template-columns: 1fr; }
  .flow__step { padding: 28px 20px 20px; }
  .anatomy__row { gap: 16px; }
  .anatomy__item:nth-child(even) { margin-top: 32px; }
  .anatomy__note { font-size: 15px; }
  .features__grid { grid-template-columns: 1fr; gap: 6px; }
  .cell { min-height: 0; gap: 8px; }
  .cell__text { padding: 24px 20px; }
  .features__grid .cell:nth-child(even) [data-ui].frag { margin-left: 0; border-radius: 0 10px 0 0; }
  .faq { padding-block: 72px; }
  .cta__copy { min-height: 0; padding-block: 72px 40px; }
  .cta__title { font-size: 13vw; }
  [data-ui].dialog { width: 100%; padding: 20px; }
  .foot { grid-template-columns: 1fr; gap: 8px; font-size: 14px; padding-top: 20svh; padding-bottom: 24px; }
  .foot__links { justify-content: flex-start; }
  .foot__meta { text-align: left; }
}
</style>
