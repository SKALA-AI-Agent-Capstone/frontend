<!--
  타일별 검토(result.tiles가 있는 최신 버전의 이미지 결과). 확인 항목이 있는 타일만 위에서부터
  [타일 이미지 | 그 타일의 문구 카드와 사진 항목] 줄로 보여 준다. 번호와 미결정 건수는 전체 기준이다.
-->
<script setup>
import { computed } from 'vue'
import { legalSearch } from '@/shared/constants/legal'
import { ACTION_ORDER } from '@/shared/constants/reviewActions'
import { t } from '@/shared/i18n'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from '../violation-review/ViolationCard.vue'
import TileFileGroup from './TileFileGroup.vue'
import VisualItem from './VisualItem.vue'

const { review, tiles, violations, findingFor, hitl, result, actionFilter, actionCounts, actionOf, tileOf } = useReviewDetail()

const groups = computed(() => {
  const byFile = new Map()
  for (const tile of tiles.value) {
    if (!byFile.has(tile.fileId)) byFile.set(tile.fileId, { fileId: tile.fileId, fileName: tile.fileName, tiles: [] })
    byFile.get(tile.fileId).tiles.push(tile)
  }
  return [...byFile.values()]
})

const visualFindings = computed(() => result.value?.visualFindings ?? [])
const undecidedCount = computed(() => violations.value.filter((v) => !v.finalResolution).length)
// 법령 검색이 정상이면 안내 한 줄로 충분하다. 검색이 안 된 경우에만 상태 문구를 덧붙인다.
const description = computed(() => [t('reviewDetail.tiles.howTo'),
  result.value?.retrievalStatus === 'connected' ? '' : legalSearch(result.value).summary].filter(Boolean).join(' '))

// 이미지 결과는 타일이 원본을 빈틈없이 덮어 tileId가 비지 않는다. 비정상 데이터라도 항목이 사라지지 않게 따로 모은다.
const tileIds = computed(() => new Set(tiles.value.map((tile) => tile.id)))
const unassignedCards = computed(() =>
  violations.value
    .map((violation, i) => ({ violation, finding: findingFor(violation), number: i + 1 }))
    .filter((row) => !tileIds.value.has(tileOf(row.finding)))
    .filter((row) => actionFilter.value === 'all' || actionOf(row.violation) === actionFilter.value),
)
const unassignedVisual = computed(() => (actionFilter.value === 'all' ? visualFindings.value.filter((f) => !tileIds.value.has(f.tileId)) : []))
</script>

<template>
  <section id="ad-viewer" class="tile-review" aria-labelledby="tile-review-heading">
    <BaseSectionHeader
      :title="$t('reviewDetail.tiles.title')"
      heading-id="tile-review-heading"
      size="md"
      icon="view_agenda"
      :description="description"
    >
      {{ $t('reviewDetail.tiles.total', { text: violations.length, visual: visualFindings.length }) }}
    </BaseSectionHeader>

    <BaseAlert v-if="hitl?.autoApproved" variant="success" icon="check_circle" :title="$t('reviewDetail.list.autoTitle')">
      {{ $t('reviewDetail.list.autoText') }}
    </BaseAlert>
    <BaseAlert v-else-if="undecidedCount > 0" variant="warning" icon="hourglass_empty">
      {{ $t('reviewDetail.list.undecided', { count: undecidedCount }) }}
    </BaseAlert>
    <div v-if="violations.length" class="tile-review__filters" role="group" :aria-label="$t('reviewActions.filter.label')">
      <button type="button" :aria-pressed="actionFilter === 'all'" @click="actionFilter = 'all'">
        {{ $t('reviewActions.filter.all', { count: violations.length }) }}
      </button>
      <button
        v-for="action in ACTION_ORDER"
        :key="action"
        type="button"
        :class="`tile-review__filter--${action}`"
        :aria-pressed="actionFilter === action"
        :disabled="!actionCounts[action]"
        @click="actionFilter = action"
      >
        {{ $t(`reviewActions.label.${action}`) }} {{ actionCounts[action] }}
      </button>
    </div>

    <p v-if="!violations.length && !visualFindings.length" class="tile-review__note">{{ $t('reviewDetail.tiles.empty') }}</p>

    <TileFileGroup
      v-for="group in groups"
      :key="group.fileId"
      :review-id="review.id"
      :file-id="group.fileId"
      :file-name="group.fileName"
      :tiles="group.tiles"
    />

    <section v-if="unassignedCards.length || unassignedVisual.length" class="tile-review__unassigned">
      <h3>{{ $t('reviewDetail.tiles.unassignedTitle') }}</h3>
      <ViolationCard
        v-for="card in unassignedCards"
        :key="card.violation.id"
        :violation="card.violation"
        :finding="card.finding"
        :number="card.number"
      />
      <VisualItem v-for="item in unassignedVisual" :key="item.id" :item="item" />
    </section>
  </section>
</template>

<style scoped>
.tile-review {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  scroll-margin-top: var(--space-5xl);
}
.tile-review :deep(.section-header) {
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
}
.tile-review__filters {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: var(--space-xs) 0;
  background: var(--color-bg-page);
}
.tile-review__filters button {
  min-height: var(--touch-target, 36px);
  padding: 0 var(--space-md);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  font-size: var(--font-size-label-s);
  cursor: pointer;
}
.tile-review__filters button[aria-pressed='true'] {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  font-weight: var(--font-weight-bold);
}
.tile-review__filters button:disabled {
  opacity: 0.45;
  cursor: default;
}
.tile-review__note {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.tile-review__unassigned {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding-top: var(--space-xl);
  border-top: var(--border-width) solid var(--color-border);
}
.tile-review__unassigned h3 {
  font-size: var(--font-size-title-s, var(--font-size-label-m));
  font-weight: var(--font-weight-bold);
}
</style>
