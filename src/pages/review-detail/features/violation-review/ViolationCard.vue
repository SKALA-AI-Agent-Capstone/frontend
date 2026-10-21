<!--
  위반 지점 카드 (시안 krds_3 — 빨강 테두리: 위반 소지 높음 / 초록: 확정됨)
  근거(FR-2,NFR-8,11) , 판정 상향(FR-3) , 보조 사례(FR-2) , violation 단위 HITL 결정(FR-5, 2026-10-20 재설계)

  finding(광고 원문 블록, basis/reason/category 등 판독 당시 정보)과 violation(결정 상태가 저장되는
  app.violations 행)은 서로 다른 출처다 — finding은 "최신 버전" JSONB에, violation은 그걸로 생성된
  DB 행이다. violation.findingId로 짝지어 둘을 함께 보여준다.
-->
<script setup>
import { computed } from 'vue'
import { emptyBasisText } from '@/shared/constants/legal'
import { SEVERITY, SEVERITY_LABEL } from '@/shared/constants/review'
import FindingImageCrop from '@/shared/components/review/FindingImageCrop.vue'
import BaseAlert from '@/shared/components/base/BaseAlert.vue'
import BaseBadge from '@/shared/components/base/BaseBadge.vue'
import BaseButton from '@/shared/components/base/BaseButton.vue'
import BaseCard from '@/shared/components/base/BaseCard.vue'
import BaseIcon from '@/shared/components/base/BaseIcon.vue'
import BasisItem from '@/shared/components/review/BasisItem.vue'
import { useReviewDetail } from '../../composables/useReviewDetail'
import RevisionOptions from './RevisionOptions.vue'

const props = defineProps({
  violation: { type: Object, required: true },
  finding: { type: Object, default: null },
  number: { type: Number, required: true },
})

const { review, version, activeFindingId, focusFinding, decideViolation, requestViolationRewrite, result } = useReviewDetail()

const sourceAsset = computed(() => [...(version.value?.input?.files ?? []), ...(version.value?.input?.evidence ?? [])]
  .find((asset) => asset.id === props.finding?.location?.fileId))

const severity = computed(() => SEVERITY_LABEL[props.finding?.severity ?? SEVERITY.LOW])
const decided = computed(() => Boolean(props.violation.finalResolution))
const variant = computed(() => (decided.value ? 'success' : props.finding?.severity === SEVERITY.HIGH ? 'danger' : 'default'))
const locationLabel = computed(() => {
  const location = props.finding?.location
  if (!location) return '원문 위치 정보 없음'
  return location.kind === 'copy' ? '광고 카피' : `이미지 , ${location.fileName}`
})

function decide(resolution, extra) {
  return decideViolation(props.violation.id, resolution, extra)
}
function retry(note) {
  return requestViolationRewrite(props.violation.id, note)
}
</script>

<template>
  <BaseCard
    :id="`finding-${violation.findingId ?? violation.id}`"
    tag="article"
    class="violation"
    :class="{ 'violation--active': finding && activeFindingId === finding.id }"
    :variant="variant"
    :aria-labelledby="`finding-${violation.id}-title`"
  >
    <header class="violation__head">
      <span class="violation__no" :class="decided ? 'violation__no--success' : `violation__no--${finding?.severity ?? SEVERITY.LOW}`" aria-hidden="true">
        <BaseIcon v-if="decided" name="check" size="sm" />
        <template v-else>{{ number }}</template>
      </span>
      <div class="violation__title-wrap">
        <p class="violation__meta">
          <BaseBadge :variant="decided ? 'success' : severity.variant" :solid="decided">
            {{ decided ? '확정됨' : severity.label }}
          </BaseBadge>
          <span>{{ finding?.basis?.[0]?.article }} , {{ locationLabel }}</span>
        </p>
        <h3 :id="`finding-${violation.id}-title`" class="violation__title">
          {{ finding?.category || finding?.title || '확인할 문구' }} ("{{ violation.textExcerpt }}")
        </h3>
      </div>
      <BaseButton
        v-if="finding"
        variant="outline"
        size="sm"
        icon="location_searching"
        @click="focusFinding(finding.id, { scrollTo: 'viewer' })"
      >
        문제지점 보기
      </BaseButton>
    </header>

    <BaseAlert
      v-if="finding?.escalation"
      :variant="severity.variant"
      icon="trending_up"
      title="증빙 대조 결과 판정 상향"
    >
      {{ SEVERITY_LABEL[finding.escalation.from].label }} → {{ severity.label }}: {{ finding.escalation.reason }}
    </BaseAlert>

    <FindingImageCrop v-if="finding?.location?.fileId && review?.id"
      :review-id="review.id" :asset-id="finding.location.fileId"
      :asset-name="finding.location.fileName ?? sourceAsset?.name ?? '광고 이미지'"
      :mime="sourceAsset?.mime ?? ''" :focus-region="finding.location.bbox"
      focus-label="문구가 추출된 위치" />

    <p v-if="finding">{{ finding.reason }}</p>
    <p v-if="!finding?.basis?.length">{{ emptyBasisText(finding, result) }}</p>
    <section v-if="finding?.basis?.length" class="violation__basis" aria-label="위반 근거">
      <p class="violation__basis-title"><BaseIcon name="gavel" size="sm" /> 관련 법령 조문 후보 (검색 결과, 위반 판정 아님)</p>
      <BasisItem v-for="(basis, i) in finding.basis" :key="`${basis.sourceId}-${i}`" :basis="basis" />
    </section>

    <section v-if="finding?.references?.length" class="violation__refs" aria-label="참고 사례">
      <p class="violation__refs-title">과거 적발,심의 사례 (보조 참고)</p>
      <p v-for="ref in finding.references" :key="ref.id" class="violation__ref">
        <BaseBadge v-if="!ref.verified" variant="warning">출처 미검증</BaseBadge>
        {{ ref.summary }}
      </p>
    </section>

    <RevisionOptions :violation="violation" @decide="decide" @retry="retry" />
  </BaseCard>
</template>

<style scoped>
.violation {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  scroll-margin-top: var(--space-5xl);
}
.violation--active {
  box-shadow: var(--shadow-level-2);
  outline: var(--border-width-strong) solid var(--color-primary);
  outline-offset: var(--space-2xs);
}
.violation__head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: var(--border-width) solid var(--color-border);
}
.violation__no {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: var(--space-xl);
  height: var(--space-xl);
  border-radius: var(--radius-full);
  color: var(--color-on-primary);
  font-weight: var(--font-weight-bold);
}
.violation__no--high { background: var(--color-danger-text); }
.violation__no--medium { background: var(--color-warning-text); }
.violation__no--low { background: var(--color-info-text); }
.violation__no--success { background: var(--color-success); }
.violation__title-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}
.violation__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-size-detail-s);
  color: var(--color-text-secondary);
}
.violation__title {
  font-size: var(--font-size-title-m);
  font-weight: var(--font-weight-bold);
}
.violation__basis {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-danger-border);
  background: var(--color-danger-surface);
}
.violation__basis-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
  color: var(--color-danger-text);
}
.violation__refs {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: var(--font-size-body-s);
}
.violation__refs-title {
  font-size: var(--font-size-label-s);
  font-weight: var(--font-weight-bold);
}
.violation__ref {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
}

@media (max-width: 600px) {
  .violation__head {
    flex-wrap: wrap;
  }
}
</style>
