<!--
  제품 증빙: 시험 성적서 등을 제품에 올려 두면 서버가 한 번 읽고, 기관과 코드, 버전, 이 제품의 쪽 범위를 보여 준다.
  같은 파일을 다시 올리면 다시 읽지 않고, 같은 코드의 다른 파일이면 개정본으로 표시한다. 읽는 중에는 이 제품의 검토를 시작할 수 없다.
  올리거나 다시 읽으면 마스코트가 나와 다 읽을 때까지 뒤 화면을 막고, 끝나면 결과를 알려 준다. 30초가 지나면 기다리지 않고 닫을 수 있다.
  방금 올린 파일은 목록에서 "방금 올림"으로 표시한다.
  제품 상세의 "증빙 서류" 모달 안에 놓인다. 목록을 받고 지우는 일은 제품 상세가 맡고(버튼에 개수를 보여 주려고), 여기서는 열 때 한 번 더 받는다.
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
import MascotNotice from '@/shared/components/feedback/MascotNotice.vue'

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

// 마스코트 알림: busy인 동안 뒤 화면을 막는다. tracking은 다 읽기를 기다리는 증빙 id다.
const mascot = ref({ open: false, busy: false, message: '', detail: '' })
const tracking = ref('')
const justAdded = ref('')
const canSkip = ref(false)
let skipTimer = 0
function showBusy(messageKey, detail = '') {
  clearTimeout(skipTimer)
  canSkip.value = false
  skipTimer = setTimeout(() => { canSkip.value = true }, 30000)
  mascot.value = { open: true, busy: true, message: t(messageKey), detail }
}
function showResult(messageKey, detail = '') {
  clearTimeout(skipTimer)
  canSkip.value = false
  tracking.value = ''
  mascot.value = { open: true, busy: false, message: t(messageKey), detail }
}
function hideMascot() { clearTimeout(skipTimer); tracking.value = ''; mascot.value = { ...mascot.value, open: false, busy: false } }
onBeforeUnmount(() => clearTimeout(skipTimer))

// 기다리던 증빙의 읽기가 끝나면 결과를 알려 준다
watch(() => items.value.find(item => item.id === tracking.value), (item) => {
  if (!tracking.value) return
  if (!item) { hideMascot(); return }
  if (item.status === 'reading') return
  if (item.status === 'failed') showResult('products.evidence.mascot.failed', failureText(item.failureCode))
  else if (item.unreadPages?.length) showResult('products.evidence.mascot.partial', t('products.evidence.unread', { pages: item.unreadPages.join(', ') }))
  else showResult('products.evidence.mascot.done', item.fileName)
})

