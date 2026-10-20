// 랜딩과 인증 화면에 쓰는 공개 도메인 옛 화장품 광고. 출처와 라이선스는 public/landing/credits.json과 같다.
// 서비스의 실제 검토 대상이나 고객 자료가 아니며, 화면에는 출처만 표시하고 판정을 붙이지 않는다.
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

export const ARCHIVE_ADS: readonly ArchiveAd[] = Object.freeze([
  {
    id: 'lesquendieu',
    src: '/landing/reclame-parfumeur-j-lesquendieu-de-1921.jpg',
    width: 664,
    height: 1100,
    caption: '레스캉디외 향수점 잡지 광고, 1921',
    alt: '두 칸으로 나뉜 프랑스 잡지 광고. 위 칸은 금발용 로션, 아래 칸은 크림을 문구 위주로 소개한다.',
    creator: '작자 미상',
    year: '1921',
    page: 'https://commons.wikimedia.org/wiki/File:R%C3%A9clame_Parfumeur_J._Lesquendieu_de_1921.jpg',
  },
  {
    id: 'elida',
    src: '/landing/julius-klinger-elida-1921.jpg',
    width: 902,
    height: 1100,
    caption: '엘리다 화장비누 포스터, 율리우스 클링어, 1921',
    alt: '크림색 바탕에 검은 대문자 E와 붉은 나비, 아래에 ELIDA 글자가 놓인 비누 포스터.',
    creator: 'Julius Klinger',
    year: '1921',
    page: 'https://commons.wikimedia.org/wiki/File:Julius_Klinger-Elida-1921.jpg',
  },
  {
    id: 'lundborg',
    src: '/landing/try-vio-violet-a-new-lundborg-perfume.jpg',
    width: 750,
    height: 1100,
    caption: '룬드보리 향수 포스터, 루이스 리드, 1890년대',
    alt: '노란 바탕에 보라색 옷을 입은 여성이 제비꽃을 흩뿌리는 향수 포스터.',
    creator: 'Louis Rhead',
    year: '1890년대',
    page: 'https://commons.wikimedia.org/wiki/File:Try_vio-violet_a_new_Lundborg_perfume_(2015646922).jpg',
  },
  {
    id: 'klarybella',
    src: '/landing/ludwig-hohlwein-parfum-klarybella-1924.jpg',
    width: 827,
    height: 1100,
    caption: '클라리벨라 향수 포스터, 루트비히 홀바인, 1924',
    alt: '푸른 드레스를 입은 여성과 노란 장미가 그려진 향수 포스터.',
    creator: 'Ludwig Hohlwein',
    year: '1924',
    page: 'https://commons.wikimedia.org/wiki/File:Ludwig_Hohlwein_-_Parf%C3%BCm_Klarybella,_1924.jpg',
  },
  {
    id: 'rigaud',
    src: '/landing/george-barbier-parfum-tendre-parfums-rigaud-1922.jpg',
    width: 804,
    height: 1100,
    caption: '리고 향수 광고, 조르주 바르비에, 1922',
    alt: '달밤의 난간에 앉은 분홍 드레스의 여성과 피에로를 그린 향수 광고.',
    creator: 'George Barbier',
    year: '1922',
    page: 'https://commons.wikimedia.org/wiki/File:George_Barbier_-_Parfum_Tendre_(Parfums_Rigaud),_1922.jpg',
  },
])
