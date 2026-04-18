// Mock 화가 데이터 — 개발/테스트용 실제 화가 기반 샘플 데이터
// 새 Types(API 반환 구조와 1:1 일치)에 맞춰 정합화됨.

import type { ArtistSummary, ArtistDetail } from "@/types/artist";
import type { ArtistCountryDistribution } from "@/types/map";

/** 화가 목록 Mock 데이터 (GET /artists) */
export const mockArtists: ArtistSummary[] = [
  {
    id: "artist-001",
    name_ko: "빈센트 반 고흐",
    name_en: "Vincent van Gogh",
    birth_year: 1853,
    death_year: 1890,
    nationality: "Dutch",
    thumbnail_url: null,
    artwork_count: 28,
    movements: [{ name_ko: "후기 인상주의", name_en: "Post-Impressionism" }],
  },
  {
    id: "artist-002",
    name_ko: "클로드 모네",
    name_en: "Claude Monet",
    birth_year: 1840,
    death_year: 1926,
    nationality: "French",
    thumbnail_url: null,
    artwork_count: 22,
    movements: [{ name_ko: "인상주의", name_en: "Impressionism" }],
  },
  {
    id: "artist-003",
    name_ko: "레오나르도 다 빈치",
    name_en: "Leonardo da Vinci",
    birth_year: 1452,
    death_year: 1519,
    nationality: "Italian",
    thumbnail_url: null,
    artwork_count: 15,
    movements: [{ name_ko: "르네상스", name_en: "Renaissance" }],
  },
  {
    id: "artist-004",
    name_ko: "파블로 피카소",
    name_en: "Pablo Picasso",
    birth_year: 1881,
    death_year: 1973,
    nationality: "Spanish",
    thumbnail_url: null,
    artwork_count: 34,
    movements: [{ name_ko: "입체주의", name_en: "Cubism" }],
  },
  {
    id: "artist-005",
    name_ko: "렘브란트 반 레인",
    name_en: "Rembrandt van Rijn",
    birth_year: 1606,
    death_year: 1669,
    nationality: "Dutch",
    thumbnail_url: null,
    artwork_count: 19,
    movements: [{ name_ko: "바로크", name_en: "Baroque" }],
  },
  {
    id: "artist-006",
    name_ko: "산드로 보티첼리",
    name_en: "Sandro Botticelli",
    birth_year: 1445,
    death_year: 1510,
    nationality: "Italian",
    thumbnail_url: null,
    artwork_count: 1,
    movements: [{ name_ko: "초기 르네상스", name_en: "Early Renaissance" }],
  },
  {
    id: "artist-007",
    name_ko: "박수근",
    name_en: "Park Soo-keun",
    birth_year: 1914,
    death_year: 1965,
    nationality: "Korean",
    thumbnail_url: null,
    artwork_count: 1,
    movements: [{ name_ko: "근대 한국 회화", name_en: "Korean Modern Painting" }],
  },
  {
    id: "artist-008",
    name_ko: "김환기",
    name_en: "Kim Whanki",
    birth_year: 1913,
    death_year: 1974,
    nationality: "Korean",
    thumbnail_url: null,
    artwork_count: 1,
    movements: [{ name_ko: "한국 추상 미술", name_en: "Korean Abstract Art" }],
  },
];

