import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { currentLocale, t } from '@/shared/i18n'
import { PERMISSIONS } from '@/shared/constants/roles'
import { NAV_KEYS, ROUTE_NAMES } from '@/shared/constants/routes'
import { useReviewsStore } from '@/shared/stores/reviews'
import { SITE } from '@/shared/constants/site'
import { useSessionStore } from '@/shared/stores/session'

const routes = [
  {
    path: '/welcome',
    name: ROUTE_NAMES.LANDING,
    component: () => import('@/pages/landing/LandingPage.vue'),
    meta: { title: null, layout: 'blank', public: true },
  },
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/pages/login/LoginPage.vue'),
    meta: { title: 'ui.titles.login', layout: 'blank', public: true },
  },
  {
    path: '/signup',
    name: ROUTE_NAMES.SIGNUP,
    component: () => import('@/pages/signup/SignupPage.vue'),
    meta: { title: 'ui.titles.signup', layout: 'blank', public: true },
  },
  {
    path: '/',
    name: ROUTE_NAMES.DASHBOARD,
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    meta: { title: null, navKey: NAV_KEYS.DASHBOARD, compactTop: true },
  },
  {
    path: '/reviews/new',
    name: ROUTE_NAMES.REVIEW_NEW,
    component: () => import('@/pages/review-new/ReviewNewPage.vue'),
    meta: { title: 'ui.titles.reviewNew', navKey: NAV_KEYS.REVIEW_NEW, permission: PERMISSIONS.REVIEW_CREATE, needsReviews: true },
  },
  {
    path: '/reviews/:id',
    name: ROUTE_NAMES.REVIEW_DETAIL,
    component: () => import('@/pages/review-detail/ReviewDetailPage.vue'),
    meta: { title: 'ui.titles.reviewDetail', navKey: NAV_KEYS.HISTORY, needsReviews: true },
  },
  {
    path: '/reviews/:id/report',
    name: ROUTE_NAMES.REVIEW_REPORT,
    component: () => import('@/pages/review-report/ReviewReportPage.vue'),
    meta: { title: 'ui.titles.report', layout: 'blank', needsReviews: true },
  },
  {
    path: '/batch',
    name: ROUTE_NAMES.BATCH,
    component: () => import('@/pages/batch/BatchPage.vue'),
    meta: { title: 'ui.titles.batch', navKey: NAV_KEYS.BATCH, permission: PERMISSIONS.REVIEW_CREATE },
  },
  {
    path: '/history',
    name: ROUTE_NAMES.HISTORY,
    component: () => import('@/pages/history/HistoryPage.vue'),
    meta: { title: 'ui.titles.history', navKey: NAV_KEYS.HISTORY },
  },
  {
    path: '/approvals',
    name: ROUTE_NAMES.APPROVALS,
    component: () => import('@/pages/approvals/ApprovalsPage.vue'),
    meta: { title: 'ui.titles.approvals', navKey: NAV_KEYS.APPROVALS, permission: PERMISSIONS.REVIEW_APPROVE },
  },
  {
    path: '/credits',
    name: ROUTE_NAMES.CREDITS,
    component: () => import('@/pages/credits/CreditsPage.vue'),
    meta: { title: 'ui.titles.credits' },
  },
  {
    path: '/standards',
    name: ROUTE_NAMES.STANDARDS,
    component: () => import('@/pages/standards/StandardsPage.vue'),
    meta: { title: 'ui.titles.standards', navKey: NAV_KEYS.STANDARDS },
  },
  {
    path: '/privacy-policy',
    name: ROUTE_NAMES.PRIVACY_POLICY,
    component: () => import('@/pages/privacy-policy/PrivacyPolicyPage.vue'),
    meta: { title: 'ui.titles.privacyPolicy', layout: 'blank', public: true },
  },
  {
    path: '/terms',
    name: ROUTE_NAMES.TERMS,
    component: () => import('@/pages/terms/TermsPage.vue'),
    meta: { title: 'ui.titles.terms', layout: 'blank', public: true },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: ROUTE_NAMES.DASHBOARD } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// NFR-9: 로그인 필수 + 역할 권한 가드
router.beforeEach(async (to) => {
  const session = useSessionStore()
  await session.restore()
  // 목록은 화면을 먼저 보여 주고 뒤에서 받는다. 처음 여는 화면이 목록 속 검토를 바로 써야 할 때만
  // (새 버전 신청, 상세, 리포트) 첫 목록을 기다린다.
  if (session.isAuthenticated) {
    const reviews = useReviewsStore()
    const loading = reviews.load()
    if (to.meta.needsReviews && !reviews.loaded) await loading
  }
  if (!to.meta.public && !session.isAuthenticated) {
    // 첫 화면으로 들어온 비로그인 방문자에게는 서비스 소개를 먼저 보여 준다.
    if (to.name === ROUTE_NAMES.DASHBOARD) return { name: ROUTE_NAMES.LANDING }
    return { name: ROUTE_NAMES.LOGIN, query: { redirect: to.fullPath } }
  }
  if ((to.name === ROUTE_NAMES.LOGIN || to.name === ROUTE_NAMES.SIGNUP) && session.isAuthenticated) {
    return { name: ROUTE_NAMES.DASHBOARD }
  }
  if (to.meta.permission && !session.can(to.meta.permission)) return { name: ROUTE_NAMES.DASHBOARD }
  return true
})

router.afterEach((to) => {
  // 언어를 바꾸면 현재 화면 제목도 다시 쓴다
  setDocumentTitle(to)
})

function setDocumentTitle(route) {
  // 탭 제목: '화면 이름 | VeRo', 화면 이름이 없으면 'VeRo, 화장품 광고 사전검토'
  document.title = route.meta.title ? `${t(route.meta.title)} | ${SITE.orgName}` : `${SITE.orgName}, ${SITE.serviceName}`
}
watch(() => currentLocale(), () => setDocumentTitle(router.currentRoute.value))

export default router
