// 랜딩과 인증 화면에 쓰는 공개 도메인 옛 화장품 광고. 출처와 라이선스는 public/landing/credits.json과 같다.
// 서비스의 실제 검토 대상이나 고객 자료가 아니며, 화면에는 출처만 표시하고 판정을 붙이지 않는다.
import { translated } from '@/shared/i18n'

export interface ArchiveAd {
  id: string
  src: string
  width: number
  height: number
  caption: string
  alt: string
  creator: string
  year: string
  page: string
}

const ADS = [
  {
    id: 'lesquendieu',
    src: '/landing/reclame-parfumeur-j-lesquendieu-de-1921.jpg',
    width: 664,
    height: 1100,
    creator: 'landing.archive.unknownCreator',
    year: '1921',
    page: 'https://commons.wikimedia.org/wiki/File:R%C3%A9clame_Parfumeur_J._Lesquendieu_de_1921.jpg',
  },
  {
    id: 'elida',
    src: '/landing/julius-klinger-elida-1921.jpg',
    width: 902,
    height: 1100,
    creator: 'Julius Klinger',
    year: '1921',
    page: 'https://commons.wikimedia.org/wiki/File:Julius_Klinger-Elida-1921.jpg',
  },
  {
    id: 'lundborg',
    src: '/landing/try-vio-violet-a-new-lundborg-perfume.jpg',
    width: 750,
    height: 1100,
    creator: 'Louis Rhead',
    year: 'landing.archive.lundborg.year',
    page: 'https://commons.wikimedia.org/wiki/File:Try_vio-violet_a_new_Lundborg_perfume_(2015646922).jpg',
  },
  {
    id: 'klarybella',
    src: '/landing/ludwig-hohlwein-parfum-klarybella-1924.jpg',
    width: 827,
    height: 1100,
    creator: 'Ludwig Hohlwein',
    year: '1924',
    page: 'https://commons.wikimedia.org/wiki/File:Ludwig_Hohlwein_-_Parf%C3%BCm_Klarybella,_1924.jpg',
  },
  {
    id: 'rigaud',
    src: '/landing/george-barbier-parfum-tendre-parfums-rigaud-1922.jpg',
    width: 804,
    height: 1100,
    creator: 'George Barbier',
    year: '1922',
    page: 'https://commons.wikimedia.org/wiki/File:George_Barbier_-_Parfum_Tendre_(Parfums_Rigaud),_1922.jpg',
  },
]

// 캡션과 대체 텍스트는 locales/*/landing.json의 archive에 있다
export const ARCHIVE_ADS: readonly ArchiveAd[] = Object.freeze(
  ADS.map((ad) => {
    // 작자와 연도 중 번역 키로 둔 값만 언어를 따라 바꾼다
    const extra: Record<string, string> = {}
    if (ad.creator.startsWith('landing.')) extra.creator = ad.creator
    if (ad.year.startsWith('landing.')) extra.year = ad.year
    return translated(ad, { caption: `landing.archive.${ad.id}.caption`, alt: `landing.archive.${ad.id}.alt`, ...extra })
  }),
)
