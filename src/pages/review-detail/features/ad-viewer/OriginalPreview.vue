<script setup>
import { computed, ref } from 'vue'
import { useAssetImage } from '@/shared/composables/useAssetImage'
import { useReviewDetail } from '../../composables/useReviewDetail'
import BaseCard from '@/shared/components/base/BaseCard.vue'

const { review, version } = useReviewDetail()
const assets = computed(() => [...version.value.input.files, ...version.value.input.evidence])
const selected = ref(0)
const asset = computed(() => assets.value[selected.value] ?? null)
const reviewId = computed(() => review.value?.id)
const assetId = computed(() => asset.value?.id ?? null)
const { url, error } = useAssetImage(reviewId, assetId)
</script>
<template>
 <BaseCard class="original"><h2>원본 보기</h2>
  <template v-if="assets.length">
   <select v-model="selected" aria-label="미리볼 원본 파일"><option v-for="(item,i) in assets" :key="item.id" :value="i">{{item.name}}</option></select>
   <div class="original__scroll">
    <iframe v-if="asset?.mime === 'application/pdf' && url" :src="url" title="업로드한 PDF 원본"></iframe>
    <img v-else-if="url" :src="url" :alt="`${asset?.name} 원본`">
    <p v-else-if="error">원본을 불러오지 못했습니다: {{ error }}</p>
   </div>
   <small>서버에 보존된 원본입니다. 분석이 끝난 뒤에도 계속 조회할 수 있습니다.</small>
  </template>
  <p v-else>이 버전에 업로드된 원본이 없습니다.</p>
 </BaseCard>
</template>
<style scoped>.original{display:grid;gap:16px}.original__scroll{max-height:650px;overflow:auto}img{width:100%;height:auto;display:block}iframe{width:100%;height:600px;border:0}select{padding:10px;max-width:100%}small{color:var(--color-text-secondary)}</style>
