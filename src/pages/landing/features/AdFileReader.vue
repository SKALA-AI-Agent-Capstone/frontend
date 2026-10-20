<!--
  랜딩 첫 화면의 광고 파일 읽기 조각.
  고른 파일은 브라우저 안에서만 읽고 서버로 보내지 않는다. 형식, 크기, 픽셀만 표시하고 검토 판정은 만들지 않는다.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ARCHIVE_ADS, type ArchiveAd } from '../archive'

interface ReadFile {
  name: string
  kind: 'image' | 'pdf'
  format: string
  bytes: number
  width: number | null
  height: number | null
  preview: string | null
  local: boolean
}

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp'
const FORMATS: Record<string, { kind: 'image' | 'pdf'; label: string }> = {
  'application/pdf': { kind: 'pdf', label: 'PDF' },
  'image/jpeg': { kind: 'image', label: 'JPG' },
  'image/png': { kind: 'image', label: 'PNG' },
  'image/webp': { kind: 'image', label: 'WEBP' },
}

const file = ref<ReadFile | null>(null)
const selectedSample = ref<string | null>(null)
const error = ref('')
const dragging = ref(false)
const input = ref<HTMLInputElement | null>(null)
let objectUrl: string | null = null

const orientation = computed(() => {
  const f = file.value
  if (!f?.width || !f.height) return null
  const ratio = f.height / f.width
  if (ratio > 1.05) return `세로형, 가로의 ${ratio.toFixed(2)}배`
  if (ratio < 0.95) return `가로형, 세로의 ${(1 / ratio).toFixed(2)}배`
  return '정사각형에 가까움'
})

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function measure(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = reject
    img.src = url
  })
}

function releaseUrl() {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = null
}

async function readSample(ad: ArchiveAd) {
  error.value = ''
  selectedSample.value = ad.id
  try {
    const blob = await fetch(ad.src).then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.blob()
    })
    const size = await measure(ad.src)
    releaseUrl()
    file.value = {
      name: ad.src.split('/').pop() ?? ad.id,
      kind: 'image',
      format: 'JPG',
      bytes: blob.size,
      ...size,
      preview: ad.src,
      local: false,
    }
  } catch {
    error.value = '예시 이미지를 불러오지 못했습니다. 잠시 후 다시 골라 주세요.'
  }
}

