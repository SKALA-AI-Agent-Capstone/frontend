import { translated } from '@/shared/i18n'
// 서버 진행 단계. slot은 서버와 Agent가 쓰는 steps 배열 자리(0~4)다.
// 2번 자리(사진 검토)는 Agent가 사진 검토를 없애(광고 문구만 검토) 더 이상 보내지 않으므로 화면에서 건너뛴다.
// 예전 Agent가 2번을 보내도 무시하므로 어느 버전이 돌아도 순서가 뒤집혀 보이지 않는다.
export const ANALYSIS_STEPS = [
 translated({ id: 'prepare', slot: 0 }, { title: 'common.analysis.prepare.title', description: 'common.analysis.prepare.description' }),
 translated({ id: 'text', slot: 1 }, { title: 'common.analysis.text.title', description: 'common.analysis.text.description' }),
 translated({ id: 'business', slot: 3 }, { title: 'common.analysis.business.title', description: 'common.analysis.business.description' }),
 translated({ id: 'approval', slot: 4 }, { title: 'common.analysis.approval.title', description: 'common.analysis.approval.description' }),
]

export const isStepDone = (version, step) => (version?.steps?.[step.slot] ?? 0) >= 100

/** 끝난 단계 수. 대시보드 진행 줄에서 쓴다. */
export const stepsDone = version => ANALYSIS_STEPS.filter(step => isStepDone(version, step)).length

/** 지금 진행 중인 단계(끝나지 않은 첫 단계). 모두 끝났으면 마지막 단계다. */
export const currentStepIndex = version => {
  const open = ANALYSIS_STEPS.findIndex(step => !isStepDone(version, step))
  return open < 0 ? ANALYSIS_STEPS.length - 1 : open
}

/**
 * 단계마다 상태(done, running, failed, pending). phase가 done이면 모두 완료로 본다.
 * 끝나지 않은 첫 단계는 진행 중(phase가 failed면 실패)이고, active가 false면(아직 접수 전) 진행 중 표시를 하지 않는다.
 */
export function stepStates(version, phase, { active = true } = {}) {
  const firstOpen = ANALYSIS_STEPS.findIndex(step => !isStepDone(version, step))
  return ANALYSIS_STEPS.map((step, i) => {
    let state = isStepDone(version, step) || phase === 'done' ? 'done' : 'pending'
    if (state !== 'done' && i === firstOpen && active) state = phase === 'failed' ? 'failed' : 'running'
    return { ...step, state }
  })
}
