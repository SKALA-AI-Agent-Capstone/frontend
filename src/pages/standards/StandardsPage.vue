<script setup>
import {onMounted,ref} from 'vue'
import {request} from '@/shared/api/http'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
const sources=ref([]),apis=ref([]),error=ref('')
onMounted(async()=>{try{const data=await request('/reference-sources');sources.value=data.sources;apis.value=data.apis || []}catch(e){error.value=e.message}})
</script>
<template>
  <BaseCard>
    <h1>공식 근거와 API 연결 계획</h1>
    <BaseAlert variant="warning" title="벡터 검색 미연결">노션과 Cosmetic_RAG_AI_Handoff의 근거 출처 9건 및 노션의 API 4종을 구분한 목록입니다. 원문을 로컬에서 다운로드하거나 청킹한 것과 DB 색인 및 현행성 검증은 별도입니다. 현재 법령 검색 근거로 사용하지 않습니다.</BaseAlert>
    <p v-if="error">{{error}}</p>
    <h2>공개 근거 문서</h2>
    <table><thead><tr><th>ID</th><th>자료</th><th>후보 버전</th><th>수집 방법</th><th>검색 상태</th></tr></thead><tbody><tr v-for="source in sources" :key="source.id"><td>{{source.id}}</td><td><a :href="source.official_page" target="_blank" rel="noopener noreferrer">{{source.title}}</a></td><td>{{source.reported_version_date}}</td><td>{{source.method}}</td><td>DB 미적재, 현행성 검증 필요</td></tr></tbody></table>
    <h2>외부 API</h2>
    <table><thead><tr><th>ID</th><th>서비스</th><th>역할</th><th>범위</th></tr></thead><tbody><tr v-for="api in apis" :key="api.id"><td>{{api.id}}</td><td><a :href="api.official_page" target="_blank" rel="noopener noreferrer">{{api.title}}</a></td><td>{{api.role === 'business_realtime' ? 'Business MCP 실시간 조회' : '보조 참고, 검토 흐름 미연결'}}</td><td>{{api.note}}</td></tr></tbody></table>
    <p>키 설정과 승인 권한은 서버에서 확인합니다. 공식 명세 확인만으로 정상 실응답 검증이 끝난 것은 아닙니다.</p>
    <p>로컬 Docker PostgreSQL의 knowledge.document_versions와 knowledge.chunks를 사용합니다. 특허와 제품정보는 Business MCP의 실시간 API 경로로 분리합니다.</p>
  </BaseCard>
</template>
<style scoped>table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:12px;border-bottom:1px solid var(--color-border);text-align:left}h1,h2{margin:20px 0}</style>
