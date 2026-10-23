import { translated } from '@/shared/i18n'

// 광고 매체 (검토 건 메타 정보) — KRDS: 체크박스 옵션 가나다순
export const MEDIA_CHANNELS = [
  translated({ value: 'live' }, { label: 'common.media.live.label', description: 'common.media.live.description' }),
  translated({ value: 'detail-page' }, { label: 'common.media.detailPage.label', description: 'common.media.detailPage.description' }),
  translated({ value: 'print' }, { label: 'common.media.print.label', description: 'common.media.print.description' }),
  translated({ value: 'sns' }, { label: 'common.media.sns.label', description: 'common.media.sns.description' }),
  translated({ value: 'broadcast' }, { label: 'common.media.broadcast.label', description: 'common.media.broadcast.description' }),
]
