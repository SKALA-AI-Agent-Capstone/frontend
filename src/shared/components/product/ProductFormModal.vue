<!--
  제품 등록과 수정. product가 없으면 등록, 있으면 이름과 유형을 고치고 새 이미지를 고른 경우에만 이미지를 바꾼다.
  이미지 형식과 크기는 보내기 전에 한 번 확인하고, 서버가 거절하면 오류 코드에 맞는 문구를 보여 준다.
  고른 이미지는 브라우저에서 배경을 지울 수 있다(2026-10-23). AI가 제품 일부를 지울 수 있어 원본과 나란히 보여 주고 고르게 하며,
  배경을 지운 이미지는 투명도를 지키는 WebP(안 되면 PNG)로 줄여 올린다.
-->
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { t } from '@/shared/i18n'
import {
  PRODUCT_IMAGE_MAX_BYTES, PRODUCT_IMAGE_TYPES, PRODUCT_TYPES, productErrorKey, useProductsStore,
} from '@/shared/stores/products'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import ProductThumb from './ProductThumb.vue'
import { removeImageBackground, toUploadImage } from '@/shared/utils/productImage'

const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
  product: { type: Object, default: null },
})
const emit = defineEmits(['saved'])

const products = useProductsStore()
const titleId = `product-form-${Math.random().toString(36).slice(2, 8)}`
const name = ref('')
const type = ref('general')
const image = ref(null)
const preview = ref(null)
const error = ref('')
const saving = ref(false)
const fileInput = ref(null)
// 배경 지우기: 결과(cutout)와 어느 쪽을 올릴지(choice)
const cutout = ref(null)
const cutoutPreview = ref(null)
const choice = ref('original')
const removing = ref(false)
// 배경 지우기 단계: 'download'(처음 한 번 모델 받기, percent 있음) 또는 'process'(지우는 중)
const removePhase = ref('download')
const removePercent = ref(null)
const removeStatus = computed(() => {
  if (removePhase.value === 'process') return t('products.form.removingProcess')
  return removePercent.value === null
    ? t('products.form.removingPrepare')
    : t('products.form.removingDownload', { percent: removePercent.value })
})

const editing = computed(() => Boolean(props.product))
const canSave = computed(() => name.value.trim().length > 0 && !saving.value && !removing.value)

function setPreview(file) {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = file ? URL.createObjectURL(file) : null
}

function setCutout(blob) {
  if (cutoutPreview.value) URL.revokeObjectURL(cutoutPreview.value)
  cutout.value = blob
  cutoutPreview.value = blob ? URL.createObjectURL(blob) : null
  choice.value = blob ? 'cutout' : 'original'
}

async function removeBackground() {
  if (!image.value || removing.value) return
  removing.value = true
  removePhase.value = 'download'
  removePercent.value = null
  error.value = ''
  const source = image.value
  try {
    // 계산은 Web Worker에서 하므로 화면은 계속 움직이고 진행 상태가 그려진다
    const blob = await removeImageBackground(source, (phase, percent) => {
      removePhase.value = phase
      if (phase === 'download' && percent !== null) removePercent.value = percent
    })
    // 기다리는 사이 다른 이미지를 골랐으면 결과를 버린다
    if (image.value === source) setCutout(blob)
  } catch {
    error.value = t('products.form.removeBgFailed')
  } finally {
    removing.value = false
  }
}

// 열 때마다 현재 제품 값으로 채운다
watch(open, (value) => {
  if (!value) return
  name.value = props.product?.name ?? ''
  type.value = props.product?.type ?? 'general'
  image.value = null
  setPreview(null)
  setCutout(null)
  error.value = ''
}, { immediate: true })
onBeforeUnmount(() => { setPreview(null); setCutout(null) })

function pick(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!PRODUCT_IMAGE_TYPES.includes(file.type)) { error.value = t('products.errors.IMAGE_TYPE_UNSUPPORTED'); return }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) { error.value = t('products.errors.IMAGE_LIMIT_10_MIB'); return }
  error.value = ''
  image.value = file
  setPreview(file)
  setCutout(null)
}

