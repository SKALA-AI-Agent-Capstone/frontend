/*
 * 새 검토 입력 상태 (FR-8 단일 입력 흐름)
 *   - ?from=<reviewId> 이면 해당 건의 최신 버전을 불러와 새 버전으로 재검토 (FR-13)
 *   - ?copy=<문구> 이면 대시보드 간이진단 문구를 이어받는다
 *   - 검토는 제품에 속한다(2026-10-22). productId를 고르면 제품 이름과 유형을 product에 채운다.
 *   - 임시저장(2026-10-23)은 브라우저 IndexedDB에 제품, 광고 파일, 증빙 파일과 유형까지 남긴다(draftStore.js).
 *     ?draft=<id>로 다시 열면 이어서 작성한다. 검토를 접수하면 그 임시저장은 지운다.
 */
import { computed, inject, provide, reactive, ref, markRaw } from 'vue'
import { DOC_TYPES, FILE_KIND } from '@/shared/constants/review'
import { uid } from '@/shared/utils/format'
import { deleteDraft, getDraft, putDraft } from '@/shared/utils/draftStore'
import { useSessionStore } from '@/shared/stores/session'

const DRAFT_KEY = Symbol('review-draft')

function emptyDraft() {
  return {
    productId: '',
    // 서버가 productId로 제품의 현재 이름을 다시 채운다. category는 제품 유형(general, functional)이다.
    product: { name: '', category: 'general' },
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

export function provideReviewDraft({ baseVersion = null, initialCopy = '', productId = '' } = {}) {
  const draft = reactive(emptyDraft())
  if (baseVersion) {
    draft.product = { name: baseVersion.input.product?.name ?? '', category: baseVersion.input.product?.category ?? 'general' }
    draft.copy = ''
    draft.media = [...baseVersion.input.media]
    // 이전 버전 원본은 서버에 보존되지만, 재검토 업로드가 이전 asset을 참조해 재사용하는
    // 기능은 아직 없다 — 증빙은 새로 선택해야 한다.
    draft.evidence = []
  } else if (initialCopy) {
    draft.copy = ''
  }
  // 제품 화면에서 시작했거나 이전 검토를 불러왔으면 그 제품을 고른다
  if (productId) draft.productId = productId

  const session = useSessionStore()
  const draftId = ref(null)
  const lastSavedAt = ref(null)
  const saving = ref(false)

  /** 임시저장을 불러온다. 다른 사용자 것이거나 없으면 false다. */
  async function loadSaved(id) {
    const saved = await getDraft(id)
    if (!saved || saved.tenantId !== session.tenant?.id || saved.userId !== session.user?.id) return false
    draftId.value = saved.id
    draft.productId = saved.productId ?? ''
    draft.product = { name: saved.productName ?? '', category: draft.product.category }
    draft.media = [...(saved.media ?? [])]
    draft.files = (saved.files ?? []).map((f) => ({ ...f, file: markRaw(f.file) }))
    draft.evidence = (saved.evidence ?? []).map((e) => ({ ...e, file: markRaw(e.file) }))
    lastSavedAt.value = saved.savedAt ? new Date(saved.savedAt) : null
    return true
  }

  /** 지금 입력을 임시저장하고 id를 돌려준다. 제품을 고르지 않았으면 저장하지 않는다(제품 화면에 칸으로 보이므로). */
  async function saveDraft() {
    if (!draft.productId) throw new Error('DRAFT_PRODUCT_REQUIRED')
    saving.value = true
    try {
      const id = draftId.value ?? uid('DR')
      const savedAt = new Date()
      await putDraft({
        id,
        tenantId: session.tenant?.id,
        userId: session.user?.id,
        productId: draft.productId,
        productName: draft.product.name,
        media: [...draft.media],
        files: draft.files.map(({ id: fileId, name, size, kind, file }) => ({ id: fileId, name, size, kind, file })),
        evidence: draft.evidence.map(({ id: docId, name, size, docType, file }) => ({ id: docId, name, size, docType, file })),
        savedAt: savedAt.toISOString(),
      })
      draftId.value = id
      lastSavedAt.value = savedAt
      return id
    } finally {
      saving.value = false
    }
  }

  async function clearSaved() {
    if (!draftId.value) return
    try { await deleteDraft(draftId.value) } catch { /* 지우지 못해도 접수는 끝났다 */ }
    draftId.value = null
  }

  // 법령 검색 연결 전에는 브라우저 규칙으로 필요 서류를 판정하지 않는다.
  const liveFindings = computed(() => [])
  const claimTypes = computed(() => [])
  const requirements = computed(() => [])
  const canSubmit = computed(() => Boolean(draft.productId) && draft.files.length > 0 && draft.files.every(f => f.file instanceof File))

  function selectProduct(product) {
    draft.productId = product?.id ?? ''
    draft.product = { name: product?.name ?? '', category: product?.type ?? 'general' }
  }

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

  /**
   * 증빙 파일을 더한다. 유형은 파일 이름으로 추측하고, 올린 뒤 파일마다 바꾼다.
   * 이름으로 못 맞혀 '기타'가 된 파일은 needsType을 붙여 화면에서 유형을 확인하게 한다(저장하지 않는 표시).
   */
  function addEvidence(files) {
    for (const file of files) {
      const guessed = guessDocType(file.name)
      draft.evidence.push({
        id: uid('EV'), docType: guessed, needsType: guessed === DOC_TYPES.OTHER,
        name: file.name, size: file.size, file: markRaw(file),
      })
    }
  }

  const context = {
    draft,
    liveFindings,
    claimTypes,
    requirements,
    canSubmit,
    addFiles,
    addEvidence,
    selectProduct,
    draftId,
    lastSavedAt,
    saving,
    loadSaved,
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
