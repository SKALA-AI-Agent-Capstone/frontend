<!--
  서비스 소개 랜딩. 비로그인 방문자가 첫 화면(/)으로 들어오면 이 화면을 본다.
  화면의 카드와 조각은 흐름 설명용 예시이며 실제 검토 결과, 법령 판정, 이용 수치를 보여 주지 않는다.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { SITE } from '@/shared/constants/site'
import {
  APPROVAL_ACTIONS,
  APPROVAL_LABEL,
  APPROVAL_STATE,
  REVIEW_STATUS,
  REVIEW_STATUS_LABEL,
  VIOLATION_RESOLUTION_LABEL,
} from '@/shared/constants/review'
import AdFileReader from './features/AdFileReader.vue'
import { ARCHIVE_ADS } from './archive'
import { useReveal } from './useReveal'

const router = useRouter()
const root = ref<HTMLElement | null>(null)
const { ready } = useReveal(root)
const anatomy = [
  { id: 'lesquendieu', note: '한 장에 두 제품을 싣고, 그림보다 문구가 지면을 채웁니다.' },
  { id: 'elida', note: '글자 하나가 그대로 그림이 되고, 제품명은 아래에 따로 놓입니다.' },
  { id: 'lundborg', note: '제품명과 권유 문구가 그림의 위아래를 감쌉니다.' },
  { id: 'klarybella', note: '인물 그림 위에 손글씨 문구가 겹쳐 있습니다.' },
].map((item) => ({ ...item, ad: ARCHIVE_ADS.find((ad) => ad.id === item.id)! }))
const year = new Date().getFullYear()

// 단계 배지는 앱의 실제 상태 표기(REVIEW_STATUS_LABEL, APPROVAL_LABEL)를 그대로 쓴다.
const flow = [
  {
    title: '광고 파일 올리기',
    text: 'PDF나 이미지를 올리고 검토를 시작합니다.',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.QUEUED],
    rows: [['형식', 'PDF, 이미지'], ['신청', '작성자']],
  },
  {
    title: '문구와 사진 분석',
    text: 'AI가 문구와 사진을 나눠 위반 소지를 판단합니다.',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.ANALYZING],
    rows: [['문구', '위반 소지와 근거 조문'], ['사진', '표현 별도 검토']],
  },
  {
    title: '문구별 처리 선택',
    text: '분석이 끝나면 문구마다 처리 방법을 고릅니다.',
    status: REVIEW_STATUS_LABEL[REVIEW_STATUS.DONE],
    rows: Object.values(VIOLATION_RESOLUTION_LABEL).map((item, i) => [i === 0 ? '선택' : '', item.label]),
  },
  {
    title: '검토자 승인',
    text: '검토자가 승인, 수정 요청, 반려 중에서 결정합니다.',
    status: APPROVAL_LABEL[APPROVAL_STATE.PENDING],
    rows: APPROVAL_ACTIONS.map((action, i) => [i === 0 ? '결정' : '', action.label]),
  },
]

const faqs = [
  {
    q: 'AI 결과대로 바로 게시해도 되나요?',
    a: 'AI가 위반 소지를 판단하고 근거와 대체 표현을 제시합니다.\n게시 전 최종 승인은 사내 검토자가 합니다.\n협회 자문이나 정부 인증을 대신하지 않습니다.',
  },
  {
    q: '어떤 파일을 올릴 수 있나요?',
    a: 'PDF와 이미지(JPG, PNG, WEBP) 두 가지입니다. 텍스트 PDF, 스캔 PDF, 긴 이미지는 서버가 나눠 처리하고, 카피를 직접 입력하는 화면은 없습니다.',
  },
  {
    q: '올린 원본은 어떻게 되나요?',
    a: '검토 결과, 승인 이력과 함께 서버에 보존됩니다. 위반 검토와 리포트 화면에서 원본을 다시 볼 수 있고, 새 버전으로 재검토할 때는 원본 파일을 다시 제출합니다.',
  },
  {
    q: '법령 근거는 어디서 찾나요?',
    a: '적재된 화장품법 조문에서 문구와 관련된 조문을 찾습니다.\nAI가 위반 소지로 본 문구마다 근거 조문을 함께 보여 줍니다.',
  },
  {
    q: '다른 회사가 우리 자료를 볼 수 있나요?',
    a: '볼 수 없습니다. 기업마다 작업공간이 나뉘고, 계정은 자기 기업의 자료에만 접근합니다.',
  },
  {
    q: '비용이 드나요?',
    a: '검토 사용량 과금은 아직 연결되지 않았습니다. 크레딧 충전 화면은 테스트 결제로만 동작합니다.',
  },
]
const activeFaq = ref(0)
const faqButtons: HTMLButtonElement[] = []

