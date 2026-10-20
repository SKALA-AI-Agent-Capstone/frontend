<script setup>
import { computed, ref } from 'vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useReviewDetail } from '../../composables/useReviewDetail'
import BaseCard from '@/shared/components/base/BaseCard.vue'
const reviews = useReviewsStore()
const {review,version} = useReviewDetail()
const selected = ref(0)
const files = computed(() => reviews.previews[`${review.value.id}:${version.value.no}`] ?? [])
const file = computed(() => files.value[selected.value])
</script>
<template>
 <BaseCard class="original"><h2>이번 세션의 원본 미리보기</h2>
  <template v-if="files.length">
   <select v-model="selected" aria-label="미리볼 원본 파일"><option v-for="(item,i) in files" :key="item.url" :value="i">{{item.name}}</option></select>
   <div class="original__scroll">
    <iframe v-if="file?.type === 'application/pdf' || file?.name.endsWith('.pdf')" :src="file.url" title="업로드한 PDF 원본"></iframe>
    <img v-else-if="file" :src="file.url" :alt="`${file.name} 원본`">
   </div>
   <small>사용자가 선택한 로컬 파일의 미리보기입니다. 서버 원본은 분석 후 폐기하며 새로고침 후에는 다시 볼 수 없습니다.</small>
  </template>
  <p v-else>이 세션에는 원본이 없습니다. 서버 원본 폐기 후에는 저장된 추출 문구와 검토 기록만 조회할 수 있습니다. 새 분석에는 원본을 다시 선택하세요.</p>
 </BaseCard>
</template>
<style scoped>.original{display:grid;gap:16px}.original__scroll{max-height:650px;overflow:auto}img{width:100%;height:auto;display:block}iframe{width:100%;height:600px;border:0}select{padding:10px;max-width:100%}small{color:var(--color-text-secondary)}</style>
