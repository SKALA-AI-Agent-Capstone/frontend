import { createRouter, createWebHistory } from 'vue-router'
import { PERMISSIONS } from '@/shared/constants/roles'
import { NAV_KEYS, ROUTE_NAMES } from '@/shared/constants/routes'
import { useReviewsStore } from '@/shared/stores/reviews'
import { SITE } from '@/shared/constants/site'
import { useSessionStore } from '@/shared/stores/session'

const routes = [
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/pages/login/LoginPage.vue'),
    meta: { title: '로그인', layout: 'blank', public: true },
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
    meta: { title: '자율심의 신청', navKey: NAV_KEYS.REVIEW_NEW, permission: PERMISSIONS.REVIEW_CREATE },
  },
  {
    path: '/reviews/:id',
    name: ROUTE_NAMES.REVIEW_DETAIL,
    component: () => import('@/pages/review-detail/ReviewDetailPage.vue'),
    meta: { title: '위반사항 분석 및 보완', navKey: NAV_KEYS.HISTORY },
  },
  {
    path: '/reviews/:id/report',
    name: ROUTE_NAMES.REVIEW_REPORT,
    component: () => import('@/pages/review-report/ReviewReportPage.vue'),
    meta: { title: '심의 리포트', layout: 'blank' },
  },
  {
    path: '/batch',
    name: ROUTE_NAMES.BATCH,
    component: () => import('@/pages/batch/BatchPage.vue'),
    meta: { title: '캠페인 일괄 심의', navKey: NAV_KEYS.BATCH, permission: PERMISSIONS.REVIEW_CREATE },
  },
  {
    path: '/history',
    name: ROUTE_NAMES.HISTORY,
    component: () => import('@/pages/history/HistoryPage.vue'),
    meta: { title: '심의 이력', navKey: NAV_KEYS.HISTORY },
  },
  {
    path: '/approvals',
    name: ROUTE_NAMES.APPROVALS,
    component: () => import('@/pages/approvals/ApprovalsPage.vue'),
    meta: { title: '승인 대기', navKey: NAV_KEYS.APPROVALS, permission: PERMISSIONS.REVIEW_APPROVE },
  },
  {
    path: '/credits',
    name: ROUTE_NAMES.CREDITS,
    component: () => import('@/pages/credits/CreditsPage.vue'),
    meta: { title: '크레딧' },
  },
  {
    path: '/standards',
    name: ROUTE_NAMES.STANDARDS,
    component: () => import('@/pages/standards/StandardsPage.vue'),
    meta: { title: '법령,고시 자료실', navKey: NAV_KEYS.STANDARDS },
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
  if (session.isAuthenticated) await useReviewsStore().load()
  if (!to.meta.public && !session.isAuthenticated) {
    return { name: ROUTE_NAMES.LOGIN, query: { redirect: to.fullPath } }
  }
  if (to.name === ROUTE_NAMES.LOGIN && session.isAuthenticated) return { name: ROUTE_NAMES.DASHBOARD }
  if (to.meta.permission && !session.can(to.meta.permission)) return { name: ROUTE_NAMES.DASHBOARD }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | ${SITE.serviceName}` : SITE.serviceName
})

export default router
