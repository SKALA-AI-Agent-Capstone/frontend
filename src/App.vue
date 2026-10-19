<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="shell">
    <header class="header">
      <div>
        <span class="eyebrow">SKALA AI AGENT CAPSTONE</span>
        <h1>광고 사전검토 개발환경</h1>
      </div>
      <span class="label">개발 기반 / 계약 v0.1.0</span>
    </header>
    <nav class="navigation" aria-label="개발환경 메뉴">
      <RouterLink to="/">환경 확인</RouterLink>
      <RouterLink to="/workspaces">담당별 시작점</RouterLink>
    </nav>
    <main><RouterView /></main>
    <footer>현재 범위는 실행환경과 서비스 연결입니다. 광고 판정과 검색 기능은 담당자가 구현합니다.</footer>
  </div>
</template>
