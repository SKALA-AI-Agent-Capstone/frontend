<!-- 리포트 다운로드 (FR-9) — 인쇄(PDF 저장) 또는 문서(HTML) 파일 저장 -->
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { REVIEW_STATUS } from '@/shared/constants/review'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import ReportDocument from './features/report-document/ReportDocument.vue'

const route = useRoute()
const reviews = useReviewsStore()
const review = computed(() => reviews.byId(String(route.params.id)))
const version = computed(() => {
  if (!review.value) return null
  const no = Number(route.query.v) || reviews.latest(review.value).no
  return review.value.versions.find((v) => v.no === no && v.status === REVIEW_STATUS.DONE) ?? null
})
const docRef = ref(null)

function print() {
  window.print()
}

function downloadHtml() {
  const styles = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((el) => el.outerHTML).join('\n')
  const title = document.createElement('title'); title.textContent = `${review.value.productName} 검토 리포트`
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">${title.outerHTML}${styles}</head><body>${docRef.value.$el.outerHTML}</body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${review.value.id}_v${version.value.no}_리포트.html` })
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="report-page">
    <BaseEmptyState v-if="!version" icon="search_off" title="리포트를 만들 수 없습니다" description="분석이 끝난 검토 건만 리포트를 받을 수 있습니다." />
    <template v-else>
      <div class="report-page__toolbar">
        <BaseButton variant="ghost" icon="arrow_back" :to="{ name: ROUTE_NAMES.REVIEW_DETAIL, params: { id: review.id }, query: { v: version.no } }">
          결과로 돌아가기
        </BaseButton>
        <div class="report-page__actions">
          <BaseButton variant="outline" icon="code" @click="downloadHtml">문서(HTML) 저장</BaseButton>
          <BaseButton icon="picture_as_pdf" @click="print">인쇄 , PDF 저장</BaseButton>
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
