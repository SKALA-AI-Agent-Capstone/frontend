<!--
  한 원본 이미지의 타일별 검토 줄. 왼쪽은 원본을 타일 region만큼 CSS로 자른 이미지(타일 픽셀은 저장하지 않음),
  오른쪽은 그 타일의 문구 카드와 사진 항목이다. 왼쪽은 줄 안에서 sticky라 오른쪽 항목을 넘기는 동안 고정되고
  다음 타일 줄로 넘어가면 다음 타일로 바뀐다.
  박스는 OCR이나 PDF 문자에서 얻은 줄 좌표(bbox)가 있는 문구에만 그린다. bbox가 없는 Vision 결과는 박스 없이 센다.
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { SEVERITY } from '@/shared/constants/review'
import { useAssetImage } from '@/shared/composables/useAssetImage'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseDisclosure from '@/shared/components/base/BaseDisclosure.vue'
import { ACTION, ACTION_ORDER } from '@/shared/constants/reviewActions'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViolationCard from '../violation-review/ViolationCard.vue'
import VisualItem from './VisualItem.vue'

const props = defineProps({
  reviewId: { type: String, required: true },
  fileId: { type: String, required: true },
  fileName: { type: String, default: '' },
  tiles: { type: Array, required: true },
})

const { findings, result, violations, findingFor, activeFindingId, focusFinding, violationNumbers, decidedFindingIds, actionOf, actionFilter, tileOf } =
  useReviewDetail()
const { url, error } = useAssetImage(toRef(props, 'reviewId'), toRef(props, 'fileId'))
const natural = ref(null)

function onLoad(event) {
  if (!natural.value) natural.value = { width: event.target.naturalWidth, height: event.target.naturalHeight }
}

const pct = (value) => `${(value * 100).toFixed(4)}%`
const clamp = (value) => Math.min(1, Math.max(0, value))

const rows = computed(() =>
  props.tiles
    .map((tile, position) => {
      const [x0, y0, x1, y1] = tile.region
      const w = x1 - x0
      const h = y1 - y0
      // 구간 안에서는 해야 할 일이 큰 순서(수정 권고, 자료 확인, 보류)로 놓고, 표현 참고는 접어 둔다.
      const all = violations.value
        .map((violation, i) => ({ violation, finding: findingFor(violation), number: i + 1, action: actionOf(violation) }))
        .filter((row) => tileOf(row.finding) === tile.id)
        .filter((row) => actionFilter.value === 'all' || row.action === actionFilter.value)
        .sort((a, b) => ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action) || a.number - b.number)
      const cards = all.filter((row) => row.action !== ACTION.NOTE || actionFilter.value === ACTION.NOTE)
      const notes = all.filter((row) => row.action === ACTION.NOTE && actionFilter.value !== ACTION.NOTE)
      const visual = actionFilter.value === 'all' ? (result.value?.visualFindings ?? []).filter((f) => f.tileId === tile.id) : []
      const boxes = findings.value
        .filter((f) => tileOf(f) === tile.id && Array.isArray(f.location?.bbox))
        .map((f) => {
          const [bx0, by0, bx1, by1] = f.location.bbox
          const top = clamp((by0 - y0) / h)
          const left = clamp((bx0 - x0) / w)
          return {
            id: f.id,
            number: violationNumbers.value.get(f.id) ?? null,
            tone: decidedFindingIds.value.has(f.id) ? 'success' : (f.severity ?? SEVERITY.LOW),
            style: {
              top: pct(top),
              left: pct(left),
              height: pct(clamp((by1 - y0) / h) - top),
              width: pct(clamp((bx1 - x0) / w) - left),
            },
          }
        })
      // 화면 높이 안에 타일 전체가 들어오도록 폭을 줄인다(sticky로 고정해도 잘리지 않게).
      const ratio = natural.value ? (natural.value.width * w) / (natural.value.height * h) : 3 / 4
      return {
        tile,
        number: position + 1,
        cards,
        notes,
        visual,
        boxes,
        frameStyle: { aspectRatio: String(ratio), width: `min(100%, calc((100vh - 6rem) * ${ratio}))` },
        imageStyle: { left: pct(-x0 / w), top: pct(-y0 / h), width: pct(1 / w) },
      }
    })
    // 확인 항목이 있는 타일만 보여 준다.
    .filter((row) => row.cards.length + row.notes.length + row.visual.length > 0),
)
</script>

