import { translated } from '@/shared/i18n'

// 품목 유형 (기능성 여부)
export const PRODUCT_CATEGORIES = [
  translated({ value: 'functional', functional: true }, { label: 'common.product.functional' }),
  translated({ value: 'general', functional: false }, { label: 'common.product.general' }),
  translated({ value: 'baby', functional: false }, { label: 'common.product.baby' }),
  translated({ value: 'custom', functional: false }, { label: 'common.product.custom' }),
]

// 광고 매체 (검토 건 메타 정보) — KRDS: 체크박스 옵션 가나다순
export const MEDIA_CHANNELS = [
  translated({ value: 'live' }, { label: 'common.media.live.label', description: 'common.media.live.description' }),
  translated({ value: 'detail-page' }, { label: 'common.media.detailPage.label', description: 'common.media.detailPage.description' }),
  translated({ value: 'print' }, { label: 'common.media.print.label', description: 'common.media.print.description' }),
  translated({ value: 'sns' }, { label: 'common.media.sns.label', description: 'common.media.sns.description' }),
  translated({ value: 'broadcast' }, { label: 'common.media.broadcast.label', description: 'common.media.broadcast.description' }),
]
