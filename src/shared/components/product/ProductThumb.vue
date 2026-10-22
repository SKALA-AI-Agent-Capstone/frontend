<!--
  제품 대표 이미지. 썸네일(너비 160px JPEG)을 받아 보여 주고, 이미지가 없거나 썸네일을 만들 수 없던 형식이면 제품 아이콘으로 대신한다.
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
  return image?.thumbnail ? `/products/${props.product.id}/image/thumbnail?v=${image.version}` : null
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
.pthumb.has-image { background: var(--color-bg-muted); }
.pthumb__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; }
</style>
