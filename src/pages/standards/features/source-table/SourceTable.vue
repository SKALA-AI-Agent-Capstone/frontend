<!-- 참조 기준 출처, 버전, 적용범위, 업데이트 주기 (NFR-6, 11) -->
<script setup>
import { computed } from 'vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import { RULES } from '@/shared/data/rules.data'
import { ARTICLES, SOURCE_TYPE_LABEL, STANDARD_SOURCES } from '@/shared/data/standards.data'
import { formatDate } from '@/shared/utils/format'

const rows = computed(() =>
  STANDARD_SOURCES.map((source) => {
    const articles = Object.values(ARTICLES).filter((a) => a.sourceId === source.id)
    return {
      ...source,
      articleCount: articles.length,
      ruleCount: RULES.filter((r) => r.basis.some((b) => b.sourceId === source.id)).length,
      missingOriginals: articles.filter((a) => !a.original).length,
    }
  }),
)
</script>

<template>
  <div class="table-wrap">
    <table class="sources">
      <caption class="sr-only">참조 기준 목록</caption>
      <thead>
        <tr>
          <th scope="col">구분</th>
          <th scope="col">기준명</th>
          <th scope="col">버전</th>
          <th scope="col">개정일</th>
          <th scope="col">적용 범위</th>
          <th scope="col">업데이트 주기</th>
          <th scope="col">최종 동기화</th>
          <th scope="col" class="sources__num">조항 ,  규칙</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td><BaseBadge variant="secondary">{{ SOURCE_TYPE_LABEL[row.type] }}</BaseBadge></td>
          <td>
            <strong>{{ row.name }}</strong>
            <p class="sources__sub">{{ row.id }}<template v-if="row.isDemo"> ,  데모 데이터</template></p>
          </td>
          <td>{{ row.version }}</td>
          <td>{{ formatDate(row.revisedAt) }}</td>
          <td>{{ row.scope }}</td>
          <td>{{ row.updateCycle }}</td>
          <td>{{ formatDate(row.syncedAt) }}</td>
          <td class="sources__num">
            {{ row.articleCount }} ,  {{ row.ruleCount }}
            <p v-if="row.missingOriginals" class="sources__warn">원문 미등록 {{ row.missingOriginals }}</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.sources {
  width: 100%;
  min-width: 96rem;
  border-collapse: collapse;
  font-size: var(--font-size-body-s);
}
.sources th,
.sources td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
  text-align: left;
  vertical-align: top;
}
.sources th {
  background: var(--color-bg-page);
  font-size: var(--font-size-label-s);
  white-space: nowrap;
}
.sources .sources__num {
  text-align: right;
}
.sources__sub {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.sources__warn {
  font-size: var(--font-size-detail-s);
  color: var(--color-warning-text);
}
</style>