/** 화가 상세 Mock 데이터 (GET /artists/{id}) — artwork_count 미포함 */
export const mockArtistDetail: Record<string, ArtistDetail> = {
  "artist-001": {
    id: "artist-001",
    name_ko: "빈센트 반 고흐",
    name_en: "Vincent van Gogh",
    birth_year: 1853,
    death_year: 1890,
    nationality: "Dutch",
    bio_ko:
      "빈센트 반 고흐(1853–1890)는 네덜란드 출신의 후기 인상주의 화가입니다. 생전에는 거의 인정받지 못했지만, 사후 서양 미술사에서 가장 영향력 있는 화가 중 한 명으로 평가받습니다. 불꽃 같은 필치와 강렬한 색채로 ‹별이 빛나는 밤›, ‹해바라기› 등 불후의 명작을 남겼습니다.",
    bio_en:
      "Vincent van Gogh (1853–1890) was a Dutch Post-Impressionist painter who posthumously became one of the most influential figures in Western art history. His bold brushwork and vibrant colors are evident in masterpieces such as The Starry Night and Sunflowers.",
    thumbnail_url: null,
    movements: [
      {
        name_ko: "후기 인상주의",
        name_en: "Post-Impressionism",
        period_start: 1886,
        period_end: 1905,
      },
    ],
  },
  "artist-002": {
    id: "artist-002",
    name_ko: "클로드 모네",
    name_en: "Claude Monet",
    birth_year: 1840,
    death_year: 1926,
    nationality: "French",
    bio_ko:
      "클로드 모네(1840–1926)는 인상주의 운동의 창시자 중 한 명으로, 빛과 색채의 순간적인 변화를 화폭에 담아냈습니다. ‹수련› 연작과 ‹인상, 해돋이› 등으로 미술사에 혁명을 일으켰습니다.",
    bio_en:
      "Claude Monet (1840–1926) was a founder of the Impressionist movement, dedicated to capturing the fleeting effects of light and color. His Water Lilies series and Impression, Sunrise revolutionized art history.",
    thumbnail_url: null,
    movements: [
      { name_ko: "인상주의", name_en: "Impressionism", period_start: 1860, period_end: 1890 },
    ],
  },
  "artist-003": {
    id: "artist-003",
    name_ko: "레오나르도 다 빈치",
    name_en: "Leonardo da Vinci",
    birth_year: 1452,
    death_year: 1519,
    nationality: "Italian",
    bio_ko:
      "레오나르도 다 빈치(1452–1519)는 르네상스의 전형적인 만능 천재로, 화가이자 조각가, 건축가, 과학자, 발명가였습니다. ‹모나리자›와 ‹최후의 만찬›은 인류 역사상 가장 유명한 작품으로 손꼽힙니다.",
    bio_en:
      "Leonardo da Vinci (1452–1519) was the archetypal Renaissance genius—painter, sculptor, architect, musician, mathematician, scientist, and inventor. The Mona Lisa and The Last Supper are among the most famous works in human history.",
    thumbnail_url: null,
    movements: [
      { name_ko: "르네상스", name_en: "Renaissance", period_start: 1400, period_end: 1600 },
    ],
  },
  "artist-004": {
    id: "artist-004",
    name_ko: "파블로 피카소",
    name_en: "Pablo Picasso",
    birth_year: 1881,
    death_year: 1973,
    nationality: "Spanish",
    bio_ko:
      "파블로 피카소(1881–1973)는 20세기 가장 영향력 있는 예술가 중 한 명으로, 조르주 브라크와 함께 입체주의를 창시했습니다. ‹게르니카›는 전쟁의 참혹함을 고발한 걸작으로 평가받습니다.",
    bio_en:
      "Pablo Picasso (1881–1973) was one of the most influential artists of the 20th century and co-founded Cubism with Georges Braque. Guernica is celebrated as a masterpiece denouncing the horrors of war.",
    thumbnail_url: null,
    movements: [{ name_ko: "입체주의", name_en: "Cubism", period_start: 1907, period_end: 1922 }],
  },
  "artist-005": {
    id: "artist-005",
    name_ko: "렘브란트 반 레인",
    name_en: "Rembrandt van Rijn",
    birth_year: 1606,
    death_year: 1669,
    nationality: "Dutch",
    bio_ko:
      "렘브란트(1606–1669)는 유럽 미술사에서 가장 위대한 화가이자 판화가 중 한 명입니다. 빛과 어둠의 극적인 대비, 즉 키아로스쿠로 기법을 완성한 거장으로 ‹야간 순찰›이 대표작입니다.",
    bio_en:
      "Rembrandt (1606–1669) is regarded as one of the greatest painters and printmakers in European art history. He mastered the dramatic contrast of light and shadow (chiaroscuro), most famously in The Night Watch.",
    thumbnail_url: null,
    movements: [{ name_ko: "바로크", name_en: "Baroque", period_start: 1600, period_end: 1750 }],
  },
  "artist-006": {
    id: "artist-006",
    name_ko: "산드로 보티첼리",
    name_en: "Sandro Botticelli",
    birth_year: 1445,
    death_year: 1510,
    nationality: "Italian",
    bio_ko:
      "산드로 보티첼리(1445–1510)는 피렌체에서 활동한 초기 르네상스의 대표 화가입니다. 메디치 가문의 후원을 받아 신화와 종교를 주제로 한 우아하고 서정적인 걸작을 다수 제작했습니다. 대표작으로는 ‹비너스의 탄생›과 ‹봄(프리마베라)›이 있으며, 부드러운 선과 장식적 구성은 이후 유럽 회화에 깊은 영향을 미쳤고, 르네상스 회화의 이상적 아름다움을 상징하는 화가로 평가받습니다.",
    bio_en:
      "Sandro Botticelli (1445–1510) was a leading painter of the Early Renaissance active in Florence. Under the patronage of the Medici family, he produced numerous graceful and lyrical masterpieces on mythological and religious themes, most famously The Birth of Venus and Primavera. His flowing lines and decorative compositions deeply influenced later European painting and came to symbolize the ideal beauty of Renaissance art.",
    thumbnail_url: null,
    movements: [
      {
        name_ko: "초기 르네상스",
        name_en: "Early Renaissance",
        period_start: 1400,
        period_end: 1495,
      },
    ],
  },
  "artist-007": {
    id: "artist-007",
    name_ko: "박수근",
    name_en: "Park Soo-keun",
    birth_year: 1914,
    death_year: 1965,
    nationality: "Korean",
    bio_ko:
      "박수근(1914–1965)은 한국 근대 미술을 대표하는 화가입니다. 화강암을 연상시키는 두꺼운 마티에르 기법으로 고유한 질감을 만들어 냈으며, 서민의 일상과 여인, 아이들을 주된 소재로 삼아 소박하고 따뜻한 정서를 화폭에 담았습니다. 대표작으로 ‹빨래터›와 ‹나무와 두 여인› 등이 있으며, 한국 전후 미술사에서 가장 사랑받는 작가 중 한 명으로 평가받습니다.",
    bio_en:
      "Park Soo-keun (1914–1965) is one of the most beloved painters in modern Korean art. He developed a distinctive technique of building thick, granite-like matière that gave his canvases a uniquely tactile surface. Drawing on the everyday lives of ordinary people — women, children, and village scenes — he expressed a humble and warm sensibility, most famously in works such as Women Washing Clothes by the Stream and Tree and Two Women.",
    thumbnail_url: null,
    movements: [
      {
        name_ko: "근대 한국 회화",
        name_en: "Korean Modern Painting",
        period_start: 1900,
        period_end: 1970,
      },
    ],
  },
  "artist-008": {
    id: "artist-008",
    name_ko: "김환기",
    name_en: "Kim Whanki",
    birth_year: 1913,
    death_year: 1974,
    nationality: "Korean",
    bio_ko:
      "김환기(1913–1974)는 한국 추상 미술의 선구자로 꼽히는 화가입니다. 한국적 서정과 동양적 사유를 서구 추상 회화의 언어로 풀어냈으며, 뉴욕 시대에 완성한 점화(點畵) 연작은 그의 예술 세계를 대표하는 성취입니다. ‹우주(05-IV-71 #200)›를 비롯한 점화 작품들은 한국 미술 경매에서 최고가 기록을 여러 차례 경신해 왔습니다.",
    bio_en:
      "Kim Whanki (1913–1974) is regarded as a pioneer of Korean abstract painting. He translated the lyricism of Korean tradition and Eastern philosophy into the language of Western abstraction, and the dot paintings he completed during his New York years stand as the defining achievement of his career. Works such as Universe (05-IV-71 #200) have repeatedly set record prices at Korean art auctions.",
    thumbnail_url: null,
    movements: [
      {
        name_ko: "한국 추상 미술",
        name_en: "Korean Abstract Art",
        period_start: 1950,
        period_end: 1980,
      },
    ],
  },
};

