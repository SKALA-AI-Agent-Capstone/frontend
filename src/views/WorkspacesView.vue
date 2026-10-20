<script setup lang="ts">
const areas = [
  { name: 'Frontend', path: 'frontend/src', work: '제품 등록, 광고 원본 뷰어, 검토 의견과 승인 화면' },
  { name: 'Backend', path: 'backend/services/api', work: '사용자 인증, 기업 권한, 제품과 광고 버전, 승인과 이력 API' },
  { name: 'Agent', path: 'backend/services/agent', work: '주장 추출, LangGraph, 상태 저장과 재개, 진행 이벤트' },
  { name: 'Business MCP', path: 'backend/services/business-mcp', work: '내부 업무 API, 식약처와 특허 API 어댑터' },
  { name: 'RAG MCP', path: 'backend/services/rag-mcp', work: '공식 문서 색인, 검색, 원문과 출처 반환, 검색 평가' },
]
</script>

<template>
  <section>
    <div class="section-heading">
      <div><h2>담당별 시작점</h2><p>공통 계약과 환경을 유지하면서 각 영역을 독립적으로 개발합니다.</p></div>
    </div>
    <div class="areas">
      <article v-for="area in areas" :key="area.name" class="area">
        <h3>{{ area.name }}</h3><code>{{ area.path }}</code><p>{{ area.work }}</p>
      </article>
    </div>
    <div class="note">
      <h3>공통 문서의 기준 위치</h3>
      <p>backend/docs의 아키텍처, 개발환경, 계약, 데이터, 협업 문서를 함께 확인하세요.</p>
      <p>계약을 변경할 때는 관련 담당자의 PR 검토와 계약 버전 갱신을 함께 진행합니다.</p>
    </div>
  </section>
</template>
