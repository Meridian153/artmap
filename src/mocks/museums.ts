// Mock 미술관 데이터 — 개발/테스트용 실제 미술관 기반 샘플 데이터
// 새 Types(API 반환 구조와 1:1 일치)에 맞춰 정합화됨.

import type { FeaturedArtwork, MuseumSummary, MuseumDetail } from "@/types/museum";

/** 미술관 목록 Mock 데이터 (GET /museums) */
export const mockMuseums: MuseumSummary[] = [
  {
    id: "museum-001",
    name_ko: "오르세 미술관",
    name_en: "Musée d'Orsay",
    institution_type: "museum",
    country_code: "FR",
    city: "Paris",
    latitude: 48.86,
    longitude: 2.3266,
    artwork_count: 2,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Front_view_of_the_Mus%C3%A9e_d%27Orsay.jpg/1280px-Front_view_of_the_Mus%C3%A9e_d%27Orsay.jpg",
    featured_artwork: {
      artwork_id: "artwork-004",
      artwork_title: "푸른 수련 (Blue Water Lilies)",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Blue_Water_Lilies_-_Google_Art_Project.jpg/500px-Claude_Monet_-_Blue_Water_Lilies_-_Google_Art_Project.jpg",
    } satisfies FeaturedArtwork, // PENDING_BE: featured_artwork — GET /api/v1/museums
  },
  {
    id: "museum-002",
    name_ko: "반 고흐 미술관",
    name_en: "Van Gogh Museum",
    institution_type: "museum",
    country_code: "NL",
    city: "Amsterdam",
    latitude: 52.3584,
    longitude: 4.8811,
    artwork_count: 3,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Van_Gogh_Museum_Amsterdam.jpg/1280px-Van_Gogh_Museum_Amsterdam.jpg",
    featured_artwork: {
      artwork_id: "artwork-002",
      artwork_title: "해바라기 (Sunflowers)",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg/500px-Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg",
    } satisfies FeaturedArtwork,
  },
  {
    id: "museum-003",
    name_ko: "메트로폴리탄 미술관",
    name_en: "The Metropolitan Museum of Art",
    institution_type: "museum",
    country_code: "US",
    city: "New York",
    latitude: 40.7794,
    longitude: -73.9632,
    artwork_count: 4,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg",
    featured_artwork: {
      artwork_id: "artwork-009",
      artwork_title: "델라웨어 강을 건너는 워싱턴 (Washington Crossing the Delaware)",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/500px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg",
    } satisfies FeaturedArtwork,
  },
  {
    id: "museum-004",
    name_ko: "루브르 박물관",
    name_en: "Musée du Louvre",
    institution_type: "museum",
    country_code: "FR",
    city: "Paris",
    latitude: 48.8606,
    longitude: 2.3376,
    artwork_count: 3,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg",
    featured_artwork: {
      artwork_id: "artwork-007",
      artwork_title: "모나리자 (Mona Lisa)",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/500px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    } satisfies FeaturedArtwork,
  },
  {
    id: "museum-005",
    name_ko: "국립 현대 미술관",
    name_en: "National Museum of Modern and Contemporary Art",
    institution_type: "museum",
    country_code: "KR",
    city: "Seoul",
    latitude: 37.5797,
    longitude: 126.977,
    artwork_count: 2,
    // 미술관 건물 외관 사진은 Commons에 공개되어 있어 헤더 이미지로 사용 가능
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/National_Museum_of_Modern_and_Contemporary_Art%2C_Seoul.jpg/1280px-National_Museum_of_Modern_and_Contemporary_Art%2C_Seoul.jpg",
    // 한국 근현대 작품(이중섭 「황소」 등)은 저작권 이슈로 Wikimedia Commons에 호스팅되지 않음 → 이니셜 폴백
    featured_artwork: null,
  },
  {
    id: "museum-006",
    name_ko: "우피치 미술관",
    name_en: "Galleria degli Uffizi",
    institution_type: "gallery",
    country_code: "IT",
    city: "Florence",
    latitude: 43.7678,
    longitude: 11.2553,
    artwork_count: 2,
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Florence._Uffizi_Gallery_and_Palazzo_Vecchio_%283611129323%29.jpg",
    featured_artwork: {
      artwork_id: "artwork-013",
      artwork_title: "비너스의 탄생 (The Birth of Venus)",
      image_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/500px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    } satisfies FeaturedArtwork,
  },
];

