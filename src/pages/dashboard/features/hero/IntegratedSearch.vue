<script setup>
import { ref } from 'vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseInput from '@/shared/components/base/BaseInput.vue'
import { SEARCH } from './hero.data'

const emit = defineEmits(['search'])
const keyword = ref('')

function submit() {
  if (keyword.value.trim()) emit('search', keyword.value.trim())
}

function pickKeyword(word) {
  keyword.value = word
  submit()
}
</script>

<template>
  <div class="integrated-search">
    <label for="violation-search" class="integrated-search__label">{{ SEARCH.label }}</label>
    <form class="integrated-search__form" role="search" @submit.prevent="submit">
      <BaseInput
        id="violation-search"
        v-model="keyword"
        type="search"
        leading-icon="search"
        :placeholder="SEARCH.placeholder"
      />
      <BaseButton type="submit" variant="secondary">{{ SEARCH.submitLabel }}</BaseButton>
    </form>
    <div class="integrated-search__keywords">
      <span>추천 검색어:</span>
      <button
        v-for="word in SEARCH.keywords"
        :key="word"
        type="button"
        class="keyword-chip"
        @click="pickKeyword(word)"
      >
        #{{ word }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.integrated-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-lg);
  border-top: var(--border-width) solid var(--color-border);
}
.integrated-search__label {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.integrated-search__form {
  display: flex;
  gap: var(--space-sm);
}
.integrated-search__keywords {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
.keyword-chip {
  padding: var(--space-2xs) var(--space-sm);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
}
.keyword-chip:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  color: var(--color-primary-active);
}

@media (max-width: 600px) {
  .integrated-search__form {
    flex-direction: column;
  }
}
</style>
