// 통합 검색 관련 타입 정의 — GET /search 응답에 사용
// Spec v1.3.0 기준 + 프론트 확장 필드 (Spec v1.4.0 편입 예정)

/** 통합 검색 결과 응답 (GET /search 응답) */
export type SearchResult = {
  /** 검색어 */
  query: string;
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지당 결과 수 */
  per_page: number;
  /** 화가 검색 결과 총 수 */
  artists_total: number;
  /** 작품 검색 결과 총 수 */
  artworks_total: number;
  /** 미술관 검색 결과 총 수 */
  museums_total: number;
  /** 화가 검색 결과 */
  artists: SearchArtistItem[];
  /** 작품 검색 결과 */
  artworks: SearchArtworkItem[];
  /** 미술관 검색 결과 */
  museums: SearchMuseumItem[];
};

/** 검색 결과 내 화가 항목 */
export type SearchArtistItem = {
  /** 화가 UUID */
  id: string;
  /** 화가명 (한국어) */
  name_ko: string;
  /** 화가명 (영어) */
  name_en: string;
  /** 국적 (한국어) — 프론트 확장 필드 */
  nationality_ko: string;
  /** 국적 (영어) — 프론트 확장 필드 */
  nationality_en: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
};

/** 검색 결과 내 작품 항목 */
export type SearchArtworkItem = {
  /** 작품 UUID */
  id: string;
  /** 작품명 (한국어) */
  title_ko: string;
  /** 작품명 (영어) */
  title_en: string;
  /** 화가명 (한국어) */
  artist_name_ko: string;
  /** 화가명 (영어) — 프론트 확장 필드 */
  artist_name_en: string;
  /** 대표 이미지 URL (Spec v1.3.0: image_url) */
  image_url: string | null;
};

/** 검색 결과 내 미술관 항목 */
export type SearchMuseumItem = {
  /** 미술관 UUID */
  id: string;
  /** 미술관명 (한국어) */
  name_ko: string;
  /** 미술관명 (영어) */
  name_en: string;
  /** 도시명 (한국어) — 프론트 확장 필드 */
  city_ko: string;
  /** 도시명 (영어) — 프론트 확장 필드 */
  city_en: string;
  /** 국가명 (한국어) — 프론트 확장 필드 */
  country_ko: string;
  /** 국가명 (영어) — 프론트 확장 필드 */
  country_en: string;
  /** 국가 코드 ISO 3166-1 alpha-2 (Spec v1.3.0: country_code) */
  country_code: string;
  /** 대표 이미지 URL */
  thumbnail_url: string | null;
};
