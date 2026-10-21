<!--
  다음 행동별 문구 수 가로 막대 (Chart.js).
  - 막대 순서는 해야 할 일 순서(수정 권고 > 자료 확인 > 보류 > 표현 참고)로 고정하고, 개수로 다시 정렬하지 않는다.
  - 막대 끝에 숫자를 직접 적어 색만으로 구분하지 않게 한다. 색은 dataviz 검사 스크립트로 확인한 값이다
    (분석 보류의 회색은 '판단하지 못함'이라 일부러 무채색으로 둔다).
  - 막대나 아래 버튼을 누르면 목록이 그 행동만 보인다. 캔버스는 키보드로 누를 수 없어서 같은 역할의 버튼 줄을 함께 둔다.
-->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BarController, BarElement, CategoryScale, Chart, LinearScale, Tooltip } from 'chart.js'
import { ACTION_ORDER } from '@/shared/constants/reviewActions'
import { currentLocale, t } from '@/shared/i18n'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  counts: { type: Object, required: true }, // { revise, evidence, hold, note }
  filter: { type: String, default: 'all' },
})
const emit = defineEmits(['select'])

const COLOR = { revise: '#eb003b', evidence: '#d98e04', hold: '#8e8e8e', note: '#2768ff' }
const TEXT = '#1d1d1d'
const MUTED = '#555555'
const GRID = '#f0f0f0'

const canvas = ref(null)
let chart = null

const total = computed(() => ACTION_ORDER.reduce((sum, action) => sum + (props.counts[action] ?? 0), 0))
const labels = () => ACTION_ORDER.map((action) => t(`reviewActions.label.${action}`))
const values = () => ACTION_ORDER.map((action) => props.counts[action] ?? 0)
// 걸러 보는 중이면 고른 막대만 진하게 둔다
const colors = () => ACTION_ORDER.map((action) => (props.filter === 'all' || props.filter === action ? COLOR[action] : `${COLOR[action]}40`))

// 막대 끝에 개수를 적는 작은 플러그인
const valueLabels = {
  id: 'valueLabels',
  afterDatasetsDraw(c) {
    const { ctx } = c
    const meta = c.getDatasetMeta(0)
    ctx.save()
    ctx.font = '700 14px Pretendard, system-ui, sans-serif'
    ctx.fillStyle = TEXT
    ctx.textBaseline = 'middle'
    meta.data.forEach((bar, i) => ctx.fillText(String(c.data.datasets[0].data[i]), bar.x + 8, bar.y))
    ctx.restore()
  },
}

function build() {
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: labels(),
      datasets: [{ data: values(), backgroundColor: colors(), borderRadius: 4, borderSkipped: 'start', barThickness: 18 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      layout: { padding: { right: 32 } },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0, color: MUTED, font: { size: 12 } },
          grid: { color: GRID },
          border: { display: false },
        },
        y: {
          ticks: { color: TEXT, font: { size: 14, weight: '600' } },
          grid: { display: false },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => t('reviewDetail.summary.phrases', { count: item.raw }),
            afterLabel: (item) => t(`reviewActions.hint.${ACTION_ORDER[item.dataIndex]}`),
          },
        },
      },
      onClick: (_, elements) => { if (elements.length) emit('select', ACTION_ORDER[elements[0].index]) },
      onHover: (event, elements) => { event.native.target.style.cursor = elements.length ? 'pointer' : 'default' },
    },
    plugins: [valueLabels],
  })
}

function refresh() {
  if (!chart) return
  chart.data.labels = labels()
  chart.data.datasets[0].data = values()
  chart.data.datasets[0].backgroundColor = colors()
  chart.update()
}

onMounted(build)
onBeforeUnmount(() => chart?.destroy())
watch(() => [props.counts, props.filter, currentLocale()], refresh, { deep: true })
</script>

<template>
  <div class="action-chart">
    <div class="action-chart__plot">
      <canvas ref="canvas" role="img" :aria-label="$t('reviewDetail.summary.chartLabel', { total })"></canvas>
    </div>
    <div class="action-chart__filters" role="group" :aria-label="$t('reviewDetail.summary.filterLabel')">
      <button type="button" class="chip" :aria-pressed="filter === 'all'" @click="emit('select', 'all')">
        {{ $t('reviewDetail.summary.all') }} <strong>{{ total }}</strong>
      </button>
      <button
        v-for="action in ACTION_ORDER"
        :key="action"
        type="button"
        class="chip"
        :aria-pressed="filter === action"
        :title="$t(`reviewActions.hint.${action}`)"
        @click="emit('select', action)"
      >
        <span class="chip__dot" :style="{ background: COLOR[action] }" aria-hidden="true"></span>
        {{ $t(`reviewActions.label.${action}`) }} <strong>{{ counts[action] ?? 0 }}</strong>
      </button>
    </div>
    <p class="action-chart__hint">
      {{ filter === 'all' ? $t('reviewDetail.summary.allHint') : $t(`reviewActions.hint.${filter}`) }}
    </p>
  </div>
</template>

<style scoped>
.action-chart { display: grid; gap: 12px; min-width: 0; }
.action-chart__plot { position: relative; height: 184px; min-width: 0; }
.action-chart__plot canvas { max-width: 100%; }
.action-chart__filters { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  font: inherit;
  font-size: var(--font-size-detail-m);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}
.chip strong { font-variant-numeric: tabular-nums; }
.chip:hover { border-color: var(--color-border-strong); }
.chip[aria-pressed='true'] { border-color: var(--color-text); background: var(--color-text); color: var(--color-bg-surface); }
.chip:focus-visible { outline: var(--focus-ring); outline-offset: 2px; }
.chip__dot { width: 8px; height: 8px; border-radius: var(--radius-full); flex: none; }
.action-chart__hint { font-size: var(--font-size-detail-s); color: var(--color-text-secondary); }
</style>
