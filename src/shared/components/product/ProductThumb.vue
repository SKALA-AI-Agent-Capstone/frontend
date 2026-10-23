<!--
  제품 대표 이미지. 썸네일(너비 160px JPEG)을 우선 쓰고, 썸네일이 없는 형식은 저장된 원본을 보여 준다.
  이미지를 바꾸면 image.version이 달라져 새 주소(?v=)로 받으므로 예전 브라우저 캐시를 쓰지 않는다.
-->
<script setup>
import { computed } from 'vue'
import { useBlobImage } from '@/shared/composables/useBlobImage'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  product: { type: Object, required: true },
  size: { type: String, default: 'md' }, // sm | md | lg
})

const path = computed(() => {
  const image = props.product.image
  if (!image) return null
  const suffix = image.thumbnail ? '/thumbnail' : ''
  return `/products/${props.product.id}/image${suffix}?v=${image.version}`
})
const { url } = useBlobImage(path)
</script>

<template>
  <span class="pthumb" :class="[`pthumb--${size}`, { 'has-image': url }]" aria-hidden="true">
    <img v-if="url" :src="url" alt="" class="pthumb__img" decoding="async" />
    <BaseIcon v-else name="layers" :size="size === 'sm' ? 'sm' : 'md'" class="pthumb__icon" />
  </span>
</template>

<style scoped>
.pthumb {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 12px;
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  outline: 1px solid rgba(0, 0, 0, 0.06);
  outline-offset: -1px;
  overflow: clip;
}
.pthumb--sm { width: 40px; height: 40px; border-radius: 8px; }
.pthumb--md { width: 64px; height: 64px; }
.pthumb--lg { width: 112px; height: 112px; border-radius: 16px; }
/* 배경을 지운(투명한) 제품 사진이 카드 위에 그대로 놓이도록 상자 배경과 테두리를 없애고, 잘리지 않게 칸 안에 맞춘다 */
.pthumb.has-image { background: transparent; outline: none; }
.pthumb__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}
</style>
