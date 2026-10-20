// 자율심의 절차 단계 — 신청서, 진단, 결과 화면이 공통으로 쓰는 단계 정의 (시안 krds_2 단계 표시기)
export const APPLICATION_STEPS = Object.freeze([
  { no: 1, title: '심의정보 작성', icon: 'edit_document' },
  { no: 2, title: 'AI 사전 진단', icon: 'cloud_upload' },
  { no: 3, title: '위반사항 확인, 보완', icon: 'fact_check' },
  { no: 4, title: '승인 완료', icon: 'check_circle' },
])
