<!--
  검토할 제품 고르기(2026-10-22 제품 단위 검토). 제품 이름과 유형은 제품 화면에서 바꾸고 여기서는 고르기만 한다.
  없는 제품은 이 자리에서 바로 등록하고 고를 수 있다. 기능성 심사(보고) 번호는 받지 않는다(Agent가 제품 이름으로 조회한다).
-->
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useProductsStore } from '@/shared/stores/products'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseSelect from '@/shared/components/base/BaseSelect.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import ProductFormModal from '@/shared/components/product/ProductFormModal.vue'
import ProductThumb from '@/shared/components/product/ProductThumb.vue'
import { useReviewDraft } from '../../composables/useReviewDraft'

const { draft, selectProduct } = useReviewDraft()
const products = useProductsStore()
const formOpen = ref(false)

onMounted(() => products.load())

const options = computed(() => products.list.map((product) => ({ value: product.id, label: product.name })))
const selected = computed(() => products.byId(draft.productId))
const productId = computed({
  get: () => draft.productId,
  set: (id) => selectProduct(products.byId(id)),
})

// 주소나 이전 검토로 정해진 제품은 목록을 받은 뒤 이름과 유형을 채운다. 없는 제품이면 선택을 비운다.
watch([() => products.loaded, () => draft.productId], ([loaded, id]) => {
  if (!loaded || !id) return
  const product = products.byId(id)
  if (!product) selectProduct(null)
  else if (draft.product.name !== product.name || draft.product.category !== product.type) selectProduct(product)
}, { immediate: true })

function onSaved(product) {
  selectProduct(product)
}
</script>

<template>
  <FormSection :title="$t('reviewNew.product.title')" :aside="$t('reviewNew.product.aside')">
    <BaseFormField class="span-full" :label="$t('reviewNew.product.select')" for-id="product-select" required
      :hint="products.loaded && !options.length ? $t('reviewNew.product.none') : $t('reviewNew.product.selectHint')">
      <div class="pick">
        <BaseSelect id="product-select" v-model="productId" :options="options"
          :placeholder="$t('reviewNew.product.selectPlaceholder')" required />
        <BaseButton variant="outline" icon="add_circle" @click="formOpen = true">{{ $t('reviewNew.product.register') }}</BaseButton>
      </div>
    </BaseFormField>
    <div v-if="selected" class="span-full chosen">
      <ProductThumb :product="selected" size="sm" />
      <span class="chosen__name">{{ selected.name }}</span>
      <span class="chosen__type">{{ $t(`products.type.${selected.type}`) }}</span>
    </div>
    <ProductFormModal v-model:open="formOpen" @saved="onSaved" />
  </FormSection>
</template>

<style scoped>
.pick { display: flex; gap: 8px; align-items: stretch; }
.pick > :first-child { flex: 1; min-width: 0; }
.chosen {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-bg-page);
}
.chosen__name { font-weight: var(--font-weight-bold); overflow-wrap: anywhere; }
.chosen__type {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-bg-muted);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
@media (max-width: 760px) {
  .pick { flex-direction: column; }
}
</style>
