/*
 * 법령 검색 상태 문구 (FR-2, NFR-2) — Agent 결과의 retrievalStatus 와 문구별 legalSearch 를 화면 문구로 옮긴다.
 * 근거는 rag-mcp 검색으로 찾은 조문 후보이며, 어떤 상태에서도 적법 판정으로 표시하지 않는다.
 */
import { textMap, translated } from '@/shared/i18n'

export const LEGAL_SEARCH = Object.freeze({
  connected: translated({ variant: 'info' }, { alertTitle: 'legal.connected.alertTitle', summary: 'legal.connected.summary', reportNotice: 'legal.connected.reportNotice', emptyBasis: 'legal.connected.emptyBasis' }),
  not_indexed: translated({ variant: 'warning' }, { alertTitle: 'legal.notIndexed.alertTitle', summary: 'legal.notIndexed.summary', reportNotice: 'legal.notIndexed.reportNotice', emptyBasis: 'legal.notIndexed.emptyBasis' }),
  error: translated({ variant: 'warning' }, { alertTitle: 'legal.error.alertTitle', summary: 'legal.error.summary', reportNotice: 'legal.error.reportNotice', emptyBasis: 'legal.error.emptyBasis' }),
  skipped: translated({ variant: 'info' }, { alertTitle: 'legal.skipped.alertTitle', summary: 'legal.skipped.summary', reportNotice: 'legal.skipped.reportNotice', emptyBasis: 'legal.skipped.emptyBasis' }),
  not_connected: translated({ variant: 'warning' }, { alertTitle: 'legal.notConnected.alertTitle', summary: 'legal.notConnected.summary', reportNotice: 'legal.notConnected.reportNotice', emptyBasis: 'legal.notConnected.emptyBasis' }),
})

// 문구 하나의 검색 결과. 예전 결과에는 legalSearch 가 없으므로 전체 상태 문구로 대신한다.
export const FINDING_LEGAL_SEARCH = textMap({
  no_match: 'legal.finding.noMatch',
  failed: 'legal.finding.failed',
  not_searched: 'legal.finding.notSearched',
})

export function legalSearch(result) {
  return LEGAL_SEARCH[result?.retrievalStatus] ?? LEGAL_SEARCH.not_connected
}

export function emptyBasisText(finding, result) {
  return FINDING_LEGAL_SEARCH[finding?.legalSearch] ?? legalSearch(result).emptyBasis
}
