// Mock 화가 데이터 — 개발/테스트용 실제 화가 기반 샘플 데이터

import type { ArtistSummary, ArtistDetail, ArtistCountryDistribution } from "@/types/artist";

/** 화가 목록 Mock 데이터 */
export const mockArtists: ArtistSummary[] = [
  {
    id: "artist-001",
    name_ko: "빈센트 반 고흐",
    name_en: "Vincent van Gogh",
    birth_year: 1853,
    death_year: 1890,
    nationality_ko: "네덜란드",
    nationality_en: "Dutch",
    artwork_count: 28,
    thumbnail_url: null,
  },
  {
    id: "artist-002",
    name_ko: "클로드 모네",
    name_en: "Claude Monet",
    birth_year: 1840,
    death_year: 1926,
    nationality_ko: "프랑스",
    nationality_en: "French",
    artwork_count: 22,
    thumbnail_url: null,
  },
  {
    id: "artist-003",
    name_ko: "레오나르도 다 빈치",
    name_en: "Leonardo da Vinci",
    birth_year: 1452,
    death_year: 1519,
    nationality_ko: "이탈리아",
    nationality_en: "Italian",
    artwork_count: 15,
    thumbnail_url: null,
  },
  {
    id: "artist-004",
    name_ko: "파블로 피카소",
    name_en: "Pablo Picasso",
    birth_year: 1881,
    death_year: 1973,
    nationality_ko: "스페인",
    nationality_en: "Spanish",
    artwork_count: 34,
    thumbnail_url: null,
  },
  {
    id: "artist-005",
    name_ko: "렘브란트 반 레인",
    name_en: "Rembrandt van Rijn",
    birth_year: 1606,
    death_year: 1669,
    nationality_ko: "네덜란드",
    nationality_en: "Dutch",
    artwork_count: 19,
    thumbnail_url: null,
  },
  {
    id: "artist-006",
    name_ko: "산드로 보티첼리",
    name_en: "Sandro Botticelli",
    birth_year: 1445,
    death_year: 1510,
    nationality_ko: "이탈리아",
    nationality_en: "Italian",
    artwork_count: 12,
    thumbnail_url: null,
  },
  {
    id: "artist-007",
    name_ko: "박수근",
    name_en: "Park Soo-keun",
    birth_year: 1914,
    death_year: 1965,
    nationality_ko: "대한민국",
    nationality_en: "Korean",
    artwork_count: 8,
    thumbnail_url: null,
  },
  {
    id: "artist-008",
    name_ko: "김환기",
    name_en: "Kim Whanki",
    birth_year: 1913,
    death_year: 1974,
    nationality_ko: "대한민국",
    nationality_en: "Korean",
    artwork_count: 10,
    thumbnail_url: null,
  },
];

