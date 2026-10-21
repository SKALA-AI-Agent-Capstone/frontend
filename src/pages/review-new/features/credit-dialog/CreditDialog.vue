<!--
  검토 시작 전 크레딧 확인 창.
  - confirm: 잔액이 충분할 때. 현재 잔액에서 이번 검토 비용을 빼는 계산을 영수증처럼 보여 주고 시작을 확인받는다.
  - topup: 잔액이 모자랄 때. 필요한 크레딧 대비 잔액을 막대로 보여 주고 충전 화면으로 안내한다.
  금액은 모두 서버가 준 값(검토 비용, 잔액)이다.
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import CreditCoins from '@/shared/components/review/CreditCoins.vue'
import { formatNumber } from '@/shared/utils/format'

const open = defineModel('open', { type: Boolean, default: false })
const props = defineProps({
  mode: { type: String, required: true }, // confirm | topup
  cost: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['confirm'])

const titleId = `credit-dialog-${useId()}`
const dialogRef = ref(null)
const after = computed(() => props.balance - props.cost)
const shortfall = computed(() => Math.max(0, props.cost - props.balance))
// 충전 안내 막대: 필요한 크레딧 중 지금 가진 비율
const filled = computed(() => (props.cost > 0 ? Math.min(100, Math.round((props.balance / props.cost) * 100)) : 0))

function close() { if (!props.busy) open.value = false }
function onKeydown(event) { if (event.key === 'Escape') close() }
watch(open, async (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  if (isOpen) {
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    dialogRef.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="credit-dialog">
      <div v-if="open" class="backdrop" @click.self="close">
        <div
          ref="dialogRef"
          class="dialog"
          :class="`dialog--${mode}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <button type="button" class="dialog__close" :disabled="busy" @click="close">
            <BaseIcon name="close" size="sm" />
            <span class="sr-only">{{ $t('ui.cancel') }}</span>
          </button>

          <div class="dialog__art"><CreditCoins /></div>
          <h2 :id="titleId" class="dialog__title">
            {{ mode === 'confirm' ? $t('reviewNew.credit.confirmTitle') : $t('reviewNew.credit.topUpTitle') }}
          </h2>

          <!-- 잔액이 충분할 때: 현재 잔액 - 이번 검토 = 검토 후 잔액 -->
          <template v-if="mode === 'confirm'">
            <p class="dialog__lead">{{ $t('reviewNew.credit.confirmLead') }}</p>
            <dl class="receipt">
              <div class="receipt__row">
                <dt>{{ $t('reviewNew.credit.receiptBalance') }}</dt>
                <dd>{{ $t('credits.amount', { count: formatNumber(balance) }) }}</dd>
              </div>
              <div class="receipt__row receipt__row--minus">
                <dt>{{ $t('reviewNew.credit.receiptCost') }}</dt>
                <dd>&minus; {{ $t('credits.amount', { count: formatNumber(cost) }) }}</dd>
              </div>
              <div class="receipt__row receipt__row--total">
                <dt>{{ $t('reviewNew.credit.receiptAfter') }}</dt>
                <dd>{{ $t('credits.amount', { count: formatNumber(after) }) }}</dd>
              </div>
            </dl>
            <p class="dialog__note">
              <BaseIcon name="info" size="xs" />
              {{ $t('reviewNew.credit.note') }}
            </p>
          </template>

          <!-- 잔액이 모자랄 때: 필요한 크레딧 중 가진 만큼 막대로, 부족한 양은 크게 -->
          <template v-else>
            <p class="dialog__lead">{{ $t('reviewNew.credit.topUpLead', { cost: formatNumber(cost) }) }}</p>
            <div class="meter">
              <div class="meter__head">
                <span>{{ $t('reviewNew.credit.receiptBalance') }}</span>
                <strong>{{ formatNumber(balance) }} / {{ $t('credits.amount', { count: formatNumber(cost) }) }}</strong>
              </div>
              <div
                class="meter__bar"
                role="meter"
                :aria-valuenow="balance"
                aria-valuemin="0"
                :aria-valuemax="cost"
                :aria-label="$t('reviewNew.credit.receiptBalance')"
              >
                <span class="meter__fill" :style="{ width: `${filled}%` }"></span>
              </div>
              <p class="meter__short">
                {{ $t('reviewNew.credit.shortfallLabel') }}
                <strong>{{ $t('credits.amount', { count: formatNumber(shortfall) }) }}</strong>
              </p>
            </div>
            <p class="dialog__note">
              <BaseIcon name="info" size="xs" />
              {{ $t('reviewNew.credit.topUpNote') }}
            </p>
          </template>

          <div class="dialog__actions">
            <BaseButton variant="outline" :disabled="busy" @click="close">{{ $t('ui.cancel') }}</BaseButton>
            <BaseButton :busy="busy" @click="emit('confirm')">
              {{ mode === 'confirm' ? $t('reviewNew.credit.confirmButton', { count: formatNumber(cost) }) : $t('reviewNew.credit.topUpAction') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--color-overlay);
  backdrop-filter: blur(var(--blur-overlay));
}
.dialog {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 12px;
  width: 100%;
  max-width: 440px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 36px 28px 24px;
  border-radius: 20px;
  background: var(--color-bg-surface);
  box-shadow: 0 24px 48px -12px rgba(16, 24, 40, 0.28);
  text-align: center;
}
.dialog:focus { outline: none; }
.dialog__close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: var(--radius-full);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.dialog__close:hover { background: var(--color-bg-muted); color: var(--color-text); }
.dialog__close:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }

.dialog__art {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  padding: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
}
.dialog--topup .dialog__art { background: var(--color-warning-surface); }
.dialog__title { margin-top: 4px; font-size: 2.2rem; font-weight: var(--font-weight-bold); letter-spacing: -0.01em; }
.dialog__lead { color: var(--color-text-secondary); }

/* 영수증: 위에서 아래로 계산이 이어지게 */
.receipt {
  display: grid;
  width: 100%;
  margin: 8px 0 0;
  padding: 6px 18px;
  border-radius: 14px;
  background: var(--color-bg-page);
  text-align: left;
}
.receipt__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
}
.receipt__row dt { color: var(--color-text-secondary); }
.receipt__row dd { margin: 0; font-weight: var(--font-weight-bold); font-variant-numeric: tabular-nums; white-space: nowrap; }
.receipt__row--minus dd { color: var(--color-primary-active); }
.receipt__row--total { border-top: 1px dashed var(--color-border-strong); }
.receipt__row--total dt { color: var(--color-text); font-weight: var(--font-weight-bold); }
.receipt__row--total dd { font-size: 2rem; }

/* 충전 안내 막대 */
.meter {
  display: grid;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--color-bg-page);
  text-align: left;
}
.meter__head { display: flex; justify-content: space-between; gap: 12px; color: var(--color-text-secondary); }
.meter__head strong { color: var(--color-text); font-variant-numeric: tabular-nums; white-space: nowrap; }
.meter__bar { height: 10px; border-radius: var(--radius-full); background: var(--color-border); overflow: hidden; }
.meter__fill { display: block; height: 100%; border-radius: inherit; background: var(--color-warning); }
.meter__short { display: flex; justify-content: space-between; gap: 12px; padding-top: 4px; font-weight: var(--font-weight-bold); }
.meter__short strong { font-size: 2rem; color: var(--color-danger-text); font-variant-numeric: tabular-nums; white-space: nowrap; }

.dialog__note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
  text-align: left;
}
.dialog__note :deep(.base-icon) { flex: none; margin-top: 2px; }

.dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.credit-dialog-enter-active,
.credit-dialog-leave-active { transition: opacity 180ms ease; }
.credit-dialog-enter-active .dialog,
.credit-dialog-leave-active .dialog { transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1); }
.credit-dialog-enter-from,
.credit-dialog-leave-to { opacity: 0; }
.credit-dialog-enter-from .dialog,
.credit-dialog-leave-to .dialog { transform: translateY(12px) scale(0.98); }
@media (prefers-reduced-motion: reduce) {
  .credit-dialog-enter-active .dialog,
  .credit-dialog-leave-active .dialog { transition: none; }
}
@media (max-width: 480px) {
  .dialog { padding: 32px 20px 20px; }
  .dialog__actions { grid-template-columns: 1fr; }
  .dialog__actions > :last-child { order: -1; }
}
</style>
