<script setup>
import {onMounted,ref} from 'vue'
import {request} from '@/shared/api/http'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
const sources=ref([]),error=ref('')
onMounted(async()=>{try{const data=await request('/reference-sources');sources.value=data.sources}catch(e){error.value=e.message}})
</script>
<template><BaseCard><h1>RAG 공식 출처 수집 계획</h1><BaseAlert variant="warning" title="원문과 벡터 미적재">Cosmetic_RAG_AI_Handoff의 9개 출처 목록입니다. 아래 날짜는 전달 자료의 후보 버전이며 현행성 검증과 원문 확보가 필요합니다. 현재 검색 근거로 사용하지 않습니다.</BaseAlert><p v-if="error">{{error}}</p>
<table><thead><tr><th>ID</th><th>자료</th><th>후보 버전</th><th>수집 방법</th><th>확보 상태</th></tr></thead><tbody><tr v-for="source in sources" :key="source.id"><td>{{source.id}}</td><td><a :href="source.official_page" target="_blank" rel="noopener noreferrer">{{source.title}}</a></td><td>{{source.reported_version_date}}</td><td>{{source.method}}</td><td>원문 미확보, 출처 검증 전</td></tr></tbody></table>
<p>로컬 Docker PostgreSQL의 knowledge.document_versions와 knowledge.chunks를 사용합니다. 특허와 제품정보는 Business MCP의 실시간 API 경로로 분리합니다.</p></BaseCard></template>
<style scoped>table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:12px;border-bottom:1px solid var(--color-border);text-align:left}h1{margin-bottom:20px}</style>
