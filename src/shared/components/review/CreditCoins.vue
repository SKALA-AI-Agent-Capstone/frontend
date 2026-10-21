<!--
  크레딧 그림: 쌓인 동전 세 개와 기울어 선 동전 하나. 장식이라 화면 읽기 프로그램에는 숨긴다.
  small 이면 금액권 카드에 쓰는 동전 한 개만 그린다.
-->
<script setup>
defineProps({
  small: { type: Boolean, default: false },
})
</script>

<template>
  <svg v-if="small" class="coins coins--small" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <ellipse class="rim" cx="16" cy="19" rx="12" ry="7" />
    <rect class="rim" x="4" y="13" width="24" height="6" />
    <ellipse class="face" cx="16" cy="13" rx="12" ry="7" />
    <ellipse class="mark" cx="16" cy="13" rx="6" ry="3.4" />
  </svg>

  <svg v-else class="coins" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
    <!-- 바닥 그림자 -->
    <ellipse class="shadow" cx="96" cy="132" rx="78" ry="10" />

    <!-- 쌓인 동전 세 개 (아래부터) -->
    <g>
      <ellipse class="rim" cx="78" cy="114" rx="50" ry="17" />
      <rect class="rim" x="28" y="100" width="100" height="14" />
      <ellipse class="face" cx="78" cy="100" rx="50" ry="17" />
    </g>
    <g>
      <ellipse class="rim" cx="84" cy="94" rx="50" ry="17" />
      <rect class="rim" x="34" y="80" width="100" height="14" />
      <ellipse class="face" cx="84" cy="80" rx="50" ry="17" />
    </g>
    <g>
      <ellipse class="rim" cx="78" cy="74" rx="50" ry="17" />
      <rect class="rim" x="28" y="60" width="100" height="14" />
      <ellipse class="face" cx="78" cy="60" rx="50" ry="17" />
      <ellipse class="mark" cx="78" cy="60" rx="26" ry="8.5" />
      <ellipse class="face" cx="78" cy="58.5" rx="17" ry="5" />
    </g>

    <!-- 기울어 선 동전 -->
    <g transform="rotate(-14 152 88)">
      <ellipse class="rim" cx="156" cy="88" rx="21" ry="38" />
      <ellipse class="face" cx="150" cy="88" rx="21" ry="38" />
      <ellipse class="mark" cx="150" cy="88" rx="11" ry="20" />
      <ellipse class="face" cx="151.5" cy="88" rx="6" ry="13" />
    </g>

    <!-- 반짝임 -->
    <path class="spark" d="M150 18 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" />
    <path class="spark spark--soft" d="M30 26 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
  </svg>
</template>

<style scoped>
.coins { display: block; width: 100%; height: auto; }
.coins--small { width: 28px; height: 28px; flex: none; }
.shadow { fill: var(--krds-primary-70); opacity: 0.12; }
.rim { fill: var(--krds-primary-70); }
.face { fill: var(--krds-primary-50); }
.mark { fill: none; stroke: var(--krds-primary-10); stroke-width: 3; }
.coins--small .mark { stroke-width: 1.6; }
.spark { fill: var(--krds-primary-50); }
.spark--soft { fill: var(--krds-primary-10); }
</style>
