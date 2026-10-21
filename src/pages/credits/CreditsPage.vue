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
import ScreenTitle from '@/shared/components/layout/ScreenTitle.vue'
import CreditCoins from './CreditCoins.vue'

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
const formatCount = (count) => count.toLocaleString('ko-KR')
// 금액권 가격을 크레딧 수로 나눈 1크레딧 값 (pricing.js의 가격에서 계산)
// 크레딧당 값이 가장 낮은 금액권에 '가장 저렴' 표시를 붙인다
const bestCredits = CREDIT_PACKAGES.reduce((best, item) => (item.price / item.credits < best.price / best.credits ? item : best)).credits
const perCredit = (item) => (item.price / item.credits).toLocaleString('ko-KR', { maximumFractionDigits: 1 })

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
  <div class="credits-page">
    <ScreenTitle :title="$t('credits.title')" :description="$t('credits.lead')" />

    <section class="balance" :aria-label="$t('credits.balanceNow')">
      <div class="balance__text">
        <p class="balance__label">{{ $t('credits.balanceNow') }}</p>
        <p class="balance__value">
          <strong>{{ formatCount(credits.balance) }}</strong>
          <span>{{ $t('credits.unit') }}</span>
        </p>
      </div>
      <div class="balance__art"><CreditCoins /></div>
    </section>

    <section v-if="!session.can(PERMISSIONS.CREDITS_CHARGE)" class="panel">
      <h2 class="panel__title">{{ $t('credits.noPermission') }}</h2>
    </section>

    <template v-else>
      <p v-if="error" role="alert" class="credits-page__error">{{ error }}</p>

      <div v-if="step === 'select'" class="checkout">
        <section class="panel" aria-labelledby="packages-title">
          <h2 id="packages-title" class="panel__title">{{ $t('credits.packages') }}</h2>
          <fieldset class="packages">
            <legend class="sr-only">{{ $t('credits.packagesLegend') }}</legend>
            <label
              v-for="item in CREDIT_PACKAGES"
              :key="item.credits"
              class="package"
              :class="{ 'is-selected': packageCredits === item.credits }"
            >
              <input v-model="packageCredits" class="sr-only" type="radio" name="credit-package" :value="item.credits" />
              <span class="package__top">
                <span class="package__mark">
                  <CreditCoins small />
                  <span v-if="item.credits === bestCredits" class="package__best">{{ $t('credits.best') }}</span>
                </span>
                <span v-if="item.discountPercent" class="package__discount">{{ $t('credits.discount', { percent: item.discountPercent }) }}</span>
              </span>
              <span class="package__credits"><strong>{{ formatCount(item.credits) }}</strong> {{ $t('credits.unit') }}</span>
              <span class="package__price">{{ formatWon(item.price) }}</span>
              <span class="package__unit">{{ $t('credits.perCredit', { price: perCredit(item) }) }}</span>
            </label>
          </fieldset>
        </section>

        <aside class="panel summary" aria-labelledby="summary-title">
          <h2 id="summary-title" class="panel__title">{{ $t('credits.summary') }}</h2>
          <dl class="summary__list">
            <div><dt>{{ $t('credits.purchaseCredits') }}</dt><dd>{{ $t('credits.amount', { count: formatCount(selectedPackage.credits) }) }}</dd></div>
            <div><dt>{{ $t('credits.balanceBefore') }}</dt><dd>{{ $t('credits.amount', { count: formatCount(credits.balance) }) }}</dd></div>
            <div><dt>{{ $t('credits.balanceAfter') }}</dt><dd class="is-strong">{{ $t('credits.amount', { count: formatCount(credits.balance + selectedPackage.credits) }) }}</dd></div>
            <div><dt>{{ $t('credits.method') }}</dt><dd>{{ $t('credits.tossPay') }}</dd></div>
          </dl>
          <p class="summary__total">
            <span>{{ $t('credits.total') }}</span>
            <strong>{{ formatWon(selectedPackage.price) }}</strong>
          </p>
          <p v-if="config.tossMode === 'window'" class="summary__hint">{{ $t('credits.windowHint') }}</p>
          <p v-if="!enabled" class="summary__hint">{{ $t('credits.keyHint') }}</p>
          <label v-if="config.tossMode === 'legacy'" class="summary__consent">
            <input v-model="tossConsent" type="checkbox" />
            <span>{{ $t('credits.consent') }}
              <a href="https://pages.tosspayments.com/terms/user" target="_blank" rel="noopener noreferrer">{{ $t('credits.terms') }}</a>,
              <a href="https://pages.tosspayments.com/terms/privacy/consent1privacy/consent1" target="_blank" rel="noopener noreferrer">{{ $t('credits.privacy') }}</a>,
              <a href="https://pages.tosspayments.com/terms/privacy/consent2privacy/consent2" target="_blank" rel="noopener noreferrer">{{ $t('credits.thirdParty') }}</a>
            </span>
          </label>
          <BaseButton class="summary__pay" :disabled="!enabled || busy || (config.tossMode === 'legacy' && !tossConsent)" @click="beginPayment">
            {{ busy ? $t('credits.busy') : $t('credits.payAmount', { amount: formatWon(selectedPackage.price) }) }}
          </BaseButton>
        </aside>
      </div>

      <section v-else class="panel done" aria-live="polite">
        <div class="done__art"><CreditCoins /></div>
        <h2 class="panel__title">{{ $t('credits.done') }}</h2>
        <p>{{ $t('credits.current') }} <strong>{{ $t('credits.amount', { count: formatCount(credits.balance) }) }}</strong></p>
        <BaseButton variant="outline" @click="step = 'select'">{{ $t('credits.again') }}</BaseButton>
      </section>
    </template>
  </div>
