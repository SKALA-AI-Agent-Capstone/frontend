<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { PERMISSIONS } from '@/shared/constants/roles'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { FOOTER } from '@/shared/constants/site'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import ScreenTitle from '@/shared/components/layout/ScreenTitle.vue'
import { useReviewsStore } from '@/shared/stores/reviews'
import { useSessionStore } from '@/shared/stores/session'
import HistoryTable from './features/history-table/HistoryTable.vue'
import { t } from '@/shared/i18n'

const reviews = useReviewsStore()
const session = useSessionStore()

const route = useRoute()
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')

const rows = computed(() =>
  reviews.list
    .map((review) => ({ review, version: reviews.latest(review) }))
    .filter(({ review }) => !keyword.value.trim() || `${review.productName} ${review.id} ${review.campaign?.name ?? ''} ${reviews.latest(review).input.copy}`.includes(keyword.value.trim()))

)

const confirmAll = ref(false)
const deletedNotice = ref(null)
const deleteError = ref(null)
const deleteScope = computed(() =>
  session.can(PERMISSIONS.REVIEW_DELETE_ANY) ? t('history.scopeTenant', { name: session.tenant?.name }) : t('history.scopeMine'),
)

async function deleteAll() {
  deleteError.value = null
  try {
    const count = await reviews.deleteAll()
    confirmAll.value = false
    deletedNotice.value = t('history.deleted', { count })
  } catch (e) { deleteError.value = e.message; confirmAll.value = false; await reviews.load() }
}
</script>

<template>
  <div class="history-page">
    <ScreenTitle :title="$t('history.title')" :description="$t('history.description')" :count="reviews.list.length">
      <BaseButton variant="outline" icon="delete_sweep" :disabled="!reviews.list.length" @click="confirmAll = true">{{ $t('history.deleteAll') }}</BaseButton>
    </ScreenTitle>

    <BaseAlert v-if="deleteError" variant="danger">{{ deleteError }}</BaseAlert>
    <BaseAlert v-if="deletedNotice" variant="success" aria-live="polite">{{ deletedNotice }}</BaseAlert>

    <section class="list" :aria-label="$t('history.listLabel')">
      <div class="list__toolbar" role="search">
        <label class="sr-only" for="history-keyword">{{ $t('history.searchLabel') }}</label>
        <BaseInput id="history-keyword" v-model="keyword" type="search" leading-icon="search" :placeholder="$t('history.searchPlaceholder')" />
      </div>

      <HistoryTable v-if="rows.length" :rows="rows" />
      <p v-else-if="!reviews.loaded" class="list__empty" role="status">{{ $t('common.listLoading') }}</p>
      <div v-else class="list__empty">
        <p class="list__empty-title">{{ reviews.list.length ? $t('history.emptyFiltered') : $t('history.empty') }}</p>
        <p class="list__empty-text">{{ reviews.list.length ? $t('history.emptyFilteredText') : $t('history.emptyText') }}</p>
        <BaseButton v-if="!reviews.list.length" variant="outline" size="sm" :to="{ name: ROUTE_NAMES.REVIEW_NEW }">{{ $t('history.newReview') }}</BaseButton>
      </div>
    </section>

    <p class="history-page__note">{{ FOOTER.retentionNotice }} {{ $t('history.noTtl') }}</p>

    <BaseConfirmDialog v-model:open="confirmAll" :title="$t('history.confirmAllTitle')" :confirm-label="$t('history.deleteAll')" danger @confirm="deleteAll">
      {{ $t('history.confirmAllText', { scope: deleteScope }) }}
    </BaseConfirmDialog>
  </div>
</template>

<style scoped>
.history-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-lg);
  padding-bottom: var(--space-4xl);
}
.list {
  background: var(--color-bg-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  overflow: clip;
}
.list__toolbar {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-sm);
  padding: 16px 24px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.list__empty {
  display: grid;
  justify-items: center;
  gap: var(--space-sm);
  padding: 72px 24px;
  text-align: center;
}
.list__empty-title { font-size: var(--font-size-body-l); font-weight: var(--font-weight-bold); }
.list__empty-text { color: var(--color-text-secondary); margin-bottom: var(--space-sm); }
.history-page__note { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }

@media (max-width: 600px) {
  .list__toolbar {
    grid-template-columns: 1fr;
    padding: 12px 16px;
  }
}
</style>