/** 미술관 상세 Mock 데이터 (GET /museums/{id}) */
export const mockMuseumDetail: Record<string, MuseumDetail> = {
  "museum-001": {
    id: "museum-001",
    name_ko: "오르세 미술관",
    name_en: "Musée d'Orsay",
    institution_type: "museum",
    country_code: "FR",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Front_view_of_the_Mus%C3%A9e_d%27Orsay.jpg/1280px-Front_view_of_the_Mus%C3%A9e_d%27Orsay.jpg",
    description_ko:
      "파리 센 강변에 위치한 오르세 미술관은 옛 기차역을 개조해 만든 미술관으로, 1848년부터 1914년 사이의 인상주의와 후기 인상주의 걸작을 소장하고 있습니다.",
    description_en:
      "Located on the left bank of the Seine in Paris, the Musée d'Orsay is housed in a former railway station and holds an outstanding collection of Impressionist and Post-Impressionist masterpieces from 1848 to 1914.",
    website: "https://www.musee-orsay.fr",
    place: {
      name_ko: "오르세 미술관",
      name_en: "Musée d'Orsay",
      country: "France",
      city: "Paris",
      address: "1 Rue de la Légion d'Honneur, 75007 Paris, France",
      latitude: 48.86,
      longitude: 2.3266,
      opening_hours: {
        tue_sun: "09:30-18:00",
        thu_late: "until 21:45",
        closed: "Mondays, Jan 1, May 1, Dec 25",
      },
      admission: { adult: "€16", note: "Free under 18 / EU residents under 26" },
    },
  },
  "museum-002": {
    id: "museum-002",
    name_ko: "반 고흐 미술관",
    name_en: "Van Gogh Museum",
    institution_type: "museum",
    country_code: "NL",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Van_Gogh_Museum_Amsterdam.jpg/1280px-Van_Gogh_Museum_Amsterdam.jpg",
    description_ko:
      "암스테르담에 위치한 반 고흐 미술관은 빈센트 반 고흐의 작품을 세계에서 가장 많이 소장하고 있으며, 그의 편지와 개인 소장품도 전시합니다.",
    description_en:
      "Located in Amsterdam, the Van Gogh Museum houses the largest collection of Van Gogh's artworks in the world, including his paintings, drawings, and personal correspondence.",
    website: "https://www.vangoghmuseum.nl",
    place: {
      name_ko: "반 고흐 미술관",
      name_en: "Van Gogh Museum",
      country: "Netherlands",
      city: "Amsterdam",
      address: "Museumplein 6, 1071 DJ Amsterdam, Netherlands",
      latitude: 52.3584,
      longitude: 4.8811,
      opening_hours: { daily: "09:00-18:00", fri_late: "until 21:00", closed: "Jan 1" },
      admission: { adult: "€22", note: "Free under 17 / Museumkaart" },
    },
  },
  "museum-003": {
    id: "museum-003",
    name_ko: "메트로폴리탄 미술관",
    name_en: "The Metropolitan Museum of Art",
    institution_type: "museum",
    country_code: "US",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Metropolitan_Museum_of_Art_%28The_Met%29_-_Central_Park%2C_NYC.jpg",
    description_ko:
      "뉴욕 센트럴파크 옆에 위치한 메트로폴리탄 미술관은 미국 최대의 미술관으로, 5,000년에 걸친 인류 문명의 예술품 약 50만 점을 소장하고 있습니다.",
    description_en:
      "Located alongside Central Park in New York City, The Metropolitan Museum of Art is the largest art museum in the United States, with a permanent collection of approximately 500,000 objects spanning 5,000 years of world culture.",
    website: "https://www.metmuseum.org",
    place: {
      name_ko: "메트로폴리탄 미술관",
      name_en: "The Metropolitan Museum of Art",
      country: "United States",
      city: "New York",
      address: "1000 Fifth Avenue, New York, NY 10028, USA",
      latitude: 40.7794,
      longitude: -73.9632,
      opening_hours: {
        sun_tue_thu: "10:00-17:00",
        fri_sat: "10:00-21:00",
        closed: "Wednesdays, Thanksgiving, Dec 25, Jan 1, first Mon of May",
      },
      admission: { adult: "$30", note: "Pay-what-you-wish for NY/NJ/CT residents and students" },
    },
  },
  "museum-004": {
    id: "museum-004",
    name_ko: "루브르 박물관",
    name_en: "Musée du Louvre",
    institution_type: "museum",
    country_code: "FR",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg",
    description_ko:
      "세계 최대 규모의 미술관인 루브르 박물관은 파리 중심부에 위치하며, 레오나르도 다 빈치의 모나리자를 비롯한 인류의 위대한 예술 유산을 소장하고 있습니다.",
    description_en:
      "The Louvre is the world's largest art museum, located in central Paris. It is home to Leonardo da Vinci's Mona Lisa and many other priceless works representing the great art of humanity.",
    website: "https://www.louvre.fr",
    place: {
      name_ko: "루브르 박물관",
      name_en: "Musée du Louvre",
      country: "France",
      city: "Paris",
      address: "Rue de Rivoli, 75001 Paris, France",
      latitude: 48.8606,
      longitude: 2.3376,
      opening_hours: {
        mon_thu_sat_sun: "09:00-18:00",
        wed_fri_late: "until 21:45",
        closed: "Tuesdays, Jan 1, May 1, Dec 25",
      },
      admission: { adult: "€22", note: "Free under 18 / EU residents under 26" },
    },
  },
  "museum-005": {
    id: "museum-005",
    name_ko: "국립 현대 미술관",
    name_en: "National Museum of Modern and Contemporary Art",
    institution_type: "museum",
    country_code: "KR",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/National_Museum_of_Modern_and_Contemporary_Art%2C_Seoul.jpg/1280px-National_Museum_of_Modern_and_Contemporary_Art%2C_Seoul.jpg",
    description_ko:
      "국립현대미술관은 한국 근현대 미술의 중심 기관으로, 서울, 과천, 덕수궁, 청주 4개 관에서 한국 및 국제 현대미술 작품을 전시합니다.",
    description_en:
      "The National Museum of Modern and Contemporary Art is the central institution of modern Korean art, with four venues in Seoul, Gwacheon, Deoksugung, and Cheongju.",
    website: "https://www.mmca.go.kr",
    place: {
      name_ko: "국립 현대 미술관",
      name_en: "National Museum of Modern and Contemporary Art",
      country: "South Korea",
      city: "Seoul",
      address: "30 Samcheong-ro, Sogyeok-dong, Jongno-gu, Seoul, South Korea",
      latitude: 37.5797,
      longitude: 126.977,
      opening_hours: {
        tue_sun: "10:00-18:00",
        wed_sat_late: "until 21:00",
        closed: "Mondays, Jan 1, Lunar New Year, Chuseok",
      },
      admission: { adult: "₩4,000", note: "Free under 24 / over 65" },
    },
  },
  "museum-006": {
    id: "museum-006",
    name_ko: "우피치 미술관",
    name_en: "Galleria degli Uffizi",
    institution_type: "gallery",
    country_code: "IT",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Florence._Uffizi_Gallery_and_Palazzo_Vecchio_%283611129323%29.jpg",
    description_ko:
      "피렌체의 아르노 강변에 위치한 우피치 미술관은 르네상스 시대의 걸작을 세계에서 가장 풍부하게 소장한 미술관 중 하나입니다.",
    description_en:
      "Located on the banks of the Arno in Florence, the Uffizi Gallery houses one of the richest collections of Renaissance masterpieces in the world.",
    website: "https://www.uffizi.it",
    place: {
      name_ko: "우피치 미술관",
      name_en: "Galleria degli Uffizi",
      country: "Italy",
      city: "Florence",
      address: "Piazzale degli Uffizi, 6, 50122 Firenze, Italy",
      latitude: 43.7678,
      longitude: 11.2553,
      opening_hours: { tue_sun: "08:15-18:30", closed: "Mondays, Jan 1, Dec 25" },
      admission: { adult: "€25", note: "Free under 18 / first Sunday of month" },
    },
  },
};
