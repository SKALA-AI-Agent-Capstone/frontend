<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlankLayout from '@/shared/layouts/BlankLayout.vue'
import DefaultLayout from '@/shared/layouts/DefaultLayout.vue'
import LegalDocumentModal from '@/shared/components/legal/LegalDocumentModal.vue'
import { useReviewsStore } from '@/shared/stores/reviews'

const route = useRoute()
const reviews = useReviewsStore()
// Review data is loaded from Backend after authentication.

const layout = computed(() => (route.meta.layout === 'blank' ? BlankLayout : DefaultLayout))
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <LegalDocumentModal />
</template>
