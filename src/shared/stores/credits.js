import { defineStore } from 'pinia'
import { computed } from 'vue'
export const useCreditsStore = defineStore('credits', () => ({
 balance: computed(() => 0), ledger: computed(() => []), enabled: false,
 precheck: () => ({ ok: true, enabled: false, balance: 0, shortfall: 0 }),
 charge: () => { throw new Error('과금 서비스는 이번 최소 기능에서 제외되어 있습니다.') },
}))