async function markAdded(id) {
  justAdded.value = id
  await nextTick()
  document.getElementById(`evidence-item-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

function message(e) { const key = evidenceErrorKey(e.message); return key ? t(key) : e.message }

watch(() => props.productId, async (id) => {
  loaded.value = false
  try { await store.load(id) } catch (e) { error.value = message(e) }
  loaded.value = true
}, { immediate: true })

async function pick(files) {
  error.value = ''
  notice.value = ''
  const file = files[0]
  if (!file) return
  if (file.size > EVIDENCE_MAX_BYTES) { error.value = t('products.evidence.errors.FILE_LIMIT_25_MIB'); return }
  uploading.value = true
  showBusy('products.evidence.mascot.uploading', file.name)
  try {
    const saved = await store.upload(props.productId, file, docType.value)
    markAdded(saved.id)
    if (saved.reused) {
      notice.value = t('products.evidence.reused', { name: saved.fileName })
      showResult('products.evidence.mascot.reused', saved.fileName)
    } else {
      tracking.value = saved.id
      showBusy('products.evidence.mascot.reading', t('products.evidence.mascot.readingDetail', { name: saved.fileName }))
    }
  } catch (e) { error.value = message(e); hideMascot() }
  finally { uploading.value = false }
}

async function reread(item) {
  error.value = ''
  rereading.value = item.id
  showBusy('products.evidence.mascot.reading', t('products.evidence.mascot.readingDetail', { name: item.fileName }))
  try {
    await store.reread(props.productId, item.id)
    // 서버가 다시 읽기를 받은 뒤에 기다린다(먼저 정하면 예전 결과를 보고 바로 끝난 것으로 안다)
    tracking.value = item.id
  } catch (e) { error.value = message(e); hideMascot() }
  finally { rereading.value = '' }
}

async function remove() {
  const item = removing.value
  removing.value = null
  try { await store.remove(props.productId, item.id) } catch (e) { error.value = message(e) }
}

const docLabel = value => DOC_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value
const readingNow = computed(() => items.value.some(item => item.status === 'reading'))
// 이 제품의 쪽 중 OCR과 AI가 숫자를 다르게 읽은 쪽. 다른 제품의 쪽은 이 제품에 영향이 없다.
const productCheck = item => item.productMatch?.checkPages ?? []
const needsLook = item => !!item.unreadPages?.length || !!productCheck(item).length
const statusVariant = item => (item.status === 'reading' ? 'info' : item.status === 'failed' ? 'danger' : needsLook(item) ? 'warning' : 'success')
const statusLabel = item => (item.status === 'reading' ? t('products.evidence.status.reading')
  : item.status === 'failed' ? t('products.evidence.status.failed')
    : item.unreadPages?.length ? t('products.evidence.status.partial')
      : productCheck(item).length ? t('products.evidence.status.check') : t('products.evidence.status.done'))
const failureText = (code) => { const key = failureKey(code); return key ? t(key) : code }
// [[6,7],[9,9]] -> "6-7, 9"
const ranges = ranges => (ranges ?? []).map(([from, to]) => (from === to ? `${from}` : `${from}-${to}`)).join(', ')
const productRanges = item => ranges(item.productMatch?.ranges)
const codeStatus = code => (code.status === 'confirmed' ? '' : t(`products.evidence.codeStatus.${code.status}`))
</script>

<template>
  <div class="evidence">
    <p class="evidence__hint">{{ $t('products.evidence.hint') }}</p>

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
      <li v-for="item in items" :id="`evidence-item-${item.id}`" :key="item.id" class="item" :class="{ 'item--old': !item.isCurrent, 'item--new': item.id === justAdded }">
        <div class="item__top">
          <div class="item__name">
            <strong>{{ item.fileName }}</strong>
            <span class="item__meta">{{ docLabel(item.docType) }} · {{ formatFileSize(item.fileSize) }} · {{ formatDateTime(item.createdAt) }}</span>
          </div>
          <BaseBadge :variant="statusVariant(item)" :dot="item.status === 'reading'">{{ statusLabel(item) }}</BaseBadge>
          <BaseBadge v-if="item.id === justAdded" variant="info">{{ $t('products.evidence.justAdded') }}</BaseBadge>
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
        <p v-if="productCheck(item).length" class="item__note item__note--warning">
          {{ $t('products.evidence.checkProduct', { pages: productCheck(item).join(', ') }) }}
        </p>
        <p v-else-if="item.checkPages?.length" class="item__note">
          {{ $t('products.evidence.checkOther', { pages: item.checkPages.join(', ') }) }}
        </p>
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

    <MascotNotice v-model:open="mascot.open" :busy="mascot.busy" :message="mascot.message" :detail="mascot.detail" :duration="2600">
      <BaseButton v-if="mascot.busy && canSkip" size="sm" variant="outline" @click="hideMascot">{{ $t('products.evidence.mascot.skip') }}</BaseButton>
    </MascotNotice>

    <BaseConfirmDialog :open="!!removing" @update:open="removing = null" :title="$t('products.evidence.removeTitle')"
      :confirm-label="$t('products.evidence.remove')" danger @confirm="remove">
      {{ $t('products.evidence.removeText', { name: removing?.fileName ?? '' }) }}
    </BaseConfirmDialog>
  </div>
</template>

<style scoped>
.evidence { display: grid; gap: var(--space-md); }
.evidence__hint, .evidence__empty { color: var(--color-text-secondary); font-size: var(--font-size-body-s); }
.evidence__upload { display: grid; gap: 12px; }
.evidence__type { display: grid; gap: 6px; max-width: 320px; font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); }
.evidence__list { display: grid; gap: 12px; list-style: none; padding: 0; margin: 0; }
.item { display: grid; gap: 10px; padding: 16px; border: var(--border-width) solid var(--color-border); border-radius: 12px; }
.item--old { background: var(--color-bg-muted); }
.item--new { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-info-surface); animation: item-new 1.6s ease-out; }
@keyframes item-new { from { background: var(--color-info-surface); } to { background: transparent; } }
@media (prefers-reduced-motion: reduce) { .item--new { animation: none; } }
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