</template>
<style scoped>
.credits-page { display: grid; gap: 24px; padding-bottom: var(--space-xl); }

/* 현재 잔액: 큰 숫자와 동전 그림 */
.balance {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  gap: 24px;
  padding: 20px 32px;
  border-radius: 16px;
  background: var(--color-primary-subtle);
  overflow: hidden;
}
.balance__label { font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); color: var(--color-primary-active); }
.balance__value { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; color: var(--color-text); }
.balance__value strong { font-size: 4.4rem; line-height: 1.1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.balance__value span { font-size: var(--font-size-body-m); font-weight: var(--font-weight-bold); }
.balance__art { justify-self: end; width: 168px; }

.panel {
  display: grid;
  align-content: start;
  gap: 20px;
  padding: 24px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-surface);
}
.panel__title { font-size: var(--font-size-title-s); font-weight: var(--font-weight-bold); }

.checkout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: stretch;
  gap: 24px;
}

/* 금액권 카드 */
.packages {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  border: 0;
}
.package {
  position: relative;
  display: grid;
  gap: 4px;
  padding: 16px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), translate var(--transition-fast);
}
.package:hover { border-color: var(--color-primary); translate: 0 -2px; }
.package.is-selected {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
  background: var(--color-primary-subtle);
}
.package:has(input:focus-visible) { outline: var(--focus-ring); outline-offset: 2px; }
.package__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 28px; margin-bottom: 6px; }
.package__discount {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-danger-surface);
  color: var(--color-danger-text);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}
.package__credits { font-size: var(--font-size-body-s); font-weight: var(--font-weight-bold); color: var(--color-text-secondary); }
.package__credits strong { font-size: 2.4rem; color: var(--color-text); font-variant-numeric: tabular-nums; }
.package.is-selected .package__credits strong { color: var(--color-primary-active); }
.package__price { font-size: var(--font-size-body-m); font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; }
.package__unit { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.package__mark { display: flex; align-items: center; gap: 8px; min-width: 0; }
.package__best {
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
}

/* 결제 정보: 넓은 화면에서는 스크롤해도 오른쪽에 남는다 */
.summary { display: flex; flex-direction: column; gap: 16px; }
/* 상자 높이가 늘어도 결제 금액과 버튼은 아래쪽에 모인다 */
.summary__total { margin-top: auto; }
.summary__list { display: grid; gap: 10px; margin: 0; }
.summary__list div { display: flex; justify-content: space-between; gap: 16px; }
.summary__list dt { color: var(--color-text-secondary); }
.summary__list dd { margin: 0; font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.summary__list dd.is-strong { color: var(--color-primary-active); }
.summary__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding-top: 16px;
  border-top: var(--border-width) solid var(--color-border);
  font-weight: var(--font-weight-bold);
}
.summary__total strong { font-size: 2.4rem; font-variant-numeric: tabular-nums; }
.summary__hint { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
.summary__consent { display: flex; align-items: flex-start; gap: 8px; font-size: var(--font-size-detail-s); }
.summary__consent a { text-decoration: underline; }
.summary__pay { width: 100%; }

.done { justify-items: center; text-align: center; padding: 40px 24px; }
.done__art { width: 180px; }

.credits-page__error { padding: var(--space-md); color: var(--color-danger-text); border: 1px solid var(--color-danger); border-radius: var(--radius-md); background: var(--color-danger-surface); }

@media (max-width: 1080px) {
  .checkout { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .balance { grid-template-columns: minmax(0, 1fr) 120px; padding: 20px; }
  .balance__art { width: 120px; }
  .balance__value strong { font-size: 3.4rem; }
  .packages { grid-template-columns: 1fr; }
  .panel { padding: 20px 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .package { transition: none; }
  .package:hover { translate: none; }
}
</style>
