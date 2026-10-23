/*
 * 검토 신청서 임시저장(2026-10-23). 브라우저 IndexedDB에 제품, 광고 파일, 증빙 파일과 유형까지 저장한다.
 * 서버로 보내지 않으므로 다른 기기나 브라우저에서는 보이지 않는다. 기업과 사용자별로 나눠 본다.
 * 저장 형태: { id, tenantId, userId, productId, productName, media, files[], evidence[], savedAt }
 *   files[]: { id, name, size, kind, file }   evidence[]: { id, name, size, docType, file }   file은 File 그대로
 */
const DB_NAME = 'vero-review-drafts'
const STORE = 'drafts'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run(mode, action) {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode)
      const request = action(transaction.objectStore(STORE))
      let result
      request.onsuccess = () => { result = request.result }
      transaction.oncomplete = () => resolve(result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export const putDraft = (draft) => run('readwrite', (store) => store.put(draft))
export const getDraft = (id) => run('readonly', (store) => store.get(id))
export const deleteDraft = (id) => run('readwrite', (store) => store.delete(id))

/** 이 사용자의 임시저장. productId를 주면 그 제품 것만, 최근 저장 순이다. */
export async function listDrafts({ tenantId, userId, productId = null }) {
  const all = (await run('readonly', (store) => store.getAll())) ?? []
  return all
    .filter((d) => d.tenantId === tenantId && d.userId === userId && (!productId || d.productId === productId))
    .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
}