// 질문 목록에서 위아래 화살표로 다음 질문으로 옮겨 간다.
function onFaqKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  const step = event.key === 'ArrowDown' ? 1 : -1
  activeFaq.value = (activeFaq.value + step + faqs.length) % faqs.length
  faqButtons[activeFaq.value]?.focus()
}

const startMode = ref<'new' | 'existing'>('new')
const tenantName = ref('봄결 코스메틱')
const startLabel = computed(() => (startMode.value === 'new' ? '이 이름으로 시작하기' : '로그인하러 가기'))

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
        <RouterLink :to="{ name: ROUTE_NAMES.LANDING }" class="wordmark">Beauty Review</RouterLink>
        <div class="hero__text">
          <h1 id="landing-title" class="hero__title lines">
            <span class="line"><span data-line style="--i: 0">화장품 광고를</span></span>
            <span class="line"><span data-line style="--i: 1">게시 전에 검토합니다</span></span>
          </h1>
          <p class="hero__lead fade-up">
            PDF나 이미지 광고를 올리면 AI가 문구와 사진을 나눠 읽고,<br class="br-wide" /> 위반 소지와 근거 조문, 대체 표현을 알려 줍니다.
          </p>
          <div class="hero__actions fade-up">
            <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP }" class="btn btn--accent">기업 작업공간 만들기</RouterLink>
          </div>
        </div>
      </div>
      <div class="hero__stage">
        <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }" class="hero__login">로그인</RouterLink>
        <AdFileReader class="fade-up" />
      </div>
    </section>

    <!-- 광고 한 장의 구성: 공개 도메인 옛 광고로 문구와 그림이 섞이는 모습을 보여 준다 -->
    <section class="anatomy page-frame" aria-labelledby="anatomy-title">
      <div class="anatomy__head" data-reveal>
        <h2 id="anatomy-title" class="section-title">문구와 그림은 따로 읽습니다</h2>
      </div>
      <ul class="anatomy__row">
        <li v-for="item in anatomy" :key="item.id" class="anatomy__item" data-reveal>
          <figure>
            <div class="anatomy__frame">
              <img :src="item.ad.src" :alt="item.ad.alt" :width="item.ad.width" :height="item.ad.height" loading="lazy" />
            </div>
            <figcaption>
              <span class="anatomy__caption">{{ item.ad.caption }}</span>
              <span class="anatomy__note">{{ item.note }}</span>
            </figcaption>
          </figure>
        </li>
      </ul>
    </section>

    <!-- 흐름: 한 건이 신청부터 승인까지 거치는 상태. 배지는 앱의 실제 상태 표기다 -->
    <section class="flow" aria-labelledby="flow-title">
      <div class="flow__inner page-frame">
        <h2 id="flow-title" class="section-title" data-reveal>Beauty Review 파이프라인</h2>
        <ol class="flow__track">
          <li v-for="(step, i) in flow" :key="step.title" class="flow__step" data-reveal :style="{ '--i': i }">
            <p class="flow__badge" :class="`flow__badge--${step.status.variant}`">{{ step.status.label }}</p>
            <h3 class="flow__title">{{ step.title }}</h3>
            <p class="flow__text">{{ step.text }}</p>
            <dl data-ui class="flow__detail">
              <div v-for="row in step.rows" :key="row[1]" :class="{ 'is-cont': !row[0] }"><dt>{{ row[0] }}</dt><dd>{{ row[1] }}</dd></div>
            </dl>
          </li>
        </ol>
      </div>
    </section>

    <!-- 작업공간 기능: 문장과 실제 화면 조각이 엇갈려 놓인다 -->
    <section class="features page-frame" aria-labelledby="features-title">
      <h2 id="features-title" class="section-title" data-reveal>작업공간</h2>
      <div class="features__grid">
        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>사내 역할을 나눕니다</h3>
            <p>마케팅 담당자는 작성자로 신청하고, <span class="nb">법무나 허가 담당자는</span> 검토자로 승인합니다. 작업공간을 만든 계정은 관리자가 됩니다.</p>
          </div>
          <div data-ui class="frag frag--members frag--dock-bottom">
            <p class="frag__label">구성원</p>
            <ul>
              <li><span>김하늘</span><span class="chip">작성자</span></li>
              <li class="is-hover"><span>이도윤</span><span class="chip chip--blue">검토자</span></li>
              <li><span>박서연</span><span class="chip chip--navy">관리자</span></li>
            </ul>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--search frag--dock-top">
            <p class="frag__label">법령 검색 범위</p>
            <p class="frag__value">적재된 화장품법 조문</p>
            <p class="frag__note">위반 소지 문구마다 근거 조문을 제시합니다</p>
            <span class="chip chip--amber">적재 자료 기준</span>
          </div>
          <div class="cell__text">
            <h3>근거 조문을 붙입니다</h3>
            <p>AI가 위반 소지로 본 문구마다 적재된 화장품법에서 찾은 근거 조문을 붙입니다.</p>
          </div>
        </article>

        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>원본을 보존합니다</h3>
            <p>업로드한 원본은 검토 결과, 승인 이력과 함께 서버에 보존되어 위반 검토와 리포트에서 다시 볼 수 있습니다.</p>
          </div>
          <div data-ui class="frag frag--table frag--dock-bottom">
            <table>
              <tbody>
                <tr><th scope="row">광고 원본</th><td>서버 보존</td></tr>
                <tr><th scope="row">검토 결과</th><td>서버 보존</td></tr>
                <tr><th scope="row">승인 이력</th><td>서버 보존</td></tr>
                <tr><th scope="row">다시 보기</th><td>위반 검토, 리포트 화면</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--versions frag--dock-top">
            <p class="frag__label">버전</p>
            <ol>
              <li class="is-current"><span>v2</span><span>문구 수정본</span><span class="chip chip--amber">{{ APPROVAL_LABEL[APPROVAL_STATE.PENDING].label }}</span></li>
              <li><span>v1</span><span>최초 신청</span><span class="chip chip--blue">{{ APPROVAL_LABEL[APPROVAL_STATE.CHANGES_REQUESTED].label }}</span></li>
            </ol>
          </div>
          <div class="cell__text">
            <h3>고치면 새 버전으로</h3>
            <p>원본 파일을 다시 제출하면 이전 결과를 덮어쓰지 않고 새 버전으로 재검토합니다.</p>
          </div>
        </article>

        <article class="cell cell--text-top" data-reveal>
          <div class="cell__text">
            <h3>리포트로 남깁니다</h3>
            <p>확인할 문구, 증빙 대조, 특허 확인, 사진 검토, 승인 이력을 리포트 한 장으로 정리합니다.</p>
          </div>
          <div data-ui class="frag frag--report frag--dock-bottom">
            <p class="frag__value">심의 리포트</p>
            <p class="frag__note">확인할 문구, 증빙 대조, 특허 확인, 사진 독립 검토, 승인 이력</p>
            <span class="frag__button">인쇄, PDF 저장</span>
          </div>
        </article>

        <article class="cell cell--frag-top" data-reveal>
          <div data-ui class="frag frag--tenant frag--dock-top">
            <p class="frag__label">작업공간</p>
            <p class="frag__value">봄결 코스메틱</p>
            <p class="frag__note">다른 기업 자료 접근 불가</p>
          </div>
          <div class="cell__text">
            <h3>기업마다 따로</h3>
            <p>기업마다 작업공간이 분리되어, 계정은 자기 회사의 광고와 이력만 볼 수 있습니다.</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 자주 묻는 질문: 왼쪽은 질문 목록, 오른쪽은 고른 질문의 답 -->
    <section class="faq" aria-labelledby="faq-title">
      <div class="faq__inner page-frame">
        <div class="faq__intro" data-reveal>
          <h2 id="faq-title" class="section-title">자주 묻는 질문</h2>
          <p class="faq__lead">검토를 신청하기 전에 가장 많이 확인하는 내용입니다.</p>
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
          <h2 id="cta-title" class="cta__title">첫 광고를<br />올려 보세요</h2>
          <p class="cta__lead">작업공간을 만들면 관리자 계정이 생기고, 바로 첫 검토를 신청할 수 있습니다.</p>
        </div>
        <form data-ui class="dialog" data-reveal aria-labelledby="dialog-title" @submit.prevent="start">
          <p id="dialog-title" class="dialog__title">기업 작업공간 만들기</p>
          <div class="dialog__seg" role="radiogroup" aria-label="시작 방법">
            <button type="button" role="radio" :aria-checked="startMode === 'new'" :class="{ 'is-on': startMode === 'new' }" @click="startMode = 'new'">새 작업공간</button>
            <button type="button" role="radio" :aria-checked="startMode === 'existing'" :class="{ 'is-on': startMode === 'existing' }" @click="startMode = 'existing'">이미 계정이 있음</button>
          </div>
          <div class="dialog__slot">
          <label class="dialog__field" :class="{ 'is-off': startMode !== 'new' }" :aria-hidden="startMode !== 'new'">
            기업명
            <input v-model="tenantName" maxlength="120" autocomplete="organization" :required="startMode === 'new'" />
          </label>
          <p class="dialog__note" :class="{ 'is-off': startMode === 'new' }" :aria-hidden="startMode === 'new'">기존 계정의 이메일과 비밀번호로 로그인합니다.</p>
          </div>
          <button type="submit" class="dialog__submit">{{ startLabel }}</button>
        </form>
      </div>
    </section>

    <footer class="foot page-frame">
      <p class="foot__what">{{ SITE.serviceName }}</p>
      <nav class="foot__links" aria-label="바닥글">
        <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }">로그인</RouterLink>
        <RouterLink :to="{ name: ROUTE_NAMES.SIGNUP }">작업공간 만들기</RouterLink>
        <details class="foot__credits">
          <summary>이미지 출처</summary>
          <ul>
            <li v-for="ad in ARCHIVE_ADS" :key="ad.id">
              <a :href="ad.page" target="_blank" rel="noopener noreferrer">{{ ad.caption }}</a>, 퍼블릭 도메인, 위키미디어 공용
            </li>
          </ul>
        </details>
      </nav>
      <p class="foot__meta">{{ year }} Beauty Review Capstone. 공식 심의 서비스가 아닙니다.</p>
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
  color: var(--krds-gray-0);
  font-weight: var(--font-weight-bold);
  font-size: var(--size-body);
  text-decoration: none;
  align-self: flex-start;
}
.hero__text {
  display: grid;
  gap: 32px;
  max-width: 34em;
}
.hero__title {
  font-size: clamp(40px, 4.6vw, 72px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
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
.hero__login {
  position: absolute;
  top: 40px;
  right: var(--frame);
  color: var(--krds-gray-0);
  font-size: 15px;
  font-weight: var(--font-weight-bold);
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
[data-ui].flow__detail div { display: grid; grid-template-columns: 40px 1fr; gap: 8px; }
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