/** 화가 상세 Mock 데이터 (ID별) */
export const mockArtistDetail: Record<string, ArtistDetail> = {
  "artist-001": {
    id: "artist-001",
    name_ko: "빈센트 반 고흐",
    name_en: "Vincent van Gogh",
    birth_year: 1853,
    death_year: 1890,
    nationality_ko: "네덜란드",
    nationality_en: "Dutch",
    biography_ko:
      "빈센트 반 고흐(1853–1890)는 네덜란드 출신의 후기 인상주의 화가입니다. 생전에는 거의 인정받지 못했지만, 사후 서양 미술사에서 가장 영향력 있는 화가 중 한 명으로 평가받습니다. 불꽃 같은 필치와 강렬한 색채로 ‹별이 빛나는 밤›, ‹해바라기› 등 불후의 명작을 남겼습니다.",
    biography_en:
      "Vincent van Gogh (1853–1890) was a Dutch Post-Impressionist painter who posthumously became one of the most influential figures in Western art history. His bold brushwork and vibrant colors are evident in masterpieces such as The Starry Night and Sunflowers.",
    style_ko: "후기 인상주의",
    style_en: "Post-Impressionism",
    artwork_count: 28,
    thumbnail_url: null,
  },
  "artist-002": {
    id: "artist-002",
    name_ko: "클로드 모네",
    name_en: "Claude Monet",
    birth_year: 1840,
    death_year: 1926,
    nationality_ko: "프랑스",
    nationality_en: "French",
    biography_ko:
      "클로드 모네(1840–1926)는 인상주의 운동의 창시자 중 한 명으로, 빛과 색채의 순간적인 변화를 화폭에 담아냈습니다. ‹수련› 연작과 ‹인상, 해돋이› 등으로 미술사에 혁명을 일으켰습니다.",
    biography_en:
      "Claude Monet (1840–1926) was a founder of the Impressionist movement, dedicated to capturing the fleeting effects of light and color. His Water Lilies series and Impression, Sunrise revolutionized art history.",
    style_ko: "인상주의",
    style_en: "Impressionism",
    artwork_count: 22,
    thumbnail_url: null,
  },
  "artist-003": {
    id: "artist-003",
    name_ko: "레오나르도 다 빈치",
    name_en: "Leonardo da Vinci",
    birth_year: 1452,
    death_year: 1519,
    nationality_ko: "이탈리아",
    nationality_en: "Italian",
    biography_ko:
      "레오나르도 다 빈치(1452–1519)는 르네상스의 전형적인 만능 천재로, 화가이자 조각가, 건축가, 과학자, 발명가였습니다. ‹모나리자›와 ‹최후의 만찬›은 인류 역사상 가장 유명한 작품으로 손꼽힙니다.",
    biography_en:
      "Leonardo da Vinci (1452–1519) was the archetypal Renaissance genius—painter, sculptor, architect, musician, mathematician, scientist, and inventor. The Mona Lisa and The Last Supper are among the most famous works in human history.",
    style_ko: "르네상스",
    style_en: "Renaissance",
    artwork_count: 15,
    thumbnail_url: null,
  },
  "artist-004": {
    id: "artist-004",
    name_ko: "파블로 피카소",
    name_en: "Pablo Picasso",
    birth_year: 1881,
    death_year: 1973,
    nationality_ko: "스페인",
    nationality_en: "Spanish",
    biography_ko:
      "파블로 피카소(1881–1973)는 20세기 가장 영향력 있는 예술가 중 한 명으로, 조르주 브라크와 함께 입체주의를 창시했습니다. ‹게르니카›는 전쟁의 참혹함을 고발한 걸작으로 평가받습니다.",
    biography_en:
      "Pablo Picasso (1881–1973) was one of the most influential artists of the 20th century and co-founded Cubism with Georges Braque. Guernica is celebrated as a masterpiece denouncing the horrors of war.",
    style_ko: "입체주의",
    style_en: "Cubism",
    artwork_count: 34,
    thumbnail_url: null,
  },
  "artist-005": {
    id: "artist-005",
    name_ko: "렘브란트 반 레인",
    name_en: "Rembrandt van Rijn",
    birth_year: 1606,
    death_year: 1669,
    nationality_ko: "네덜란드",
    nationality_en: "Dutch",
    biography_ko:
      "렘브란트(1606–1669)는 유럽 미술사에서 가장 위대한 화가이자 판화가 중 한 명입니다. 빛과 어둠의 극적인 대비, 즉 키아로스쿠로 기법을 완성한 거장으로 ‹야간 순찰›이 대표작입니다.",
    biography_en:
      "Rembrandt (1606–1669) is regarded as one of the greatest painters and printmakers in European art history. He mastered the dramatic contrast of light and shadow (chiaroscuro), most famously in The Night Watch.",
    style_ko: "바로크",
    style_en: "Baroque",
    artwork_count: 19,
    thumbnail_url: null,
  },
};

/** 화가 작품 국가 분포 Mock 데이터 (ID별) */
export const mockArtistMapData: Record<string, ArtistCountryDistribution[]> = {
  "artist-001": [
    {
      country_code: "NL",
      country_name_ko: "네덜란드",
      country_name_en: "Netherlands",
      artwork_count: 12,
    },
    { country_code: "FR", country_name_ko: "프랑스", country_name_en: "France", artwork_count: 9 },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 4,
    },
    { country_code: "RU", country_name_ko: "러시아", country_name_en: "Russia", artwork_count: 3 },
  ],
  "artist-002": [
    { country_code: "FR", country_name_ko: "프랑스", country_name_en: "France", artwork_count: 14 },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 5,
    },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 3,
    },
  ],
  "artist-003": [
    { country_code: "IT", country_name_ko: "이탈리아", country_name_en: "Italy", artwork_count: 6 },
    { country_code: "FR", country_name_ko: "프랑스", country_name_en: "France", artwork_count: 5 },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 2,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 2,
    },
  ],
  "artist-004": [
    { country_code: "ES", country_name_ko: "스페인", country_name_en: "Spain", artwork_count: 10 },
    { country_code: "FR", country_name_ko: "프랑스", country_name_en: "France", artwork_count: 15 },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 9,
    },
  ],
  "artist-005": [
    {
      country_code: "NL",
      country_name_ko: "네덜란드",
      country_name_en: "Netherlands",
      artwork_count: 11,
    },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 4,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 4,
    },
  ],
};
