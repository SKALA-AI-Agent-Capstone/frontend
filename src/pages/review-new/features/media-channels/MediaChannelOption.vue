<script setup>
const selected = defineModel({ type: Array, required: true })

defineProps({
  channel: { type: Object, required: true },
})
</script>

<template>
  <label class="channel-option" :class="{ 'channel-option--checked': selected.includes(channel.value) }">
    <input v-model="selected" class="channel-option__input" type="checkbox" name="ad-channels" :value="channel.value" />
    <span class="channel-option__text">
      <span class="channel-option__label">{{ channel.label }}</span>
      <span class="channel-option__desc">{{ channel.description }}</span>
    </span>
  </label>
</template>

<style scoped>
.channel-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border-strong);
  background: var(--color-bg-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
.channel-option:hover {
  border-color: var(--color-primary);
}
.channel-option--checked {
  border: var(--border-width-strong) solid var(--color-primary);
  background: var(--color-info-surface);
}
.channel-option__input {
  flex-shrink: 0;
  width: var(--control-check-size);
  height: var(--control-check-size);
  margin: 0;
  accent-color: var(--color-primary);
}
.channel-option__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.channel-option__label {
  font-size: var(--font-size-label-s);
  line-height: var(--line-height-base);
  font-weight: var(--font-weight-bold);
}
.channel-option__desc {
  font-size: var(--font-size-detail-s);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
}
</style>
