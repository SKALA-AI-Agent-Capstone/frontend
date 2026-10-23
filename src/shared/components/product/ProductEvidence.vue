<!--
  제품 증빙: 시험 성적서 등을 제품에 올려 두면 서버가 한 번 읽고, 기관과 코드, 버전, 이 제품의 쪽 범위를 보여 준다.
  같은 파일을 다시 올리면 다시 읽지 않고, 같은 코드의 다른 파일이면 개정본으로 표시한다. 읽는 중에는 이 제품의 검토를 시작할 수 없다.
-->
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { t } from '@/shared/i18n'
import { DOC_TYPE_OPTIONS } from '@/shared/constants/review'
import { evidenceErrorKey, EVIDENCE_MAX_BYTES, failureKey, useProductEvidenceStore } from '@/shared/stores/productEvidence'
import { formatDateTime, formatFileSize } from '@/shared/utils/format'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseConfirmDialog from '@/shared/components/base/BaseConfirmDialog.vue'
import BaseFileDropzone from '@/shared/components/base/BaseFileDropzone.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'

const props = defineProps({ productId: { type: String, required: true }, canEdit: { type: Boolean, default: true } })
const store = useProductEvidenceStore()
const items = computed(() => store.list(props.productId))
const docType = ref('clinical_test')
const uploading = ref(false)
const error = ref('')
const notice = ref('')
const removing = ref(null)
const rereading = ref('')
const loaded = ref(false)

function message(e) { const key = evidenceErrorKey(e.message); return key ? t(key) : e.message }

watch(() => props.productId, async (id) => {
  loaded.value = false
  try { await store.load(id) } catch (e) { error.value = message(e) }
  loaded.value = true
}, { immediate: true })
onBeforeUnmount(() => store.clear(props.productId))

async function pick(files) {
  error.value = ''
  notice.value = ''
  const file = files[0]
  if (!file) return
  if (file.size > EVIDENCE_MAX_BYTES) { error.value = t('products.evidence.errors.FILE_LIMIT_25_MIB'); return }
  uploading.value = true
  try {
    const saved = await store.upload(props.productId, file, docType.value)
    if (saved.reused) notice.value = t('products.evidence.reused', { name: saved.fileName })
  } catch (e) { error.value = message(e) }
  finally { uploading.value = false }
}

async function reread(item) {
  error.value = ''
  rereading.value = item.id
  try { await store.reread(props.productId, item.id) } catch (e) { error.value = message(e) }
  finally { rereading.value = '' }
}

async function remove() {
  const item = removing.value
  removing.value = null
  try { await store.remove(props.productId, item.id) } catch (e) { error.value = message(e) }
}

const docLabel = value => DOC_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value
const readingNow = computed(() => items.value.some(item => item.status === 'reading'))
const statusVariant = item => (item.status === 'reading' ? 'info' : item.status === 'failed' ? 'danger' : item.unreadPages?.length ? 'warning' : 'success')
const statusLabel = item => (item.status === 'reading' ? t('products.evidence.status.reading')
  : item.status === 'failed' ? t('products.evidence.status.failed')
    : item.unreadPages?.length ? t('products.evidence.status.partial') : t('products.evidence.status.done'))
const failureText = (code) => { const key = failureKey(code); return key ? t(key) : code }
// [[6,7],[9,9]] -> "6-7, 9"
const ranges = ranges => (ranges ?? []).map(([from, to]) => (from === to ? `${from}` : `${from}-${to}`)).join(', ')
const productRanges = item => ranges(item.productMatch?.ranges)
const codeStatus = code => (code.status === 'confirmed' ? '' : t(`products.evidence.codeStatus.${code.status}`))
</script>

