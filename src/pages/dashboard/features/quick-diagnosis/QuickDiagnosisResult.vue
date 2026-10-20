<script setup>
import { computed } from 'vue'
import { STATUS } from '@/shared/constants/status'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'

const props = defineProps({
  result: { type: Object, required: true }, // { level, matches }
})

const TITLES = {
  [STATUS.DANGER]: '위반 위험 높음 — 사전 자율심의가 필요합니다',
  [STATUS.WARNING]: '주의 표현 포함 — 실증자료 확인이 필요합니다',
  [STATUS.SUCCESS]: '주요 금지 표현이 발견되지 않았습니다',
}

const title = computed(() => TITLES[props.result.level])
</script>

<template>
  <BaseAlert :variant="result.level" :title="title" aria-live="polite">
    <ul v-if="result.matches.length" class="matches">
      <li v-for="match in result.matches" :key="match.term">
        <BaseBadge :variant="match.level">{{ match.term }}</BaseBadge>
        {{ match.reason }}
      </li>
    </ul>
    <p v-else>간이진단 결과이며, 최종 판단은 정식 자율심의를 통해 확인하십시오.</p>
  </BaseAlert>
</template>

<style scoped>
.matches {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.matches li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
</style>
