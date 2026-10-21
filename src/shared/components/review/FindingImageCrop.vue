<script setup>
import { computed, ref, watch } from 'vue'
import { useAssetImage } from '@/shared/composables/useAssetImage'

const props = defineProps({
  reviewId: { type: String, required: true },
  assetId: { type: String, required: true },
  assetName: { type: String, default: '광고 이미지' },
  mime: { type: String, default: '' },
  focusRegion: { type: Array, default: null },
  focusLabel: { type: String, default: '분석 대상' },
})

function validRegion(box) {
  return Array.isArray(box) && box.length === 4 &&
    box.every((value) => typeof value === 'number' && Number.isFinite(value)) &&
    0 <= box[0] && box[0] < box[2] && box[2] <= 1 &&
    0 <= box[1] && box[1] < box[3] && box[3] <= 1
}

const focus = computed(() => validRegion(props.focusRegion) ? props.focusRegion : null)
const imageFile = computed(() => props.mime.startsWith('image/') ||
  (!props.mime && /\.(png|jpe?g|webp|gif|bmp)$/i.test(props.assetName)))
const fetchId = computed(() => imageFile.value && focus.value ? props.assetId : null)
const { url, error } = useAssetImage(computed(() => props.reviewId), fetchId)
const overlap = ref(10)
const crop = computed(() => {
  if (!focus.value) return null
  const margin = overlap.value / 100
  const [x0, y0, x1, y1] = focus.value
  return [Math.max(0, x0 - margin), Math.max(0, y0 - margin),
    Math.min(1, x1 + margin), Math.min(1, y1 + margin)]
})
const cropUrl = ref(null)
const cropError = ref(false)

watch(() => [url.value, ...(crop.value ?? [])], (_, __, onCleanup) => {
  let canceled = false
  let objectUrl = null
  cropUrl.value = null
  cropError.value = false
  if (!url.value || !crop.value) return
  const image = new Image()
  const source = url.value
  const box = [...crop.value]
  image.onload = () => {
    if (canceled) return
    const sourceWidth = (box[2] - box[0]) * image.naturalWidth
    const sourceHeight = (box[3] - box[1]) * image.naturalHeight
    if (sourceWidth <= 0 || sourceHeight <= 0) { cropError.value = true; return }
    const scale = Math.min(1, 1200 / sourceWidth, 1200 / sourceHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sourceWidth * scale))
    canvas.height = Math.max(1, Math.round(sourceHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) { cropError.value = true; return }
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, box[0] * image.naturalWidth, box[1] * image.naturalHeight,
      sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (canceled) return
      if (!blob) { cropError.value = true; return }
      objectUrl = URL.createObjectURL(blob)
      cropUrl.value = objectUrl
    }, 'image/jpeg', 0.9)
  }
  image.onerror = () => { if (!canceled) cropError.value = true }
  image.src = source
  onCleanup(() => {
    canceled = true
    image.onload = null
    image.onerror = null
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  })
}, { immediate: true })
</script>

<template>
  <div class="finding-crop">
    <p v-if="!focus">이 결과에는 특정 위치 좌표가 없어 부분 이미지를 표시할 수 없습니다.</p>
    <p v-else-if="!imageFile">PDF 등 이미지가 아닌 원본은 부분 자르기를 지원하지 않습니다. 원본 보기에서 해당 페이지를 확인해 주세요.</p>
    <p v-else-if="error">원본 이미지를 불러오지 못했습니다: {{ error }}</p>
    <template v-else>
      <img v-if="cropUrl" class="finding-crop__image" :src="cropUrl" :alt="`${assetName}의 ${focusLabel} 주변`" />
      <p v-else-if="cropError">부분 이미지를 생성하지 못했습니다.</p>
      <p v-else>부분 이미지를 불러오는 중입니다.</p>
      <label class="finding-crop__control">
        주변 여백 {{ overlap }}%
        <input v-model.number="overlap" type="range" min="0" max="40" step="5" :aria-label="`${assetName}의 분석 대상 주변 여백`" />
      </label>
      <small>여백은 원본 이미지의 가로·세로 비율을 기준으로 더해집니다. 표시 범위는 검토용이며 위반 위치를 확정하지 않습니다.</small>
      <details v-if="url">
        <summary>원본에서 위치 확인</summary>
        <p class="finding-crop__legend">실선: 분석 대상 · 점선: 여백을 포함해 잘라낸 범위</p>
        <div class="finding-crop__context">
          <img :src="url" :alt="`${assetName} 원본`" />
          <span class="finding-crop__overlap" :style="{
            left: `${crop[0] * 100}%`, top: `${crop[1] * 100}%`,
            width: `${(crop[2] - crop[0]) * 100}%`, height: `${(crop[3] - crop[1]) * 100}%`,
          }" aria-hidden="true"></span>
          <span class="finding-crop__outline" :style="{
            left: `${focus[0] * 100}%`, top: `${focus[1] * 100}%`,
            width: `${(focus[2] - focus[0]) * 100}%`, height: `${(focus[3] - focus[1]) * 100}%`,
          }" aria-hidden="true"></span>
        </div>
      </details>
    </template>
  </div>
</template>

<style scoped>
.finding-crop { display: grid; gap: 8px; min-width: 0; }
.finding-crop p { margin: 0; }
.finding-crop__image { display: block; max-width: 100%; max-height: 360px; object-fit: contain; border-radius: var(--radius-md); border: var(--border-width) solid var(--color-border); }
.finding-crop__control { display: grid; gap: 4px; max-width: 320px; }
.finding-crop__control input { width: 100%; }
.finding-crop small { color: var(--color-text-secondary); }
.finding-crop summary { cursor: pointer; }
.finding-crop__context { position: relative; width: fit-content; max-width: 100%; margin-top: 8px; }
.finding-crop__context img { display: block; max-width: 100%; max-height: 480px; }
.finding-crop__legend { color: var(--color-text-secondary); font-size: var(--font-size-detail-s); margin: 8px 0 0; }
.finding-crop__overlap { position: absolute; box-sizing: border-box; border: 2px dashed #2c65a2; background: rgb(44 101 162 / 12%); pointer-events: none; }
.finding-crop__outline { position: absolute; box-sizing: border-box; border: 3px solid #e45838; background: rgb(228 88 56 / 18%); pointer-events: none; }
</style>
