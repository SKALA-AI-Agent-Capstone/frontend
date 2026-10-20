<script setup>
import BaseCard from '@/shared/components/base/BaseCard.vue'
import {useReviewDetail} from '../../composables/useReviewDetail'
const {result} = useReviewDetail()
</script>
<template><BaseCard class="visual"><h2>사진 독립 검토</h2>
 <p>처리 상태: {{result.pipelineStatus?.visual}}</p>
 <p v-if="!result.visualFindings?.length">확인 항목이 없거나 사진 분석이 미실행된 상태입니다. 사진의 적합 판정을 의미하지 않습니다.</p>
 <article v-for="item in result.visualFindings" :key="item.id">
  <strong>{{item.location.fileName}} / {{item.location.page}}페이지</strong>
  <p>{{item.observation}}</p><p>확인할 점: {{item.concern}}</p>
  <ul><li v-for="limit in item.comparisonLimitations" :key="limit">{{limit}}</li></ul>
  <p v-if="item.needsAdjacentContext">이웃 구간 또는 비교 상대 사진의 문맥 확인이 필요합니다.</p>
  <small>원본 분석 구간 y={{Math.round((item.location.region?.[1] ?? 0)*100)}}~{{Math.round((item.location.region?.[3] ?? 1)*100)}}%. 정밀한 주름 위치나 실제 효능을 확정한 결과가 아닙니다.</small>
 </article>
</BaseCard></template>
<style scoped>.visual{display:grid;gap:16px}.visual article{padding:16px;border:1px solid var(--color-border);border-radius:8px;display:grid;gap:8px}small{color:var(--color-text-secondary)}</style>
