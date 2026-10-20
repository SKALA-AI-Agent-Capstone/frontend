<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import {useReviewDetail} from '../../composables/useReviewDetail'
const {review,version,result,findings} = useReviewDetail()
</script>
<template><BaseCard><h2>문구와 사진 분석 현황</h2><p>{{review.productName}} / v{{version.no}}</p><p>문구 확인 항목 {{findings.length}}건 / 사진 확인 항목 {{result.visualFindings?.length ?? 0}}건</p><p>문구 경로: {{result.pipelineStatus?.text}} / 사진 경로: {{result.pipelineStatus?.visual}}</p><strong>법령 검색 미연결: 적법 여부와 적합성 점수는 산출하지 않았습니다.</strong></BaseCard></template>
