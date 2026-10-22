import { translated } from '@/shared/i18n'
// 자율심의 절차 단계 — 신청서, 진단, 결과 화면이 공통으로 쓰는 단계 정의 (시안 krds_2 단계 표시기)
export const APPLICATION_STEPS = Object.freeze([
  translated({ no: 1, icon: 'edit_document' }, { title: 'common.steps.write' }),
  translated({ no: 2, icon: 'cloud_upload' }, { title: 'common.steps.diagnose' }),
  translated({ no: 3, icon: 'fact_check' }, { title: 'common.steps.fix' }),
  translated({ no: 4, icon: 'check_circle' }, { title: 'common.steps.report' }),
])
