import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchEnvironment, type Environment } from '../api/environment'

export const useEnvironmentStore = defineStore('environment', () => {
  const data = ref<Environment | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function refresh() {
    if (loading.value) return
    loading.value = true
    error.value = ''
    try {
      data.value = await fetchEnvironment()
    } catch {
      data.value = null
      error.value = '백엔드 연결을 확인할 수 없습니다. Spring Boot와 API 프록시 설정을 확인해 주세요.'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, refresh }
})
