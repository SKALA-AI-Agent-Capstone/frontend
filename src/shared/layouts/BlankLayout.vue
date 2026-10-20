<!-- 헤더, 푸터 없는 레이아웃 (로그인, 인쇄용 리포트) -->
<template>
  <main id="main-content" class="blank-layout" tabindex="-1">
    <slot />
  </main>
</template>

<style scoped>
.blank-layout {
  min-height: 100vh;
}
.blank-layout:focus {
  outline: none;
}
</style>
