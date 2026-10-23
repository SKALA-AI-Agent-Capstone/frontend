<!--
  이 제품의 임시저장한 검토 신청서(2026-10-23). 브라우저 IndexedDB에 저장된 것만 보이며, 누르면 신청 화면에서 이어서 작성한다.
  저장한 사용자의 이 브라우저에서만 보인다. 임시저장이 없으면 아무것도 그리지 않는다.
-->
<script setup>
import { computed, ref, watch } from 'vue'
import { ROUTE_NAMES } from '@/shared/constants/routes'
import { useSessionStore } from '@/shared/stores/session'
import { deleteDraft, listDrafts } from '@/shared/utils/draftStore'
import { formatDateTime } from '@/shared/utils/format'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

const props = defineProps({
  productId: { type: String, required: true },
})

const session = useSessionStore()
const drafts = ref([])
const pending = ref(null) // 삭제를 확인 중인 임시저장
const deleting = ref(false)

async function load() {
  try {
    drafts.value = await listDrafts({ tenantId: session.tenant?.id, userId: session.user?.id, productId: props.productId })
  } catch {
    drafts.value = [] // 브라우저 저장소를 쓸 수 없으면 칸을 그리지 않는다
  }
}
watch(() => [props.productId, session.user?.id], load, { immediate: true })

const resumeRoute = (draft) => ({ name: ROUTE_NAMES.REVIEW_NEW, query: { product: props.productId, draft: draft.id } })
const titleOf = (draft) => draft.files?.[0]?.name ?? null

const confirmOpen = computed({
  get: () => Boolean(pending.value),
  set: (value) => { if (!value) pending.value = null },
})

async function remove() {
  if (!pending.value) return
  deleting.value = true
  try {
    await deleteDraft(pending.value.id)
    drafts.value = drafts.value.filter((d) => d.id !== pending.value.id)
    pending.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section v-if="drafts.length" class="drafts" aria-labelledby="drafts-title">
    <div class="drafts__head">
      <h2 id="drafts-title">{{ $t('products.drafts.title') }} <span class="drafts__count">{{ drafts.length }}</span></h2>
      <p class="drafts__note">{{ $t('products.drafts.note') }}</p>
    </div>
    <ul class="drafts__list">
      <li v-for="draft in drafts" :key="draft.id" class="draft">
        <span class="draft__icon" aria-hidden="true"><BaseIcon name="draft" size="md" /></span>
        <div class="draft__body">
          <RouterLink :to="resumeRoute(draft)" class="draft__name">{{ titleOf(draft) ?? $t('products.drafts.untitled') }}</RouterLink>
          <p class="draft__meta">
            <span>{{ $t('products.drafts.counts', { ads: draft.files?.length ?? 0, evidence: draft.evidence?.length ?? 0 }) }}</span>
            <span>{{ $t('products.drafts.savedAt', { time: formatDateTime(draft.savedAt) }) }}</span>
          </p>
        </div>
        <div class="draft__actions">
          <BaseButton variant="secondary" size="sm" :to="resumeRoute(draft)">{{ $t('products.drafts.resume') }}</BaseButton>
          <BaseButton variant="ghost" size="sm" icon="delete" @click="pending = draft">{{ $t('products.drafts.delete') }}</BaseButton>
        </div>
      </li>
    </ul>

    <BaseConfirmDialog v-model:open="confirmOpen" :title="$t('products.drafts.deleteTitle')"
      :confirm-label="$t('products.drafts.delete')" danger :busy="deleting" @confirm="remove">
      {{ $t('products.drafts.deleteText') }}
    </BaseConfirmDialog>
  </section>
</template>

<style scoped>
.drafts {
  display: grid;
  gap: 12px;
  padding: 18px 24px;
  border: 1.5px dashed var(--color-border-strong);
  border-radius: 12px;
  background: var(--color-bg-surface);
}
.drafts__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; }
.drafts__head h2 { display: flex; align-items: center; gap: 8px; font-size: var(--font-size-title-s); font-weight: var(--font-weight-bold); }
.drafts__count {
  padding: 0 8px;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.drafts__note { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.drafts__list { display: grid; gap: 8px; }
.draft {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--color-bg-page);
}
.draft__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-warning-surface);
  color: #b86e00;
}
.draft__body { flex: 1; min-width: 0; }
.draft__name { font-weight: var(--font-weight-bold); color: var(--color-text); text-decoration: none; overflow-wrap: anywhere; }
.draft__name:hover { color: var(--color-primary); }
.draft__meta { display: flex; flex-wrap: wrap; gap: 2px 12px; margin-top: 2px; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.draft__actions { display: flex; gap: 6px; flex: none; }
@media (max-width: 760px) {
  .draft { flex-wrap: wrap; }
  .draft__actions { width: 100%; justify-content: flex-end; }
}
</style>
