<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import {computed} from 'vue'
import {legalSearch} from '@/shared/constants/legal'
import {useReviewDetail} from '../../composables/useReviewDetail'
const {review,version,result,findings} = useReviewDetail()
const legal = computed(() => legalSearch(result.value))
const withBasis = computed(() => findings.value.filter((f) => f.basis?.length).length)
</script>
<template><BaseCard><h2>{{ $t('reviewDetail.summary.title') }}</h2><p>{{review.productName}} / v{{version.no}}</p><p>{{ $t('reviewDetail.summary.counts', { text: findings.length, visual: result.visualFindings?.length ?? 0 }) }}</p><p>{{ $t('reviewDetail.summary.paths', { text: result.pipelineStatus?.text, visual: result.pipelineStatus?.visual }) }}</p><p v-if="result.retrievalStatus === 'connected'">{{ $t('reviewDetail.summary.withBasis', { count: withBasis, total: findings.length }) }}</p><strong>{{legal.summary}}</strong></BaseCard></template>
