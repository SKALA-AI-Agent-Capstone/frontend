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
import { t } from '@/shared/i18n'

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
    error.value = t('reviewDetail.approval.ackRequired')
    return
  }
  if (!comment.value.trim()) {
    error.value = t('reviewDetail.approval.reasonRequired', { action: action.label })
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
    <BaseSectionHeader :title="$t('reviewDetail.approval.title')" heading-id="approval-title" size="md">
      <BaseBadge :variant="state.variant" dot>{{ state.label }}</BaseBadge>
    </BaseSectionHeader>

    <template v-if="canDecide">
      <BaseAlert variant="warning" icon="gavel" :title="$t('reviewDetail.approval.responsibility')">
        {{ $t('reviewDetail.approval.responsibilityText') }}
      </BaseAlert>
      <BaseFormField :label="$t('reviewDetail.approval.comment')" for-id="approval-comment" :hint="legal.approvalHint">
        <BaseTextarea id="approval-comment" v-model="comment" :rows="3" :placeholder="$t('reviewDetail.approval.commentPlaceholder')" />
      </BaseFormField>
      <BaseCheckbox v-model="acknowledged" :label="$t('reviewDetail.approval.ack')" />
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
    <p v-else-if="!isLatest" class="approval__note">{{ $t('reviewDetail.approval.oldVersion') }}</p>
    <p v-else-if="version.approval.state !== 'pending'" class="approval__note">{{ $t('reviewDetail.approval.saved') }}</p>
    <p v-else class="approval__note">{{ $t('reviewDetail.approval.noPermission') }}</p>

    <BaseAlert v-if="version.approval.agentResume === 'pending'" variant="info">{{ $t('reviewDetail.approval.resumePending') }}</BaseAlert>
    <BaseAlert v-else-if="version.approval.agentResume === 'failed'" variant="warning">
      {{ $t('reviewDetail.approval.resumeFailed', { error: version.approval.agentResumeError || '-' }) }}
    </BaseAlert>
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
