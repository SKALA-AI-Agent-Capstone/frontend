<!--
  검토 요약 — 담당자가 답을 찾는 세 질문 순서로 보여 준다.
  1) 무엇부터 봐야 하나: 다음 행동별 문구 수(누르면 아래 목록이 그 행동만 보인다)
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
  actionFilter.value = actionFilter.value === action ? 'all' : action
  document.getElementById('ad-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <BaseCard class="summary">
    <div class="summary__head">
      <h2>{{ $t('reviewDetail.summary.title') }}</h2>
      <p class="summary__sub">{{ subtitle }}</p>
    </div>

    <div class="summary__actions">
      <button
        v-for="action in ACTION_ORDER"
        :key="action"
        type="button"
        class="summary__action"
        :class="[`summary__action--${action}`, { 'summary__action--on': actionFilter === action }]"
        :aria-pressed="actionFilter === action"
        @click="show(action)"
      >
        <span class="summary__action-label">{{ $t(`reviewActions.label.${action}`) }}</span>
        <strong>{{ actionCounts[action] }}</strong>
        <span class="summary__action-hint">{{ $t(`reviewActions.hint.${action}`) }}</span>
      </button>
    </div>

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
.summary__actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-sm);
}
.summary__action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2xs);
  padding: var(--space-sm) var(--space-md);
  border: var(--border-width) solid var(--color-border);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  text-align: left;
  cursor: pointer;
}
.summary__action strong {
  font-size: var(--font-size-title-m);
}
.summary__action-label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.summary__action-hint {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.summary__action--revise { border-left-color: var(--color-danger-text); }
.summary__action--evidence { border-left-color: var(--color-warning-text); }
.summary__action--hold { border-left-color: var(--color-text-secondary); }
.summary__action--note { border-left-color: var(--color-info-text); }
.summary__action--on {
  outline: var(--border-width-strong) solid var(--color-primary);
  background: var(--color-primary-subtle);
}
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
@media (max-width: 720px) {
  .summary__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
