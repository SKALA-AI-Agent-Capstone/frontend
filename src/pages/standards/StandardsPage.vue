<!-- 법령 자료실 — 검토 근거 문서의 적재 현황과 외부 API 연결 범위 (NFR-6, 11) -->
<script setup>
import { computed, onMounted, ref } from 'vue'
import { request } from '@/shared/api/http'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import ScreenTitle from '@/shared/components/layout/ScreenTitle.vue'
import { t } from '@/shared/i18n'

const sources = ref([]), apis = ref([]), corpus = ref([]), status = ref(''), error = ref(''), loading = ref(true)
onMounted(async () => {
  try {
    const data = await request('/reference-sources')
    sources.value = data.sources
    apis.value = data.apis || []
    corpus.value = data.corpus || []
    status.value = data.retrievalStatus
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const ROUTE_LABEL = { legalize_kr: 'standards.route.legalize', 'legalize_kr+pdf': 'standards.route.legalizePdf', pdf: 'standards.route.pdf' }
const BANNER = {
  indexed: { tone: 'ok', title: 'standards.banner.indexed.title', text: 'standards.banner.indexed.text' },
  not_indexed: { tone: 'warn', title: 'standards.banner.notIndexed.title', text: 'standards.banner.notIndexed.text' },
  unavailable: { tone: 'warn', title: 'standards.banner.unavailable.title', text: 'standards.banner.unavailable.text' },
}
const banner = computed(() => BANNER[status.value] ?? BANNER.unavailable)
const legalizeDocs = computed(() => corpus.value.filter((d) => d.document_key.startsWith('legalize-kr:')))
const articleCount = computed(() => legalizeDocs.value.reduce((sum, d) => sum + d.chunks, 0))

// 문서마다 적재 상태를 글자와 함께 '적재됨' 여부로 돌려준다
function sourceStatus(source) {
  const method = source.acquisition?.method ?? ''
  const parts = []
  let loaded = false
  if (method.includes('legalize_kr')) {
    if (legalizeDocs.value.length) loaded = true
    parts.push(legalizeDocs.value.length ? t('standards.status.articles', { versions: legalizeDocs.value.length, articles: articleCount.value }) : t('standards.status.articlesMissing'))
  }
  if (method.split('+').includes('pdf')) {
    const pdf = corpus.value.filter((d) => d.document_key === `pdf:${source.id}` || d.document_key.startsWith(`pdf:${source.id}:`))
    if (pdf.length) loaded = true
    parts.push(pdf.length ? t('standards.status.pdf', { chunks: pdf.reduce((sum, d) => sum + d.chunks, 0) }) : t('standards.status.pdfMissing'))
  }
  return { text: parts.join(', ') || t('standards.status.missing'), loaded }
}
const API_ROLE = { business_realtime: 'standards.apiRole.realtime', supporting_reference: 'standards.apiRole.supporting' }
const summary = computed(() => [
  { label: 'standards.summary.sources', value: sources.value.length },
  { label: 'standards.summary.versions', value: legalizeDocs.value.length },
  { label: 'standards.summary.articles', value: articleCount.value },
  { label: 'standards.summary.apis', value: apis.value.length },
])
</script>

<template>
  <div class="standards">
    <ScreenTitle :title="$t('standards.title')" :description="$t('standards.description')" />

    <BaseAlert v-if="error" variant="danger">{{ $t('standards.loadError') }} {{ error }}</BaseAlert>

    <section v-if="!error" class="status" :class="`status--${banner.tone}`" aria-labelledby="status-title">
      <div class="status__text">
        <h2 id="status-title"><span class="status__dot" aria-hidden="true"></span>{{ loading ? $t('standards.loadingTitle') : $t(banner.title) }}</h2>
        <p>{{ loading ? $t('standards.loadingText') : $t(banner.text) }}</p>
      </div>
      <dl class="status__numbers">
        <div v-for="item in summary" :key="item.label">
          <dt>{{ $t(item.label) }}</dt>
          <dd>{{ loading ? '-' : item.value }}<span v-if="!loading && $t('standards.summary.unit') !== '-'">{{ $t('standards.summary.unit') }}</span></dd>
        </div>
      </dl>
    </section>

    <section class="card" aria-labelledby="sources-title">
      <h2 id="sources-title" class="card__title">{{ $t('standards.sources.title') }}</h2>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th scope="col">{{ $t('standards.sources.source') }}</th><th scope="col">{{ $t('standards.sources.version') }}</th><th scope="col">{{ $t('standards.sources.route') }}</th><th scope="col">{{ $t('standards.sources.status') }}</th></tr></thead>
          <tbody>
            <tr v-for="source in sources" :key="source.id">
              <td>
                <a :href="source.official_page" target="_blank" rel="noopener noreferrer" class="table__link">{{ source.title }}</a>
                <p class="table__sub">{{ source.id }}</p>
              </td>
              <td class="table__nowrap">{{ source.reported_version_date === 'check_current' ? $t('standards.sources.checkCurrent') : source.reported_version_date }}</td>
              <td class="table__nowrap">{{ ROUTE_LABEL[source.acquisition?.method] ? $t(ROUTE_LABEL[source.acquisition?.method]) : source.method }}</td>
              <td><span class="pill" :class="{ 'pill--ok': sourceStatus(source).loaded }">{{ sourceStatus(source).text }}</span></td>
            </tr>
            <tr v-if="!loading && !sources.length"><td colspan="4" class="table__empty">{{ $t('standards.sources.empty') }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="legalizeDocs.length" class="card" aria-labelledby="versions-title">
      <h2 id="versions-title" class="card__title">{{ $t('standards.versions.title') }}</h2>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th scope="col">{{ $t('standards.versions.law') }}</th><th scope="col">{{ $t('standards.versions.promulgated') }}</th><th scope="col">{{ $t('standards.versions.effective') }}</th><th scope="col" class="table__num">{{ $t('standards.versions.articles') }}</th></tr></thead>
          <tbody>
            <tr v-for="doc in legalizeDocs" :key="doc.document_key + doc.version_label">
              <td class="table__strong">{{ doc.title }}</td>
              <td class="table__nowrap">{{ doc.version_label }}</td>
              <td class="table__nowrap">{{ doc.effective_from }} ~ {{ doc.effective_until || $t('standards.versions.now') }}</td>
              <td class="table__num">{{ doc.chunks }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card" aria-labelledby="apis-title">
      <h2 id="apis-title" class="card__title">{{ $t('standards.apis.title') }}</h2>
      <ul class="apis">
        <li v-for="api in apis" :key="api.id" class="api">
          <div>
            <a :href="api.official_page" target="_blank" rel="noopener noreferrer" class="table__link">{{ api.title }}</a>
            <p class="table__sub">{{ api.note }}</p>
          </div>
          <span class="pill" :class="{ 'pill--ok': api.role === 'business_realtime' }">{{ API_ROLE[api.role] ? $t(API_ROLE[api.role]) : api.role }}</span>
        </li>
        <li v-if="!loading && !apis.length" class="table__empty">{{ $t('standards.apis.empty') }}</li>
      </ul>
    </section>

    <p class="standards__note">
      {{ $t('standards.note') }}
    </p>
  </div>
</template>

<style scoped>
.standards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}

/* 적재 현황: 왼쪽 상태 문장, 오른쪽 숫자 */
.status {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-xl);
  padding: 24px;
  border-radius: 12px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.status h2 { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-title-m); font-weight: var(--font-weight-bold); }
.status__dot { width: 10px; height: 10px; border-radius: var(--radius-full); background: var(--color-text-disabled); }
.status--ok .status__dot { background: var(--color-success); }
.status--warn .status__dot { background: var(--color-warning); }
.status__text p { margin-top: 6px; color: var(--color-text-secondary); max-width: 52em; }
.status__numbers { display: flex; gap: 28px; margin: 0; }
.status__numbers dt { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); white-space: nowrap; }
.status__numbers dd { margin: 2px 0 0; font-size: 2.4rem; font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; }
.status__numbers dd span { margin-left: 2px; font-size: var(--font-size-body-s); font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }

.card {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  overflow: clip;
}
.card__title {
  padding: 18px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-title-s);
  font-weight: var(--font-weight-bold);
}
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: var(--font-size-body-s); }
.table th {
  padding: 10px 24px;
  background: var(--color-bg-page);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-align: left;
  white-space: nowrap;
}
.table td { padding: 14px 24px; border-bottom: var(--border-width) solid var(--color-border); vertical-align: middle; }
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr:hover td { background: var(--color-bg-page); }
.table__link { font-weight: var(--font-weight-bold); color: var(--color-text); text-decoration: none; }
.table__link:hover { color: var(--color-primary); text-decoration: underline; text-underline-offset: 3px; }
.table__sub { margin-top: 2px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.table__strong { font-weight: var(--font-weight-bold); }
.table__nowrap { white-space: nowrap; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.table__num { text-align: right; font-variant-numeric: tabular-nums; }
.table__empty { padding: 32px 24px; text-align: center; color: var(--color-text-secondary); }
.pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}
.pill--ok { background: var(--color-success-surface); color: var(--color-success-text); }

.apis { display: grid; }
.api {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: 14px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.api:last-child { border-bottom: 0; }
.standards__note { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); max-width: 72em; }

@media (max-width: 1024px) {
  .status { grid-template-columns: 1fr; }
  .status__numbers { flex-wrap: wrap; gap: 16px 24px; }
}
@media (max-width: 600px) {
  .api { flex-direction: column; align-items: flex-start; gap: 8px; padding: 14px 16px; }
  .card__title { padding: 14px 16px; }
}
</style>
