<!--
  한 원본 이미지의 타일별 검토 줄. 왼쪽은 원본을 타일 region만큼 CSS로 자른 이미지(타일 픽셀은 저장하지 않음),
  오른쪽은 그 타일의 문구 카드와 사진 항목이다. 왼쪽은 줄 안에서 sticky라 오른쪽 항목을 넘기는 동안 고정되고
  다음 타일 줄로 넘어가면 다음 타일로 바뀐다.
  왼쪽은 화면 높이에 맞춘 창이고, 구간 이미지는 창 폭에 맞춰 크게 보여 준다. 오른쪽에서 화면 가운데쯤 있는 카드의
  문구 위치가 창 가운데에 오도록 이미지를 위아래로 옮긴다(2026-10-23). 창보다 짧은 구간은 옮기지 않는다.
  노랑 형광펜은 읽은 광고 문구 전체(result.texts, 제품 표면 글자는 Agent가 이미 뺌)이고 누를 수 없다.
  빨강 형광펜은 문구 카드가 가리키는 문제 글자다. 문제 글자 좌표(problemSpan.bbox)가 없으면 문구 줄 좌표를 쓴다.
  좌표가 없는 문구는 박스 없이 센다.
-->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef } from 'vue'
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

// 줄마다 지금 읽고 있는 카드(화면 가운데에 가장 가까운 카드)의 문구 id
const readingByTile = ref({})
const group = ref(null)
let timer = 0
function updateReading() {
  timer = 0
  if (!group.value) return
  // 읽는 위치: 화면 위에서 40% 지점. 위쪽 필터와 아래쪽 버튼 막대를 뺀 가운데쯤이다.
  const line = window.innerHeight * 0.4
  const next = {}
  for (const row of group.value.querySelectorAll('.tile-row')) {
    let best = null
    // 카드 자체만 본다(카드 안 제목도 finding-…-title id를 쓴다). 접힌 표현 참고 카드는 높이가 0이라 빠진다.
    for (const card of row.querySelectorAll('.tile-row__items > [id^="finding-"], .tile-row__note-list > [id^="finding-"]')) {
      const box = card.getBoundingClientRect()
      if (!box.height || box.bottom < 0 || box.top > window.innerHeight) continue
      const distance = line < box.top ? box.top - line : line > box.bottom ? line - box.bottom : 0
      if (!best || distance < best.distance) best = { distance, id: card.id.slice('finding-'.length) }
    }
    if (best) next[row.dataset.tile] = best.id
  }
  if (Object.keys(next).some((key) => next[key] !== readingByTile.value[key])) readingByTile.value = { ...readingByTile.value, ...next }
}
// 스크롤마다 계산하지 않고 80ms에 한 번만 계산한다(화면이 가려져 있어도 동작하도록 타이머를 쓴다)
const schedule = () => { if (!timer) timer = setTimeout(updateReading, 80) }
onMounted(() => {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  schedule()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  if (timer) clearTimeout(timer)
})

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
      // 한 덩어리가 멀리 떨어진 항목을 묶은 경우(특허증의 번호와 날짜 표)에는 덩어리 전체 사각형이 사진까지 덮는다.
      // OCR 단어 위치가 있으면 단어마다 칠하고, 없을 때만 덩어리 사각형을 쓴다.
      const marks = (result.value?.texts ?? [])
        .filter((t) => t.location?.tileId === tile.id && Array.isArray(t.location?.bbox))
        .flatMap((t) => {
          const words = (t.words ?? []).filter((w) => Array.isArray(w.bbox))
          return words.length
            ? words.map((w, i) => ({ id: `${t.id}:${i}`, style: place(w.bbox) }))
            : [{ id: t.id, style: place(t.location.bbox) }]
        })
      const boxes = findings.value
        .filter((f) => tileOf(f) === tile.id && (Array.isArray(f.problemSpan?.bbox) || Array.isArray(f.location?.bbox)))
        .map((f) => ({
          id: f.id,
          number: violationNumbers.value.get(f.id) ?? null,
          tone: decidedFindingIds.value.has(f.id) ? 'success' : 'problem',
          style: place(f.problemSpan?.bbox ?? f.location.bbox),
        }))
      const ratio = natural.value ? (natural.value.width * w) / (natural.value.height * h) : 3 / 4
      // 지금 읽는 카드의 문구 세로 중심(구간 안 0~1). 문구 좌표가 없으면 구간 위쪽을 보여 준다.
      const reading = findings.value.find((f) => f.id === readingByTile.value[tile.id])
      const bbox = reading && (reading.problemSpan?.bbox ?? reading.location?.bbox)
      const center = Array.isArray(bbox) ? clamp(((bbox[1] + bbox[3]) / 2 - y0) / h) : 0
      return {
        tile,
        number: position + 1,
        cards,
        notes,
        visual,
        marks,
        boxes,
        frameStyle: { '--ratio': String(ratio), '--center': String(center) },
        imageStyle: { left: pct(-x0 / w), top: pct(-y0 / h), width: pct(1 / w) },
      }
    })
    // 확인 항목이 있는 타일만 보여 준다.
    .filter((row) => row.cards.length + row.notes.length + row.visual.length > 0),
)
</script>

<template>
  <section ref="group" class="tile-group" :aria-label="fileName">
    <p v-if="error" class="tile-group__status">{{ $t('reviewDetail.tiles.imageError') }}</p>

    <article
      v-for="row in rows"
      :id="`tile-${row.tile.id}`"
      :key="row.tile.id"
      :data-tile="row.tile.id"
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
          <!-- 구간 전체 크기의 층. 창 안에서 위아래로 옮겨 지금 읽는 문구를 가운데에 둔다 -->
          <div class="tile-row__canvas">
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
  /* 왼쪽 창: 위쪽 필터 막대(약 5.2rem) 아래에 붙고, 아래쪽 버튼 막대(약 8rem)에 가리지 않는 높이 */
  --window-h: calc(100vh - 22rem);
  container-type: inline-size;
  position: sticky;
  top: calc(5.2rem + var(--space-md));
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
  /* 구간이 창보다 짧으면 구간 높이, 길면 창 높이 */
  height: min(calc(100cqw / var(--ratio)), var(--window-h));
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 1px var(--color-border);
  /* 위아래만 자른다. 왼쪽 바깥의 번호 표시는 보이게 둔다 */
  overflow-x: visible;
  overflow-y: clip;
}
.tile-row__canvas {
  position: relative;
  width: 100%;
  aspect-ratio: var(--ratio);
  /* 문구 중심이 창 가운데에 오도록 옮기되, 구간 위아래 끝을 넘지 않는다 */
  transform: translateY(calc(-1 * clamp(0px,
    var(--center) * 100cqw / var(--ratio) - var(--window-h) / 2,
    max(0px, 100cqw / var(--ratio) - var(--window-h)))));
  transition: transform 350ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .tile-row__canvas { transition: none; }
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
  .tile-row__frame { height: auto; }
  .tile-row__canvas { transform: none; }
}
</style>
