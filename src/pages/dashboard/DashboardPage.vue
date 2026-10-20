<script setup>
import { computed } from 'vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
const reviews = useReviewsStore(), session = useSessionStore()
const recent = computed(() => reviews.list.slice(0,5))
</script>
<template><div class="home">
 <BaseCard padding="xl"><p>BEAUTY REVIEW WORKSPACE</p><h1>{{session.tenant?.name}} 광고 사전검토</h1><p>문구는 근거 대조 경로로, 사진은 시각 검토 경로로 나누어 처리합니다.</p><BaseButton to="/reviews/new">PDF 또는 이미지 검토 시작</BaseButton></BaseCard>
 <BaseAlert variant="warning" title="현재 최소 기능 범위">벡터 검색은 연결 전입니다. 법령 적합성 점수와 법령 인용을 생성하지 않습니다. OpenAI와 공공 API의 설정 상태는 각 결과에 표시됩니다.</BaseAlert>
 <div class="stats"><BaseCard>접수 {{reviews.list.length}}건</BaseCard><BaseCard>담당자 승인 대기 {{reviews.pendingApprovals.length}}건</BaseCard><BaseCard>법령 코퍼스 미적재</BaseCard></div>
 <BaseCard><h2>최근 검토</h2><p v-if="!recent.length">등록된 검토가 없습니다.</p><p v-for="review in recent" :key="review.id"><RouterLink :to="`/reviews/${review.id}`">{{review.productName}} / v{{reviews.latest(review).no}} / {{reviews.latest(review).status}}</RouterLink></p></BaseCard>
 <BaseAlert v-if="reviews.error" variant="danger">{{reviews.error}}</BaseAlert>
</div></template>
<style scoped>.home{display:grid;gap:24px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}h1{margin:12px 0}p{margin:12px 0}</style>
