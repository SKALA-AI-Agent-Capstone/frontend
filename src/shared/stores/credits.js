import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { t } from '@/shared/i18n'
import { request } from '@/shared/api/http'

// 검사 시작 시 서버가 100크레딧을 차감한다. 화면 잔액은 안내용이며 서버가 최종 검사한다.
export const useCreditsStore = defineStore('credits', () => {
  const balance = ref(0)
  async function loadBalance() {
    const response = await request('/billing/balance')
    balance.value = response.balance
    return balance.value
  }
  function setBalance(value) { balance.value = value }
  function resetBalance() { balance.value = 0 }
  return {
    balance, loadBalance, setBalance, resetBalance,
    ledger: computed(() => []),
    enabled: true,
    precheck: (required = 100) => ({
      ok: balance.value >= required,
      enabled: true,
      balance: balance.value,
      shortfall: Math.max(0, required - balance.value),
    }),
    charge: () => { throw new Error(t('ui.errors.billingNotConnected')) },
  }
})
