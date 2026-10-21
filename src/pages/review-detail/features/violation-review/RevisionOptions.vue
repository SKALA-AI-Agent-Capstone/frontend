<!--
  문구 단위 HITL 결정 — violation별로 kept/rewritten/rewritten_manual 중 하나를 확정하거나,
  확정 전에 "다시쓰기"를 요청한다(2026-10-20 HITL 재설계). 결정은 매 클릭마다 바로 저장되고
  로컬에만 있다가 사라지는 상태가 아니다. 담당자 승인 전이면 저장한 결정을 다시 바꿀 수 있다.
-->
<script setup>
import { computed, ref, watch } from 'vue'
import { VIOLATION_RESOLUTION, VIOLATION_RESOLUTION_LABEL } from '@/shared/constants/review'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseTextarea from '@/shared/components/base/BaseTextarea.vue'
import { formatDateTime } from '@/shared/utils/format'
import { t } from '@/shared/i18n'

const props = defineProps({
  violation: { type: Object, required: true },
  // 결정 저장과 다시쓰기 요청. 부모가 돌려주는 Promise를 기다려 진행 표시와 오류를 보인다.
  decide: { type: Function, required: true },
  retry: { type: Function, required: true },
  // 담당자 승인 전에만 저장한 결정을 다시 바꿀 수 있다 (서버도 같은 규칙)
  editable: { type: Boolean, default: true },
})

const retryNote = ref('')
const showRetryNote = ref(false)
const manualText = ref('')
const showManualInput = ref(false)
const editing = ref(false) // 저장한 결정을 다시 고치는 중
const busy = ref(null) // 진행 중인 동작 키
const error = ref(null)

const decided = computed(() => Boolean(props.violation.finalResolution))
const decidedLabel = computed(() => VIOLATION_RESOLUTION_LABEL[props.violation.finalResolution] ?? null)
const retryExhausted = computed(() => props.violation.humanRetryCount >= props.violation.humanRetryLimit)

// 서버에 새 결정이 저장되면 고치기 모드를 닫는다
watch(
  () => [props.violation.finalResolution, props.violation.finalText, props.violation.decidedAt],
  () => {
    editing.value = false
    showManualInput.value = false
  },
)

async function run(key, action) {
  error.value = null
  busy.value = key
  try {
    await action()
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    busy.value = null
  }
}

const keep = () => run('kept', () => props.decide(VIOLATION_RESOLUTION.KEPT))
const adopt = () => run('rewritten', () => props.decide(VIOLATION_RESOLUTION.REWRITTEN))
function toggleManual() {
  showManualInput.value = !showManualInput.value
  // 처음 열 때는 지금 문구에서 시작해 조금만 고치면 되게 한다
  if (showManualInput.value && !manualText.value.trim()) {
    manualText.value = (decided.value ? props.violation.finalText : props.violation.rewriteSuggestion) ?? ''
  }
}
function submitManual() {
  if (!manualText.value.trim()) {
    error.value = t('reviewDetail.revision.manualRequired')
    return
  }
  run(VIOLATION_RESOLUTION.REWRITTEN_MANUAL, () =>
    props.decide(VIOLATION_RESOLUTION.REWRITTEN_MANUAL, { finalText: manualText.value.trim() }),
  )
}
async function submitRetry() {
  if (await run('retry', () => props.retry(retryNote.value.trim() || undefined))) {
    retryNote.value = ''
    showRetryNote.value = false
  }
}
function startEdit() {
  error.value = null
  manualText.value = props.violation.finalText ?? ''
  showManualInput.value = false
  editing.value = true
}
function cancelEdit() {
  error.value = null
  editing.value = false
  showManualInput.value = false
  showRetryNote.value = false
}
</script>