/** 화가 작품 국가 분포 Mock 데이터 (GET /artists/{id}/map-data) */
export const mockArtistMapData: Record<string, ArtistCountryDistribution[]> = {
  "artist-001": [
    {
      country_code: "NL",
      country_name_ko: "네덜란드",
      country_name_en: "Netherlands",
      artwork_count: 12,
      latitude: 52.1326,
      longitude: 5.2913,
    },
    {
      country_code: "FR",
      country_name_ko: "프랑스",
      country_name_en: "France",
      artwork_count: 9,
      latitude: 46.2276,
      longitude: 2.2137,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 4,
      latitude: 37.0902,
      longitude: -95.7129,
    },
    {
      country_code: "RU",
      country_name_ko: "러시아",
      country_name_en: "Russia",
      artwork_count: 3,
      latitude: 61.524,
      longitude: 105.3188,
    },
  ],
  "artist-002": [
    {
      country_code: "FR",
      country_name_ko: "프랑스",
      country_name_en: "France",
      artwork_count: 14,
      latitude: 46.2276,
      longitude: 2.2137,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 5,
      latitude: 37.0902,
      longitude: -95.7129,
    },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 3,
      latitude: 55.3781,
      longitude: -3.436,
    },
  ],
  "artist-003": [
    {
      country_code: "IT",
      country_name_ko: "이탈리아",
      country_name_en: "Italy",
      artwork_count: 6,
      latitude: 41.8719,
      longitude: 12.5674,
    },
    {
      country_code: "FR",
      country_name_ko: "프랑스",
      country_name_en: "France",
      artwork_count: 5,
      latitude: 46.2276,
      longitude: 2.2137,
    },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 2,
      latitude: 55.3781,
      longitude: -3.436,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 2,
      latitude: 37.0902,
      longitude: -95.7129,
    },
  ],
  "artist-004": [
    {
      country_code: "ES",
      country_name_ko: "스페인",
      country_name_en: "Spain",
      artwork_count: 10,
      latitude: 40.4637,
      longitude: -3.7492,
    },
    {
      country_code: "FR",
      country_name_ko: "프랑스",
      country_name_en: "France",
      artwork_count: 15,
      latitude: 46.2276,
      longitude: 2.2137,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 9,
      latitude: 37.0902,
      longitude: -95.7129,
    },
  ],
  "artist-005": [
    {
      country_code: "NL",
      country_name_ko: "네덜란드",
      country_name_en: "Netherlands",
      artwork_count: 11,
      latitude: 52.1326,
      longitude: 5.2913,
    },
    {
      country_code: "GB",
      country_name_ko: "영국",
      country_name_en: "United Kingdom",
      artwork_count: 4,
      latitude: 55.3781,
      longitude: -3.436,
    },
    {
      country_code: "US",
      country_name_ko: "미국",
      country_name_en: "United States",
      artwork_count: 4,
      latitude: 37.0902,
      longitude: -95.7129,
    },
  ],
  "artist-006": [
    {
      country_code: "IT",
      country_name_ko: "이탈리아",
      country_name_en: "Italy",
      artwork_count: 1,
      latitude: 41.8719,
      longitude: 12.5674,
    },
  ],
  "artist-007": [
    {
      country_code: "KR",
      country_name_ko: "대한민국",
      country_name_en: "South Korea",
      artwork_count: 1,
      latitude: 35.9078,
      longitude: 127.7669,
    },
  ],
  "artist-008": [
    {
      country_code: "KR",
      country_name_ko: "대한민국",
      country_name_en: "South Korea",
      artwork_count: 1,
      latitude: 35.9078,
      longitude: 127.7669,
    },
  ],
};
