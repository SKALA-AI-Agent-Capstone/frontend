/*
 * 새 검토 입력 상태 (FR-8 단일 입력 흐름)
 *   - ?from=<reviewId> 이면 해당 건의 최신 버전을 불러와 새 버전으로 재검토 (FR-13)
 *   - ?copy=<문구> 이면 대시보드 간이진단 문구를 이어받는다
 */
import { computed, inject, provide, reactive, ref, markRaw } from 'vue'
import { calcUsage } from '@/shared/constants/pricing'
import { DOC_TYPES, FILE_KIND } from '@/shared/constants/review'
import { uid } from '@/shared/utils/format'

const DRAFT_KEY = Symbol('review-draft')
const SESSION_KEY = 'cosmetic-ad-review:draft'

function emptyDraft() {
  return {
    product: { name: '', category: 'functional', functionalReportNo: '' },
    copy: '',
    media: [],
    files: [],
    evidence: [],
  }
}

// 파일명으로 증빙 유형 추정 (사용자가 바꿀 수 있음)
function guessDocType(name) {
  const rules = [
    [/기능성|심사|보고/, DOC_TYPES.FUNCTIONAL_REPORT],
    [/전성분|성분표/, DOC_TYPES.INGREDIENT_LIST],
    [/인체\s*적용|임상/, DOC_TYPES.CLINICAL_TEST],
    [/인체\s*외|in\s*vitro/i, DOC_TYPES.IN_VITRO_TEST],
    [/특허/, DOC_TYPES.PATENT_CERT],
    [/상표/, DOC_TYPES.TRADEMARK_CERT],
    [/원산지/, DOC_TYPES.ORIGIN_CERT],
    [/인증|수상/, DOC_TYPES.CERTIFICATE],
  ]
  return rules.find(([re]) => re.test(name))?.[1] ?? DOC_TYPES.OTHER
}

export function provideReviewDraft({ baseVersion = null, initialCopy = '' } = {}) {
  const draft = reactive(emptyDraft())
  if (baseVersion) {
    draft.product = { ...baseVersion.input.product }
    draft.copy = ''
    draft.media = [...baseVersion.input.media]
    // 증빙은 메타데이터만 이어받는다 (원본은 이전 판정 후 폐기됨)
    draft.evidence = []
  } else if (initialCopy) {
    draft.copy = ''
  } else {
    // 임시저장본 복원 (업로드 파일은 저장하지 않음)
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null')
      if (saved) Object.assign(draft, { ...saved, files: [], evidence: [] })
    } catch {
      /* 저장소 사용 불가 시 무시 */
    }
  }

  const lastSavedAt = ref(null)
  function saveDraft() {
    try {
      const { files, evidence, ...rest } = draft
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(rest))
      lastSavedAt.value = new Date()
    } catch {
      /* 저장소 사용 불가 시 무시 */
    }
  }
  function clearSaved() {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* noop */
    }
  }

  // 법령 검색 연결 전에는 브라우저 규칙으로 필요 서류를 판정하지 않는다.
  const liveFindings = computed(() => [])
  const claimTypes = computed(() => [])
  const requirements = computed(() => [])
  // FR-11: 요청 전 예상 사용량
  const estimate = computed(() => calcUsage({ textChars: draft.copy.length, images: draft.files.length }))
  const canSubmit = computed(() => draft.product.name.trim() && draft.files.length > 0 && draft.files.every(f => f.file instanceof File))

  function addFiles(files) {
    for (const file of files) {
      draft.files.push({
        id: uid('FL'),
        name: file.name,
        size: file.size,
        kind: /\.pdf$/i.test(file.name) ? FILE_KIND.DETAIL_PAGE : FILE_KIND.IMAGE,
        file: markRaw(file),
      })
    }
  }

  function addEvidence(files) {
    for (const file of files) {
      draft.evidence.push({ id: uid('EV'), docType: guessDocType(file.name), name: file.name, size: file.size, file: markRaw(file) })
    }
  }

  const context = {
    draft,
    liveFindings,
    claimTypes,
    requirements,
    estimate,
    canSubmit,
    addFiles,
    addEvidence,
    lastSavedAt,
    saveDraft,
    clearSaved,
  }
  provide(DRAFT_KEY, context)
  return context
}

export function useReviewDraft() {
  const context = inject(DRAFT_KEY)
  if (!context) throw new Error('useReviewDraft() 는 provideReviewDraft() 하위에서만 사용할 수 있습니다.')
  return context
}
