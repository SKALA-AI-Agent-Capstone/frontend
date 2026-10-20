<script setup>
import {computed,onMounted,ref} from 'vue'
import {request} from '@/shared/api/http'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
const sources=ref([]),apis=ref([]),corpus=ref([]),status=ref(''),error=ref('')
onMounted(async()=>{try{const data=await request('/reference-sources');sources.value=data.sources;apis.value=data.apis || [];corpus.value=data.corpus || [];status.value=data.retrievalStatus}catch(e){error.value=e.message}})

const ROUTE_LABEL={legalize_kr:'legalize-kr 조문','legalize_kr+pdf':'legalize-kr 조문 + PDF',pdf:'PDF'}
const BANNER={
  indexed:{variant:'info',title:'법령 검색 사용 중',text:'적재된 자료만 검토 시 rag-mcp가 검색합니다. 검색 결과는 조문 후보이며 적법 판정이 아닙니다.'},
  not_indexed:{variant:'warning',title:'법령 자료 미적재',text:'아직 적재된 자료가 없어 검토 결과에 법령 근거가 붙지 않습니다. scripts/ingest_rag.py로 적재하세요.'},
  unavailable:{variant:'warning',title:'법령 검색 서비스 확인 불가',text:'rag-mcp에서 적재 현황을 받지 못했습니다. 검토 시 법령 검색이 실패할 수 있습니다.'},
}
const banner=computed(()=>BANNER[status.value] ?? BANNER.unavailable)
const legalizeDocs=computed(()=>corpus.value.filter((d)=>d.document_key.startsWith('legalize-kr:')))
function sourceStatus(source){
  const method=source.acquisition?.method ?? ''
  const parts=[]
  if(method.includes('legalize_kr')){
    const chunks=legalizeDocs.value.reduce((sum,d)=>sum+d.chunks,0)
    parts.push(legalizeDocs.value.length?`조문 적재 (${legalizeDocs.value.length}개 버전, ${chunks}개 조문)`:'조문 미적재')
  }
  if(method.split('+').includes('pdf')){
    const pdf=corpus.value.filter((d)=>d.document_key===`pdf:${source.id}` || d.document_key.startsWith(`pdf:${source.id}:`))
    parts.push(pdf.length?`PDF 적재 (${pdf.reduce((sum,d)=>sum+d.chunks,0)}개 조각)`:'PDF 미적재')
  }
  return parts.join(', ') || '미적재'
}
const API_ROLE={business_realtime:'Business MCP 실시간 조회, 검토 흐름에서 호출',supporting_reference:'Business MCP 도구로 제공, 검토 흐름에서는 아직 호출하지 않음'}
</script>
<template>
  <BaseCard>
    <h1>공식 근거와 API 연결 현황</h1>
    <BaseAlert :variant="banner.variant" :title="banner.title">{{banner.text}}</BaseAlert>
    <p v-if="error">{{error}}</p>
    <h2>공개 근거 문서</h2>
    <table><thead><tr><th>ID</th><th>자료</th><th>후보 버전</th><th>수집 경로</th><th>적재 상태</th></tr></thead><tbody><tr v-for="source in sources" :key="source.id"><td>{{source.id}}</td><td><a :href="source.official_page" target="_blank" rel="noopener noreferrer">{{source.title}}</a></td><td>{{source.reported_version_date}}</td><td>{{ROUTE_LABEL[source.acquisition?.method] ?? source.method}}</td><td>{{sourceStatus(source)}}</td></tr></tbody></table>
    <h2 v-if="legalizeDocs.length">적재된 법령 버전</h2>
    <table v-if="legalizeDocs.length"><thead><tr><th>법령</th><th>공포</th><th>시행 기간</th><th>조문 수</th></tr></thead><tbody><tr v-for="doc in legalizeDocs" :key="doc.document_key + doc.version_label"><td>{{doc.title}}</td><td>{{doc.version_label}}</td><td>{{doc.effective_from}} ~ {{doc.effective_until || '현재'}}</td><td>{{doc.chunks}}</td></tr></tbody></table>
    <h2>외부 API</h2>
    <table><thead><tr><th>ID</th><th>서비스</th><th>역할</th><th>범위</th></tr></thead><tbody><tr v-for="api in apis" :key="api.id"><td>{{api.id}}</td><td><a :href="api.official_page" target="_blank" rel="noopener noreferrer">{{api.title}}</a></td><td>{{API_ROLE[api.role] ?? api.role}}</td><td>{{api.note}}</td></tr></tbody></table>
    <p>키 설정과 승인 권한은 서버에서 확인합니다. 공식 명세 확인만으로 정상 실응답 검증이 끝난 것은 아닙니다.</p>
    <p>법령과 기준은 로컬 Docker PostgreSQL의 knowledge 스키마(pgvector)에 적재하고 rag-mcp가 검색합니다. 특허와 제품정보는 Business MCP의 실시간 API 경로로 분리합니다.</p>
  </BaseCard>
</template>
<style scoped>table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:12px;border-bottom:1px solid var(--color-border);text-align:left}h1,h2{margin:20px 0}</style>
