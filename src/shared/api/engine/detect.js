/*
 * 위반 소지 문구 탐지 (FR-1, 2, 5) — 순수 함수.
 * 같은 위치에 여러 규칙이 겹치면 심각도가 높은 규칙을 우선한다.
 */
import { SEVERITY_ORDER } from '@/shared/constants/review'
import { REFERENCE_CASES, RULES } from '@/shared/data/rules.data'
import { SOURCE_BY_ID } from '@/shared/data/standards.data'

const severityRank = (s) => SEVERITY_ORDER.indexOf(s)

/** 근거 조항에 출처 버전, 개정일을 붙인다 (NFR-11) */
export function withSourceMeta(article) {
  const source = SOURCE_BY_ID[article.sourceId]
  return {
    ...article,
    sourceName: source?.name ?? article.sourceId,
    sourceType: source?.type,
    version: source?.version ?? '-',
    revisedAt: source?.revisedAt ?? null,
  }
}

/**
 * @param {string} text 검토 대상 텍스트
 * @param {object} location { kind: 'copy' | 'image', fileId?, fileName? }
 * @returns {Array} findings (위치 순)
 */
export function detectFindings(text, location) {
  if (!text?.trim()) return []
  const taken = [] // [start, end)
  const findings = []

  const rules = [...RULES].sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      for (const match of text.matchAll(new RegExp(pattern.source, pattern.flags))) {
        const start = match.index
        const end = start + match[0].length
        if (taken.some(([s, e]) => start < e && end > s)) continue
        taken.push([start, end])
        findings.push({
          ruleId: rule.id,
          phrase: match[0],
          start,
          end,
          location,
          category: rule.category,
          claimType: rule.claimType,
          severity: rule.severity,
          basis: rule.basis.map(withSourceMeta),
          references: REFERENCE_CASES.filter((c) => c.ruleId === rule.id),
          rewrites: rule.rewrites,
          escalation: null,
        })
      }
    }
  }
  return findings.sort((a, b) => a.start - b.start)
}

/** 광고에서 탐지된 주장 유형 목록 */
export function extractClaims(findings) {
  return [...new Set(findings.map((f) => f.claimType))]
}

/** 대체 표현 제안 → 화면 표시 문구 */
export function rewriteLabel(rewrite) {
  if (typeof rewrite === 'string') return rewrite
  if (rewrite.keep) return '현재 표현 유지 (증빙 제출)'
  if (!rewrite.text) return '표현 삭제'
  return `"${rewrite.text}"`
}

/** 대체 표현 제안 → 카피에 실제로 들어갈 문구 */
export function rewriteValue(rewrite, phrase) {
  return typeof rewrite === 'string' ? rewrite : (rewrite.keep ? phrase : rewrite.text)
}
