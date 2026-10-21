import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { t } from '@/shared/i18n'
import { request } from '@/shared/api/http'

// 검토 사용량 과금은 아직 연결되지 않았다. 잔액은 서버의 충전 내역에서 조회한다.
export const useCreditsStore = defineStore('credits', () => {
  const balance = ref(0)
  async function loadBalance() {
    const response = await request('/billing/balance')
    balance.value = response.balance
  }
  function setBalance(value) { balance.value = value }
  function resetBalance() { balance.value = 0 }
  return {
    balance, loadBalance, setBalance, resetBalance,
    ledger: computed(() => []),
    enabled: false,
    precheck: () => ({ ok: true, enabled: false, balance: 0, shortfall: 0 }),
    charge: () => { throw new Error(t('ui.errors.billingNotConnected')) },
  }
})