async function readLocal(picked: File | undefined) {
  if (!picked) return
  error.value = ''
  const format = FORMATS[picked.type]
  if (!format) {
    error.value = 'PDF, JPG, PNG, WEBP 파일만 올릴 수 있습니다.'
    return
  }
  selectedSample.value = null
  releaseUrl()
  if (format.kind === 'pdf') {
    file.value = { name: picked.name, kind: 'pdf', format: format.label, bytes: picked.size, width: null, height: null, preview: null, local: true }
    return
  }
  objectUrl = URL.createObjectURL(picked)
  try {
    const size = await measure(objectUrl)
    file.value = { name: picked.name, kind: 'image', format: format.label, bytes: picked.size, ...size, preview: objectUrl, local: true }
  } catch {
    error.value = '이미지를 읽지 못했습니다. 파일이 손상되지 않았는지 확인해 주세요.'
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false
  readLocal(event.dataTransfer?.files[0])
}

function onPick(event: Event) {
  readLocal((event.target as HTMLInputElement).files?.[0])
  ;(event.target as HTMLInputElement).value = ''
}

onMounted(() => readSample(ARCHIVE_ADS[0]))
onBeforeUnmount(releaseUrl)
</script>

<template>
  <div data-ui class="reader" aria-label="광고 파일 읽기">
    <p class="reader__title">광고 파일 읽기</p>

    <div
      class="reader__drop"
      :class="{ 'is-dragging': dragging }"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="reader__preview">
        <img v-if="file?.preview" :key="file.preview" :src="file.preview" alt="" class="reader__img" />
        <span v-else-if="file?.kind === 'pdf'" class="reader__pdf">PDF</span>
      </div>
      <dl class="reader__readout" aria-live="polite">
        <!-- 파일이 바뀌어도 조각 크기가 변하지 않도록 항상 같은 다섯 줄을 한 줄씩 보여 준다 -->
        <div><dt>파일</dt><dd :title="file?.name">{{ file?.name ?? '-' }}</dd></div>
        <div><dt>형식</dt><dd>{{ file?.format ?? '-' }}</dd></div>
        <div><dt>용량</dt><dd>{{ file ? formatBytes(file.bytes) : '-' }}</dd></div>
        <template v-if="file?.kind === 'pdf'">
          <div><dt>페이지</dt><dd>서버에서 확인</dd></div>
          <div><dt>비율</dt><dd>-</dd></div>
        </template>
        <template v-else>
          <div><dt>픽셀</dt><dd>{{ file?.width ? `${file.width} × ${file.height}` : '-' }}</dd></div>
          <div><dt>비율</dt><dd>{{ orientation ?? '-' }}</dd></div>
        </template>
      </dl>
    </div>

    <div class="reader__lanes">
      <p><strong>문구</strong> 위반 소지를 판단하고 근거 조문을 찾습니다.</p>
      <p><strong>사진</strong> 문구와 따로 표현을 살핍니다. 실제 효능을 판정하지 않습니다.</p>
    </div>

    <div class="reader__actions">
      <button type="button" class="reader__pick" @click="input?.click()">내 광고 파일 고르기</button>
      <!-- 오류는 안내 문구 자리에 바꿔 보여 주어 조각 높이를 유지한다 -->
      <span v-if="error" class="reader__hint reader__error" role="alert">{{ error }}</span>
      <span v-else class="reader__hint">PDF, JPG, PNG, WEBP</span>
      <input ref="input" type="file" :accept="ACCEPT" class="sr-only" tabindex="-1" @change="onPick" />
    </div>

    <div class="reader__samples" role="group" aria-label="옛 화장품 광고 예시">
      <button
        v-for="ad in ARCHIVE_ADS"
        :key="ad.id"
        type="button"
        class="reader__sample"
        :class="{ 'is-selected': selectedSample === ad.id }"
        :aria-pressed="selectedSample === ad.id"
        :title="ad.caption"
        @click="readSample(ad)"
      >
        <img :src="ad.src" :alt="ad.caption" :width="ad.width" :height="ad.height" />
      </button>
    </div>
  </div>
</template>

<style scoped>
[data-ui].reader {
  width: min(100%, 480px);
  background: var(--krds-gray-0);
  color: var(--krds-gray-90);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: grid;
  gap: 14px;
  font-size: 14px;
  line-height: 1.45;
}
[data-ui] .reader__title { font-size: 15px; font-weight: 700; }
[data-ui] .reader__drop {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 14px;
  padding: 10px;
  border: 1px dashed var(--krds-gray-40);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
[data-ui] .reader__drop.is-dragging {
  border-color: var(--color-primary);
  background: var(--krds-primary-10);
}
[data-ui] .reader__preview {
  position: relative;
  aspect-ratio: 3 / 4;
  align-self: start;
  background: var(--krds-gray-10);
  border-radius: var(--radius-sm);
  overflow: clip;
  display: grid;
  place-items: center;
}
/* 이미지는 칸 안에 절대 위치로 채워, 이미지 비율이 칸 크기를 바꾸지 않게 한다 */
[data-ui] .reader__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@media (prefers-reduced-motion: no-preference) {
  [data-ui] .reader__img { animation: reader-drift 14s ease-in-out infinite alternate; }
}
@keyframes reader-drift {
  from { transform: scale(1) translateY(0); }
  to { transform: scale(1.12) translateY(-4%); }
}
[data-ui] .reader__pdf { font-size: 20px; font-weight: 700; color: var(--krds-secondary-50); }
[data-ui] .reader__readout { display: grid; align-content: start; gap: 6px; margin: 0; min-width: 0; }
[data-ui] .reader__readout div { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 8px; }
[data-ui] .reader__readout dt { color: var(--krds-gray-70); }
[data-ui] .reader__readout dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-ui] .reader__hint.reader__error { color: var(--color-danger-text); }
[data-ui] .reader__lanes { display: grid; gap: 6px; }
[data-ui] .reader__lanes strong { display: inline-block; min-width: 36px; color: var(--color-primary); }
[data-ui] .reader__actions { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px; }
[data-ui] .reader__pick {
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--krds-gray-40);
  border-radius: var(--radius-sm-2);
  background: var(--krds-gray-0);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}
[data-ui] .reader__pick:hover { background: var(--krds-gray-10); }
[data-ui] .reader__pick:active { transform: translateY(1px); }
[data-ui] .reader__hint {
  color: var(--krds-gray-70);
  font-size: 13px;
  line-height: 1.35;
  min-height: 2.7em;
  display: flex;
  align-items: center;
}
[data-ui] .reader__samples { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
[data-ui] .reader__sample {
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  aspect-ratio: 3 / 4;
  overflow: clip;
  cursor: pointer;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}
[data-ui] .reader__sample { position: relative; }
[data-ui] .reader__sample img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
[data-ui] .reader__sample:hover { transform: translateY(-2px); }
[data-ui] .reader__sample.is-selected { border-color: var(--color-primary); }
[data-ui] button:focus-visible { outline: var(--focus-ring); outline-offset: var(--focus-ring-offset); }

@media (max-width: 600px) {
  [data-ui] .reader__drop { grid-template-columns: 96px 1fr; }
}
</style>
