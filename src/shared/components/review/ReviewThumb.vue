<!--
  검토 목록의 광고 썸네일: 최신 버전의 첫 광고.
  서버가 만든 썸네일(너비 160px JPEG, PDF는 첫 쪽)만 받는다. 만들 수 없는 파일(WebP 등)이거나 받지 못하면 형식 아이콘으로 대신한다.
-->
<script setup>
import { t } from '@/shared/i18n'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAssetImage } from '@/shared/composables/useAssetImage'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  review: { type: Object, required: true },
  version: { type: Object, required: true },
  size: { type: String, default: 'md' }, // sm | md
})

const file = computed(() => props.version.input?.files?.[0] ?? null)
const isPdf = computed(() => file.value?.mime === 'application/pdf' || /\.pdf$/i.test(file.value?.name ?? ''))
const reviewId = computed(() => props.review.id)
// 썸네일이 화면 가까이 왔을 때만 받는다
const root = ref(null)
const inView = ref(typeof IntersectionObserver === 'undefined')
let observer = null
onMounted(() => {
  if (inView.value || !root.value) return
  observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    inView.value = true
    observer.disconnect()
  }, { rootMargin: '200px' })
  observer.observe(root.value)
})
onBeforeUnmount(() => observer?.disconnect())

const assetId = computed(() => (inView.value ? file.value?.id ?? null : null))
const { url } = useAssetImage(reviewId, assetId, { thumbnail: true })

const fallback = computed(() => {
  if (isPdf.value) return { icon: 'picture_as_pdf', label: 'PDF', tone: 'pdf' }
  if (file.value) return { icon: 'image', label: t('ui.thumb.image'), tone: 'image' }
  return { icon: 'draft', label: t('ui.thumb.none'), tone: 'none' }
})
</script>

<template>
  <span ref="root" class="thumb" :class="[`thumb--${size}`, `thumb--${fallback.tone}`, { 'has-image': url }]" aria-hidden="true">
    <img v-if="url" :src="url" alt="" class="thumb__img" decoding="async" />
    <template v-else>
      <BaseIcon :name="fallback.icon" :size="size === 'sm' ? 'sm' : 'md'" class="thumb__icon" />
      <span class="thumb__label">{{ fallback.label }}</span>
    </template>
  </span>
</template>

<style scoped>
.thumb {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  border-radius: 8px;
  background: var(--krds-secondary-5);
  color: var(--krds-secondary-50);
  outline: 1px solid rgba(0, 0, 0, 0.06);
  outline-offset: -1px;
  overflow: clip;
  flex: none;
}
.thumb--md { width: 56px; height: 72px; }
.thumb--sm { width: 44px; height: 56px; }
.thumb--pdf { background: var(--color-danger-surface); color: var(--color-danger-text); }
.thumb--image { background: var(--color-info-surface); color: var(--color-info-text); }
.thumb--none { background: var(--color-bg-muted); color: var(--color-text-secondary); }
.thumb.has-image { background: var(--color-bg-muted); }
.thumb__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; }
.thumb__label { font-size: 11px; font-weight: var(--font-weight-bold); line-height: 1; }
.thumb--sm .thumb__label { display: none; }
</style>
