<script setup>
import { t } from '@/shared/i18n'
import { computed, onMounted, ref } from 'vue'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { request } from '@/shared/api/http'
import { useSessionStore } from '@/shared/stores/session'
import { useCreditsStore } from '@/shared/stores/credits'
import { PERMISSIONS } from '@/shared/constants/roles'
import { CREDIT_PACKAGES } from '@/shared/constants/pricing'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'

const session = useSessionStore()
const credits = useCreditsStore()
const step = ref('select')
const packageCredits = ref(100)
const config = ref({ tossEnabled: false, tossClientKey: '', tossMode: 'legacy' })
const busy = ref(false)
const tossConsent = ref(false)
const error = ref('')
const selectedPackage = computed(() => CREDIT_PACKAGES.find((item) => item.credits === packageCredits.value))
const formatWon = (amount) => t('credits.won', { amount: amount.toLocaleString('ko-KR') })
const enabled = computed(() => config.value.tossEnabled)

async function beginPayment() {
  error.value = ''
  busy.value = true
  try {
    const order = await request('/billing/orders', {
      method: 'POST', body: JSON.stringify({ credits: packageCredits.value, method: 'toss' }),
    })
    const sdk = await loadTossPayments(order.clientKey)
    const paymentRequest = {
      orderId: order.orderId, orderName: t('credits.orderName', { count: order.credits }),
      successUrl: `${window.location.origin}/credits?provider=toss`,
      failUrl: `${window.location.origin}/credits?payment=failed`,
    }
    if (order.tossMode === 'window') {
      const widgets = sdk.widgets({ customerKey: session.user.id })
      await widgets.setAmount({ currency: 'KRW', value: order.amount })
      const paymentWindow = await widgets.renderPaymentWindow({ orderName: paymentRequest.orderName })
      paymentWindow.on('paymentRequest', async () => {
        try { await widgets.requestPayment(paymentRequest) }
        catch (cause) { error.value = cause instanceof Error ? cause.message : t('credits.startFailed') }
      })
      paymentWindow.on('cancel', () => { busy.value = false })
    } else {
      const payment = sdk.payment({ customerKey: session.user.id })
      await payment.requestPayment({
        ...paymentRequest, method: 'CARD', amount: { currency: 'KRW', value: order.amount },
        card: { flowMode: 'DIRECT', easyPay: 'TOSSPAY' },
      })
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : t('credits.startFailed')
  } finally {
    busy.value = false
  }
}
onMounted(async () => {
  try {
    config.value = await request('/billing/config')
    await credits.loadBalance()
    const params = new URLSearchParams(window.location.search)
    const provider = params.get('provider')
    const orderId = params.get('orderId')
    if (provider && orderId) {
      busy.value = true
      if (provider !== 'toss') throw new Error(t('credits.unknownProvider'))
      const result = await request(`/billing/orders/${encodeURIComponent(orderId)}/confirm-toss`, {
        method: 'POST', body: JSON.stringify({ paymentKey: params.get('paymentKey'), amount: Number(params.get('amount')) }),
      })
      credits.setBalance(result.balance)
      step.value = 'done'
    } else if (params.get('payment')) {
      error.value = t('credits.cancelled')
    }
    if (window.location.search) window.history.replaceState({}, '', '/credits')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : t('credits.confirmFailed')
  } finally {
    busy.value = false
  }
})
</script>

<template>
  <main class="credits-page">
    <header class="credits-page__header">
      <p class="credits-page__eyebrow">CREDITS</p>
      <h1>{{ $t('credits.title') }}</h1>
      <p>{{ $t('credits.lead') }}</p>
    </header>
    <BaseCard v-if="!session.can(PERMISSIONS.CREDITS_CHARGE)" tag="section" class="credits-page__card">
      <h2>{{ $t('credits.noPermission') }}</h2>
    </BaseCard>
    <template v-else>
      <p v-if="error" role="alert" class="credits-page__error">{{ error }}</p>
      <BaseCard v-if="step === 'select'" tag="section" class="credits-page__card">
        <h2>{{ $t('credits.packages') }}</h2>
        <fieldset class="credits-page__packages"><legend class="sr-only">{{ $t('credits.packagesLegend') }}</legend>
          <label v-for="item in CREDIT_PACKAGES" :key="item.credits" class="credits-page__package" :class="{ 'credits-page__package--selected': packageCredits === item.credits }">
            <input v-model="packageCredits" type="radio" name="credit-package" :value="item.credits" />
            <strong>{{ $t('credits.amount', { count: item.credits.toLocaleString('ko-KR') }) }}</strong><span>{{ formatWon(item.price) }}</span>
            <small v-if="item.discountPercent">{{ $t('credits.discount', { percent: item.discountPercent }) }}</small>
          </label>
        </fieldset>
        <dl class="credits-page__summary">
          <div><dt>{{ $t('credits.method') }}</dt><dd>{{ $t('credits.tossPay') }}</dd></div>
          <div><dt>{{ $t('credits.total') }}</dt><dd>{{ formatWon(selectedPackage.price) }}</dd></div>
        </dl>
        <p v-if="config.tossMode === 'window'" class="credits-page__hint">{{ $t('credits.windowHint') }}</p>
        <p v-if="!enabled" class="credits-page__hint">{{ $t('credits.keyHint') }}</p>
        <label v-if="config.tossMode === 'legacy'" class="credits-page__consent">
          <input v-model="tossConsent" type="checkbox" />
          <span>{{ $t('credits.consent') }}
            <a href="https://pages.tosspayments.com/terms/user" target="_blank" rel="noopener noreferrer">{{ $t('credits.terms') }}</a>,
            <a href="https://pages.tosspayments.com/terms/privacy/consent1privacy/consent1" target="_blank" rel="noopener noreferrer">{{ $t('credits.privacy') }}</a>,
            <a href="https://pages.tosspayments.com/terms/privacy/consent2privacy/consent2" target="_blank" rel="noopener noreferrer">{{ $t('credits.thirdParty') }}</a>
          </span>
        </label>
        <BaseButton :disabled="!enabled || busy || (config.tossMode === 'legacy' && !tossConsent)" @click="beginPayment">{{ busy ? $t('credits.busy') : $t('credits.pay') }}</BaseButton>
      </BaseCard>
      <BaseCard v-else tag="section" class="credits-page__card" aria-live="polite">
        <h2>{{ $t('credits.done') }}</h2>
        <p>{{ $t('credits.current') }} <strong>{{ $t('credits.amount', { count: credits.balance.toLocaleString('ko-KR') }) }}</strong></p>
        <BaseButton @click="step = 'select'">{{ $t('credits.again') }}</BaseButton>
      </BaseCard>
    </template>
  </main>
</template>
<style scoped>
.credits-page { max-width: 780px; margin: 0 auto; display: grid; gap: var(--space-lg); padding-bottom: var(--space-xl); }
.credits-page__header h1 { margin: var(--space-xs) 0; }
.credits-page__header p:last-child, .credits-page__hint { color: var(--color-text-secondary); }
.credits-page__eyebrow { color: var(--color-primary); font-weight: var(--font-weight-bold); letter-spacing: .12em; }
.credits-page__card { display: grid; gap: var(--space-md); }
.credits-page__card h2 { margin: 0; }
.credits-page__packages { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-sm); border: 0; padding: 0; margin: 0; }
.credits-page__package { display: grid; gap: var(--space-xs); padding: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; }
.credits-page__package--selected { border-color: var(--color-primary); background: var(--color-bg-page); }
.credits-page__package strong { color: var(--color-primary); }
.credits-page__package small { color: var(--color-text-secondary); }
.credits-page__summary { margin: 0; display: grid; gap: var(--space-sm); }
.credits-page__summary div { display: flex; justify-content: space-between; gap: var(--space-md); }
.credits-page__summary dd { margin: 0; font-weight: var(--font-weight-bold); }
.credits-page__consent { display: flex; align-items: flex-start; gap: var(--space-sm); }
.credits-page__consent a { text-decoration: underline; }
.credits-page__error { padding: var(--space-md); color: var(--color-danger-text); border: 1px solid var(--color-danger); border-radius: var(--radius-md); }
.credits-page__actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
</style>
