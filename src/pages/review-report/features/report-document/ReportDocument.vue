<!-- 검토 결과 리포트 본문 (FR-9) — 위반 문구,근거,리라이트,증빙 대조,특허,사진 검토 -->
<script setup>
import { computed } from 'vue'
import {
  CLAIM_LABEL,
  DOC_TYPE_LABEL,
  PATENT_MATCH_LABEL,
  PATENT_STATUS_LABEL,
  SEVERITY_LABEL,
} from '@/shared/constants/review'
import { emptyBasisText, legalSearch } from '@/shared/constants/legal'
import { SITE } from '@/shared/constants/site'
import { formatDate, formatDateTime } from '@/shared/utils/format'
import { visibleVisualFindings } from '@/shared/utils/visualFindings'
import { t } from '@/shared/i18n'

function rewriteLabel(rewrite) {
  if (typeof rewrite === 'string') return rewrite
  if (rewrite.keep) return t('common.rewrite.keep')
  if (!rewrite.text) return t('common.rewrite.remove')
  return `"${rewrite.text}"`
}

const props = defineProps({
  review: { type: Object, required: true },
  version: { type: Object, required: true },
})

// violations는 항상 "최신 버전" 기준이다(재검토 버전 구조 없음) — 과거 버전 리포트에선 비워 둔다.
const isLatestVersion = computed(() => props.version.no === Math.max(...props.review.versions.map((v) => v.no)))
function violationFor(finding) {
  if (!isLatestVersion.value) return null
  return props.review.violations?.find((v) => v.findingId === finding.id) ?? null
}
function locationLabel(finding) {
  return finding.location?.kind === 'copy' ? t('reviewDetail.viewer.copy') : finding.location?.fileName ?? t('report.noLocation')
}
</script>

