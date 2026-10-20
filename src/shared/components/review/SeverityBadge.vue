<script setup>
import { computed } from 'vue'
import { SEVERITY_LABEL } from '@/shared/constants/review'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'

const props = defineProps({
  severity: { type: String, required: true },
  short: { type: Boolean, default: false },
})
const view = computed(() => SEVERITY_LABEL[props.severity])
</script>

<template>
  <BaseBadge :variant="view.variant" :icon="view.icon">{{ short ? view.short : view.label }}</BaseBadge>
</template>
