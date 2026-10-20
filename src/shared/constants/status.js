// 전역 상태(variant) 키 — 배지, 알림, 카드 등 상태 색상을 쓰는 모든 컴포넌트가 공유한다.
// 실제 색상 값은 tokens.css 의 --color-{variant}* 변수에 매핑된다.
export const STATUS = Object.freeze({
  PRIMARY: 'primary',
  NEUTRAL: 'neutral',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
})

export const STATUS_ICONS = Object.freeze({
  [STATUS.INFO]: 'info',
  [STATUS.SUCCESS]: 'check_circle',
  [STATUS.WARNING]: 'warning',
  [STATUS.DANGER]: 'error',
})