function clearImage() {
  image.value = null
  setPreview(null)
  setCutout(null)
}

async function uploadImage() {
  if (!image.value) return null
  if (choice.value === 'cutout' && cutout.value) return toUploadImage(cutout.value, image.value.name)
  return image.value
}

async function save() {
  if (!canSave.value) return
  saving.value = true
  error.value = ''
  try {
    const fields = { name: name.value.trim(), type: type.value }
    const upload = await uploadImage()
    let saved
    if (editing.value) {
      saved = await products.update(props.product.id, fields)
      if (upload) saved = await products.replaceImage(props.product.id, upload)
    } else {
      saved = await products.create({ ...fields, image: upload })
    }
    open.value = false
    emit('saved', saved)
  } catch (e) {
    const key = productErrorKey(e.message)
    error.value = key ? t(key) : e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal v-model:open="open" :labelledby="titleId">
    <template #header>
      <h2 :id="titleId" class="pform__title">{{ $t(editing ? 'products.form.editTitle' : 'products.form.createTitle') }}</h2>
    </template>

    <form :id="`${titleId}-form`" class="pform" @submit.prevent="save">
      <BaseFormField :label="$t('products.form.name')" :for-id="`${titleId}-name`" required>
        <BaseInput :id="`${titleId}-name`" v-model="name" :placeholder="$t('products.form.namePlaceholder')" required />
      </BaseFormField>

      <fieldset class="pform__types">
        <legend class="pform__legend">{{ $t('products.form.type') }}</legend>
        <label v-for="option in PRODUCT_TYPES" :key="option" class="pform__type" :class="{ 'is-checked': type === option }">
          <input v-model="type" type="radio" :name="`${titleId}-type`" :value="option" />
          <span>{{ $t(`products.type.${option}`) }}</span>
        </label>
      </fieldset>

      <BaseFormField :label="$t('products.form.image')" optional :hint="$t('products.form.imageHint')">
        <div class="pform__image">
          <div v-if="preview" class="pform__preview-wrap">
            <img :src="preview" alt="" class="pform__preview" />
            <div v-if="removing" class="pform__busy" role="status" aria-live="polite">
              <BaseIcon name="progress_activity" class="pform__spinner" />
              <span class="pform__busy-text">{{ removeStatus }}</span>
              <span v-if="removePhase === 'download' && removePercent !== null" class="pform__bar" aria-hidden="true">
                <span :style="{ width: `${removePercent}%` }"></span>
              </span>
            </div>
          </div>
          <ProductThumb v-else-if="product" :product="product" size="lg" />
          <span v-else class="pform__placeholder" aria-hidden="true"></span>
          <div class="pform__image-actions">
            <input ref="fileInput" type="file" :accept="PRODUCT_IMAGE_TYPES.join(',')" class="sr-only" @change="pick" />
            <BaseButton variant="outline" size="sm" icon="image" @click="fileInput?.click()">
              {{ $t(preview || product?.image ? 'products.form.imageChange' : 'products.form.imagePick') }}
            </BaseButton>
            <BaseButton v-if="image && !cutout" variant="outline" size="sm" icon="layers" :busy="removing" @click="removeBackground">
              {{ $t('products.form.removeBg') }}
            </BaseButton>
            <BaseButton v-if="image" variant="ghost" size="sm" :disabled="removing" @click="clearImage">{{ $t('products.form.imageClear') }}</BaseButton>
            <span v-if="image" class="pform__file">{{ image.name }}</span>
            <span v-if="removing" class="pform__file">{{ $t('products.form.removingBg') }}</span>
          </div>
        </div>
      </BaseFormField>

      <fieldset v-if="cutout" class="pform__choices">
        <legend class="pform__legend">{{ $t('products.form.chooseImage') }}</legend>
        <label class="pform__choice" :class="{ 'is-checked': choice === 'original' }">
          <input v-model="choice" type="radio" :name="`${titleId}-choice`" value="original" />
          <img :src="preview" alt="" class="pform__choice-img" />
          <span>{{ $t('products.form.choiceOriginal') }}</span>
        </label>
        <label class="pform__choice" :class="{ 'is-checked': choice === 'cutout' }">
          <input v-model="choice" type="radio" :name="`${titleId}-choice`" value="cutout" />
          <img :src="cutoutPreview" alt="" class="pform__choice-img pform__choice-img--clear" />
          <span>{{ $t('products.form.choiceCutout') }}</span>
        </label>
        <p class="pform__note">{{ $t('products.form.removeBgNote') }}</p>
      </fieldset>

      <BaseAlert v-if="error" variant="danger">{{ error }}</BaseAlert>
    </form>

    <template #footer>
      <BaseButton variant="outline" @click="open = false">{{ $t('ui.cancel') }}</BaseButton>
      <BaseButton type="submit" :form="`${titleId}-form`" :busy="saving" :disabled="!canSave">
        {{ $t(editing ? 'products.form.submitEdit' : 'products.form.submitCreate') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.pform__title { font-size: var(--font-size-title-m); font-weight: var(--font-weight-bold); }
.pform { display: grid; gap: var(--space-lg); }
.pform__types { display: flex; flex-wrap: wrap; gap: 8px; border: 0; padding: 0; margin: 0; }
.pform__legend { margin-bottom: 8px; font-weight: var(--font-weight-bold); }
.pform__type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: var(--border-width) solid var(--color-border-strong);
  border-radius: 10px;
  cursor: pointer;
}
.pform__type.is-checked { border-color: var(--color-primary); background: var(--color-primary-subtle); color: var(--color-primary-active); font-weight: var(--font-weight-bold); }
.pform__type input { accent-color: var(--color-primary); }
.pform__type:focus-within { outline: var(--focus-ring); outline-offset: 2px; }
.pform__image { display: flex; align-items: center; gap: 16px; }
.pform__preview,
.pform__placeholder {
  width: 112px;
  height: 112px;
  flex: none;
  border-radius: 16px;
  object-fit: cover;
  object-position: top;
  background: var(--color-bg-muted);
  outline: 1px solid rgba(0, 0, 0, 0.06);
  outline-offset: -1px;
}
.pform__preview-wrap { position: relative; flex: none; }
.pform__busy {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  text-align: center;
}
.pform__spinner { color: var(--color-primary); animation: pform-spin 1s linear infinite; }
@keyframes pform-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .pform__spinner { animation: none; } }
.pform__busy-text { font-size: var(--font-size-detail-s); font-weight: var(--font-weight-bold); color: var(--color-primary-active); line-height: 1.3; }
.pform__bar { width: 80px; height: 4px; border-radius: var(--radius-full); background: var(--color-bg-muted); overflow: hidden; }
.pform__bar span { display: block; height: 100%; background: var(--color-primary); transition: width 200ms ease; }
.pform__image-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
.pform__file { flex-basis: 100%; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); overflow-wrap: anywhere; }
.pform__choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; border: 0; padding: 0; margin: 0; }
.pform__choice {
  display: grid;
  gap: 8px;
  justify-items: center;
  padding: 12px;
  border: var(--border-width) solid var(--color-border-strong);
  border-radius: 12px;
  cursor: pointer;
  font-weight: var(--font-weight-bold);
}
.pform__choice input { position: absolute; opacity: 0; pointer-events: none; }
.pform__choice.is-checked { border-color: var(--color-primary); background: var(--color-primary-subtle); color: var(--color-primary-active); }
.pform__choice:focus-within { outline: var(--focus-ring); outline-offset: 2px; }
.pform__choice-img { width: 100%; height: 160px; object-fit: contain; border-radius: 8px; background: var(--color-bg-surface); }
/* 투명한 부분이 보이도록 체크무늬 위에 그린다 */
.pform__choice-img--clear {
  background-color: #fff;
  background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
.pform__note { grid-column: 1 / -1; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
</style>
