// KRDS Responsive layout grid — tokens.css 미디어쿼리와 동일한 값을 유지한다.
export const BREAKPOINTS = Object.freeze({
  MOBILE_MAX: 600,
  TABLET_MAX: 1024,
})

export const MEDIA = Object.freeze({
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`,
  TABLET_DOWN: `(max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
})
