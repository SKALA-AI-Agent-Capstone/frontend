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
 <BaseCard class="original"><h2>{{ $t('reviewDetail.original.title') }}</h2>
  <template v-if="assets.length">
   <select v-model="selected" :aria-label="$t('reviewDetail.original.select')"><option v-for="(item,i) in assets" :key="item.id" :value="i">{{item.name}}</option></select>
   <div class="original__scroll">
    <iframe v-if="asset?.mime === 'application/pdf' && url" :src="url" :title="$t('reviewDetail.original.pdf')"></iframe>
    <img v-else-if="url" :src="url" :alt="$t('reviewDetail.original.alt', { name: asset?.name })">
    <p v-else-if="error">{{ $t('reviewDetail.original.error', { error }) }}</p>
   </div>
   <small>{{ $t('reviewDetail.original.note') }}</small>
  </template>
  <p v-else>{{ $t('reviewDetail.original.empty') }}</p>
 </BaseCard>
</template>
<style scoped>.original{display:grid;gap:16px}.original__scroll{max-height:650px;overflow:auto}img{width:100%;height:auto;display:block}iframe{width:100%;height:600px;border:0}select{padding:10px;max-width:100%}small{color:var(--color-text-secondary)}</style>
