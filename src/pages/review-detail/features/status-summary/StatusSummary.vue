<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import {computed} from 'vue'
import {legalSearch} from '@/shared/constants/legal'
import {useReviewDetail} from '../../composables/useReviewDetail'
const {review,version,result,findings} = useReviewDetail()
const legal = computed(() => legalSearch(result.value))
const withBasis = computed(() => findings.value.filter((f) => f.basis?.length).length)
</script>
<template><BaseCard><h2>문구와 사진 분석 현황</h2><p>{{review.productName}} / v{{version.no}}</p><p>문구 확인 항목 {{findings.length}}건 / 사진 확인 항목 {{result.visualFindings?.length ?? 0}}건</p><p>문구 경로: {{result.pipelineStatus?.text}} / 사진 경로: {{result.pipelineStatus?.visual}}</p><p v-if="result.retrievalStatus === 'connected'">법령 조문 후보가 붙은 문구 {{withBasis}}건 / 전체 {{findings.length}}건</p><strong>{{legal.summary}}</strong></BaseCard></template>