<template>
  <section class="evidence" :aria-labelledby="`evidence-title-${productId}`">
    <header class="evidence__head">
      <h2 :id="`evidence-title-${productId}`" class="evidence__title">{{ $t('products.evidence.title') }}</h2>
      <p class="evidence__hint">{{ $t('products.evidence.hint') }}</p>
    </header>

    <BaseAlert v-if="readingNow" variant="info" role="status">{{ $t('products.evidence.readingBlocked') }}</BaseAlert>
    <BaseAlert v-if="notice" variant="info">{{ notice }}</BaseAlert>
    <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>

    <div v-if="canEdit" class="evidence__upload">
      <label class="evidence__type">
        <span>{{ $t('products.evidence.docType') }}</span>
        <BaseSelect v-model="docType" :options="DOC_TYPE_OPTIONS" />
      </label>
      <BaseFileDropzone
        :title="uploading ? $t('products.evidence.uploading') : $t('products.evidence.pick')"
        :description="$t('products.evidence.pickHint')"
        :button-label="$t('products.evidence.pickButton')"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        @select="pick"
      />
    </div>

    <p v-if="loaded && !items.length" class="evidence__empty">{{ $t('products.evidence.empty') }}</p>

    <ul v-if="items.length" class="evidence__list">
      <li v-for="item in items" :key="item.id" class="item" :class="{ 'item--old': !item.isCurrent }">
        <div class="item__top">
          <div class="item__name">
            <strong>{{ item.fileName }}</strong>
            <span class="item__meta">{{ docLabel(item.docType) }} · {{ formatFileSize(item.fileSize) }} · {{ formatDateTime(item.createdAt) }}</span>
          </div>
          <BaseBadge :variant="statusVariant(item)" :dot="item.status === 'reading'">{{ statusLabel(item) }}</BaseBadge>
          <BaseBadge v-if="!item.isCurrent" variant="secondary">{{ $t('products.evidence.replaced') }}</BaseBadge>
        </div>

        <p v-if="item.status === 'reading'" class="item__note">{{ $t('products.evidence.readingText') }}</p>
        <p v-else-if="item.status === 'failed'" class="item__note item__note--danger">{{ failureText(item.failureCode) }}</p>

        <dl v-if="item.status === 'done'" class="item__facts">
          <div>
            <dt>{{ $t('products.evidence.issuer') }}</dt>
            <dd>{{ item.issuer?.name ?? $t('products.evidence.issuerUnknown') }}</dd>
          </div>
          <div v-for="code in item.codes" :key="code.label">
            <dt>{{ code.label }}</dt>
            <dd>
              {{ code.value }}
              <BaseBadge v-if="codeStatus(code)" variant="warning">{{ codeStatus(code) }}</BaseBadge>
            </dd>
          </div>
          <div v-if="item.version">
            <dt>{{ $t('products.evidence.version') }}</dt>
            <dd>{{ item.version }}</dd>
          </div>
          <div>
            <dt>{{ $t('products.evidence.pages') }}</dt>
            <dd>{{ $t('products.evidence.pageCount', { count: item.pageCount }) }}</dd>
          </div>
          <div>
            <dt>{{ $t('products.evidence.productPages') }}</dt>
            <dd v-if="item.productMatch">{{ productRanges(item) || $t('products.evidence.noPageFound') }}</dd>
            <dd v-else>{{ $t('products.evidence.productNotFound') }}</dd>
          </div>
        </dl>

        <ul v-if="item.status === 'done' && item.productMatch?.results?.length" class="item__results">
          <li v-for="(result, index) in item.productMatch.results" :key="index">
            {{ $t('products.evidence.result', { item: result.item || $t('products.evidence.itemUnknown'), pct: result.changePct, page: result.page }) }}
          </li>
        </ul>

        <p v-if="item.changeNote" class="item__note item__note--warning">{{ item.changeNote }}</p>
        <p v-if="item.unreadPages?.length" class="item__note item__note--warning">
          {{ $t('products.evidence.unread', { pages: item.unreadPages.join(', ') }) }}
        </p>

        <div v-if="canEdit && item.status !== 'reading'" class="item__actions">
          <BaseButton size="sm" variant="outline" icon="refresh" :busy="rereading === item.id" @click="reread(item)">
            {{ $t('products.evidence.reread') }}
          </BaseButton>
          <BaseButton size="sm" variant="ghost" icon="delete" @click="removing = item">{{ $t('products.evidence.remove') }}</BaseButton>
        </div>
      </li>
    </ul>

    <BaseConfirmDialog :open="!!removing" @update:open="removing = null" :title="$t('products.evidence.removeTitle')"
      :confirm-label="$t('products.evidence.remove')" danger @confirm="remove">
      {{ $t('products.evidence.removeText', { name: removing?.fileName ?? '' }) }}
    </BaseConfirmDialog>
  </section>
</template>

<style scoped>
.evidence {
  display: grid;
  gap: var(--space-md);
  padding: 24px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-surface);
}
.evidence__title { font-size: var(--font-size-title-m); font-weight: var(--font-weight-bold); }
.evidence__hint, .evidence__empty { color: var(--color-text-secondary); font-size: var(--font-size-body-s); }
.evidence__upload { display: grid; gap: 12px; }
.evidence__type { display: grid; gap: 6px; max-width: 320px; font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); }
.evidence__list { display: grid; gap: 12px; list-style: none; padding: 0; margin: 0; }
.item { display: grid; gap: 10px; padding: 16px; border: var(--border-width) solid var(--color-border); border-radius: 12px; }
.item--old { background: var(--color-bg-muted); }
.item__top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.item__name { display: grid; flex: 1; min-width: 0; }
.item__name strong { overflow-wrap: anywhere; }
.item__meta { color: var(--color-text-secondary); font-size: var(--font-size-detail-s); }
.item__note { font-size: var(--font-size-body-s); color: var(--color-text-secondary); }
.item__note--danger { color: var(--color-danger-text); }
.item__note--warning { color: var(--color-warning-text); }
.item__facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px 16px; margin: 0; }
.item__facts dt { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.item__facts dd { margin: 0; font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.item__results { margin: 0; padding-left: 18px; font-size: var(--font-size-body-s); }
.item__actions { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
