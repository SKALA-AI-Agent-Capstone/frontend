/*
 * 법령 검색 상태 문구 (FR-2, NFR-2) — Agent 결과의 retrievalStatus 와 문구별 legalSearch 를 화면 문구로 옮긴다.
 * 근거는 rag-mcp 검색으로 찾은 조문 후보이며, 어떤 상태에서도 적법 판정으로 표시하지 않는다.
 */
export const LEGAL_SEARCH = Object.freeze({
  connected: {
    variant: 'info',
    alertTitle: '법령 조문 후보 검색 완료, 예비검토 결과',
    summary: '문구마다 관련 법령 조문 후보를 붙였습니다. 적법 여부와 적합성 점수는 산출하지 않았습니다.',
    approvalHint: '조문 후보는 검색 결과입니다. 원문 조항을 직접 확인한 내용을 의견에 기록하세요.',
    reportNotice: '법령 근거는 검색으로 찾은 조문 후보입니다. 적법 여부를 판단하지 않은 예비검토 리포트입니다.',
    emptyBasis: '검색한 법령 조문 중 이 문구와 맞는 후보를 찾지 못했습니다. 적합 판정이 아닙니다.',
  },
  not_indexed: {
    variant: 'warning',
    alertTitle: '법령 자료 미적재, 예비검토 결과',
    summary: '법령 자료가 적재되지 않아 근거를 검색하지 못했습니다. 적법 여부는 판단하지 않았습니다.',
    approvalHint: '법령 근거 없이 나온 결과입니다. 직접 확인한 조항과 내용을 반드시 기록하세요.',
    reportNotice: '법령 자료가 적재되지 않아 근거를 검색하지 못한 예비검토 리포트입니다.',
    emptyBasis: '법령 자료가 적재되지 않아 근거를 검색하지 못했습니다.',
  },
  error: {
    variant: 'warning',
    alertTitle: '법령 검색 실패, 예비검토 결과',
    summary: '법령 검색 서비스에 연결하지 못해 근거를 확인하지 못했습니다. 적법 여부는 판단하지 않았습니다.',
    approvalHint: '법령 검색에 실패한 결과입니다. 직접 확인한 조항과 내용을 반드시 기록하세요.',
    reportNotice: '법령 검색에 실패해 근거를 확인하지 못한 예비검토 리포트입니다.',
    emptyBasis: '법령 검색에 실패해 근거를 확인하지 못했습니다.',
  },
  skipped: {
    variant: 'info',
    alertTitle: '확인할 문구 없음, 예비검토 결과',
    summary: '확인할 문구가 없어 법령 검색을 하지 않았습니다. 적합 판정을 의미하지 않습니다.',
    approvalHint: '확인할 문구가 추출되지 않았습니다. 원본을 직접 확인한 내용을 기록하세요.',
    reportNotice: '확인할 문구가 없어 법령 검색을 하지 않은 예비검토 리포트입니다.',
    emptyBasis: '법령 검색을 하지 않았습니다.',
  },
  not_connected: {
    variant: 'warning',
    alertTitle: '법령 검색 미실행, 예비검토 결과',
    summary: '이 버전은 법령 검색 없이 분석되었습니다. 적법 여부와 적합성 점수는 산출하지 않았습니다.',
    approvalHint: '법령 검색 없이 나온 결과입니다. 직접 확인한 조항과 내용을 반드시 기록하세요.',
    reportNotice: '법령 검색 없이 분석한 예비검토 리포트입니다. 적법 여부를 판단하지 않았습니다.',
    emptyBasis: '법령 검색 없이 분석된 항목입니다.',
  },
})

// 문구 하나의 검색 결과. 예전 결과에는 legalSearch 가 없으므로 전체 상태 문구로 대신한다.
export const FINDING_LEGAL_SEARCH = Object.freeze({
  no_match: '검색한 법령 조문 중 이 문구와 맞는 후보를 찾지 못했습니다. 적합 판정이 아닙니다.',
  failed: '이 문구는 법령 검색에 실패했습니다. 담당자가 직접 확인해야 합니다.',
  not_searched: '검색 한도를 넘어 이 문구는 법령 검색을 하지 않았습니다.',
})

export function legalSearch(result) {
  return LEGAL_SEARCH[result?.retrievalStatus] ?? LEGAL_SEARCH.not_connected
}

export function emptyBasisText(finding, result) {
  return FINDING_LEGAL_SEARCH[finding?.legalSearch] ?? legalSearch(result).emptyBasis
}