<template>
  <div class="revision">
    <template v-if="decided && !editing">
      <BaseAlert :variant="decidedLabel?.variant ?? 'success'" icon="check_circle" :title="decidedLabel?.label ?? violation.finalResolution">
        <p class="revision__final">{{ violation.finalText }}</p>
        <p class="revision__decided-meta">
          {{ violation.decidedByName ?? $t('reviewDetail.revision.system') }}, {{ formatDateTime(violation.decidedAt) }}
        </p>
      </BaseAlert>
      <div v-if="editable" class="revision__actions">
        <BaseButton variant="outline" size="sm" icon="edit" @click="startEdit">{{ $t('reviewDetail.revision.edit') }}</BaseButton>
      </div>
    </template>

    <template v-else>
      <div v-if="violation.rewriteSuggestion" class="revision__suggestion">
        <p class="revision__suggestion-label">{{ $t('reviewDetail.revision.suggestionLabel') }}</p>
        <p class="revision__suggestion-text">{{ violation.rewriteSuggestion }}</p>
      </div>
      <p v-else class="revision__empty">
        {{ $t('reviewDetail.revision.noSuggestion') }}
      </p>

      <p v-if="editing" class="revision__current">
        {{ $t('reviewDetail.revision.current') }} <strong>{{ violation.finalText }}</strong>
      </p>

      <BaseAlert v-if="error" variant="danger" aria-live="assertive">{{ error }}</BaseAlert>

      <div class="revision__actions">
        <BaseButton variant="outline" size="sm" :busy="busy === 'kept'" @click="keep">{{ $t('reviewDetail.revision.keep') }}</BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!violation.rewriteSuggestion"
          :busy="busy === 'rewritten'"
          @click="adopt"
        >
          {{ $t('reviewDetail.revision.adopt') }}
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click="toggleManual">{{ $t('reviewDetail.revision.manual') }}</BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          :disabled="retryExhausted"
          @click="showRetryNote = !showRetryNote"
        >
          {{ $t('reviewDetail.revision.retry') }} ({{ violation.humanRetryCount }}/{{ violation.humanRetryLimit }})
        </BaseButton>
        <BaseButton v-if="editing" variant="ghost" size="sm" @click="cancelEdit">{{ $t('reviewDetail.revision.cancelEdit') }}</BaseButton>
      </div>

      <div v-if="showManualInput" class="revision__panel">
        <BaseTextarea v-model="manualText" :rows="2" :placeholder="$t('reviewDetail.revision.manualPlaceholder')" />
        <BaseButton size="sm" :busy="busy === VIOLATION_RESOLUTION.REWRITTEN_MANUAL" @click="submitManual">{{ $t('reviewDetail.revision.manualSave') }}</BaseButton>
      </div>

      <div v-if="showRetryNote" class="revision__panel">
        <BaseTextarea v-model="retryNote" :rows="2" :placeholder="$t('reviewDetail.revision.retryPlaceholder')" />
        <BaseButton size="sm" :busy="busy === 'retry'" @click="submitRetry">{{ $t('reviewDetail.revision.retrySend') }}</BaseButton>
      </div>

      <p v-if="retryExhausted" class="revision__limit">
        {{ $t('reviewDetail.revision.retryLimit', { limit: violation.humanRetryLimit }) }}
      </p>
    </template>

    <details v-if="violation.rewrites?.length" class="revision__history">
      <summary>{{ $t('reviewDetail.revision.history', { count: violation.rewrites.length }) }}</summary>
      <ul>
        <li v-for="attempt in violation.rewrites" :key="attempt.attemptNo">
          <BaseBadge :variant="attempt.requestedByHuman ? 'info' : 'neutral'">
            {{ $t(attempt.requestedByHuman ? 'reviewDetail.revision.byHuman' : 'reviewDetail.revision.auto') }}
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
/* 수정 제안: 카드 안에서 가장 먼저 읽히도록 바탕색과 왼쪽 선으로 띄우고 본문보다 크게 쓴다 */
.revision__suggestion {
  padding: 14px 16px;
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  background: var(--color-primary-subtle);
}
.revision__suggestion-label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-active);
}
.revision__suggestion-text {
  margin-top: 4px;
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-bold);
  line-height: 1.5;
  color: var(--color-text);
  overflow-wrap: anywhere;
}
.revision__empty {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.revision__final {
  font-size: var(--font-size-body-m);
  font-weight: var(--font-weight-bold);
  overflow-wrap: anywhere;
}
.revision__current {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
.revision__current strong { color: var(--color-text); }
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
