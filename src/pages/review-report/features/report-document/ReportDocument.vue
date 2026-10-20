<!-- 검토 결과 리포트 본문 (FR-9) — 위반 문구,근거,리라이트,증빙 대조,특허,승인 이력 -->
<script setup>
import {
  APPROVAL_LABEL,
  CLAIM_LABEL,
  DOC_TYPE_LABEL,
  PATENT_MATCH_LABEL,
  PATENT_STATUS_LABEL,
  SEVERITY_LABEL,
} from '@/shared/constants/review'
import { rewriteLabel } from '@/shared/api/engine/detect'
import { SITE } from '@/shared/constants/site'
import { formatDate, formatDateTime } from '@/shared/utils/format'

defineProps({
  review: { type: Object, required: true },
  version: { type: Object, required: true },
})
</script>

<template>
  <article class="report">
    <header class="report__header">
      <p class="report__service">{{ SITE.serviceName }} , 검토 결과 리포트</p>
      <h1 class="report__title">{{ review.productName }}</h1>
      <dl class="report__meta">
        <div><dt>검토 번호</dt><dd>{{ review.id }} , v{{ version.no }}</dd></div>
        <div><dt>작성자</dt><dd>{{ version.authorName }}</dd></div>
        <div><dt>분석 완료</dt><dd>{{ formatDateTime(version.result.analyzedAt) }}</dd></div>
        <div><dt>승인 상태</dt><dd>{{ APPROVAL_LABEL[version.approval.state].label }}</dd></div>
      </dl>
      <p class="report__notice">
        법령 검색은 미연결 상태입니다. 적법 여부를 판단하지 않은 예비검토 리포트입니다. 게재 여부의 최종 판단과 책임은 승인 담당자에게 있습니다.
      </p>
    </header>

    <section>
      <h2>1. 검토 원문</h2>
      <div v-for="(t, i) in version.result.texts.filter((x) => x.text?.trim())" :key="i" class="report__text">
        <p class="report__label">{{ t.location.kind === 'copy' ? '광고 카피' : t.location.fileName }}{{ t.mock ? ' (목업 OCR)' : '' }}</p>
        <p>{{ t.text }}</p>
      </div>
    </section>

    <section>
      <h2>2. 확인할 문구 ({{ version.result.findings.length }}건)</h2>
      <table class="report__table">
        <thead>
          <tr><th>#</th><th>문구</th><th>판정</th><th>근거 (출처 , 버전)</th><th>대체 표현</th></tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in version.result.findings" :key="f.id">
            <td>{{ i + 1 }}</td>
            <td><strong>"{{ f.phrase }}"</strong><br />{{ f.category }}</td>
            <td>{{ SEVERITY_LABEL[f.severity].label }}<template v-if="f.escalation"><br />↑ {{ f.escalation.reason }}</template></td>
            <td>
              <p v-if="!f.basis.length">법령 근거 미연결, {{f.reason}}</p>
              <p v-for="(b, j) in f.basis" :key="j">{{ b.sourceName }} {{ b.article }} ({{ b.version }}) — {{ b.plain }}</p>
            </td>
            <td><p v-for="(r, j) in f.rewrites" :key="j">{{ rewriteLabel(r) }}<template v-if="r.note"> — {{ r.note }}</template></p></td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>3. 증빙 대조</h2>
      <ul>
        <li v-for="(flag, i) in version.result.evidence.flags" :key="i">[{{ SEVERITY_LABEL[flag.severity].short }}] {{ flag.message }}</li>
        <li v-if="!version.result.evidence.flags.length">증빙 자동 대조가 완료됐다는 뜻은 아닙니다. 추출 상태와 담당자 확인이 필요합니다.</li>
      </ul>
      <p class="report__label">주장별 필요 서류</p>
      <ul>
        <li v-for="req in version.result.evidence.requirements" :key="req.claimType">
          {{ CLAIM_LABEL[req.claimType] }}:
          <template v-if="req.prohibited">증빙 불가 표현 (수정 필요)</template>
          <template v-else>{{ req.docs.map((d) => `${d.label} ${d.provided ? '제출' : '미제출'}`).join(', ') }}</template>
        </li>
      </ul>
      <p class="report__label">제출 서류</p>
      <ul>
        <li v-for="doc in version.input.evidence" :key="doc.id">{{ DOC_TYPE_LABEL[doc.docType] }} — {{ doc.name }}</li>
        <li v-if="!version.input.evidence.length">없음</li>
      </ul>
      <p>공공데이터 교차검증: {{ version.result.publicData.status }} {{ version.result.publicData.reportNo ? `(${version.result.publicData.reportNo})` : '' }}</p>
    </section>

    <section>
      <h2>4. 특허 확인</h2>
      <ul>
        <li v-for="p in version.result.patents" :key="p.id">
          {{ p.confirmedNumber ?? p.number }} — {{ PATENT_STATUS_LABEL[p.status].label }}
          <template v-if="p.match"> , {{ PATENT_MATCH_LABEL[p.match.verdict || 'unknown'].label }}: {{ p.match.summary }}</template>
          <template v-if="p.checkedAt"> (출처 {{ p.source ?? '-' }}, {{ formatDateTime(p.checkedAt) }})</template>
        </li>
        <li v-if="!version.result.patents.length">추출된 특허번호 없음</li>
      </ul>
    </section>

    <section>
      <h2>사진 독립 검토</h2>
      <p>처리 상태: {{version.result.pipelineStatus?.visual}}</p>
      <p v-for="item in version.result.visualFindings" :key="item.id">{{item.location.fileName}} / {{item.location.page}}페이지: {{item.observation}} / {{item.concern}}</p>
      <p v-for="warning in version.result.warnings" :key="warning">{{warning}}</p>
    </section>
    <section>
      <h2>5. 승인 이력 (v{{ version.no }})</h2>
      <ul>
        <li v-for="(h, i) in version.approval.history" :key="i">
          {{ formatDateTime(h.at) }} {{ h.by }} — {{ APPROVAL_LABEL[h.action].label }}{{ h.comment ? `: ${h.comment}` : '' }}
        </li>
        <li v-if="!version.approval.history.length">처리 이력 없음</li>
      </ul>
    </section>

    <footer class="report__footer">
      적용 기준: {{ version.result.standardsSnapshot.map((s) => `${s.name} ${s.version}(${formatDate(s.revisedAt)})`).join(' / ') || '미연결, 적용 법령 버전을 확정하지 않았습니다.' }}
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
.report__text {
  margin-bottom: var(--space-sm);
}
.report__label {
  margin-top: var(--space-sm);
  font-weight: var(--font-weight-bold);
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
