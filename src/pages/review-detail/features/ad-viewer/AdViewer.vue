<!--
  광고물 위반 위치 인터랙티브 뷰어 (시안 krds_3)
  원본 이미지는 판정 후 폐기되므로(NFR-3) 보존된 카피,추출 문구를 광고물 프레임에 표시하고 위반 지점에 번호 핀을 단다.
-->
<script setup>
import { computed, ref } from 'vue'
import { SEVERITY, SEVERITY_LABEL } from '@/shared/constants/review'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseSectionHeader from '@/shared/components/base/BaseSectionHeader.vue'
import HighlightedText from '@/shared/components/review/HighlightedText.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import ViewerToolbar from './ViewerToolbar.vue'
import ZoomDetailCard from './ZoomDetailCard.vue'

const { review, version, findings, activeFindingId, focusFinding, revisions } = useReviewDetail()

const zoom = ref(100)
const overlay = ref(true)

const numberOf = (finding) => findings.value.findIndex((f) => f.id === finding.id) + 1
const active = computed(() => findings.value.find((f) => f.id === activeFindingId.value) ?? null)

const blocks = computed(() =>
  version.value.result.texts
    .filter((t) => t.text?.trim())
    .map((t) => ({
      ...t,
      key: t.id,
      label: t.location.kind === 'copy' ? '광고 카피' : t.location.fileName,
      findings: findings.value.filter((f) =>
        f.textId === t.id,
      ),
    })),
)

const fileLabel = computed(() => version.value.input.files[0]?.name ?? '광고 문구')
const legend = computed(() =>
  [SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW]
    .map((s) => ({
      severity: s,
      label: SEVERITY_LABEL[s].label,
      numbers: findings.value.filter((f) => f.severity === s).map(numberOf),
    }))
    .filter((l) => l.numbers.length),
)
</script>

<template>
  <BaseCard id="ad-viewer" tag="section" class="viewer" aria-labelledby="viewer-heading">
    <BaseSectionHeader title="광고물 위반 위치 인터랙티브 뷰어" heading-id="viewer-heading" size="md" icon="image_search">
      <BaseBadge>{{ fileLabel }}</BaseBadge>
    </BaseSectionHeader>

    <div class="viewer__stage">
      <ZoomDetailCard
        v-if="overlay && active"
        :finding="active"
        :number="numberOf(active)"
        :revised="revisions[active.id] !== undefined"
      />
      <div class="viewer__canvas">
        <figure class="poster" :style="{ fontSize: `${zoom}%` }" :aria-label="`${review.productName} 광고물`">
          <p class="poster__brand">{{ review.productName }}</p>
          <div v-for="block in blocks" :key="block.key" class="poster__block">
            <p class="poster__label">
              {{ block.label }}
              <BaseBadge v-if="block.mock">목업 OCR</BaseBadge>
            </p>
            <HighlightedText
              :text="block.text"
              :findings="overlay ? block.findings : []"
              :number-of="numberOf"
              :active-id="activeFindingId"
              @select="focusFinding"
            />
          </div>
          <figcaption v-if="version.originalsDiscardedAt && version.input.files.length" class="poster__note">
            원본 이미지는 판정 완료 후 폐기되어 추출 문구만 표시합니다.
          </figcaption>
        </figure>
      </div>
    </div>

    <ViewerToolbar v-model:zoom="zoom" v-model:overlay="overlay" :max="150" :step="10" />

    <ul v-if="legend.length" class="legend">
      <li v-for="item in legend" :key="item.severity" class="legend__item" :class="`legend__item--${item.severity}`">
        {{ item.numbers.join(', ') }}번: {{ item.label }}
      </li>
    </ul>
  </BaseCard>
</template>

<style scoped>
.viewer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  scroll-margin-top: var(--space-5xl);
}
.viewer__stage {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}
.viewer__canvas {
  overflow: auto;
}
.poster {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin: 0;
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-surface);
}
.poster__brand {
  padding-bottom: var(--space-sm);
  border-bottom: var(--border-width) dashed var(--color-border-strong);
  text-align: center;
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.poster__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.poster__label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
}
.poster :deep(.highlighted) {
  font-size: 1em;
  line-height: 1.9;
}
.poster__note {
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--space-sm);
}
.legend__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-bg-page);
  font-size: var(--font-size-detail-s);
  font-weight: var(--font-weight-bold);
}
.legend__item::before {
  content: '';
  flex-shrink: 0;
  width: var(--space-sm);
  height: var(--space-sm);
  border-radius: var(--radius-full);
}
.legend__item--high::before { background: var(--color-danger-text); }
.legend__item--medium::before { background: var(--color-warning-text); }
.legend__item--low::before { background: var(--color-info-text); }
</style>
