<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEnvironmentStore } from '../stores/environment'

const environment = useEnvironmentStore()
const rows = computed(() => {
  const dependencies = environment.data?.dependencies
  const agent = dependencies?.agent_environment?.dependencies
  return [
    { name: 'Spring Boot API', value: environment.data ? 'ok' : undefined, detail: '화면의 유일한 API 진입점' },
    { name: 'PostgreSQL / app', value: dependencies?.application_database.status, detail: '업무 데이터 전용 권한' },
    { name: 'Agent API', value: dependencies?.agent.status, detail: 'FastAPI 내부 연결' },
    { name: 'PostgreSQL / agent', value: agent?.agent_database.status, detail: '체크포인트 저장 영역' },
    { name: 'business-mcp', value: agent?.business_mcp.status, detail: agent?.business_mcp.tools?.join(', ') || '업무 도구 등록 확인' },
    { name: 'rag-mcp', value: agent?.rag_mcp.status, detail: agent?.rag_mcp.tools?.join(', ') || '근거 검색 도구 등록 확인' },
  ]
})
const label = (value?: string) => value === 'ok' ? '연결됨' : value === 'down' ? '연결 실패' : '미확인'
onMounted(() => environment.refresh())
</script>

<template>
  <section>
    <div class="section-heading">
      <div>
        <h2>공통 실행환경 확인</h2>
        <p>실제 상태를 조회합니다. MCP 도구의 등록과 기능 구현 여부는 구분됩니다.</p>
      </div>
      <button :disabled="environment.loading" @click="environment.refresh()">
        {{ environment.loading ? '확인 중' : '다시 확인' }}
      </button>
    </div>
    <p v-if="environment.error" class="notice" role="alert">{{ environment.error }}</p>
    <div class="services" aria-live="polite" :aria-busy="environment.loading">
      <article v-for="row in rows" :key="row.name" class="service">
        <div><h3>{{ row.name }}</h3><p>{{ row.detail }}</p></div>
        <span class="status" :data-status="row.value">{{ label(row.value) }}</span>
      </article>
    </div>
    <div class="note">
      <h3>다음에 구현할 업무 흐름</h3>
      <p>제품과 광고 등록 → 주장 추출 → 근거 검색과 대조 → 담당자 검토 → 버전 이력</p>
      <p>현재 검색 도구와 작업 접수는 NOT_IMPLEMENTED 또는 HTTP 501로 응답합니다.</p>
    </div>
  </section>
</template>
