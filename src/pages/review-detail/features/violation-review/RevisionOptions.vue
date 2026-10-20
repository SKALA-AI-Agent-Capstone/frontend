<!--
  문구 단위 HITL 결정 — violation별로 kept/rewritten/rewritten_manual 중 하나를 확정하거나,
  확정 전에 "다시쓰기"를 요청한다(2026-10-20 HITL 재설계). 결정은 매 클릭마다 바로 저장되고
  로컬에만 있다가 사라지는 상태가 아니다.
-->
<script setup>
import { computed, ref } from 'vue'
import { VIOLATION_RESOLUTION, VIOLATION_RESOLUTION_LABEL } from '@/shared/constants/review'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseTextarea from '@/shared/components/base/BaseTextarea.vue'
import { formatDateTime } from '@/shared/utils/format'

const props = defineProps({
  violation: { type: Object, required: true },
})
const emit = defineEmits(['decide', 'retry'])

const retryNote = ref('')
const showRetryNote = ref(false)
const manualText = ref('')
const showManualInput = ref(false)
const busy = ref(null) // 진행 중인 동작 키
const error = ref(null)

const decided = computed(() => Boolean(props.violation.finalResolution))
const decidedLabel = computed(() => VIOLATION_RESOLUTION_LABEL[props.violation.finalResolution] ?? null)
const retryExhausted = computed(() => props.violation.humanRetryCount >= props.violation.humanRetryLimit)

async function run(key, action) {
  error.value = null
  busy.value = key
  try {
    await action()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = null
  }
}

const keep = () => run('kept', () => emit('decide', VIOLATION_RESOLUTION.KEPT))
const adopt = () => run('rewritten', () => emit('decide', VIOLATION_RESOLUTION.REWRITTEN))
function submitManual() {
  if (!manualText.value.trim()) {
    error.value = '직접 수정할 문구를 입력해 주세요.'
    return
  }
  run(VIOLATION_RESOLUTION.REWRITTEN_MANUAL, () =>
    emit('decide', VIOLATION_RESOLUTION.REWRITTEN_MANUAL, { finalText: manualText.value.trim() }),
  )
}
function submitRetry() {
  run('retry', () => emit('retry', retryNote.value.trim() || undefined)).then(() => {
    retryNote.value = ''
    showRetryNote.value = false
  })
}
</script>

<template>
  <div class="revision">
    <template v-if="decided">
      <BaseAlert :variant="decidedLabel?.variant ?? 'success'" icon="check_circle" :title="decidedLabel?.label ?? violation.finalResolution">
        <p>{{ violation.finalText }}</p>
        <p class="revision__decided-meta">
          {{ violation.decidedByName ?? '시스템' }} · {{ formatDateTime(violation.decidedAt) }}
        </p>
      </BaseAlert>
    </template>

    <template v-else>
      <p v-if="violation.rewriteSuggestion" class="revision__suggestion">
        <strong>수정 제안:</strong> {{ violation.rewriteSuggestion }}
      </p>
      <p v-else class="revision__suggestion revision__suggestion--empty">
        아직 생성된 수정안이 없습니다. 원문을 유지하거나 다시쓰기를 요청하세요.
      </p>

      <BaseAlert v-if="error" variant="danger" aria-live="assertive">{{ error }}</BaseAlert>

      <div class="revision__actions">
        <BaseButton variant="outline" size="sm" :busy="busy === 'kept'" @click="keep">원문 유지</BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!violation.rewriteSuggestion"
          :busy="busy === 'rewritten'"
          @click="adopt"
        >
          수정안 채택
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click="showManualInput = !showManualInput">직접 수정</BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          :disabled="retryExhausted"
          @click="showRetryNote = !showRetryNote"
        >
          다시쓰기 요청 ({{ violation.humanRetryCount }}/{{ violation.humanRetryLimit }})
        </BaseButton>
      </div>

      <div v-if="showManualInput" class="revision__panel">
        <BaseTextarea v-model="manualText" :rows="2" placeholder="직접 수정할 문구를 입력하세요." />
        <BaseButton size="sm" :busy="busy === VIOLATION_RESOLUTION.REWRITTEN_MANUAL" @click="submitManual">직접 수정 저장</BaseButton>
      </div>

      <div v-if="showRetryNote" class="revision__panel">
        <BaseTextarea v-model="retryNote" :rows="2" placeholder="다시 쓸 때 참고할 방향을 적어주세요 (선택)." />
        <BaseButton size="sm" :busy="busy === 'retry'" @click="submitRetry">다시쓰기 요청 보내기</BaseButton>
      </div>

      <p v-if="retryExhausted" class="revision__limit">
        사람의 다시쓰기 요청 한도({{ violation.humanRetryLimit }}회)를 모두 썼습니다. 원문 유지 또는 직접 수정으로 확정하세요.
      </p>
    </template>

    <details v-if="violation.rewrites?.length" class="revision__history">
      <summary>리라이트 시도 이력 ({{ violation.rewrites.length }}건)</summary>
      <ul>
        <li v-for="attempt in violation.rewrites" :key="attempt.attemptNo">
          <BaseBadge :variant="attempt.requestedByHuman ? 'info' : 'neutral'">
            {{ attempt.requestedByHuman ? '사람 요청' : '자동' }}
          </BaseBadge>
          {{ attempt.text }}
          <span v-if="attempt.retryNote" class="revision__history-note"> — {{ attempt.retryNote }}</span>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.revision {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.revision__suggestion {
  font-size: var(--font-size-body-s);
}
.revision__suggestion--empty {
  color: var(--color-text-secondary);
}
.revision__decided-meta {
  margin-top: var(--space-xs);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.revision__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}
.revision__panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.revision__limit {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.revision__history {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.revision__history ul {
  margin-top: var(--space-xs);
  padding-left: var(--space-lg);
  list-style: disc;
}
.revision__history-note {
  color: var(--color-text-secondary);
}
</style>
