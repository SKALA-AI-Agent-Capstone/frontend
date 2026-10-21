<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import {useReviewDetail} from '../../composables/useReviewDetail'
const {result} = useReviewDetail()
</script>
<template><BaseCard class="visual"><h2>{{ $t('reviewDetail.visual.title') }}</h2>
 <p>{{ $t('reviewDetail.visual.status', { status: result.pipelineStatus?.visual }) }}</p>
 <p v-if="!result.visualFindings?.length">{{ $t('reviewDetail.visual.empty') }}</p>
 <article v-for="item in result.visualFindings" :key="item.id">
  <strong>{{ $t('reviewDetail.visual.location', { name: item.location.fileName, page: item.location.page }) }}</strong>
  <p>{{item.observation}}</p><p>{{ $t('reviewDetail.visual.concern', { concern: item.concern }) }}</p>
  <ul><li v-for="limit in item.comparisonLimitations" :key="limit">{{limit}}</li></ul>
  <p v-if="item.needsAdjacentContext">{{ $t('reviewDetail.visual.adjacent') }}</p>
  <small>{{ $t('reviewDetail.visual.region', { from: Math.round((item.location.region?.[1] ?? 0)*100), to: Math.round((item.location.region?.[3] ?? 1)*100) }) }}</small>
 </article>
</BaseCard></template>
<style scoped>.visual{display:grid;gap:16px}.visual article{padding:16px;border:1px solid var(--color-border);border-radius:8px;display:grid;gap:8px}small{color:var(--color-text-secondary)}</style>
