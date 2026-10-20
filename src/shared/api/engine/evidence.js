/*
 * 광고 주장 ↔ 증빙 대조 (FR-3), 필요 서류 사전 안내 (FR-10) — 순수 함수.
 * 공공데이터 조회 결과는 보조 근거로만 쓴다 (FR-4): 제출 서류가 1차, API 는 2차 교차검증.
 */
import {
  CLAIM_LABEL,
  DOC_TYPE_LABEL,
  DOC_TYPES,
  FUNCTION_OF_CLAIM,
  PUBLIC_DATA_STATUS,
  SEVERITY,
} from '@/shared/constants/review'
import { REQUIRED_DOCS } from '@/shared/data/requiredDocs.data'
import { ARTICLES } from '@/shared/data/standards.data'
import { withSourceMeta } from './detect'

/** 주장 유형별 필요 서류와 제출 여부 */
export function buildRequirements(claimTypes, evidenceDocs = []) {
  const provided = new Set(evidenceDocs.map((d) => d.docType))
  return claimTypes
    .filter((claim) => REQUIRED_DOCS[claim])
    .map((claim) => {
      const rule = REQUIRED_DOCS[claim]
      return {
        claimType: claim,
        claimLabel: CLAIM_LABEL[claim],
        prohibited: rule.prohibited,
        docs: rule.docs.map((docType) => ({
          docType,
          label: DOC_TYPE_LABEL[docType],
          provided: provided.has(docType),
        })),
      }
    })
}

/**
 * 증빙 대조 결과와 판정 상향(escalation) 목록
 * @returns {{ requirements, flags, escalations: Map<claimType, {severity, reason, basis}> }}
 */
export function checkEvidence({ claimTypes, evidenceDocs, publicData, functionalReportNo }) {
  const requirements = buildRequirements(claimTypes, evidenceDocs)
  const flags = []
  const escalations = new Map()

  // 1) 금지 표현 — 서류로 해결 불가
  for (const req of requirements.filter((r) => r.prohibited)) {
    flags.push({
      severity: SEVERITY.HIGH,
      claimType: req.claimType,
      message: `'${req.claimLabel}'은(는) 증빙으로 허용되지 않는 표현입니다. 표현을 수정해야 합니다.`,
    })
  }

  // 2) 필요 서류 누락
  for (const req of requirements.filter((r) => !r.prohibited)) {
    const missing = req.docs.filter((d) => !d.provided)
    if (missing.length) {
      flags.push({
        severity: SEVERITY.MEDIUM,
        claimType: req.claimType,
        message: `'${req.claimLabel}' 주장에 필요한 ${missing.map((d) => d.label).join(', ')}이(가) 제출되지 않았습니다.`,
      })
      escalations.set(req.claimType, {
        severity: SEVERITY.MEDIUM,
        reason: `증빙 누락: ${missing.map((d) => d.label).join(', ')}`,
      })
    }
  }

  // 3) 기능성 범위 대조 — 보고된 기능 밖의 효능 주장 (예: 미백만 보고 → 주름개선 주장)
  const functionalClaims = claimTypes.filter((c) => FUNCTION_OF_CLAIM[c])
  if (functionalClaims.length) {
    if (!functionalReportNo) {
      flags.push({
        severity: SEVERITY.MEDIUM,
        message: '기능성 효능을 표방하지만 기능성화장품 심사, 보고번호가 입력되지 않았습니다.',
      })
    } else if (publicData.status === PUBLIC_DATA_STATUS.FOUND) {
      const reported = publicData.data.functions
      for (const claim of functionalClaims) {
        const fn = FUNCTION_OF_CLAIM[claim]
        if (!reported.includes(fn)) {
          const reason = `보고된 기능성(${reported.join(', ')}) 범위를 벗어난 '${fn}' 주장`
          flags.push({ severity: SEVERITY.HIGH, claimType: claim, message: `${reason}입니다.` })
          escalations.set(claim, {
            severity: SEVERITY.HIGH,
            reason,
            basis: withSourceMeta(ARTICLES.COS_13_1_2),
          })
        }
      }
    } else if (publicData.status === PUBLIC_DATA_STATUS.NOT_FOUND) {
      flags.push({
        severity: SEVERITY.MEDIUM,
        message: `심사, 보고번호 '${functionalReportNo}'가 식약처 보고품목에서 조회되지 않았습니다. 번호를 확인하거나 심사, 보고서를 제출해 주세요.`,
      })
    } else if (publicData.status === PUBLIC_DATA_STATUS.ERROR) {
      flags.push({
        severity: SEVERITY.LOW,
        message: '공공데이터 교차검증에 실패해 제출 서류만으로 판단했습니다. 재조회를 권장합니다.',
      })
    }
    const hasReportDoc = evidenceDocs.some((d) => d.docType === DOC_TYPES.FUNCTIONAL_REPORT)
    if (!hasReportDoc && publicData.status === PUBLIC_DATA_STATUS.FOUND) {
      flags.push({
        severity: SEVERITY.LOW,
        message: '공공데이터로 보고 내역은 확인되었으나, 1차 판단 근거인 심사, 보고서 사본 제출을 권장합니다.',
      })
    }
  }

  return { requirements, flags, escalations }
}