<template>
  <section class="tile-group" :aria-label="fileName">
    <p v-if="error" class="tile-group__status">{{ $t('reviewDetail.tiles.imageError') }}</p>

    <article
      v-for="row in rows"
      :id="`tile-${row.tile.id}`"
      :key="row.tile.id"
      class="tile-row"
    >
      <div class="tile-row__media">
        <header class="tile-row__head">
          <p class="tile-row__name">
            <span class="tile-row__index">{{ $t('reviewDetail.tiles.section', { n: row.number }) }}</span>
            <strong v-if="row.tile.title">{{ row.tile.title }}</strong>
          </p>
          <BaseBadge v-if="row.cards.length + row.notes.length" variant="danger">{{ $t('reviewDetail.tiles.textCount', { count: row.cards.length + row.notes.length }) }}</BaseBadge>
          <BaseBadge v-if="row.visual.length" variant="warning">{{ $t('reviewDetail.tiles.visualCount', { count: row.visual.length }) }}</BaseBadge>
        </header>
        <div class="tile-row__frame" :style="row.frameStyle">
          <img v-if="url" :src="url" alt="" class="tile-row__image" :style="row.imageStyle" @load="onLoad" />
          <p v-else-if="!error" class="tile-row__loading">{{ $t('reviewDetail.tiles.loading') }}</p>
          <button
            v-for="box in row.boxes"
            :key="box.id"
            type="button"
            class="tile-row__box"
            :class="[`tile-row__box--${box.tone}`, { 'tile-row__box--active': activeFindingId === box.id }]"
            :style="box.style"
            :aria-label="$t('reviewDetail.tiles.boxLabel', { n: box.number ?? '' })"
            @click="focusFinding(box.id)"
          >
            <span v-if="box.number" class="tile-row__box-no">{{ box.number }}</span>
          </button>
        </div>
      </div>

      <div class="tile-row__items">
        <ViolationCard
          v-for="card in row.cards"
          :key="card.violation.id"
          :violation="card.violation"
          :finding="card.finding"
          :number="card.number"
        />
        <BaseDisclosure v-if="row.notes.length" :label="$t('reviewActions.notes', { count: row.notes.length })" class="tile-row__notes">
          <div class="tile-row__note-list">
            <ViolationCard
              v-for="card in row.notes"
              :key="card.violation.id"
              :violation="card.violation"
              :finding="card.finding"
              :number="card.number"
            />
          </div>
        </BaseDisclosure>
        <template v-if="row.visual.length">
          <p class="tile-row__photo-title">{{ $t('reviewActions.photo') }}</p>
          <VisualItem v-for="item in row.visual" :key="item.id" :item="item" />
        </template>
      </div>
    </article>
  </section>
</template>

<style scoped>
.tile-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}
.tile-group__status {
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.tile-row {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: var(--layout-gutter);
  padding-top: var(--space-xl);
  border-top: var(--border-width) solid var(--color-border);
  scroll-margin-top: var(--space-md);
}
.tile-row__media {
  position: sticky;
  top: var(--space-md);
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.tile-row__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
}
.tile-row__note-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.tile-row__photo-title {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.tile-row__name {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  width: 100%;
  font-size: var(--font-size-label-m, var(--font-size-label-s));
}
.tile-row__index {
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
.tile-row__frame {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-muted);
}
.tile-row__image {
  position: absolute;
  max-width: none;
  height: auto;
  user-select: none;
}
.tile-row__loading {
  padding: var(--space-md);
  font-size: var(--font-size-detail-m);
  color: var(--color-text-secondary);
}
.tile-row__box {
  position: absolute;
  padding: 0;
  border: 2px solid var(--color-info-text);
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-info-text) 12%, transparent);
  cursor: pointer;
}
.tile-row__box--high { border-color: var(--color-danger-text); background: color-mix(in srgb, var(--color-danger-text) 14%, transparent); }
.tile-row__box--medium { border-color: var(--color-warning-text); background: color-mix(in srgb, var(--color-warning-text) 14%, transparent); }
.tile-row__box--success { border-color: var(--color-success); background: color-mix(in srgb, var(--color-success) 14%, transparent); }
.tile-row__box--active { box-shadow: 0 0 0 3px var(--color-primary); }
.tile-row__box-no {
  position: absolute;
  top: -0.7rem;
  left: -0.7rem;
  display: grid;
  place-items: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding: 0 0.25rem;
  border-radius: var(--radius-full);
  background: var(--color-text);
  color: var(--color-on-primary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}
.tile-row__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-width: 0;
}

@media (max-width: 1024px) {
  .tile-row {
    grid-template-columns: 1fr;
  }
  .tile-row__media {
    position: static;
  }
}
</style>
