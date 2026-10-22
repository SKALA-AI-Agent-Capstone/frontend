<!-- 리포트 다운로드 (FR-9) — 인쇄(PDF 저장) 또는 문서(HTML) 파일 저장 -->
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { currentLocale, t } from '@/shared/i18n'
import ReportDocument from './features/report-document/ReportDocument.vue'

const route = useRoute()
const reviews = useReviewsStore()
// 리포트는 결과 전체가 필요하다. 목록 요약 항목이면 상세를 받을 때까지 기다린다.
const review = computed(() => {
  const item = reviews.byId(String(route.params.id))
  return reviews.isDetailed(item) ? item : null
})
const loading = ref(true)
watch(() => route.params.id, (id) => {
  if (!id) return
  loading.value = true
  reviews.refresh(String(id)).catch(() => {}).finally(() => { loading.value = false })
}, { immediate: true })
const version = computed(() => {
  if (!review.value) return null
  // 재검토(새 버전)를 없앤 뒤로는 최신 버전 리포트만 만든다
  const no = reviews.latest(review.value).no
  return review.value.versions.find((v) => v.no === no && v.status === REVIEW_STATUS.DONE) ?? null
})
const docRef = ref(null)

function print() {
  window.print()
}

function downloadHtml() {
  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((el) => el.outerHTML).join('\n')
  const title = document.createElement('title'); title.textContent = t('report.docTitle', { name: review.value.productName })
  const html = `<!doctype html><html lang="${currentLocale()}"><head><meta charset="utf-8">${title.outerHTML}${styles}</head><body>${docRef.value.$el.outerHTML}</body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${review.value.id}_v${version.value.no}_${t('report.fileSuffix')}.html` })
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="report-page">
    <p v-if="!version && loading" class="report-page__loading" role="status">{{ $t('report.loading') }}</p>
    <BaseEmptyState v-else-if="!version" icon="search_off" :title="$t('report.emptyTitle')" :description="$t('report.emptyText')" />
    <template v-else>
      <div class="report-page__toolbar">
        <BaseButton variant="ghost" icon="arrow_back" :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id }, query: { v: version.no } }">
          {{ $t('report.back') }}
        </BaseButton>
        <div class="report-page__actions">
          <BaseButton variant="outline" icon="code" @click="downloadHtml">{{ $t('report.saveHtml') }}</BaseButton>
          <BaseButton icon="picture_as_pdf" @click="print">{{ $t('report.print') }}</BaseButton>
        </div>
      </div>
      <ReportDocument ref="docRef" :review="review" :version="version" />
    </template>
  </div>
</template>

<style scoped>
.report-page {
  max-width: var(--modal-width-lg);
  margin: 0 auto;
  padding: var(--space-lg) var(--layout-margin);
}
.report-page__toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.report-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

@media print {
  .report-page {
    max-width: none;
    padding: 0;
  }
  .report-page__toolbar {
    display: none;
  }
}
</style>
