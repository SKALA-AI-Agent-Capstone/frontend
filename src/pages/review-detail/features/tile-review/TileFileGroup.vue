<!--
  한 원본 이미지의 타일별 검토 줄. 왼쪽은 원본을 타일 region만큼 CSS로 자른 이미지(타일 픽셀은 저장하지 않음),
  오른쪽은 그 타일의 문구 카드와 사진 항목이다. 왼쪽은 줄 안에서 sticky라 오른쪽 항목을 넘기는 동안 고정되고
  다음 타일 줄로 넘어가면 다음 타일로 바뀐다.
  노랑 형광펜은 읽은 광고 문구 전체(result.texts, 제품 표면 글자는 Agent가 이미 뺌)이고 누를 수 없다.
  빨강 형광펜은 문구 카드가 가리키는 문제 글자다. 문제 글자 좌표(problemSpan.bbox)가 없으면 문구 줄 좌표를 쓴다.
  좌표가 없는 문구는 박스 없이 센다.
-->
<script setup>
import { computed, ref, toRef } from 'vue'
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
      const place = ([bx0, by0, bx1, by1]) => {
        const top = clamp((by0 - y0) / h)
        const left = clamp((bx0 - x0) / w)
        return { top: pct(top), left: pct(left), height: pct(clamp((by1 - y0) / h) - top), width: pct(clamp((bx1 - x0) / w) - left) }
      }
      const marks = (result.value?.texts ?? [])
        .filter((t) => t.location?.tileId === tile.id && Array.isArray(t.location?.bbox))
        .map((t) => ({ id: t.id, style: place(t.location.bbox) }))
      const boxes = findings.value
        .filter((f) => tileOf(f) === tile.id && (Array.isArray(f.problemSpan?.bbox) || Array.isArray(f.location?.bbox)))
        .map((f) => ({
          id: f.id,
          number: violationNumbers.value.get(f.id) ?? null,
          tone: decidedFindingIds.value.has(f.id) ? 'success' : 'problem',
          style: place(f.problemSpan?.bbox ?? f.location.bbox),
        }))
      // 화면 높이 안에 타일 전체가 들어오도록 폭을 줄인다(sticky로 고정해도 잘리지 않게).
      const ratio = natural.value ? (natural.value.width * w) / (natural.value.height * h) : 3 / 4
      return {
        tile,
        number: position + 1,
        cards,
        notes,
        visual,
        marks,
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
        <div
          class="tile-row__frame"
          :class="{ 'tile-row__frame--focus': row.boxes.some((box) => box.id === activeFindingId) }"
          :style="row.frameStyle"
        >
          <!-- 이미지만 잘라 내는 층. 번호 표시는 바깥 층에 두어 가장자리에서 잘리지 않는다 -->
          <div class="tile-row__clip">
            <img v-if="url" :src="url" alt="" class="tile-row__image" :style="row.imageStyle" @load="onLoad" />
            <p v-else-if="!error" class="tile-row__loading">{{ $t('reviewDetail.tiles.loading') }}</p>
          </div>
          <span v-for="mark in row.marks" :key="mark.id" class="tile-row__mark" :style="mark.style" aria-hidden="true" />
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
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-border);
}
.tile-row__clip {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
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
/* 하이라이트: 사각 테두리 대신 형광펜처럼 옅게 칠하고 아래에 굵은 밑줄을 그어 문구를 짚는다 */
.tile-row__box {
  --tone: var(--color-info);
  position: absolute;
  padding: 0;
  border: 0;
  border-bottom: 3px solid var(--tone);
  border-radius: 4px 4px 2px 2px;
  background: color-mix(in srgb, var(--tone) 18%, transparent);
  cursor: pointer;
  transition: background-color var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast);
}
/* 읽은 광고 문구 전체: 노랑 형광펜. 문제 글자 박스 아래에 깔리고 누를 수 없다 */
.tile-row__mark {
  position: absolute;
  border-radius: 3px;
  background: rgba(255, 214, 0, 0.28);
  pointer-events: none;
}
.tile-row__box--problem { --tone: var(--color-danger); }
.tile-row__box--success { --tone: var(--color-success); }
.tile-row__box:hover,
.tile-row__box--active {
  z-index: 1;
  background: color-mix(in srgb, var(--tone) 30%, transparent);
  box-shadow: 0 0 0 2px var(--tone), 0 0 0 5px color-mix(in srgb, var(--tone) 22%, transparent);
}
.tile-row__box:focus-visible { outline: var(--focus-ring); outline-offset: 3px; }
/* 한 문구를 고르면 같은 구간의 다른 하이라이트는 흐리게 둔다 */
.tile-row__frame--focus .tile-row__box:not(.tile-row__box--active):not(:hover) { opacity: 0.55; }
.tile-row__box-no {
  position: absolute;
  top: 50%;
  left: 0;
  display: grid;
  place-items: center;
  min-width: 2.2rem;
  height: 2.2rem;
  padding: 0 0.5rem;
  border: 2px solid var(--color-bg-surface);
  border-radius: var(--radius-full);
  background: var(--tone);
  color: #fff;
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  /* 문구 왼쪽 바깥에 붙여 글자를 가리지 않는다 */
  transform: translate(calc(-100% - 4px), -50%);
}
.tile-row__box--active .tile-row__box-no { transform: translate(calc(-100% - 4px), -50%) scale(1.12); }
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
