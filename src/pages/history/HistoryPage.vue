<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { APPROVAL_LABEL, APPROVAL_STATE } from '@/shared/constants/review'
import { FOOTER } from '@/shared/constants/site'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import BaseEmptyState from '@/shared/components/base/BaseEmptyState.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'
import PageHeading from '@/shared/components/layout/PageHeading.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import HistoryTable from './features/history-table/HistoryTable.vue'

const reviews = useReviewsStore()
const session = useSessionStore()

const route = useRoute()
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const approval = ref('')
const approvalOptions = Object.values(APPROVAL_STATE).map((s) => ({ value: s, label: APPROVAL_LABEL[s].label }))

const rows = computed(() =>
  reviews.list
    .map((review) => ({ review, version: reviews.latest(review) }))
    .filter(({ review }) => !keyword.value.trim() || `${review.productName} ${review.id} ${review.campaign?.name ?? ''} ${reviews.latest(review).input.copy}`.includes(keyword.value.trim()))
    .filter(({ version }) => !approval.value || version.approval.state === approval.value),
)

const confirmAll = ref(false)
const deletedNotice = ref(null)
const deleteError = ref(null)
const deleteScope = computed(() =>
  session.can(PERMISSIONS.REVIEW_DELETE_ANY) ? `${session.tenant?.name}의 전체 검토 이력` : '내가 작성한 전체 검토 이력',
)

async function deleteAll() {
  deleteError.value = null
  try {
    const count = await reviews.deleteAll()
    confirmAll.value = false
    deletedNotice.value = `${count}건을 삭제했습니다.`
  } catch (e) { deleteError.value = e.message; confirmAll.value = false; await reviews.load() }
}
</script>

<template>
  <div class="history-page">
    <PageHeading boxed badge="심의 결과 보존 ,  재조회" title="심의 이력" description="과거 심의 결과를 다시 보고 리포트를 다시 받을 수 있습니다." :breadcrumbs="[{ label: '심의 이력' }]">
      <template #aside>
        <BaseButton variant="outline" icon="delete_sweep" :disabled="!reviews.list.length" @click="confirmAll = true">전체 삭제</BaseButton>
      </template>
    </PageHeading>

    <BaseAlert variant="neutral" icon="inventory">{{ FOOTER.retentionNotice }} 자동 만료(TTL) 삭제는 하지 않습니다.</BaseAlert>
    <BaseAlert v-if="deleteError" variant="danger">{{ deleteError }}</BaseAlert>
    <BaseAlert v-if="deletedNotice" variant="success" aria-live="polite">{{ deletedNotice }}</BaseAlert>

    <div class="history-page__filters" role="search">
      <label class="sr-only" for="history-keyword">제품명, 캠페인 검색</label>
      <BaseInput id="history-keyword" v-model="keyword" type="search" leading-icon="search" placeholder="제품명, 검토번호, 캠페인 검색" />
      <label class="sr-only" for="history-approval">승인 상태</label>
      <BaseSelect id="history-approval" v-model="approval" :options="approvalOptions" placeholder="승인 상태 전체" />
    </div>

    <HistoryTable v-if="rows.length" :rows="rows" />
    <BaseEmptyState v-else icon="history" title="검토 이력이 없습니다">
      <BaseButton :to="{ name: ROUTE_NAMES.REVIEW_NEW }">새 검토 시작</BaseButton>
    </BaseEmptyState>

    <BaseConfirmDialog v-model:open="confirmAll" title="전체 검토 이력을 삭제할까요?" confirm-label="전체 삭제" danger @confirm="deleteAll">
      {{ deleteScope }}이 판정, 근거, 승인 이력과 함께 모두 삭제되며 되돌릴 수 없습니다.
    </BaseConfirmDialog>
  </div>
</template>

<style scoped>
.history-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
.history-page__filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .history-page__filters {
    grid-template-columns: 1fr;
  }
}
</style>
