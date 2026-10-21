<!--
  타일별 검토(result.tiles가 있는 최신 버전의 이미지 결과). 확인 항목이 있는 타일만 위에서부터
  [타일 이미지 | 그 타일의 문구 카드와 사진 항목] 줄로 보여 준다. 번호와 미결정 건수는 전체 기준이다.
-->
<script setup>
import { computed } from 'vue'
import { legalSearch } from '@/shared/constants/legal'
import { t } from '@/shared/i18n'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from '../violation-review/ViolationCard.vue'
import TileFileGroup from './TileFileGroup.vue'
import VisualItem from './VisualItem.vue'

const { review, tiles, violations, findingFor, hitl, result } = useReviewDetail()

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
const description = computed(() => t('reviewDetail.list.description', { summary: legalSearch(result.value).summary }))

// 이미지 결과는 타일이 원본을 빈틈없이 덮어 tileId가 비지 않는다. 비정상 데이터라도 항목이 사라지지 않게 따로 모은다.
const tileIds = computed(() => new Set(tiles.value.map((tile) => tile.id)))
const unassignedCards = computed(() =>
  violations.value
    .map((violation, i) => ({ violation, finding: findingFor(violation), number: i + 1 }))
    .filter((row) => !tileIds.value.has(row.finding?.tileId)),
)
const unassignedVisual = computed(() => visualFindings.value.filter((f) => !tileIds.value.has(f.tileId)))
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
