<!--
  제품 등록과 수정. product가 없으면 등록, 있으면 이름과 유형을 고치고 새 이미지를 고른 경우에만 이미지를 바꾼다.
  이미지 형식과 크기는 보내기 전에 한 번 확인하고, 서버가 거절하면 오류 코드에 맞는 문구를 보여 준다.
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
import BaseInput from '@/shared/components/base/BaseInput.vue'
import BaseModal from '@/shared/components/base/BaseModal.vue'
import ProductThumb from './ProductThumb.vue'

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

const editing = computed(() => Boolean(props.product))
const canSave = computed(() => name.value.trim().length > 0 && !saving.value)

function setPreview(file) {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = file ? URL.createObjectURL(file) : null
}

// 열 때마다 현재 제품 값으로 채운다
watch(open, (value) => {
  if (!value) return
  name.value = props.product?.name ?? ''
  type.value = props.product?.type ?? 'general'
  image.value = null
  setPreview(null)
  error.value = ''
}, { immediate: true })
onBeforeUnmount(() => setPreview(null))

function pick(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!PRODUCT_IMAGE_TYPES.includes(file.type)) { error.value = t('products.errors.IMAGE_TYPE_UNSUPPORTED'); return }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) { error.value = t('products.errors.IMAGE_LIMIT_10_MIB'); return }
  error.value = ''
  image.value = file
  setPreview(file)
}

function clearImage() {
  image.value = null
  setPreview(null)
}

async function save() {
  if (!canSave.value) return
  saving.value = true
  error.value = ''
  try {
    const fields = { name: name.value.trim(), type: type.value }
    let saved
    if (editing.value) {
      saved = await products.update(props.product.id, fields)
      if (image.value) saved = await products.replaceImage(props.product.id, image.value)
    } else {
      saved = await products.create({ ...fields, image: image.value })
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
          <img v-if="preview" :src="preview" alt="" class="pform__preview" />
          <ProductThumb v-else-if="product" :product="product" size="lg" />
          <span v-else class="pform__placeholder" aria-hidden="true"></span>
          <div class="pform__image-actions">
            <input ref="fileInput" type="file" :accept="PRODUCT_IMAGE_TYPES.join(',')" class="sr-only" @change="pick" />
            <BaseButton variant="outline" size="sm" icon="image" @click="fileInput?.click()">
              {{ $t(preview || product?.image ? 'products.form.imageChange' : 'products.form.imagePick') }}
            </BaseButton>
            <BaseButton v-if="image" variant="ghost" size="sm" @click="clearImage">{{ $t('products.form.imageClear') }}</BaseButton>
            <span v-if="image" class="pform__file">{{ image.name }}</span>
          </div>
        </div>
      </BaseFormField>

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
.pform__image-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
.pform__file { flex-basis: 100%; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); overflow-wrap: anywhere; }
</style>