<template>
  <article class="report">
    <header class="report__header">
      <p class="report__service">{{ SITE.orgName }} {{ SITE.serviceName }}, {{ $t('report.heading') }}</p>
      <h1 class="report__title">{{ review.productName }}</h1>
      <dl class="report__meta">
        <div><dt>{{ $t('report.reviewNo') }}</dt><dd>{{ review.id }}, v{{ version.no }}</dd></div>
        <div><dt>{{ $t('report.author') }}</dt><dd>{{ version.authorName }}</dd></div>
        <div><dt>{{ $t('report.analyzedAt') }}</dt><dd>{{ formatDateTime(version.result.analyzedAt) }}</dd></div>
      </dl>
      <p class="report__notice">
        {{ legalSearch(version.result).reportNotice }} {{ $t('report.responsibility') }}
      </p>
    </header>

    <section>
      <h2>{{ $t('report.s1', { count: version.result.findings.length }) }}</h2>
      <div class="report__table-wrap"><table class="report__table">
        <thead>
          <tr><th>#</th><th>{{ $t('report.colPhrase') }}</th><th>{{ $t('report.colLocation') }}</th><th>{{ $t('report.colSeverity') }}</th><th>{{ $t('report.colBasis') }}</th><th>{{ $t('report.colDecision') }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in version.result.findings" :key="f.id">
            <td>{{ i + 1 }}</td>
            <td><strong>"{{ f.phrase }}"</strong></td>
            <td>{{ locationLabel(f) }}</td>
            <td>{{ SEVERITY_LABEL[f.severity].label }}<template v-if="f.escalation"><br />↑ {{ f.escalation.reason }}</template></td>
            <td>
              <p v-if="!f.basis.length">{{ emptyBasisText(f, version.result) }} {{ f.reason }}</p>
              <p v-for="(b, j) in f.basis" :key="j">{{ b.sourceName }} {{ b.article }} ({{ b.version }}) — {{ b.plain }}</p>
            </td>
            <td>
              <template v-if="violationFor(f)?.finalResolution">
                {{ violationFor(f).finalText }}
                <br /><span class="report__label">{{ violationFor(f).decidedByName ?? $t('reviewDetail.revision.system') }}, {{ formatDateTime(violationFor(f).decidedAt) }}</span>
              </template>
              <template v-else-if="violationFor(f)">
                {{ $t('report.undecided', { suggestion: violationFor(f).rewriteSuggestion ?? $t('report.none') }) }}
              </template>
              <template v-else>
                <p v-for="(r, j) in f.rewrites" :key="j">{{ rewriteLabel(r) }}<template v-if="r.note"> — {{ r.note }}</template></p>
              </template>
            </td>
          </tr>
        </tbody>
      </table></div>
    </section>

    <section>
      <h2>{{ $t('report.s2') }}</h2>
      <ul>
        <li v-for="(flag, i) in version.result.evidence.flags" :key="i">[{{ SEVERITY_LABEL[flag.severity].short }}] {{ flag.message }}</li>
        <li v-if="!version.result.evidence.flags.length">{{ $t('report.evidenceNotDone') }}</li>
      </ul>
      <p class="report__label">{{ $t('reviewDetail.evidence.required') }}</p>
      <ul>
        <li v-for="req in version.result.evidence.requirements" :key="req.claimType">
          {{ CLAIM_LABEL[req.claimType] }}:
          <template v-if="req.prohibited">{{ $t('report.prohibited') }}</template>
          <template v-else>{{ req.docs.map((d) => `${d.label} ${t(d.provided ? 'report.provided' : 'report.missing')}`).join(', ') }}</template>
        </li>
      </ul>
      <p class="report__label">{{ $t('reviewDetail.evidence.submitted') }}</p>
      <ul>
        <li v-for="doc in version.input.evidence" :key="doc.id">{{ DOC_TYPE_LABEL[doc.docType] }} — {{ doc.name }}</li>
        <li v-if="!version.input.evidence.length">{{ $t('report.none') }}</li>
      </ul>
      <p>{{ $t('report.publicData') }} {{ version.result.publicData.status }} {{ version.result.publicData.reportNo ? `(${version.result.publicData.reportNo})` : '' }}</p>
    </section>

    <section>
      <h2>{{ $t('report.s3') }}</h2>
      <ul>
        <li v-for="p in version.result.patents" :key="p.id">
          {{ p.confirmedNumber ?? p.number }} — {{ PATENT_STATUS_LABEL[p.data?.registerStatus === '소멸' ? 'expired' : p.status]?.label ?? p.status }}
          <template v-if="p.data?.title">, {{ p.data.title }}</template>
          <template v-if="p.match">, {{ PATENT_MATCH_LABEL[p.match.verdict || 'unknown'].label }}: {{ p.match.reason === '청구항 원문 미확보' ? $t('reviewDetail.patent.claimsUnavailable') : p.match.summary }}</template>
          <template v-if="p.checkedAt"> ({{ $t('report.patentSource', { source: p.source ?? '-', at: formatDateTime(p.checkedAt) }) }})</template>
        </li>
        <li v-if="!version.result.patents.length">{{ $t('report.noPatents') }}</li>
      </ul>
    </section>

    <section>
      <h2>{{ $t('reviewDetail.visual.title') }}</h2>
      <p>{{ $t('reviewDetail.visual.status', { status: version.result.pipelineStatus?.visual }) }}</p>
      <p v-for="item in visibleVisualFindings(version.result.visualFindings)" :key="item.id">{{ $t('reviewDetail.visual.location', { name: item.location.fileName, page: item.location.page }) }}: {{item.observation}} / {{item.concern}}</p>
      <p v-for="warning in version.result.warnings" :key="warning">{{warning}}</p>
    </section>

    <footer class="report__footer">
      {{ $t('report.standards') }} {{ version.result.standardsSnapshot.map((s) => `${s.name} ${s.version}(${formatDate(s.revisedAt)})`).join(' / ') || $t('report.noStandards') }}
    </footer>
  </article>
</template>

<style scoped>
.report {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--color-bg-surface);
  color: var(--color-text);
  font-size: var(--font-size-body-s);
}
.report h2 {
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: var(--border-width-strong) solid var(--color-text);
  font-size: var(--font-size-title-m);
}
.report ul {
  padding-left: var(--space-lg);
  list-style: disc;
}
.report__service {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.report__title {
  font-size: var(--font-size-heading-s);
}
.report__meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-sm);
  margin: var(--space-sm) 0;
}
.report__meta dt {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.report__meta dd {
  margin: 0;
  font-weight: var(--font-weight-bold);
}
.report__notice {
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--color-warning-border);
  background: var(--color-warning-surface);
}
.report__label {
  margin-top: var(--space-sm);
  font-weight: var(--font-weight-bold);
}
.report__table-wrap { overflow-x: auto; }
@media (max-width: 760px) {
  .report__table { min-width: 640px; }
  .report__meta { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.report__table {
  width: 100%;
  border-collapse: collapse;
}
.report__table th,
.report__table td {
  padding: var(--space-xs);
  border: var(--border-width) solid var(--color-border-strong);
  text-align: left;
  vertical-align: top;
}
.report__table th {
  background: var(--color-bg-muted);
}
.report__footer {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
