<!--
  검토 요약 — 담당자가 답을 찾는 세 질문 순서로 보여 준다.
  1) 무엇부터 봐야 하나: 다음 행동별 문구 수 가로 막대(누르면 아래 목록이 그 행동만 보인다)
  2) 어떤 자료가 필요한가: 문구마다 반복되던 자료 요청을 자료 종류별 한 줄로 묶는다
  3) 무엇을 분석하지 못했나: 조회 실패와 끝까지 읽지 못한 구간
  처리 경로의 내부 상태값(complete, partial)은 그대로 쓰지 않는다.
-->
<script setup>
import { computed } from 'vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import { ACTION, ACTION_ORDER, materialsFor } from '@/shared/constants/reviewActions'
import { t } from '@/shared/i18n'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ActionChart from './ActionChart.vue'

const { review, version, result, violations, tiles, findingFor, actionOf, actionCounts, actionFilter, keepAllNotes, bulkProgress, hitl } =
  useReviewDetail()

const undecided = computed(() => violations.value.filter((v) => !v.finalResolution).length)
const files = computed(() => new Set(tiles.value.map((tile) => tile.fileId)).size)
const subtitle = computed(() =>
  [
    `${review.value.productName}, v${version.value.no}.`,
    tiles.value.length ? t('reviewDetail.summary.sections', { files: files.value, sections: tiles.value.length }) : '',
    t('reviewDetail.summary.progress', { done: violations.value.length - undecided.value, total: violations.value.length }),
  ].filter(Boolean).join(' '),
)
const partial = computed(() => ['text', 'visual'].some((path) => result.value?.pipelineStatus?.[path] !== 'complete'))
const materials = computed(() => {
  const counts = new Map()
  for (const v of violations.value) {
    if (v.finalResolution) continue
    for (const key of materialsFor(findingFor(v))) counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1])
})
const undecidedNotes = computed(() => violations.value.filter((v) => !v.finalResolution && actionOf(v) === ACTION.NOTE).length)
const canBulk = computed(() => undecidedNotes.value > 0 && (hitl.value?.status ?? 'pending') === 'pending')

function show(action) {
  actionFilter.value = action === 'all' || actionFilter.value === action ? 'all' : action
  document.getElementById('ad-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <BaseCard class="summary">
    <div class="summary__head">
      <h2>{{ $t('reviewDetail.summary.title') }}</h2>
      <p class="summary__sub">{{ subtitle }}</p>
    </div>

    <div class="summary__grid" :class="{ 'summary__grid--single': !materials.length && !partial && !actionCounts.hold }">
      <ActionChart :counts="actionCounts" :filter="actionFilter" @select="show" />
      <div v-if="materials.length || partial || actionCounts.hold" class="summary__side">
        <div v-if="materials.length" class="summary__block">
          <h3>{{ $t('reviewDetail.summary.materials') }}</h3>
          <ul>
            <li v-for="[key, count] in materials" :key="key">
              {{ $t(`reviewActions.material.${key}`) }} <span>{{ $t('reviewDetail.summary.phrases', { count }) }}</span>
            </li>
          </ul>
        </div>

        <div v-if="partial || actionCounts.hold" class="summary__block summary__block--warning">
          <h3>{{ $t('reviewDetail.summary.unanalyzed') }}</h3>
          <p v-if="actionCounts.hold">{{ $t('reviewDetail.summary.holdCount', { count: actionCounts.hold }) }}</p>
          <p v-if="partial">{{ $t('reviewDetail.summary.partial') }}</p>
        </div>
      </div>
    </div>

    <div v-if="canBulk" class="summary__bulk">
      <BaseButton variant="outline" size="sm" :busy="Boolean(bulkProgress)" @click="keepAllNotes">
        {{ bulkProgress ? $t('reviewActions.bulkKeepBusy', bulkProgress) : $t('reviewActions.bulkKeep', { count: undecidedNotes }) }}
      </BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.summary__sub {
  margin-top: var(--space-2xs);
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.summary__grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  gap: var(--space-lg);
  align-items: start;
}
.summary__grid--single { grid-template-columns: minmax(0, 1fr); }
.summary__side { display: flex; flex-direction: column; gap: var(--space-sm); }
.summary__block {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-bg-page);
  font-size: var(--font-size-body-s);
}
.summary__block h3 {
  margin-bottom: var(--space-2xs);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.summary__block ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
  padding-left: var(--space-lg);
  list-style: disc;
}
.summary__block li span {
  color: var(--color-text-secondary);
}
.summary__block--warning h3 {
  color: var(--color-warning-text);
}
@media (max-width: 900px) {
  /* 1fr은 내용(그래프 캔버스) 너비 아래로 줄어들지 않아 좁은 화면에서 페이지를 밀어낸다 */
  .summary__grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
