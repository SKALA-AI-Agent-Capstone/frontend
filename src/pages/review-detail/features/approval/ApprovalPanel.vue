<!--
  HITL 승인 게이트 (FR-6)
  - 검토자,관리자만 승인/반려/수정요청 가능 (NFR-9), 작성자는 상태만 확인
  - 최종 책임이 승인자에게 있음을 명시하고 확인 체크 후 처리 (NFR-2)
  - 과거 버전은 이력만 표시 — 결정은 최신 버전에만
-->
<script setup>
import { computed, ref, watch } from 'vue'
import { APPROVAL_ACTIONS, APPROVAL_LABEL, APPROVAL_STATE } from '@/shared/constants/review'
import { legalSearch } from '@/shared/constants/legal'
import { PERMISSIONS } from '@/shared/constants/roles'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseCheckbox from '@/shared/components/base/BaseCheckbox.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import BaseTextarea from '@/shared/components/base/BaseTextarea.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ApprovalHistory from './ApprovalHistory.vue'

const { review, version, isLatest } = useReviewDetail()
const legal = computed(() => legalSearch(version.value?.result))
const reviews = useReviewsStore()
const session = useSessionStore()

const canDecide = computed(() => session.can(PERMISSIONS.REVIEW_APPROVE) && isLatest.value && version.value.approval.state === 'pending')
const state = computed(() => APPROVAL_LABEL[version.value.approval.state])
const comment = ref('')
const acknowledged = ref(false)
const error = ref(null)

watch(() => version.value.no, () => {
  comment.value = ''
  acknowledged.value = false
  error.value = null
})

async function decide(action) {
  error.value = null
  if (!acknowledged.value) {
    error.value = '최종 책임 확인에 체크해 주세요.'
    return
  }
  if (!comment.value.trim()) {
    error.value = `${action.label} 사유를 입력해 주세요.`
    return
  }
  try { await reviews.decide(review.value.id, version.value.no, action.state, comment.value) }
  catch (e) { error.value = e.message; return }
  comment.value = ''
  acknowledged.value = false
}
</script>

<template>
  <BaseCard tag="section" class="approval" aria-labelledby="approval-title">
    <BaseSectionHeader title="담당자 승인" heading-id="approval-title" size="md">
      <BaseBadge :variant="state.variant" dot>{{ state.label }}</BaseBadge>
    </BaseSectionHeader>

    <template v-if="canDecide">
      <BaseAlert variant="warning" icon="gavel" title="최종 책임은 승인자에게 있습니다">
        AI 검토 결과는 판단을 돕는 참고 자료입니다. 원문과 근거를 직접 확인한 뒤 처리해 주세요.
      </BaseAlert>
      <BaseFormField label="검토 의견" for-id="approval-comment" :hint="legal.approvalHint">
        <BaseTextarea id="approval-comment" v-model="comment" :rows="3" placeholder="담당자에게 전달할 의견을 입력하세요." />
      </BaseFormField>
      <BaseCheckbox v-model="acknowledged" label="AI 결과와 원문,근거를 직접 확인했으며, 승인 결정의 책임이 본인에게 있음을 확인합니다." />
      <BaseAlert v-if="error" variant="danger" aria-live="assertive">{{ error }}</BaseAlert>
      <div class="approval__actions">
        <BaseButton
          v-for="action in APPROVAL_ACTIONS"
          :key="action.state"
          :variant="action.variant"
          :disabled="version.approval.state === action.state && action.state === APPROVAL_STATE.APPROVED"
          @click="decide(action)"
        >
          {{ action.label }}
        </BaseButton>
      </div>
    </template>
    <p v-else-if="!isLatest" class="approval__note">이전 버전입니다. 승인 처리는 최신 버전에서만 할 수 있습니다.</p>
    <p v-else-if="version.approval.state !== 'pending'" class="approval__note">이 버전의 담당자 결정이 저장되었습니다.</p>
    <p v-else class="approval__note">승인,반려,수정 요청은 검토자 또는 관리자만 할 수 있습니다.</p>

    <BaseAlert v-if="version.approval.agentResume === 'pending'" variant="warning">결정은 저장됐지만 실행 재개는 대기 중입니다. 자동 재시도는 아직 연결되지 않았습니다.</BaseAlert>
    <ApprovalHistory :history="version.approval.history" :version-no="version.no" />
  </BaseCard>
</template>

<style scoped>
.approval {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.approval__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-sm);
}
.approval__note {
  font-size: var(--font-size-body-s);
  color: var(--color-text-secondary);
}
</style>
