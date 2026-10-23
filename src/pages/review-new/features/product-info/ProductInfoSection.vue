<!--
  검토할 제품 고르기(2026-10-22 제품 단위 검토). 제품 이름과 유형은 제품 화면에서 바꾸고 여기서는 고르기만 한다.
  없는 제품은 이 자리에서 바로 등록하고 고를 수 있다. 기능성 심사(보고) 번호는 받지 않는다(Agent가 제품 이름으로 조회한다).
-->
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useProductsStore } from '@/shared/stores/products'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseFormField from '@/shared/components/base/BaseFormField.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import FormSection from '@/shared/components/form/FormSection.vue'
import ProductFormModal from '@/shared/components/product/ProductFormModal.vue'
import ProductThumb from '@/shared/components/product/ProductThumb.vue'
import { useReviewDraft } from '../../composables/useReviewDraft'

const { draft, selectProduct } = useReviewDraft()
const products = useProductsStore()
const formOpen = ref(false)
const query = ref('')
const pickerOpen = ref(false)
const activeIndex = ref(-1)

onMounted(() => products.load())

const selected = computed(() => products.byId(draft.productId))
const normalize = value => value.normalize('NFKC').trim().toLocaleLowerCase()
const matchingProducts = computed(() => {
  const term = selected.value?.name === query.value ? '' : normalize(query.value)
  return term ? products.list.filter(product => normalize(product.name).includes(term)) : products.list
})
const activeId = computed(() => pickerOpen.value && matchingProducts.value[activeIndex.value]
  ? `product-option-${matchingProducts.value[activeIndex.value].id}` : undefined)

watch(selected, product => {
  if (product) query.value = product.name
}, { immediate: true })
watch(matchingProducts, () => { activeIndex.value = -1 })
watch(activeId, async id => {
  if (!id) return
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ block: 'nearest' })
})

function search(event) {
  query.value = event.target.value
  if (query.value !== selected.value?.name) selectProduct(null)
  pickerOpen.value = true
  activeIndex.value = -1
}

function choose(product) {
  selectProduct(product)
  query.value = product.name
  pickerOpen.value = false
}

function onKeydown(event) {
  if (event.isComposing) return
  if (event.key === 'Escape') {
    if (pickerOpen.value) { event.preventDefault(); event.stopPropagation() }
    pickerOpen.value = false
    return
  }
  if (event.key === 'Enter' && pickerOpen.value) {
    event.preventDefault()
    const product = matchingProducts.value[Math.max(0, activeIndex.value)]
    if (product) choose(product)
    return
  }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
  event.preventDefault()
  pickerOpen.value = true
  const count = matchingProducts.value.length
  if (!count) return
  activeIndex.value = activeIndex.value < 0
    ? (event.key === 'ArrowDown' ? 0 : count - 1)
    : (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
}

// 주소나 이전 검토로 정해진 제품은 목록을 받은 뒤 이름과 유형을 채운다. 없는 제품이면 선택을 비운다.
watch([() => products.loaded, () => draft.productId], ([loaded, id]) => {
  if (!loaded || !id) return
  const product = products.byId(id)
  if (!product) selectProduct(null)
  else if (draft.product.name !== product.name || draft.product.category !== product.type) selectProduct(product)
}, { immediate: true })

function onSaved(product) {
  choose(product)
}
</script>

<template>
  <FormSection :title="$t('reviewNew.product.title')" :aside="$t('reviewNew.product.aside')">
    <BaseFormField class="span-full" :label="$t('reviewNew.product.select')" for-id="product-select" required
      :hint="products.loaded && !products.list.length ? $t('reviewNew.product.none') : $t('reviewNew.product.selectHint')">
      <div class="pick">
        <div class="picker">
          <BaseIcon name="search" class="picker__icon" />
          <input id="product-select" class="control picker__input" :value="query" role="combobox"
            autocomplete="off" aria-autocomplete="list" :aria-expanded="pickerOpen"
            aria-controls="product-options" :aria-activedescendant="activeId"
            :placeholder="$t('reviewNew.product.searchPlaceholder')" required
            @input="search" @focus="pickerOpen = true" @click="pickerOpen = true"
            @blur="pickerOpen = false" @keydown="onKeydown" />
          <div v-if="pickerOpen" class="picker__dropdown">
            <ul id="product-options" role="listbox" :aria-label="$t('reviewNew.product.select')" class="picker__options">
              <li v-for="(product, index) in matchingProducts" :id="`product-option-${product.id}`"
                :key="product.id" role="option" :aria-selected="draft.productId === product.id"
                class="picker__option" :class="{ 'is-active': activeIndex === index, 'is-selected': draft.productId === product.id }"
                @mousedown.prevent @click="choose(product)" @mouseenter="activeIndex = index">
                <span class="picker__name">{{ product.name }}</span>
                <span class="picker__type">{{ $t(`products.type.${product.type}`) }}</span>
              </li>
            </ul>
            <p v-if="!matchingProducts.length" class="picker__empty" role="status">
              {{ $t(products.loaded ? 'reviewNew.product.noResults' : 'common.listLoading') }}
            </p>
          </div>
        </div>
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

<style scoped src="@/shared/styles/control.css"></style>
<style scoped>
.pick { display: flex; gap: 8px; align-items: stretch; }
.pick > :first-child { flex: 1; min-width: 0; }
.picker { position: relative; }
.picker__icon { position: absolute; left: var(--space-md); top: 50%; transform: translateY(-50%); color: var(--color-text-secondary); pointer-events: none; }
.picker__input { padding-left: calc(var(--space-md) + var(--icon-size-md) + var(--space-sm)); }
.picker__dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 10; max-height: 280px; overflow-y: auto; border: var(--border-width) solid var(--color-border-strong); border-radius: var(--radius-md); background: var(--color-bg-surface); box-shadow: var(--shadow-level-3); }
.picker__option { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; cursor: pointer; }
.picker__option.is-active, .picker__option.is-selected { background: var(--color-primary-subtle); }
.picker__option.is-selected { font-weight: var(--font-weight-bold); }
.picker__name { min-width: 0; overflow-wrap: anywhere; }
.picker__type { flex-shrink: 0; font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.picker__empty { padding: 16px; color: var(--color-text-secondary); }
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
