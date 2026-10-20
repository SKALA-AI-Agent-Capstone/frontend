<!-- 대체 광고 카피 수정안 (FR-5) — 시안 krds_3 '권고 문구 ,  문구 적용' 행 -->
<script setup>
import { rewriteLabel } from '@/shared/api/engine/detect'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'

defineProps({
  rewrites: { type: Array, required: true }, // [{ text, keep?, note? }]
  appliedIndex: { type: Number, default: null },
})
defineEmits(['apply', 'cancel'])
</script>

<template>
  <div class="revision">
    <p class="revision__label">대체 광고 카피 수정안</p>
    <ul class="revision__list">
      <li
        v-for="(rewrite, index) in rewrites"
        :key="index"
        class="revision__item"
        :class="{ 'revision__item--applied': appliedIndex === index }"
      >
        <div class="revision__body">
          <p class="revision__text">
            <BaseIcon :name="appliedIndex === index ? 'check_circle' : 'recommend'" size="sm" />
            권고: <strong>{{ rewriteLabel(rewrite) }}</strong>
          </p>
          <p v-if="rewrite.note" class="revision__note">{{ rewrite.note }}</p>
        </div>
        <BaseButton v-if="appliedIndex === index" variant="ghost" size="sm" @click="$emit('cancel')">반영 취소</BaseButton>
        <BaseButton v-else variant="outline" size="sm" @click="$emit('apply', index)">문구 적용</BaseButton>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.revision {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.revision__label {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.revision__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.revision__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-xs) var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
}
.revision__item--applied {
  border-color: var(--color-success-border);
  background: var(--color-success-surface);
}
.revision__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.revision__text {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-body-s);
}
.revision__text :deep(.base-icon) {
  color: var(--color-success-text);
}
.revision__note {
  padding-left: calc(var(--icon-size-sm) + var(--space-xs));
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
</style>
